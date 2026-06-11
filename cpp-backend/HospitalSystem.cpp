#include "HospitalSystem.h"
#include <iostream>
#include <algorithm>
using namespace std;

HospitalSystem::HospitalSystem()
    : nextPatientId(1), nextDoctorId(100),
      nextAppointmentId(1000), nextBillId(2000),
      nextPrescriptionId(3000)
{
    loadAllFromDisk();
    cout << "Hospital System initialized." << endl;
}

HospitalSystem::~HospitalSystem()
{
    for (auto* p : people)        delete p;
    for (auto* a : appointments)  delete a;
    for (auto* b : bills)         delete b;
    for (auto* p : prescriptions) delete p;
}

void HospitalSystem::loadAllFromDisk()
{
    // Load patients
    auto patients = fileManager.loadAllPatients();
    for (auto& p : patients) {
        people.push_back(new Patient(p));
        if (p.getPersonId() >= nextPatientId)
            nextPatientId = p.getPersonId() + 1;
    }

    // Load doctors
    auto doctors = fileManager.loadAllDoctors();
    for (auto& d : doctors) {
        people.push_back(new Doctor(d));
        if (d.getPersonId() >= nextDoctorId)
            nextDoctorId = d.getPersonId() + 1;
    }

    // Load appointments
    auto appts = fileManager.loadAllAppointments();
    for (auto& a : appts) {
        appointments.push_back(new Appointment(a));
        if (a.getAppointmentId() >= nextAppointmentId)
            nextAppointmentId = a.getAppointmentId() + 1;
    }

    // Load bills
    auto bls = fileManager.loadAllBills();
    for (auto& b : bls) {
        bills.push_back(new Bill(b));
        if (b.getBillId() >= nextBillId)
            nextBillId = b.getBillId() + 1;
    }

    // Load prescriptions
    auto prescs = fileManager.loadAllPrescriptions();
    for (auto& p : prescs) {
        prescriptions.push_back(new Prescription(p));
        if (p.getPrescriptionId() >= nextPrescriptionId)
            nextPrescriptionId = p.getPrescriptionId() + 1;
    }

    cout << "Loaded " << patients.size() << " patients, "
         << doctors.size() << " doctors, "
         << appts.size() << " appointments, "
         << bls.size() << " bills, "
         << prescs.size() << " prescriptions from disk." << endl;
}

// ===== PATIENT =====
void HospitalSystem::addPatient( Patient& p )
{
    p.setPersonId(nextPatientId++);
    if (!p.validateData()) { cerr << "Invalid patient data." << endl; return; }
    Patient* newP = new Patient(p);
    people.push_back(newP);
    fileManager.savePatient(p);
    cout << "Patient added: " << p.getName() << " (ID: " << p.getPersonId() << ")" << endl;
}

void HospitalSystem::removePatient( int patientId )
{
    for (auto it = people.begin(); it != people.end(); ++it) {
        if ((*it)->getPersonId() == patientId) {
            fileManager.deletePatient(patientId);
            delete *it;
            people.erase(it);
            cout << "Patient ID " << patientId << " removed." << endl;
            return;
        }
    }
    cerr << "Patient ID " << patientId << " not found." << endl;
}

Patient* HospitalSystem::searchPatient( int patientId )
{
    for (auto* p : people) {
        Patient* pat = dynamic_cast<Patient*>(p);
        if (pat && pat->getPersonId() == patientId) return pat;
    }
    return nullptr;
}

Patient* HospitalSystem::searchPatientByName( const string& name )
{
    for (auto* p : people) {
        Patient* pat = dynamic_cast<Patient*>(p);
        if (pat && pat->getName() == name) return pat;
    }
    return nullptr;
}

void HospitalSystem::updatePatient( Patient& p )
{
    for (auto* person : people) {
        Patient* pat = dynamic_cast<Patient*>(person);
        if (pat && pat->getPersonId() == p.getPersonId()) {
            *pat = p;
            fileManager.updatePatient(p);
            cout << "Patient updated: " << p.getName() << endl;
            return;
        }
    }
    cerr << "Patient not found for update." << endl;
}

void HospitalSystem::listAllPatients() const
{
    cout << "\n===== ALL PATIENTS =====" << endl;
    bool found = false;
    for (auto* p : people) {
        Patient* pat = dynamic_cast<Patient*>(p);
        if (pat) { pat->displayInfo(); found = true; }
    }
    if (!found) cout << "No patients found." << endl;
}

// ===== DOCTOR =====
void HospitalSystem::addDoctor( Doctor& d )
{
    d.setPersonId(nextDoctorId++);
    Doctor* newD = new Doctor(d);
    people.push_back(newD);
    fileManager.saveDoctor(d);
    cout << "Doctor added: " << d.getName() << " (ID: " << d.getPersonId() << ")" << endl;
}

Doctor* HospitalSystem::searchDoctor( int doctorId )
{
    for (auto* p : people) {
        Doctor* doc = dynamic_cast<Doctor*>(p);
        if (doc && doc->getPersonId() == doctorId) return doc;
    }
    return nullptr;
}

void HospitalSystem::listAllDoctors() const
{
    cout << "\n===== ALL DOCTORS =====" << endl;
    bool found = false;
    for (auto* p : people) {
        Doctor* doc = dynamic_cast<Doctor*>(p);
        if (doc) { doc->displayInfo(); found = true; }
    }
    if (!found) cout << "No doctors found." << endl;
}

// ===== APPOINTMENT =====
void HospitalSystem::bookAppointment( Appointment& a )
{
    a = Appointment(nextAppointmentId++, a.getPatientId(),
                    a.getDoctorId(), a.getDate(),
                    a.getTime(), a.getReason());
    Appointment* newA = new Appointment(a);
    appointments.push_back(newA);
    fileManager.saveAppointment(a);
    cout << "Appointment booked: ID " << a.getAppointmentId() << endl;
}

void HospitalSystem::cancelAppointment( int appointmentId )
{
    for (auto* a : appointments) {
        if (a->getAppointmentId() == appointmentId) {
            a->setStatus(Cancelled);
            fileManager.updateAppointment(*a);
            cout << "Appointment " << appointmentId << " cancelled." << endl;
            return;
        }
    }
    cerr << "Appointment not found." << endl;
}

void HospitalSystem::completeAppointment( int appointmentId )
{
    for (auto* a : appointments) {
        if (a->getAppointmentId() == appointmentId) {
            a->setStatus(Completed);
            fileManager.updateAppointment(*a);
            cout << "Appointment " << appointmentId << " completed." << endl;
            return;
        }
    }
    cerr << "Appointment not found." << endl;
}

void HospitalSystem::listAllAppointments() const
{
    cout << "\n===== ALL APPOINTMENTS =====" << endl;
    if (appointments.empty()) { cout << "No appointments." << endl; return; }
    for (auto* a : appointments) a->displayInfo();
}

// ===== BILL =====
void HospitalSystem::createBill( Bill& b )
{
    b = Bill(nextBillId++, b.getPatientId(),
             b.getAmount(), b.getDate(), b.getDescription());
    Bill* newB = new Bill(b);
    bills.push_back(newB);
    fileManager.saveBill(b);
    cout << "Bill created: ID " << b.getBillId()
         << " Amount: $" << b.getAmount() << endl;
}

void HospitalSystem::processPayment( int billId, double amount )
{
    for (auto* b : bills) {
        if (b->getBillId() == billId) {
            b->makePayment(amount);
            fileManager.updateBill(*b);
            return;
        }
    }
    cerr << "Bill ID " << billId << " not found." << endl;
}

void HospitalSystem::listAllBills() const
{
    cout << "\n===== ALL BILLS =====" << endl;
    if (bills.empty()) { cout << "No bills." << endl; return; }
    for (auto* b : bills) b->displayInfo();
}

// ===== PRESCRIPTION =====
void HospitalSystem::addPrescription( Prescription& p )
{
    p = Prescription(nextPrescriptionId++, p.getPatientId(),
                     p.getDoctorId(), p.getMedication(),
                     p.getDosage(), p.getFrequency(),
                     p.getStartDate(), p.getEndDate());
    Prescription* newP = new Prescription(p);
    prescriptions.push_back(newP);
    fileManager.savePrescription(p);
    cout << "Prescription added: ID " << p.getPrescriptionId() << endl;
}

void HospitalSystem::listAllPrescriptions() const
{
    cout << "\n===== ALL PRESCRIPTIONS =====" << endl;
    if (prescriptions.empty()) { cout << "No prescriptions." << endl; return; }
    for (auto* p : prescriptions) p->displayInfo();
}

// ===== REPORTS =====
void HospitalSystem::generateReport( const string& filename )
{
    fileManager.exportAllToCSV(filename, people, appointments, bills, prescriptions);
}

void HospitalSystem::generatePatientReport( int patientId )
{
    Patient* p = searchPatient(patientId);
    if (!p) { cerr << "Patient not found." << endl; return; }

    cout << "\n===== PATIENT REPORT =====" << endl;
    p->displayInfo();

    cout << "\n--- Appointments ---" << endl;
    for (auto* a : appointments)
        if (a->getPatientId() == patientId) a->displayInfo();

    cout << "\n--- Bills ---" << endl;
    for (auto* b : bills)
        if (b->getPatientId() == patientId) b->displayInfo();

    cout << "\n--- Prescriptions ---" << endl;
    for (auto* pr : prescriptions)
        if (pr->getPatientId() == patientId) pr->displayInfo();
}
