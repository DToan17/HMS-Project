const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'hospital.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── SCHEMA ───────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS doctors (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    specialty   TEXT NOT NULL,
    department  TEXT NOT NULL,
    experience  TEXT NOT NULL,
    phone       TEXT,
    email       TEXT,
    status      TEXT DEFAULT 'Available',
    avatar      TEXT,
    patients    INTEGER DEFAULT 0,
    rating      REAL DEFAULT 4.5,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS patients (
    id          TEXT PRIMARY KEY,
    patient_id  TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    age         INTEGER,
    gender      TEXT,
    blood_group TEXT,
    phone       TEXT,
    email       TEXT,
    address     TEXT,
    status      TEXT DEFAULT 'Active',
    doctor      TEXT,
    department  TEXT,
    last_visit  TEXT,
    diagnosis   TEXT,
    allergies   TEXT DEFAULT '[]',
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id           TEXT PRIMARY KEY,
    patient_id   TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    doctor_id    TEXT NOT NULL,
    doctor_name  TEXT NOT NULL,
    department   TEXT,
    date         TEXT NOT NULL,
    time         TEXT NOT NULL,
    status       TEXT DEFAULT 'Pending',
    type         TEXT DEFAULT 'Consultation',
    notes        TEXT DEFAULT '',
    created_at   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    number     TEXT UNIQUE NOT NULL,
    type       TEXT NOT NULL,
    floor      INTEGER DEFAULT 1,
    status     TEXT DEFAULT 'Available',
    patient    TEXT DEFAULT '',
    notes      TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS revenue (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT NOT NULL,
    amount     REAL NOT NULL,
    source     TEXT NOT NULL,
    patient    TEXT DEFAULT '',
    notes      TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// ─── SEED ─────────────────────────────────────────────────────────────────────
function seed() {
  const alreadySeeded = db.prepare('SELECT COUNT(*) as c FROM doctors').get().c > 0;
  if (alreadySeeded) return;

  console.log('🌱  Seeding database...');

  // ── Doctors (5) ──────────────────────────────────────────────────────────
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (id, name, specialty, department, experience, phone, email, status, avatar, patients, rating)
    VALUES (@id, @name, @specialty, @department, @experience, @phone, @email, @status, @avatar, @patients, @rating)
  `);

  const doctors = [
    { id: 'd1', name: 'Dr. Michael Johnson', specialty: 'Cardiologist',        department: 'Cardiology',       experience: '15 years', phone: '+1 555 001 0001', email: 'mjohnson@medicare.com', status: 'Available', avatar: 'MJ', patients: 142, rating: 4.9 },
    { id: 'd2', name: 'Dr. Sarah Chen',      specialty: 'Neurologist',          department: 'Neurology',        experience: '12 years', phone: '+1 555 001 0002', email: 'schen@medicare.com',    status: 'Available', avatar: 'SC', patients: 118, rating: 4.8 },
    { id: 'd3', name: 'Dr. James Rivera',    specialty: 'Pediatrician',         department: 'Pediatrics',       experience: '10 years', phone: '+1 555 001 0003', email: 'jrivera@medicare.com',  status: 'Busy',      avatar: 'JR', patients: 205, rating: 4.7 },
    { id: 'd4', name: 'Dr. Priya Patel',     specialty: 'Orthopedic Surgeon',   department: 'Orthopedics',      experience: '18 years', phone: '+1 555 001 0004', email: 'ppatel@medicare.com',   status: 'Available', avatar: 'PP', patients: 96,  rating: 4.9 },
    { id: 'd5', name: 'Dr. Thomas Lee',      specialty: 'General Physician',    department: 'General Medicine', experience: '8 years',  phone: '+1 555 001 0005', email: 'tlee@medicare.com',     status: 'On Leave',  avatar: 'TL', patients: 187, rating: 4.6 },
  ];
  doctors.forEach(d => insertDoctor.run(d));

  // ── Patients (20) ────────────────────────────────────────────────────────
  const insertPatient = db.prepare(`
    INSERT INTO patients (id, patient_id, name, age, gender, blood_group, phone, email, address, status, doctor, department, last_visit, diagnosis, allergies)
    VALUES (@id, @patient_id, @name, @age, @gender, @blood_group, @phone, @email, @address, @status, @doctor, @department, @last_visit, @diagnosis, @allergies)
  `);

  const patients = [
    { id:'p1',  patient_id:'#PAT-2024-1847', name:'Emily Parker',     age:32, gender:'Female', blood_group:'A+',  phone:'+1 234 567 8900', email:'eparker@email.com',    address:'123 Oak St, Springfield, IL 62701',     status:'Active',   doctor:'Dr. Michael Johnson', department:'Cardiology',       last_visit:'2026-05-15', diagnosis:'Hypertension',           allergies:'["Penicillin"]' },
    { id:'p2',  patient_id:'#PAT-2024-1848', name:'Robert Martinez',  age:45, gender:'Male',   blood_group:'O+',  phone:'+1 234 567 8901', email:'rmartinez@email.com',  address:'456 Elm Ave, Chicago, IL 60601',        status:'Active',   doctor:'Dr. Sarah Chen',      department:'Neurology',        last_visit:'2026-05-20', diagnosis:'Migraine',               allergies:'[]' },
    { id:'p3',  patient_id:'#PAT-2024-1849', name:'Linda Thompson',   age:28, gender:'Female', blood_group:'B+',  phone:'+1 234 567 8902', email:'lthompson@email.com',  address:'789 Pine Rd, Naperville, IL 60540',     status:'Active',   doctor:'Dr. James Rivera',    department:'Pediatrics',       last_visit:'2026-05-18', diagnosis:'Seasonal Allergies',     allergies:'["Aspirin"]' },
    { id:'p4',  patient_id:'#PAT-2024-1850', name:'James Wilson',     age:60, gender:'Male',   blood_group:'AB-', phone:'+1 234 567 8903', email:'jwilson@email.com',    address:'321 Maple Dr, Rockford, IL 61101',      status:'Inactive', doctor:'Dr. Priya Patel',     department:'Orthopedics',      last_visit:'2026-04-10', diagnosis:'Knee Arthritis',         allergies:'["Sulfa"]' },
    { id:'p5',  patient_id:'#PAT-2024-1851', name:'Maria Garcia',     age:38, gender:'Female', blood_group:'O-',  phone:'+1 234 567 8904', email:'mgarcia@email.com',    address:'654 Cedar Ln, Peoria, IL 61602',        status:'Active',   doctor:'Dr. Thomas Lee',      department:'General Medicine', last_visit:'2026-05-22', diagnosis:'Diabetes Type 2',        allergies:'[]' },
    { id:'p6',  patient_id:'#PAT-2024-1852', name:'David Kim',        age:52, gender:'Male',   blood_group:'A-',  phone:'+1 234 567 8905', email:'dkim@email.com',       address:'987 Birch Blvd, Aurora, IL 60505',      status:'Active',   doctor:'Dr. Priya Patel',     department:'Orthopedics',      last_visit:'2026-05-25', diagnosis:'Psoriasis',              allergies:'["Latex"]' },
    { id:'p7',  patient_id:'#PAT-2024-1853', name:'Susan White',      age:41, gender:'Female', blood_group:'B-',  phone:'+1 234 567 8906', email:'swhite@email.com',     address:'147 Walnut St, Joliet, IL 60432',       status:'Active',   doctor:'Dr. Michael Johnson', department:'Cardiology',       last_visit:'2026-05-28', diagnosis:'Arrhythmia',             allergies:'[]' },
    { id:'p8',  patient_id:'#PAT-2024-1854', name:'Thomas Brown',     age:67, gender:'Male',   blood_group:'O+',  phone:'+1 234 567 8907', email:'tbrown@email.com',     address:'258 Spruce Ave, Waukegan, IL 60085',    status:'Critical', doctor:'Dr. Sarah Chen',      department:'Neurology',        last_visit:'2026-05-30', diagnosis:'Stroke Recovery',        allergies:'["Ibuprofen"]' },
    { id:'p9',  patient_id:'#PAT-2024-1855', name:'Anna Davis',       age:23, gender:'Female', blood_group:'AB+', phone:'+1 234 567 8908', email:'adavis@email.com',     address:'369 Poplar Ct, Champaign, IL 61820',    status:'Active',   doctor:'Dr. Thomas Lee',      department:'General Medicine', last_visit:'2026-05-12', diagnosis:'Anemia',                 allergies:'[]' },
    { id:'p10', patient_id:'#PAT-2024-1856', name:'Kevin Nguyen',     age:35, gender:'Male',   blood_group:'A+',  phone:'+1 234 567 8909', email:'knguyen@email.com',    address:'741 Ash Way, Springfield, IL 62702',    status:'Active',   doctor:'Dr. James Rivera',    department:'Pediatrics',       last_visit:'2026-05-26', diagnosis:'Asthma',                 allergies:'["Codeine"]' },
    { id:'p11', patient_id:'#PAT-2024-1857', name:'Patricia Moore',   age:55, gender:'Female', blood_group:'A+',  phone:'+1 234 567 8910', email:'pmoore@email.com',     address:'852 Oak Ave, Springfield, IL 62703',    status:'Active',   doctor:'Dr. Michael Johnson', department:'Cardiology',       last_visit:'2026-06-01', diagnosis:'Coronary Artery Disease', allergies:'[]' },
    { id:'p12', patient_id:'#PAT-2024-1858', name:'Charles Anderson', age:48, gender:'Male',   blood_group:'B+',  phone:'+1 234 567 8911', email:'canderson@email.com',  address:'963 Maple St, Elgin, IL 60120',         status:'Active',   doctor:'Dr. Sarah Chen',      department:'Neurology',        last_visit:'2026-05-29', diagnosis:'Parkinson\'s Disease',   allergies:'["Penicillin","Latex"]' },
    { id:'p13', patient_id:'#PAT-2024-1859', name:'Jennifer Taylor',  age:31, gender:'Female', blood_group:'O+',  phone:'+1 234 567 8912', email:'jtaylor@email.com',    address:'174 Birch Ct, Decatur, IL 62521',       status:'Active',   doctor:'Dr. James Rivera',    department:'Pediatrics',       last_visit:'2026-05-31', diagnosis:'Eczema',                 allergies:'[]' },
    { id:'p14', patient_id:'#PAT-2024-1860', name:'Michael Harris',   age:72, gender:'Male',   blood_group:'AB+', phone:'+1 234 567 8913', email:'mharris@email.com',    address:'285 Cedar Dr, Bloomington, IL 61701',   status:'Critical', doctor:'Dr. Priya Patel',     department:'Orthopedics',      last_visit:'2026-06-02', diagnosis:'Hip Fracture',           allergies:'["Sulfa"]' },
    { id:'p15', patient_id:'#PAT-2024-1861', name:'Elizabeth Clark',  age:44, gender:'Female', blood_group:'A-',  phone:'+1 234 567 8914', email:'eclark@email.com',     address:'396 Elm Blvd, Peoria, IL 61604',        status:'Active',   doctor:'Dr. Thomas Lee',      department:'General Medicine', last_visit:'2026-05-27', diagnosis:'Hypothyroidism',         allergies:'[]' },
    { id:'p16', patient_id:'#PAT-2024-1862', name:'Daniel Lewis',     age:29, gender:'Male',   blood_group:'O-',  phone:'+1 234 567 8915', email:'dlewis@email.com',     address:'507 Pine Ave, Rockford, IL 61102',      status:'Active',   doctor:'Dr. Michael Johnson', department:'Cardiology',       last_visit:'2026-06-01', diagnosis:'Atrial Fibrillation',    allergies:'[]' },
    { id:'p17', patient_id:'#PAT-2024-1863', name:'Sophia Robinson',  age:19, gender:'Female', blood_group:'B-',  phone:'+1 234 567 8916', email:'srobinson@email.com',  address:'618 Walnut Way, Aurora, IL 60506',      status:'Active',   doctor:'Dr. James Rivera',    department:'Pediatrics',       last_visit:'2026-05-24', diagnosis:'Iron Deficiency',        allergies:'["Aspirin"]' },
    { id:'p18', patient_id:'#PAT-2024-1864', name:'William Walker',   age:63, gender:'Male',   blood_group:'O+',  phone:'+1 234 567 8917', email:'wwalker@email.com',    address:'729 Spruce Ln, Waukegan, IL 60086',     status:'Inactive', doctor:'Dr. Thomas Lee',      department:'General Medicine', last_visit:'2026-04-15', diagnosis:'COPD',                   allergies:'["Codeine","Ibuprofen"]' },
    { id:'p19', patient_id:'#PAT-2024-1865', name:'Olivia Hall',      age:36, gender:'Female', blood_group:'A+',  phone:'+1 234 567 8918', email:'ohall@email.com',      address:'840 Poplar St, Naperville, IL 60541',   status:'Active',   doctor:'Dr. Sarah Chen',      department:'Neurology',        last_visit:'2026-06-02', diagnosis:'Multiple Sclerosis',     allergies:'[]' },
    { id:'p20', patient_id:'#PAT-2024-1866', name:'Noah Young',       age:8,  gender:'Male',   blood_group:'B+',  phone:'+1 234 567 8919', email:'nyoung@email.com',     address:'951 Ash Blvd, Champaign, IL 61821',     status:'Active',   doctor:'Dr. James Rivera',    department:'Pediatrics',       last_visit:'2026-06-03', diagnosis:'Childhood Asthma',       allergies:'[]' },
  ];
  patients.forEach(p => insertPatient.run(p));

  // ── Appointments (15) ────────────────────────────────────────────────────
  const insertAppt = db.prepare(`
    INSERT INTO appointments (id, patient_id, patient_name, doctor_id, doctor_name, department, date, time, status, type, notes)
    VALUES (@id, @patient_id, @patient_name, @doctor_id, @doctor_name, @department, @date, @time, @status, @type, @notes)
  `);

  const today = new Date().toISOString().split('T')[0];
  const d = (offset) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString().split('T')[0];
  };

  const appointments = [
    { id:'a1',  patient_id:'p1',  patient_name:'Emily Parker',     doctor_id:'d1', doctor_name:'Dr. Michael Johnson', department:'Cardiology',       date:today,  time:'09:00', status:'Confirmed', type:'Follow-up',       notes:'Blood pressure monitoring' },
    { id:'a2',  patient_id:'p2',  patient_name:'Robert Martinez',  doctor_id:'d2', doctor_name:'Dr. Sarah Chen',      department:'Neurology',        date:today,  time:'10:30', status:'Confirmed', type:'Consultation',    notes:'MRI review' },
    { id:'a3',  patient_id:'p3',  patient_name:'Linda Thompson',   doctor_id:'d3', doctor_name:'Dr. James Rivera',    department:'Pediatrics',       date:today,  time:'11:00', status:'Pending',   type:'Check-up',        notes:'' },
    { id:'a4',  patient_id:'p5',  patient_name:'Maria Garcia',     doctor_id:'d5', doctor_name:'Dr. Thomas Lee',      department:'General Medicine', date:today,  time:'14:00', status:'Confirmed', type:'Follow-up',       notes:'HbA1c results review' },
    { id:'a5',  patient_id:'p20', patient_name:'Noah Young',       doctor_id:'d3', doctor_name:'Dr. James Rivera',    department:'Pediatrics',       date:today,  time:'15:30', status:'Confirmed', type:'Check-up',        notes:'Inhaler assessment' },
    { id:'a6',  patient_id:'p6',  patient_name:'David Kim',        doctor_id:'d4', doctor_name:'Dr. Priya Patel',     department:'Orthopedics',      date:d(1),   time:'09:30', status:'Confirmed', type:'Treatment',       notes:'Post-surgery review' },
    { id:'a7',  patient_id:'p7',  patient_name:'Susan White',      doctor_id:'d1', doctor_name:'Dr. Michael Johnson', department:'Cardiology',       date:d(1),   time:'11:00', status:'Confirmed', type:'Consultation',    notes:'ECG review' },
    { id:'a8',  patient_id:'p11', patient_name:'Patricia Moore',   doctor_id:'d1', doctor_name:'Dr. Michael Johnson', department:'Cardiology',       date:d(1),   time:'14:30', status:'Pending',   type:'Follow-up',       notes:'Medication adjustment' },
    { id:'a9',  patient_id:'p8',  patient_name:'Thomas Brown',     doctor_id:'d2', doctor_name:'Dr. Sarah Chen',      department:'Neurology',        date:d(2),   time:'10:00', status:'Confirmed', type:'Emergency',       notes:'Urgent neurological review' },
    { id:'a10', patient_id:'p4',  patient_name:'James Wilson',     doctor_id:'d4', doctor_name:'Dr. Priya Patel',     department:'Orthopedics',      date:d(2),   time:'13:00', status:'Cancelled', type:'Surgery Consult', notes:'' },
    { id:'a11', patient_id:'p9',  patient_name:'Anna Davis',       doctor_id:'d5', doctor_name:'Dr. Thomas Lee',      department:'General Medicine', date:d(3),   time:'09:00', status:'Confirmed', type:'Check-up',        notes:'Iron studies follow-up' },
    { id:'a12', patient_id:'p12', patient_name:'Charles Anderson', doctor_id:'d2', doctor_name:'Dr. Sarah Chen',      department:'Neurology',        date:d(3),   time:'11:30', status:'Confirmed', type:'Consultation',    notes:'Tremor assessment' },
    { id:'a13', patient_id:'p15', patient_name:'Elizabeth Clark',  doctor_id:'d5', doctor_name:'Dr. Thomas Lee',      department:'General Medicine', date:d(-1),  time:'10:00', status:'Confirmed', type:'Follow-up',       notes:'Thyroid labs' },
    { id:'a14', patient_id:'p16', patient_name:'Daniel Lewis',     doctor_id:'d1', doctor_name:'Dr. Michael Johnson', department:'Cardiology',       date:d(-1),  time:'14:00', status:'Confirmed', type:'Consultation',    notes:'Rhythm monitoring' },
    { id:'a15', patient_id:'p19', patient_name:'Olivia Hall',      doctor_id:'d2', doctor_name:'Dr. Sarah Chen',      department:'Neurology',        date:d(-2),  time:'09:30', status:'Confirmed', type:'Treatment',       notes:'MRI scan scheduled' },
  ];
  appointments.forEach(a => insertAppt.run(a));

  // ── Rooms (45) ───────────────────────────────────────────────────────────
  const insertRoom = db.prepare(`
    INSERT INTO rooms (number, type, floor, status, patient, notes)
    VALUES (@number, @type, @floor, @status, @patient, @notes)
  `);

  const roomDefs = [
    // Floor 1 - General (20 rooms)
    ...Array.from({ length: 20 }, (_, i) => ({
      number: `G${String(i + 101).slice(1)}`, type: 'General',
      floor: 1,
      status: i < 14 ? 'Occupied' : 'Available',
      patient: i < 14 ? ['Emily Parker','Robert Martinez','Linda Thompson','James Wilson','Maria Garcia','David Kim','Susan White','Thomas Brown','Anna Davis','Kevin Nguyen','Patricia Moore','Charles Anderson','Jennifer Taylor','Michael Harris'][i] : '',
      notes: '',
    })),
    // Floor 2 - ICU (10 rooms)
    ...Array.from({ length: 10 }, (_, i) => ({
      number: `ICU-${String(i + 1).padStart(2,'0')}`, type: 'ICU',
      floor: 2,
      status: i < 8 ? 'Occupied' : 'Available',
      patient: i < 8 ? ['Thomas Brown','Michael Harris','','','','','',''][i] || '' : '',
      notes: i < 2 ? 'Critical patient' : '',
    })),
    // Floor 3 - Surgery (8 rooms)
    ...Array.from({ length: 8 }, (_, i) => ({
      number: `OR-${String(i + 1).padStart(2,'0')}`, type: 'Surgery',
      floor: 3,
      status: i < 3 ? 'Occupied' : (i === 7 ? 'Maintenance' : 'Available'),
      patient: '',
      notes: i === 7 ? 'Equipment servicing' : '',
    })),
    // Floor 1 - Emergency (7 rooms)
    ...Array.from({ length: 7 }, (_, i) => ({
      number: `ER-${String(i + 1).padStart(2,'0')}`, type: 'Emergency',
      floor: 1,
      status: i < 4 ? 'Occupied' : 'Available',
      patient: '',
      notes: '',
    })),
  ];
  roomDefs.forEach(r => insertRoom.run(r));

  // ── Revenue (30 days) ────────────────────────────────────────────────────
  const insertRevenue = db.prepare(`
    INSERT INTO revenue (date, amount, source, patient, notes)
    VALUES (@date, @amount, @source, @patient, @notes)
  `);

  const sources = ['Consultation', 'Surgery', 'Medicine', 'Lab Tests', 'Radiology', 'Other'];
  const baseAmounts = { Consultation: 250, Surgery: 8500, Medicine: 180, 'Lab Tests': 320, Radiology: 650, Other: 120 };

  for (let i = 29; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - i);
    const dateStr = dt.toISOString().split('T')[0];
    const entriesPerDay = 4 + Math.floor(Math.random() * 6);
    for (let j = 0; j < entriesPerDay; j++) {
      const source = sources[Math.floor(Math.random() * sources.length)];
      const variance = 0.7 + Math.random() * 0.6;
      insertRevenue.run({
        date: dateStr,
        amount: Math.round(baseAmounts[source] * variance),
        source,
        patient: '',
        notes: '',
      });
    }
  }

  console.log('✅  Database seeded: 5 doctors, 20 patients, 15 appointments, 45 rooms, 30 days revenue');
}

seed();

module.exports = db;
