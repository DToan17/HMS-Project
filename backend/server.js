const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const CPP_ENGINE = path.join(__dirname, '../cpp-backend/hms_engine');

app.use(cors());
app.use(express.json());

// ─── C++ BRIDGE ───────────────────────────────────────────────────────────────
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
  try { res.json(await callCpp({ action: 'getDashboardStats' })); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
app.get('/api/patients', async (req, res) => {
  try { res.json(await callCpp({ action: 'getPatients' })); }
  catch(e) { res.status(500).json({ error: e.message }); }
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
  try { res.json(await callCpp({ action: 'getAppointments' })); }
  catch(e) { res.status(500).json({ error: e.message }); }
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
  try { res.json(await callCpp({ action: 'getRooms' })); }
  catch(e) { res.status(500).json({ error: e.message }); }
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

// ─── SERVE FRONTEND ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, './public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅  API server running → http://localhost:${PORT}`);
});
