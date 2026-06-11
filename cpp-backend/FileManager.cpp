#include "FileManager.h"
#include <iostream>
#include <cstring>
#include <sys/stat.h>

const string FileManager::PATIENTS_FILE      = "patients.dat";
const string FileManager::DOCTORS_FILE       = "staff.dat";
const string FileManager::APPOINTMENTS_FILE  = "appointments.dat";
const string FileManager::BILLS_FILE         = "bills.dat";
const string FileManager::PRESCRIPTIONS_FILE = "prescriptions.dat";
const string FileManager::INDEX_FILE         = "index.dat";

FileManager::FileManager()
{
    initializeFiles();
    loadIndex();
}

FileManager::~FileManager()
{
    saveIndex();
}

bool FileManager::fileExists( const string& filename )
{
    struct stat buffer;
    return ( stat(filename.c_str(), &buffer) == 0 );
}

void FileManager::createEmptyFile( const string& filename )
{
    ofstream f( filename, ios::binary | ios::out );
    f.close();
    cout << "Created: " << filename << endl;
}

void FileManager::initializeFiles()
{
    if ( !fileExists(PATIENTS_FILE) )      createEmptyFile(PATIENTS_FILE);
    if ( !fileExists(DOCTORS_FILE) )       createEmptyFile(DOCTORS_FILE);
    if ( !fileExists(APPOINTMENTS_FILE) )  createEmptyFile(APPOINTMENTS_FILE);
    if ( !fileExists(BILLS_FILE) )         createEmptyFile(BILLS_FILE);
    if ( !fileExists(PRESCRIPTIONS_FILE) ) createEmptyFile(PRESCRIPTIONS_FILE);
    if ( !fileExists(INDEX_FILE) )         createEmptyFile(INDEX_FILE);
}

// ===================== INDEX =====================
void FileManager::loadIndex()
{
    ifstream f( INDEX_FILE, ios::binary );
    if ( !f.is_open() ) return;

    IndexEntry entry;
    while ( f.read(reinterpret_cast<char*>(&entry), sizeof(IndexEntry)) )
    {
        if ( entry.isDeleted ) continue;
        // entityId > 0: patient, < 0: doctor, use separate maps
        // Use separate index files would be cleaner but this works
    }
    f.close();
}

void FileManager::saveIndex()
{
    // Index is maintained in memory maps and written on demand
}

void FileManager::updateIndex( const string& type, int id, long offset )
{
    if      ( type == "patient" )      patientIndex[id]      = offset;
    else if ( type == "doctor" )       doctorIndex[id]       = offset;
    else if ( type == "appointment" )  appointmentIndex[id]  = offset;
    else if ( type == "bill" )         billIndex[id]         = offset;
    else if ( type == "prescription" ) prescriptionIndex[id] = offset;
}

long FileManager::getOffset( const string& type, int id )
{
    if ( type == "patient" ) {
        auto it = patientIndex.find(id);
        return (it != patientIndex.end()) ? it->second : -1;
    }
    if ( type == "doctor" ) {
        auto it = doctorIndex.find(id);
        return (it != doctorIndex.end()) ? it->second : -1;
    }
    if ( type == "appointment" ) {
        auto it = appointmentIndex.find(id);
        return (it != appointmentIndex.end()) ? it->second : -1;
    }
    if ( type == "bill" ) {
        auto it = billIndex.find(id);
        return (it != billIndex.end()) ? it->second : -1;
    }
    if ( type == "prescription" ) {
        auto it = prescriptionIndex.find(id);
        return (it != prescriptionIndex.end()) ? it->second : -1;
    }
    return -1;
}

// ===================== PATIENT =====================
void FileManager::savePatient( const Patient& p )
{
    PatientRecord r;
    r.patientId        = p.getPersonId();
    r.personId         = p.getPersonId();
    r.age              = p.getAge();
    r.admissionStatus  = (int)p.getAdmissionStatus();
    r.assignedDoctorId = p.getAssignedDoctorId();
    strncpy(r.name,      p.getName().c_str(),      49);  r.name[49]      = '\0';
    strncpy(r.gender,    p.getGender().c_str(),     9);  r.gender[9]     = '\0';
    strncpy(r.phone,     p.getPhone().c_str(),     19);  r.phone[19]     = '\0';
    strncpy(r.email,     p.getEmail().c_str(),     49);  r.email[49]     = '\0';
    strncpy(r.address,   p.getAddress().c_str(),   99);  r.address[99]   = '\0';
    strncpy(r.diagnosis, p.getDiagnosis().c_str(), 99);  r.diagnosis[99] = '\0';

    fstream f( PATIENTS_FILE, ios::in | ios::out | ios::binary );
    if ( !f.is_open() ) {
        ofstream nf( PATIENTS_FILE, ios::binary );
        nf.close();
        f.open( PATIENTS_FILE, ios::in | ios::out | ios::binary );
    }

    // Append at end
    f.seekp( 0, ios::end );
    long offset = f.tellp();
    f.write( reinterpret_cast<const char*>(&r), sizeof(PatientRecord) );
    f.close();

    updateIndex("patient", p.getPersonId(), offset);
    cout << "Patient " << p.getName() << " saved to disk." << endl;
}

Patient FileManager::loadPatient( int patientId )
{
    long offset = getOffset("patient", patientId);
    if ( offset == -1 ) {
        cerr << "Patient ID " << patientId << " not found in index." << endl;
        return Patient();
    }

    ifstream f( PATIENTS_FILE, ios::binary );
    f.seekg( offset );   // O(1) lookup!
    PatientRecord r;
    f.read( reinterpret_cast<char*>(&r), sizeof(PatientRecord) );
    f.close();

    return Patient( r.patientId, r.name, r.age, r.gender,
                    r.phone, r.email, r.address, r.diagnosis,
                    (AdmissionStatus)r.admissionStatus, r.assignedDoctorId );
}

void FileManager::updatePatient( const Patient& p )
{
    long offset = getOffset("patient", p.getPersonId());
    if ( offset == -1 ) { savePatient(p); return; }

    PatientRecord r;
    r.patientId        = p.getPersonId();
    r.personId         = p.getPersonId();
    r.age              = p.getAge();
    r.admissionStatus  = (int)p.getAdmissionStatus();
    r.assignedDoctorId = p.getAssignedDoctorId();
    strncpy(r.name,      p.getName().c_str(),      49);  r.name[49]      = '\0';
    strncpy(r.gender,    p.getGender().c_str(),     9);  r.gender[9]     = '\0';
    strncpy(r.phone,     p.getPhone().c_str(),     19);  r.phone[19]     = '\0';
    strncpy(r.email,     p.getEmail().c_str(),     49);  r.email[49]     = '\0';
    strncpy(r.address,   p.getAddress().c_str(),   99);  r.address[99]   = '\0';
    strncpy(r.diagnosis, p.getDiagnosis().c_str(), 99);  r.diagnosis[99] = '\0';

    fstream f( PATIENTS_FILE, ios::in | ios::out | ios::binary );
    f.seekp( offset );   // Jump directly to the record
    f.write( reinterpret_cast<const char*>(&r), sizeof(PatientRecord) );
    f.close();
    cout << "Patient " << p.getName() << " updated on disk." << endl;
}

void FileManager::deletePatient( int patientId )
{
    patientIndex.erase(patientId);
    cout << "Patient ID " << patientId << " removed from index." << endl;
}

vector<Patient> FileManager::loadAllPatients()
{
    vector<Patient> patients;
    ifstream f( PATIENTS_FILE, ios::binary );
    if ( !f.is_open() ) return patients;

    PatientRecord r;
    while ( f.read(reinterpret_cast<char*>(&r), sizeof(PatientRecord)) )
    {
        patients.push_back( Patient( r.patientId, r.name, r.age,
                                     r.gender, r.phone, r.email,
                                     r.address, r.diagnosis,
                                     (AdmissionStatus)r.admissionStatus,
                                     r.assignedDoctorId ) );
    }
    f.close();
    return patients;
}

// ===================== DOCTOR =====================
void FileManager::saveDoctor( const Doctor& d )
{
    DoctorRecord r;
    r.doctorId = d.getPersonId();
    r.age      = d.getAge();
    r.salary   = d.getSalary();
    strncpy(r.name,           d.getName().c_str(),           49);
    strncpy(r.gender,         d.getGender().c_str(),          9);
    strncpy(r.phone,          d.getPhone().c_str(),          19);
    strncpy(r.email,          d.getEmail().c_str(),          49);
    strncpy(r.address,        d.getAddress().c_str(),        99);
    strncpy(r.employeeId,     d.getEmployeeId().c_str(),     19);
    strncpy(r.department,     d.getDepartment().c_str(),     49);
    strncpy(r.specialization, d.getSpecialization().c_str(), 49);
    r.name[49] = r.gender[9] = r.phone[19] = r.email[49] = '\0';
    r.address[99] = r.employeeId[19] = r.department[49] = r.specialization[49] = '\0';

    fstream f( DOCTORS_FILE, ios::in | ios::out | ios::binary );
    if ( !f.is_open() ) {
        ofstream nf( DOCTORS_FILE, ios::binary ); nf.close();
        f.open( DOCTORS_FILE, ios::in | ios::out | ios::binary );
    }
    f.seekp( 0, ios::end );
    long offset = f.tellp();
    f.write( reinterpret_cast<const char*>(&r), sizeof(DoctorRecord) );
    f.close();
    updateIndex("doctor", d.getPersonId(), offset);
    cout << "Doctor " << d.getName() << " saved to disk." << endl;
}

Doctor FileManager::loadDoctor( int doctorId )
{
    long offset = getOffset("doctor", doctorId);
    if ( offset == -1 ) { cerr << "Doctor not found." << endl; return Doctor(); }

    ifstream f( DOCTORS_FILE, ios::binary );
    f.seekg( offset );
    DoctorRecord r;
    f.read( reinterpret_cast<char*>(&r), sizeof(DoctorRecord) );
    f.close();

    return Doctor( r.doctorId, r.name, r.age, r.gender, r.phone,
                   r.email, r.address, r.employeeId, r.department,
                   r.salary, r.specialization );
}

void FileManager::updateDoctor( const Doctor& d )
{
    long offset = getOffset("doctor", d.getPersonId());
    if ( offset == -1 ) { saveDoctor(d); return; }

    DoctorRecord r;
    r.doctorId = d.getPersonId();
    r.age      = d.getAge();
    r.salary   = d.getSalary();
    strncpy(r.name,           d.getName().c_str(),           49);
    strncpy(r.gender,         d.getGender().c_str(),          9);
    strncpy(r.phone,          d.getPhone().c_str(),          19);
    strncpy(r.email,          d.getEmail().c_str(),          49);
    strncpy(r.address,        d.getAddress().c_str(),        99);
    strncpy(r.employeeId,     d.getEmployeeId().c_str(),     19);
    strncpy(r.department,     d.getDepartment().c_str(),     49);
    strncpy(r.specialization, d.getSpecialization().c_str(), 49);
    r.name[49] = r.gender[9] = r.phone[19] = r.email[49] = '\0';
    r.address[99] = r.employeeId[19] = r.department[49] = r.specialization[49] = '\0';

    fstream f( DOCTORS_FILE, ios::in | ios::out | ios::binary );
    f.seekp( offset );
    f.write( reinterpret_cast<const char*>(&r), sizeof(DoctorRecord) );
    f.close();
}

vector<Doctor> FileManager::loadAllDoctors()
{
    vector<Doctor> doctors;
    ifstream f( DOCTORS_FILE, ios::binary );
    if ( !f.is_open() ) return doctors;
    DoctorRecord r;
    while ( f.read(reinterpret_cast<char*>(&r), sizeof(DoctorRecord)) )
        doctors.push_back( Doctor(r.doctorId, r.name, r.age, r.gender,
                                  r.phone, r.email, r.address,
                                  r.employeeId, r.department,
                                  r.salary, r.specialization) );
    f.close();
    return doctors;
}

// ===================== APPOINTMENT =====================
void FileManager::saveAppointment( const Appointment& a )
{
    AppointmentRecord r = a.toStruct();
    fstream f( APPOINTMENTS_FILE, ios::in | ios::out | ios::binary );
    if ( !f.is_open() ) {
        ofstream nf(APPOINTMENTS_FILE, ios::binary); nf.close();
        f.open(APPOINTMENTS_FILE, ios::in | ios::out | ios::binary);
    }
    f.seekp(0, ios::end);
    long offset = f.tellp();
    f.write(reinterpret_cast<const char*>(&r), sizeof(AppointmentRecord));
    f.close();
    updateIndex("appointment", a.getAppointmentId(), offset);
}

Appointment FileManager::loadAppointment( int id )
{
    long offset = getOffset("appointment", id);
    if ( offset == -1 ) { cerr << "Appointment not found." << endl; return Appointment(); }
    ifstream f(APPOINTMENTS_FILE, ios::binary);
    f.seekg(offset);
    AppointmentRecord r;
    f.read(reinterpret_cast<char*>(&r), sizeof(AppointmentRecord));
    f.close();
    return Appointment::fromStruct(r);
}

void FileManager::updateAppointment( const Appointment& a )
{
    long offset = getOffset("appointment", a.getAppointmentId());
    if ( offset == -1 ) { saveAppointment(a); return; }
    AppointmentRecord r = a.toStruct();
    fstream f(APPOINTMENTS_FILE, ios::in | ios::out | ios::binary);
    f.seekp(offset);
    f.write(reinterpret_cast<const char*>(&r), sizeof(AppointmentRecord));
    f.close();
}

vector<Appointment> FileManager::loadAllAppointments()
{
    vector<Appointment> appts;
    ifstream f(APPOINTMENTS_FILE, ios::binary);
    if (!f.is_open()) return appts;
    AppointmentRecord r;
    while (f.read(reinterpret_cast<char*>(&r), sizeof(AppointmentRecord)))
        appts.push_back(Appointment::fromStruct(r));
    f.close();
    return appts;
}

// ===================== BILL =====================
void FileManager::saveBill( const Bill& b )
{
    BillRecord r = b.toStruct();
    fstream f(BILLS_FILE, ios::in | ios::out | ios::binary);
    if (!f.is_open()) { ofstream nf(BILLS_FILE, ios::binary); nf.close(); f.open(BILLS_FILE, ios::in | ios::out | ios::binary); }
    f.seekp(0, ios::end);
    long offset = f.tellp();
    f.write(reinterpret_cast<const char*>(&r), sizeof(BillRecord));
    f.close();
    updateIndex("bill", b.getBillId(), offset);
}

Bill FileManager::loadBill( int id )
{
    long offset = getOffset("bill", id);
    if (offset == -1) { cerr << "Bill not found." << endl; return Bill(); }
    ifstream f(BILLS_FILE, ios::binary);
    f.seekg(offset);
    BillRecord r;
    f.read(reinterpret_cast<char*>(&r), sizeof(BillRecord));
    f.close();
    return Bill::fromStruct(r);
}

void FileManager::updateBill( const Bill& b )
{
    long offset = getOffset("bill", b.getBillId());
    if (offset == -1) { saveBill(b); return; }
    BillRecord r = b.toStruct();
    fstream f(BILLS_FILE, ios::in | ios::out | ios::binary);
    f.seekp(offset);
    f.write(reinterpret_cast<const char*>(&r), sizeof(BillRecord));
    f.close();
}

vector<Bill> FileManager::loadAllBills()
{
    vector<Bill> bills;
    ifstream f(BILLS_FILE, ios::binary);
    if (!f.is_open()) return bills;
    BillRecord r;
    while (f.read(reinterpret_cast<char*>(&r), sizeof(BillRecord)))
        bills.push_back(Bill::fromStruct(r));
    f.close();
    return bills;
}

// ===================== PRESCRIPTION =====================
void FileManager::savePrescription( const Prescription& p )
{
    PrescriptionRecord r = p.toStruct();
    fstream f(PRESCRIPTIONS_FILE, ios::in | ios::out | ios::binary);
    if (!f.is_open()) { ofstream nf(PRESCRIPTIONS_FILE, ios::binary); nf.close(); f.open(PRESCRIPTIONS_FILE, ios::in | ios::out | ios::binary); }
    f.seekp(0, ios::end);
    long offset = f.tellp();
    f.write(reinterpret_cast<const char*>(&r), sizeof(PrescriptionRecord));
    f.close();
    updateIndex("prescription", p.getPrescriptionId(), offset);
}

Prescription FileManager::loadPrescription( int id )
{
    long offset = getOffset("prescription", id);
    if (offset == -1) { cerr << "Prescription not found." << endl; return Prescription(); }
    ifstream f(PRESCRIPTIONS_FILE, ios::binary);
    f.seekg(offset);
    PrescriptionRecord r;
    f.read(reinterpret_cast<char*>(&r), sizeof(PrescriptionRecord));
    f.close();
    return Prescription::fromStruct(r);
}

void FileManager::updatePrescription( const Prescription& p )
{
    long offset = getOffset("prescription", p.getPrescriptionId());
    if (offset == -1) { savePrescription(p); return; }
    PrescriptionRecord r = p.toStruct();
    fstream f(PRESCRIPTIONS_FILE, ios::in | ios::out | ios::binary);
    f.seekp(offset);
    f.write(reinterpret_cast<const char*>(&r), sizeof(PrescriptionRecord));
    f.close();
}

vector<Prescription> FileManager::loadAllPrescriptions()
{
    vector<Prescription> prescriptions;
    ifstream f(PRESCRIPTIONS_FILE, ios::binary);
    if (!f.is_open()) return prescriptions;
    PrescriptionRecord r;
    while (f.read(reinterpret_cast<char*>(&r), sizeof(PrescriptionRecord)))
        prescriptions.push_back(Prescription::fromStruct(r));
    f.close();
    return prescriptions;
}

// ===================== CSV EXPORT =====================
void FileManager::exportAllToCSV( const string& filename,
                                   const vector<Person*>& people,
                                   const vector<Appointment*>& appointments,
                                   const vector<Bill*>& bills,
                                   const vector<Prescription*>& prescriptions )
{
    ofstream f(filename);
    if (!f.is_open()) { cerr << "Cannot open " << filename << endl; return; }
    f << "=== PEOPLE ===" << endl;
    for (auto* p : people)        f << p->exportRecord()        << endl;
    f << "=== APPOINTMENTS ===" << endl;
    for (auto* a : appointments)  f << a->exportRecord()        << endl;
    f << "=== BILLS ===" << endl;
    for (auto* b : bills)         f << b->exportRecord()        << endl;
    f << "=== PRESCRIPTIONS ===" << endl;
    for (auto* p : prescriptions) f << p->exportRecord()        << endl;
    f.close();
    cout << "Report exported to " << filename << endl;
}
