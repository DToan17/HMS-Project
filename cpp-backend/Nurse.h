#ifndef NURSE_H
#define NURSE_H

#include "Staff.h"
#include <vector>

// ============================================================
// Nurse — Level 3 of the inheritance hierarchy
// Extends Staff (which extends Person).
// Responsible for ward-level patient care and shift management.
// Author: Doan Minh Tung
// ============================================================

class Nurse : public Staff
{
public:
    // --------------------------------------------------------
    // Constructor
    // Initializes all Person + Staff fields plus nurse-specific
    // wardAssignment and shift data.
    // --------------------------------------------------------
    Nurse( int id = 0, string name = "", int age = 0,
           string gender = "", string phone = "",
           string email = "", string address = "",
           string employeeId = "", string department = "",
           double salary = 0.0,
           string wardAssignment = "",
           string shiftSchedule  = "" );

    // --------------------------------------------------------
    // Pure virtual overrides required by Person base class
    // --------------------------------------------------------
    void   displayInfo()  const override;
    string exportRecord() const override;

    // --------------------------------------------------------
    // calculateFee: nurse consultation assistance fee
    // Override of Person::calculateFee()
    // Returns a flat fee based on shift type (day/night)
    // --------------------------------------------------------
    double calculateFee() const override;

    // --------------------------------------------------------
    // validateData: extend Person::validateData()
    // Checks that wardAssignment is not empty
    // --------------------------------------------------------
    bool validateData() const override;

    // --------------------------------------------------------
    // updatePatientRecord: nurse updates a patient's care note.
    // Prints confirmation — actual record update goes via
    // HospitalSystem which calls FileManager.
    // --------------------------------------------------------
    void updatePatientRecord( int patientId, const string& note ) const;

    // --------------------------------------------------------
    // addPatientToWard / removePatientFromWard:
    // Track which patients this nurse is responsible for.
    // --------------------------------------------------------
    void addPatientToWard( int patientId );
    void removePatientFromWard( int patientId );
    bool isResponsibleFor( int patientId ) const;

    // Getters
    string          getWardAssignment() const { return wardAssignment; }
    string          getShiftSchedule()  const { return shiftSchedule; }
    vector<int>     getWardPatients()   const { return wardPatients; }

    // Setters
    void setWardAssignment( string w ) { wardAssignment = w; }
    void setShiftSchedule ( string s ) { shiftSchedule  = s; }

    // --------------------------------------------------------
    // toStruct / fromStruct: binary serialization helpers
    // Mirrors the pattern used by Appointment and Prescription
    // so FileManager can save/load Nurse records consistently.
    // --------------------------------------------------------
    struct NurseRecord {
        int    nurseId;
        int    age;
        double salary;
        char   name[50];
        char   gender[10];
        char   phone[20];
        char   email[50];
        char   address[100];
        char   employeeId[20];
        char   department[50];
        char   wardAssignment[50];
        char   shiftSchedule[50];
    };

    NurseRecord        toStruct()  const;
    static Nurse fromStruct( const NurseRecord& r );

private:
    string      wardAssignment;  // e.g. "Ward A", "ICU", "Pediatrics"
    string      shiftSchedule;   // e.g. "Day", "Night", "Rotating"
    vector<int> wardPatients;    // patientIds this nurse currently manages
};

#endif
