#ifndef FILEMANAGER_H
#define FILEMANAGER_H

#include "Patient.h"
#include "Doctor.h"
#include "Appointment.h"
#include "Bill.h"
#include "Prescription.h"
#include <fstream>
#include <map>
#include <vector>

// Fixed-size structs for binary file I/O
struct PatientRecord {
    int    patientId;
    int    personId;
    char   name[50];
    int    age;
    char   gender[10];
    char   phone[20];
    char   email[50];
    char   address[100];
    char   diagnosis[100];
    int    admissionStatus;
    int    assignedDoctorId;
};

struct DoctorRecord {
    int    doctorId;
    char   name[50];
    int    age;
    char   gender[10];
    char   phone[20];
    char   email[50];
    char   address[100];
    char   employeeId[20];
    char   department[50];
    double salary;
    char   specialization[50];
};

struct IndexEntry {
    int    entityId;
    long   byteOffset;
    bool   isDeleted;
};

class FileManager
{
public:
    FileManager();
    ~FileManager();

    // Initialize all .dat files on first launch
    void initializeFiles();

    // Patient file operations
    void    savePatient( const Patient& p );
    Patient loadPatient( int patientId );
    void    updatePatient( const Patient& p );
    void    deletePatient( int patientId );
    vector<Patient> loadAllPatients();

    // Doctor file operations
    void    saveDoctor( const Doctor& d );
    Doctor  loadDoctor( int doctorId );
    void    updateDoctor( const Doctor& d );
    vector<Doctor> loadAllDoctors();

    // Appointment file operations
    void        saveAppointment( const Appointment& a );
    Appointment loadAppointment( int appointmentId );
    void        updateAppointment( const Appointment& a );
    vector<Appointment> loadAllAppointments();

    // Bill file operations
    void   saveBill( const Bill& b );
    Bill   loadBill( int billId );
    void   updateBill( const Bill& b );
    vector<Bill> loadAllBills();

    // Prescription file operations
    void         savePrescription( const Prescription& p );
    Prescription loadPrescription( int prescriptionId );
    void         updatePrescription( const Prescription& p );
    vector<Prescription> loadAllPrescriptions();

    // Report: export all records to CSV
    void exportAllToCSV( const string& filename,
                         const vector<Person*>& people,
                         const vector<Appointment*>& appointments,
                         const vector<Bill*>& bills,
                         const vector<Prescription*>& prescriptions );

private:
    // File paths
    static const string PATIENTS_FILE;
    static const string DOCTORS_FILE;
    static const string APPOINTMENTS_FILE;
    static const string BILLS_FILE;
    static const string PRESCRIPTIONS_FILE;
    static const string INDEX_FILE;

    // Index maps: entityId → byte offset
    map<int, long> patientIndex;
    map<int, long> doctorIndex;
    map<int, long> appointmentIndex;
    map<int, long> billIndex;
    map<int, long> prescriptionIndex;

    // Index operations
    void loadIndex();
    void saveIndex();
    void updateIndex( const string& type, int id, long offset );
    long getOffset( const string& type, int id );

    bool fileExists( const string& filename );
    void createEmptyFile( const string& filename );
};

#endif
