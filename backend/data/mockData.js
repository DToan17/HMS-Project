const { v4: uuidv4 } = require('uuid');

const doctors = [
  { id: 'd1', name: 'Dr. Michael Johnson', specialty: 'Cardiologist', experience: '15 years', avatar: 'MJ', phone: '+1 555 001 0001', email: 'mjohnson@medicare.com', status: 'Available', patients: 142, rating: 4.9, department: 'Cardiology' },
  { id: 'd2', name: 'Dr. Sarah Chen', specialty: 'Neurologist', experience: '12 years', avatar: 'SC', phone: '+1 555 001 0002', email: 'schen@medicare.com', status: 'Available', patients: 118, rating: 4.8, department: 'Neurology' },
  { id: 'd3', name: 'Dr. James Rivera', specialty: 'Pediatrician', experience: '10 years', avatar: 'JR', phone: '+1 555 001 0003', email: 'jrivera@medicare.com', status: 'Busy', patients: 205, rating: 4.7, department: 'Pediatrics' },
  { id: 'd4', name: 'Dr. Priya Patel', specialty: 'Orthopedic Surgeon', experience: '18 years', avatar: 'PP', phone: '+1 555 001 0004', email: 'ppatel@medicare.com', status: 'Available', patients: 96, rating: 4.9, department: 'Orthopedics' },
  { id: 'd5', name: 'Dr. Thomas Lee', specialty: 'General Physician', experience: '8 years', avatar: 'TL', phone: '+1 555 001 0005', email: 'tlee@medicare.com', status: 'On Leave', patients: 187, rating: 4.6, department: 'General Medicine' },
  { id: 'd6', name: 'Dr. Amelia Foster', specialty: 'Dermatologist', experience: '11 years', avatar: 'AF', phone: '+1 555 001 0006', email: 'afoster@medicare.com', status: 'Available', patients: 134, rating: 4.8, department: 'Dermatology' },
];

const patients = [
  { id: 'p1', name: 'Emily Parker', patientId: '#PAT-2024-1847', age: 32, gender: 'Female', bloodGroup: 'A+', phone: '+1 234 567 8900', email: 'eparker@email.com', address: '123 Oak Street, Springfield, IL 62701', status: 'Active', doctor: 'Dr. Michael Johnson', department: 'Cardiology', lastVisit: '2026-05-15', diagnosis: 'Hypertension', allergies: ['Penicillin'] },
  { id: 'p2', name: 'Robert Martinez', patientId: '#PAT-2024-1848', age: 45, gender: 'Male', bloodGroup: 'O+', phone: '+1 234 567 8901', email: 'rmartinez@email.com', address: '456 Elm Ave, Chicago, IL 60601', status: 'Active', doctor: 'Dr. Sarah Chen', department: 'Neurology', lastVisit: '2026-05-20', diagnosis: 'Migraine', allergies: [] },
  { id: 'p3', name: 'Linda Thompson', patientId: '#PAT-2024-1849', age: 28, gender: 'Female', bloodGroup: 'B+', phone: '+1 234 567 8902', email: 'lthompson@email.com', address: '789 Pine Rd, Naperville, IL 60540', status: 'Active', doctor: 'Dr. James Rivera', department: 'Pediatrics', lastVisit: '2026-05-18', diagnosis: 'Seasonal Allergies', allergies: ['Aspirin'] },
  { id: 'p4', name: 'James Wilson', patientId: '#PAT-2024-1850', age: 60, gender: 'Male', bloodGroup: 'AB-', phone: '+1 234 567 8903', email: 'jwilson@email.com', address: '321 Maple Dr, Rockford, IL 61101', status: 'Inactive', doctor: 'Dr. Priya Patel', department: 'Orthopedics', lastVisit: '2026-04-10', diagnosis: 'Knee Arthritis', allergies: ['Sulfa'] },
  { id: 'p5', name: 'Maria Garcia', patientId: '#PAT-2024-1851', age: 38, gender: 'Female', bloodGroup: 'O-', phone: '+1 234 567 8904', email: 'mgarcia@email.com', address: '654 Cedar Ln, Peoria, IL 61602', status: 'Active', doctor: 'Dr. Thomas Lee', department: 'General Medicine', lastVisit: '2026-05-22', diagnosis: 'Diabetes Type 2', allergies: [] },
  { id: 'p6', name: 'David Kim', patientId: '#PAT-2024-1852', age: 52, gender: 'Male', bloodGroup: 'A-', phone: '+1 234 567 8905', email: 'dkim@email.com', address: '987 Birch Blvd, Aurora, IL 60505', status: 'Active', doctor: 'Dr. Amelia Foster', department: 'Dermatology', lastVisit: '2026-05-25', diagnosis: 'Psoriasis', allergies: ['Latex'] },
  { id: 'p7', name: 'Susan White', patientId: '#PAT-2024-1853', age: 41, gender: 'Female', bloodGroup: 'B-', phone: '+1 234 567 8906', email: 'swhite@email.com', address: '147 Walnut St, Joliet, IL 60432', status: 'Active', doctor: 'Dr. Michael Johnson', department: 'Cardiology', lastVisit: '2026-05-28', diagnosis: 'Arrhythmia', allergies: [] },
  { id: 'p8', name: 'Thomas Brown', patientId: '#PAT-2024-1854', age: 67, gender: 'Male', bloodGroup: 'O+', phone: '+1 234 567 8907', email: 'tbrown@email.com', address: '258 Spruce Ave, Waukegan, IL 60085', status: 'Critical', doctor: 'Dr. Sarah Chen', department: 'Neurology', lastVisit: '2026-05-30', diagnosis: 'Stroke Recovery', allergies: ['Ibuprofen'] },
  { id: 'p9', name: 'Anna Davis', patientId: '#PAT-2024-1855', age: 23, gender: 'Female', bloodGroup: 'AB+', phone: '+1 234 567 8908', email: 'adavis@email.com', address: '369 Poplar Ct, Champaign, IL 61820', status: 'Active', doctor: 'Dr. Thomas Lee', department: 'General Medicine', lastVisit: '2026-05-12', diagnosis: 'Anemia', allergies: [] },
  { id: 'p10', name: 'Kevin Nguyen', patientId: '#PAT-2024-1856', age: 35, gender: 'Male', bloodGroup: 'A+', phone: '+1 234 567 8909', email: 'knguyen@email.com', address: '741 Ash Way, Springfield, IL 62702', status: 'Active', doctor: 'Dr. James Rivera', department: 'Pediatrics', lastVisit: '2026-05-26', diagnosis: 'Asthma', allergies: ['Codeine'] },
];

const appointments = [
  { id: 'a1', patientId: 'p1', patientName: 'Emily Parker', doctorId: 'd1', doctorName: 'Dr. Michael Johnson', department: 'Cardiology', date: '2026-06-03', time: '09:00', status: 'Confirmed', type: 'Follow-up', notes: 'Blood pressure monitoring' },
  { id: 'a2', patientId: 'p2', patientName: 'Robert Martinez', doctorId: 'd2', doctorName: 'Dr. Sarah Chen', department: 'Neurology', date: '2026-06-03', time: '10:30', status: 'Confirmed', type: 'Consultation', notes: 'MRI review' },
  { id: 'a3', patientId: 'p3', patientName: 'Linda Thompson', doctorId: 'd3', doctorName: 'Dr. James Rivera', department: 'Pediatrics', date: '2026-06-03', time: '11:00', status: 'Pending', type: 'Check-up', notes: '' },
  { id: 'a4', patientId: 'p5', patientName: 'Maria Garcia', doctorId: 'd5', doctorName: 'Dr. Thomas Lee', department: 'General Medicine', date: '2026-06-03', time: '14:00', status: 'Confirmed', type: 'Follow-up', notes: 'HbA1c results' },
  { id: 'a5', patientId: 'p6', patientName: 'David Kim', doctorId: 'd6', doctorName: 'Dr. Amelia Foster', department: 'Dermatology', date: '2026-06-04', time: '09:30', status: 'Confirmed', type: 'Treatment', notes: 'Phototherapy session' },
  { id: 'a6', patientId: 'p7', patientName: 'Susan White', doctorId: 'd1', doctorName: 'Dr. Michael Johnson', department: 'Cardiology', date: '2026-06-04', time: '11:00', status: 'Confirmed', type: 'Consultation', notes: 'ECG review' },
  { id: 'a7', patientId: 'p8', patientName: 'Thomas Brown', doctorId: 'd2', doctorName: 'Dr. Sarah Chen', department: 'Neurology', date: '2026-06-05', time: '10:00', status: 'Pending', type: 'Emergency', notes: 'Urgent follow-up' },
  { id: 'a8', patientId: 'p4', patientName: 'James Wilson', doctorId: 'd4', doctorName: 'Dr. Priya Patel', department: 'Orthopedics', date: '2026-06-05', time: '13:00', status: 'Cancelled', type: 'Surgery Consult', notes: '' },
  { id: 'a9', patientId: 'p9', patientName: 'Anna Davis', doctorId: 'd5', doctorName: 'Dr. Thomas Lee', department: 'General Medicine', date: '2026-06-06', time: '09:00', status: 'Confirmed', type: 'Check-up', notes: 'Iron studies' },
  { id: 'a10', patientId: 'p10', patientName: 'Kevin Nguyen', doctorId: 'd3', doctorName: 'Dr. James Rivera', department: 'Pediatrics', date: '2026-06-06', time: '10:30', status: 'Confirmed', type: 'Follow-up', notes: 'Inhaler technique check' },
];

const weeklyAppointments = [
  { day: 'Mon', appointments: 28 },
  { day: 'Tue', appointments: 35 },
  { day: 'Wed', appointments: 42 },
  { day: 'Thu', appointments: 38 },
  { day: 'Fri', appointments: 45 },
  { day: 'Sat', appointments: 30 },
  { day: 'Sun', appointments: 22 },
];

const monthlyRevenue = [
  { month: 'Jan', revenue: 65000 },
  { month: 'Feb', revenue: 72000 },
  { month: 'Mar', revenue: 68000 },
  { month: 'Apr', revenue: 78000 },
  { month: 'May', revenue: 85000 },
  { month: 'Jun', revenue: 92000 },
];

module.exports = { doctors, patients, appointments, weeklyAppointments, monthlyRevenue, uuidv4 };
