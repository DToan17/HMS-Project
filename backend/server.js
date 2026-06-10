const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const db = require('./db/database');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const parseAllergies = (row) => ({
  ...row,
  allergies: JSON.parse(row.allergies || '[]'),
});

const today = () => new Date().toISOString().split('T')[0];

// ─── DASHBOARD STATS (live) ───────────────────────────────────────────────────
app.get('/api/dashboard/stats', (req, res) => {
  const t = today();

  const totalPatients      = db.prepare('SELECT COUNT(*) as c FROM patients').get().c;
  const todayAppointments  = db.prepare("SELECT COUNT(*) as c FROM appointments WHERE date = ?").get(t).c;
  const availableRooms     = db.prepare("SELECT COUNT(*) as c FROM rooms WHERE status = 'Available'").get().c;
  const totalRooms         = db.prepare('SELECT COUNT(*) as c FROM rooms').get().c;
  const revenueToday       = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM revenue WHERE date = ?").get(t).total;

  // Weekly appointments (last 7 days)
  const weeklyAppointments = db.prepare(`
    SELECT date(d.date) as day,
           COALESCE(COUNT(a.id), 0) as appointments
    FROM (
      SELECT date('now', '-' || n || ' days') as date
      FROM (SELECT 6 as n UNION SELECT 5 UNION SELECT 4 UNION SELECT 3
            UNION SELECT 2 UNION SELECT 1 UNION SELECT 0)
    ) d
    LEFT JOIN appointments a ON a.date = d.date
    GROUP BY d.date
    ORDER BY d.date
  `).all().map(r => ({ day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(r.day + 'T00:00').getDay()], appointments: r.appointments }));

  // Monthly revenue (last 6 months)
  const monthlyRevenue = db.prepare(`
    SELECT strftime('%Y-%m', date) as month_key,
           SUM(amount) as revenue
    FROM revenue
    WHERE date >= date('now', '-6 months')
    GROUP BY month_key
    ORDER BY month_key
  `).all().map(r => ({
    month: new Date(r.month_key + '-01').toLocaleString('en-US', { month: 'short' }),
    revenue: Math.round(r.revenue),
  }));

  // Recent patients (5 most recently added)
  const recentPatients = db.prepare(
    'SELECT * FROM patients ORDER BY created_at DESC LIMIT 5'
  ).all().map(parseAllergies);

  // Today's appointments with details
  const todaySchedule = db.prepare(
    "SELECT * FROM appointments WHERE date = ? ORDER BY time"
  ).all(t);

  res.json({
    totalPatients,
    todayAppointments,
    roomAvailability: { available: availableRooms, total: totalRooms },
    revenueToday: Math.round(revenueToday),
    weeklyAppointments,
    monthlyRevenue,
    recentPatients,
    todaySchedule,
  });
});

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
app.get('/api/patients', (req, res) => {
  const { search, status, department } = req.query;
  let sql = 'SELECT * FROM patients WHERE 1=1';
  const params = [];
  if (search) {
    sql += ' AND (name LIKE ? OR patient_id LIKE ? OR diagnosis LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (department) { sql += ' AND department = ?'; params.push(department); }
  sql += ' ORDER BY created_at DESC';
  const rows = db.prepare(sql).all(...params).map(parseAllergies);
  // rename snake_case to camelCase for frontend compatibility
  res.json(rows.map(p => ({ ...p, patientId: p.patient_id, bloodGroup: p.blood_group, lastVisit: p.last_visit })));
});

app.get('/api/patients/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Patient not found' });
  const p = parseAllergies(row);
  res.json({ ...p, patientId: p.patient_id, bloodGroup: p.blood_group, lastVisit: p.last_visit });
});

app.post('/api/patients', (req, res) => {
  const b = req.body;
  const id = 'p' + uuidv4().slice(0, 8);
  const patient_id = '#PAT-2024-' + String(1867 + db.prepare('SELECT COUNT(*) as c FROM patients').get().c);
  db.prepare(`
    INSERT INTO patients (id, patient_id, name, age, gender, blood_group, phone, email, address, status, doctor, department, last_visit, diagnosis, allergies)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, patient_id,
    b.name, b.age || null, b.gender || 'Male', b.bloodGroup || b.blood_group || '',
    b.phone || '', b.email || '', b.address || '', b.status || 'Active',
    b.doctor || '', b.department || 'General Medicine',
    today(), b.diagnosis || '',
    JSON.stringify(Array.isArray(b.allergies) ? b.allergies : (b.allergies ? b.allergies.split(',').map(s => s.trim()).filter(Boolean) : [])),
  );
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  const p = parseAllergies(row);
  res.status(201).json({ ...p, patientId: p.patient_id, bloodGroup: p.blood_group, lastVisit: p.last_visit });
});

app.put('/api/patients/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Patient not found' });
  const b = req.body;
  const allergies = Array.isArray(b.allergies) ? b.allergies : (b.allergies ? String(b.allergies).split(',').map(s => s.trim()).filter(Boolean) : JSON.parse(existing.allergies || '[]'));
  db.prepare(`
    UPDATE patients SET name=?, age=?, gender=?, blood_group=?, phone=?, email=?, address=?,
    status=?, doctor=?, department=?, diagnosis=?, allergies=? WHERE id=?
  `).run(
    b.name ?? existing.name, b.age ?? existing.age, b.gender ?? existing.gender,
    b.bloodGroup ?? b.blood_group ?? existing.blood_group,
    b.phone ?? existing.phone, b.email ?? existing.email, b.address ?? existing.address,
    b.status ?? existing.status, b.doctor ?? existing.doctor, b.department ?? existing.department,
    b.diagnosis ?? existing.diagnosis, JSON.stringify(allergies),
    req.params.id
  );
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  const p = parseAllergies(row);
  res.json({ ...p, patientId: p.patient_id, bloodGroup: p.blood_group, lastVisit: p.last_visit });
});

app.delete('/api/patients/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM patients WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Patient not found' });
  db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);
  res.json({ message: 'Patient deleted' });
});

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
app.get('/api/appointments', (req, res) => {
  const { date, doctorId, status, patientId } = req.query;
  let sql = 'SELECT * FROM appointments WHERE 1=1';
  const params = [];
  if (date)      { sql += ' AND date = ?';       params.push(date); }
  if (doctorId)  { sql += ' AND doctor_id = ?';  params.push(doctorId); }
  if (status)    { sql += ' AND status = ?';     params.push(status); }
  if (patientId) { sql += ' AND patient_id = ?'; params.push(patientId); }
  sql += ' ORDER BY date, time';
  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(a => ({ ...a, patientName: a.patient_name, doctorName: a.doctor_name, doctorId: a.doctor_id, patientId: a.patient_id })));
});

app.get('/api/appointments/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Appointment not found' });
  res.json({ ...row, patientName: row.patient_name, doctorName: row.doctor_name, doctorId: row.doctor_id, patientId: row.patient_id });
});

app.post('/api/appointments', (req, res) => {
  const b = req.body;
  const id = 'a' + uuidv4().slice(0, 8);
  db.prepare(`
    INSERT INTO appointments (id, patient_id, patient_name, doctor_id, doctor_name, department, date, time, status, type, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, b.patientId || b.patient_id || '', b.patientName || b.patient_name || '',
    b.doctorId || b.doctor_id || '', b.doctorName || b.doctor_name || '',
    b.department || '', b.date || '', b.time || '',
    b.status || 'Pending', b.type || 'Consultation', b.notes || '',
  );
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  res.status(201).json({ ...row, patientName: row.patient_name, doctorName: row.doctor_name, doctorId: row.doctor_id, patientId: row.patient_id });
});

app.put('/api/appointments/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Appointment not found' });
  const b = req.body;
  db.prepare(`
    UPDATE appointments SET patient_id=?, patient_name=?, doctor_id=?, doctor_name=?,
    department=?, date=?, time=?, status=?, type=?, notes=? WHERE id=?
  `).run(
    b.patientId ?? b.patient_id ?? existing.patient_id,
    b.patientName ?? b.patient_name ?? existing.patient_name,
    b.doctorId ?? b.doctor_id ?? existing.doctor_id,
    b.doctorName ?? b.doctor_name ?? existing.doctor_name,
    b.department ?? existing.department,
    b.date ?? existing.date, b.time ?? existing.time,
    b.status ?? existing.status, b.type ?? existing.type, b.notes ?? existing.notes,
    req.params.id
  );
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  res.json({ ...row, patientName: row.patient_name, doctorName: row.doctor_name, doctorId: row.doctor_id, patientId: row.patient_id });
});

app.delete('/api/appointments/:id', (req, res) => {
  const row = db.prepare('SELECT id FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Appointment not found' });
  db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
  res.json({ message: 'Appointment deleted' });
});

// ─── DOCTORS ──────────────────────────────────────────────────────────────────
app.get('/api/doctors', (req, res) => {
  const { department, status } = req.query;
  let sql = 'SELECT * FROM doctors WHERE 1=1';
  const params = [];
  if (department) { sql += ' AND department = ?'; params.push(department); }
  if (status)     { sql += ' AND status = ?';     params.push(status); }
  sql += ' ORDER BY name';
  res.json(db.prepare(sql).all(...params));
});

app.get('/api/doctors/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Doctor not found' });
  res.json(row);
});

app.post('/api/doctors', (req, res) => {
  const b = req.body;
  const id = 'd' + uuidv4().slice(0, 8);
  const avatar = b.name ? b.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR';
  db.prepare(`
    INSERT INTO doctors (id, name, specialty, department, experience, phone, email, status, avatar, patients, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, b.name, b.specialty || '', b.department || 'General Medicine', b.experience || '', b.phone || '', b.email || '', b.status || 'Available', avatar, 0, 4.5);
  res.status(201).json(db.prepare('SELECT * FROM doctors WHERE id = ?').get(id));
});

app.put('/api/doctors/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Doctor not found' });
  const b = req.body;
  db.prepare(`
    UPDATE doctors SET name=?, specialty=?, department=?, experience=?, phone=?, email=?, status=? WHERE id=?
  `).run(
    b.name ?? existing.name, b.specialty ?? existing.specialty, b.department ?? existing.department,
    b.experience ?? existing.experience, b.phone ?? existing.phone, b.email ?? existing.email,
    b.status ?? existing.status, req.params.id
  );
  res.json(db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id));
});

// ─── ROOMS ────────────────────────────────────────────────────────────────────
app.get('/api/rooms', (req, res) => {
  const { type, status } = req.query;
  let sql = 'SELECT * FROM rooms WHERE 1=1';
  const params = [];
  if (type)   { sql += ' AND type = ?';   params.push(type); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY type, number';
  res.json(db.prepare(sql).all(...params));
});

app.put('/api/rooms/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Room not found' });
  const b = req.body;
  db.prepare(`
    UPDATE rooms SET status=?, patient=?, notes=?, updated_at=datetime('now') WHERE id=?
  `).run(b.status ?? existing.status, b.patient ?? existing.patient, b.notes ?? existing.notes, req.params.id);
  res.json(db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id));
});

// ─── REVENUE ──────────────────────────────────────────────────────────────────
app.get('/api/revenue', (req, res) => {
  const { from, to, source } = req.query;
  const fromDate = from || (() => { const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().split('T')[0]; })();
  const toDate = to || today();
  let sql = 'SELECT * FROM revenue WHERE date >= ? AND date <= ?';
  const params = [fromDate, toDate];
  if (source) { sql += ' AND source = ?'; params.push(source); }
  sql += ' ORDER BY date DESC, id DESC';
  const rows = db.prepare(sql).all(...params);

  const summary = db.prepare(`
    SELECT source, SUM(amount) as total, COUNT(*) as count
    FROM revenue WHERE date >= ? AND date <= ?
    GROUP BY source ORDER BY total DESC
  `).all(fromDate, toDate);

  const daily = db.prepare(`
    SELECT date, SUM(amount) as revenue
    FROM revenue WHERE date >= ? AND date <= ?
    GROUP BY date ORDER BY date
  `).all(fromDate, toDate);

  const totalRevenue = rows.reduce((s, r) => s + r.amount, 0);

  res.json({ rows, summary, daily, totalRevenue: Math.round(totalRevenue) });
});

app.post('/api/revenue', (req, res) => {
  const b = req.body;
  const info = db.prepare(`
    INSERT INTO revenue (date, amount, source, patient, notes)
    VALUES (?, ?, ?, ?, ?)
  `).run(b.date || today(), b.amount, b.source || 'Other', b.patient || '', b.notes || '');
  res.status(201).json(db.prepare('SELECT * FROM revenue WHERE id = ?').get(info.lastInsertRowid));
});

// ─── LEGACY /api/stats (keep old frontend paths working) ─────────────────────
app.get('/api/stats', (req, res) => {
  const t = today();
  const totalPatients     = db.prepare('SELECT COUNT(*) as c FROM patients').get().c;
  const todayAppointments = db.prepare('SELECT COUNT(*) as c FROM appointments WHERE date = ?').get(t).c;
  const availableRooms    = db.prepare("SELECT COUNT(*) as c FROM rooms WHERE status='Available'").get().c;
  const totalRooms        = db.prepare('SELECT COUNT(*) as c FROM rooms').get().c;
  const revenueToday      = db.prepare("SELECT COALESCE(SUM(amount),0) as s FROM revenue WHERE date=?").get(t).s;

  const weeklyAppointments = db.prepare(`
    SELECT date(d.date) as day, COALESCE(COUNT(a.id),0) as appointments
    FROM (SELECT date('now','-'||n||' days') as date FROM
          (SELECT 6 n UNION SELECT 5 UNION SELECT 4 UNION SELECT 3
           UNION SELECT 2 UNION SELECT 1 UNION SELECT 0)) d
    LEFT JOIN appointments a ON a.date=d.date
    GROUP BY d.date ORDER BY d.date
  `).all().map(r => ({ day:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(r.day+'T00:00').getDay()], appointments:r.appointments }));

  const monthlyRevenue = db.prepare(`
    SELECT strftime('%Y-%m',date) as month_key, SUM(amount) as revenue
    FROM revenue WHERE date >= date('now','-6 months')
    GROUP BY month_key ORDER BY month_key
  `).all().map(r => ({ month: new Date(r.month_key+'-01').toLocaleString('en-US',{month:'short'}), revenue: Math.round(r.revenue) }));

  const recentPatients = db.prepare('SELECT * FROM patients ORDER BY created_at DESC LIMIT 5').all().map(p => ({
    ...parseAllergies(p), patientId: p.patient_id, bloodGroup: p.blood_group, lastVisit: p.last_visit,
  }));

  res.json({ totalPatients, todayAppointments, roomAvailability:{ available:availableRooms, total:totalRooms }, revenueToday: Math.round(revenueToday), weeklyAppointments, monthlyRevenue, recentPatients });
});

// ─── HEALTH ───────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'sqlite', time: new Date() }));

app.listen(PORT, () => {
  console.log(`\n✅  API server running → http://localhost:${PORT}`);
  console.log(`   /api/dashboard/stats  /api/patients  /api/appointments`);
  console.log(`   /api/doctors          /api/rooms      /api/revenue\n`);
});
