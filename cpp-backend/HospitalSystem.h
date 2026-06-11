#ifndef HOSPITALSYSTEM_H
#define HOSPITALSYSTEM_H

#include "Patient.h"
#include "Doctor.h"
#include "Appointment.h"
#include "Bill.h"
#include "Prescription.h"
#include "FileManager.h"
#include <vector>
#include <string>
using namespace std;

class HospitalSystem
{
public:
    HospitalSystem();
    ~HospitalSystem();

    // Patient operations
    void addPatient( Patient& p );
    void removePatient( int patientId );
    Patient* searchPatient( int patientId );
    Patient* searchPatientByName( const string& name );
    void updatePatient( Patient& p );
    void listAllPatients() const;

    // Doctor operations
    void addDoctor( Doctor& d );
    Doctor* searchDoctor( int doctorId );
    void listAllDoctors() const;

    // Appointment operations
    void bookAppointment( Appointment& a );
    void cancelAppointment( int appointmentId );
    void completeAppointment( int appointmentId );
    void listAllAppointments() const;

    // Bill operations
    void createBill( Bill& b );
    void processPayment( int billId, double amount );
    void listAllBills() const;

    // Prescription operations
    void addPrescription( Prescription& p );
    void listAllPrescriptions() const;

    // Reports
    void generateReport( const string& filename );
    void generatePatientReport( int patientId );

private:
    vector<Person*>       people;
    vector<Appointment*>  appointments;
    vector<Bill*>         bills;
    vector<Prescription*> prescriptions;
    FileManager           fileManager;

    int nextPatientId;
    int nextDoctorId;
    int nextAppointmentId;
    int nextBillId;
    int nextPrescriptionId;

    void loadAllFromDisk();
};

#endif
