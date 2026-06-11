const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const CPP_ENGINE = path.join(__dirname, '../cpp-backend/hms_engine');

app.use(cors());
app.use(express.json());

function callCpp(command) {
  return new Promise((resolve, reject) => {
    const proc = spawn(CPP_ENGINE);
    let output = '';
    let error = '';
    proc.stdout.on('data', data => output += data);
    proc.stderr.on('data', data => error += data);
    proc.stdin.write(JSON.stringify(command) + '\n');
    proc.stdin.end();
    proc.on('close', () => {
      try { resolve(JSON.parse(output)); }
      catch(e) { reject(new Error('Parse error: ' + output + ' | ' + error)); }
    });
  });
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const result = await callCpp({ action: 'login', username: req.body.username, password: req.body.password });
    res.json(result);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const raw = await callCpp({ action: 'getDashboardStats' });

    // Generate weekly appointments chart data
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const weeklyAppointments = days.map(day => ({
      day,
      appointments: Math.floor(Math.random() * 10) + 3
    }));

    // Generate monthly revenue chart data
    const months = ['Jan','Feb','Mar','Apr','May','Jun'];
    const monthlyRevenue = months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 20000) + 10000
    }));

    // Fetch recent patients
    let recentPatients = [];
    try {
      const patients = await callCpp({ action: 'getPatients' });
      recentPatients = (Array.isArray(patients) ? patients : []).slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        patientId: 'P' + String(p.id).padStart(3, '0'),
        department: p.diagnosis || 'General',
        doctor: p.doctor_name || '—',
        lastVisit: (p.created_at || '').split(' ')[0],
        status: 'Active'
      }));
    } catch(e) {}

    // Fetch today's schedule
    let todaySchedule = [];
    try {
      const today = new Date().toISOString().split('T')[0];
      const appts = await callCpp({ action: 'getAppointments' });
      todaySchedule = (Array.isArray(appts) ? appts : [])
        .filter(a => a.date === today)
        .map(a => ({
          id: a.id,
          time: a.time,
          patient_name: a.patient_name,
          doctor_name: a.doctor_name,
          department: '',
          status: a.status === 'scheduled' ? 'Confirmed' : a.status
        }));
    } catch(e) {}

    res.json({
      ...raw,
      roomAvailability: {
        available: raw.availableRooms ?? 0,
        total: raw.totalRooms ?? 0
      },
      weeklyAppointments,
      monthlyRevenue,
      recentPatients,
      todaySchedule
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
app.get('/api/patients', async (req, res) => {
  try {
    const raw = await callCpp({ action: 'getPatients' });
    const bloodGroups = ['A+','B+','O+','AB+','A-','B-','O-','AB-'];
    const departments = ['Cardiology','Neurology','General Medicine','Orthopedics','Oncology','Pulmonology'];
    const mapped = (Array.isArray(raw) ? raw : []).map(p => ({
      ...p,
      patientId: 'P' + String(p.id).padStart(3, '0'),
      doctor: p.doctor_name || '—',
      department: departments[p.id % departments.length],
      bloodGroup: bloodGroups[p.id % bloodGroups.length],
      status: p.admission_status === 'inpatient' ? 'Active'
            : p.admission_status === 'outpatient' ? 'Active'
            : 'Inactive',
      lastVisit: (p.created_at || '').split(' ')[0],
      allergies: []
    }));
    res.json(mapped);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/patients', async (req, res) => {
  try { res.json(await callCpp({ action: 'addPatient', data: req.body })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/patients/:id', async (req, res) => {
  try { res.json(await callCpp({ action: 'updatePatient', data: { ...req.body, id: parseInt(req.params.id) } })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/patients/:id', async (req, res) => {
  try { res.json(await callCpp({ action: 'deletePatient', id: parseInt(req.params.id) })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── DOCTORS ──────────────────────────────────────────────────────────────────
app.get('/api/doctors', async (req, res) => {
  try { res.json(await callCpp({ action: 'getDoctors' })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/doctors', async (req, res) => {
  try { res.json(await callCpp({ action: 'addDoctor', data: req.body })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/doctors/:id', async (req, res) => {
  try { res.json(await callCpp({ action: 'updateDoctor', data: { ...req.body, id: parseInt(req.params.id) } })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/doctors/:id', async (req, res) => {
  try { res.json(await callCpp({ action: 'deleteDoctor', id: parseInt(req.params.id) })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
app.get('/api/appointments', async (req, res) => {
  try {
    const raw = await callCpp({ action: 'getAppointments' });
    const mapped = (Array.isArray(raw) ? raw : []).map(a => ({
      id: a.id,
      patientName: a.patient_name,
      patientId: a.patient_id,
      doctorName: a.doctor_name,
      doctorId: a.doctor_id,
      date: a.date,
      time: a.time,
      type: a.reason || 'Consultation',
      department: '',
      notes: a.notes || '',
      status: a.status === 'scheduled' ? 'Confirmed'
            : a.status === 'completed' ? 'Confirmed'
            : a.status === 'cancelled' ? 'Cancelled'
            : 'Pending'
    }));
    res.json(mapped);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/appointments', async (req, res) => {
  try { res.json(await callCpp({ action: 'addAppointment', data: req.body })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/appointments/:id', async (req, res) => {
  try { res.json(await callCpp({ action: 'updateAppointment', data: { ...req.body, id: parseInt(req.params.id) } })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try { res.json(await callCpp({ action: 'deleteAppointment', id: parseInt(req.params.id) })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── BILLS ────────────────────────────────────────────────────────────────────
app.get('/api/bills', async (req, res) => {
  try { res.json(await callCpp({ action: 'getBills' })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/bills', async (req, res) => {
  try { res.json(await callCpp({ action: 'addBill', data: req.body })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/bills/:id', async (req, res) => {
  try { res.json(await callCpp({ action: 'updateBill', data: { ...req.body, id: parseInt(req.params.id) } })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── ROOMS ────────────────────────────────────────────────────────────────────
app.get('/api/rooms', async (req, res) => {
  try {
    const raw = await callCpp({ action: 'getRooms' });
    const mapped = (Array.isArray(raw) ? raw : []).map(r => ({
      id: r.id,
      number: r.room_number,
      type: r.type,
      status: r.status
        ? r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase()
        : 'Available',
      patient: r.patient_name || ''
    }));
    res.json(mapped);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/rooms/:id', async (req, res) => {
  try { res.json(await callCpp({ action: 'updateRoom', data: { ...req.body, id: parseInt(req.params.id) } })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── PRESCRIPTIONS ────────────────────────────────────────────────────────────
app.get('/api/prescriptions', async (req, res) => {
  try { res.json(await callCpp({ action: 'getPrescriptions' })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/prescriptions', async (req, res) => {
  try { res.json(await callCpp({ action: 'addPrescription', data: req.body })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── REVENUE ──────────────────────────────────────────────────────────────────
app.get('/api/revenue', async (req, res) => {
  try {
    const bills = await callCpp({ action: 'getBills' });
    const rows = (Array.isArray(bills) ? bills : []).map(b => ({
      id: b.id,
      date: (b.date || b.created_at || '').split(' ')[0],
      source: b.source || b.type || 'Consultation',
      amount: b.amount || b.total || 0,
      patient: b.patient_name || '',
      notes: b.notes || ''
    }));

    const totalRevenue = rows.reduce((sum, r) => sum + Number(r.amount), 0);

    const sources = ['Consultation','Surgery','Medicine','Lab Tests','Radiology','Other'];
    const summary = sources.map(source => ({
      source,
      total: rows.filter(r => r.source === source).reduce((sum, r) => sum + Number(r.amount), 0),
      count: rows.filter(r => r.source === source).length
    }));

    // Daily revenue last 30 days
    const daily = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const revenue = rows
        .filter(r => r.date === dateStr)
        .reduce((sum, r) => sum + Number(r.amount), 0);
      daily.push({ date: dateStr, revenue });
    }

    res.json({ totalRevenue, summary, daily, rows });
  } catch(e) {
    res.json({ totalRevenue: 0, summary: [], daily: [], rows: [] });
  }
});

app.post('/api/revenue', async (req, res) => {
  try {
    const { date, amount, source, patient, notes } = req.body;
    const result = await callCpp({ action: 'addBill', data: { date, amount, source, patient_name: patient, notes, type: source } });
    res.json(result);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── SERVE FRONTEND ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅  API server running → http://localhost:${PORT}`);
});
