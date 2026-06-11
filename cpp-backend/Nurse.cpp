#include "Nurse.h"
#include <iostream>
#include <iomanip>
#include <sstream>
#include <algorithm>
#include <cstring>
using namespace std;

// ============================================================
// Constructor
// Calls Staff (which calls Person) to initialize common fields,
// then sets Nurse-specific ward and shift data.
// ============================================================
Nurse::Nurse( int id, string name, int age,
              string gender, string phone,
              string email, string address,
              string employeeId, string department,
              double salary,
              string wardAssignment,
              string shiftSchedule )
    : Staff(id, name, age, gender, phone, email, address,
            employeeId, department, salary),
      wardAssignment(wardAssignment),
      shiftSchedule(shiftSchedule)
{}

// ============================================================
// displayInfo
// Overrides Person::displayInfo() (pure virtual).
// Prints all inherited fields plus nurse-specific data.
// ============================================================
void Nurse::displayInfo() const
{
    cout << "========== NURSE INFO ==========" << endl;
    cout << "ID:              " << personId       << endl;
    cout << "Employee ID:     " << employeeId     << endl;
    cout << "Name:            " << name           << endl;
    cout << "Age:             " << age            << endl;
    cout << "Gender:          " << gender         << endl;
    cout << "Phone:           " << phone          << endl;
    cout << "Email:           " << email          << endl;
    cout << "Address:         " << address        << endl;
    cout << "Department:      " << department     << endl;
    cout << "Ward Assignment: " << wardAssignment << endl;
    cout << "Shift Schedule:  " << shiftSchedule  << endl;
    cout << "Salary:          $" << fixed << setprecision(2) << salary << endl;

    // Print ward patient IDs if any
    if ( !wardPatients.empty() ) {
        cout << "Ward Patients:   ";
        for ( int id : wardPatients ) cout << id << " ";
        cout << endl;
    }
    cout << "================================" << endl;
}

// ============================================================
// exportRecord
// Overrides Person::exportRecord() (pure virtual).
// Returns a CSV-style string for file export.
// Format matches the PATIENT/DOCTOR records in FileManager.
// ============================================================
string Nurse::exportRecord() const
{
    ostringstream oss;
    oss << "NURSE,"    << personId      << ","
        << name        << ","           << age       << ","
        << gender      << ","           << phone     << ","
        << email       << ","           << address   << ","
        << employeeId  << ","           << department << ","
        << fixed << setprecision(2) << salary << ","
        << wardAssignment << ","        << shiftSchedule;
    return oss.str();
}

// ============================================================
// calculateFee
// Overrides Person::calculateFee() (virtual with default).
// Night-shift nurses have a higher rate than day-shift.
// ============================================================
double Nurse::calculateFee() const
{
    if ( shiftSchedule == "Night" )
        return salary * 0.08;   // night shift premium
    return salary * 0.05;       // standard day shift rate
}

// ============================================================
// validateData
// Extends Person::validateData().
// Adds check: wardAssignment must not be empty.
// ============================================================
bool Nurse::validateData() const
{
    if ( !Person::validateData() ) return false;
    if ( wardAssignment.empty() ) {
        cerr << "Error: Ward assignment is empty." << endl;
        return false;
    }
    return true;
}

// ============================================================
// updatePatientRecord
// Nurse logs a care note for a patient.
// The actual Patient record update is handled by HospitalSystem
// via FileManager — this method validates and prints confirmation.
// ============================================================
void Nurse::updatePatientRecord( int patientId, const string& note ) const
{
    if ( note.empty() ) {
        cerr << "Error: Care note cannot be empty." << endl;
        return;
    }
    if ( !isResponsibleFor(patientId) ) {
        cerr << "Warning: Patient " << patientId
             << " is not assigned to this nurse's ward." << endl;
        // Allow update anyway — nurse may be covering another ward
    }
    cout << "Nurse " << name << " logged care note for Patient "
         << patientId << ": \"" << note << "\"" << endl;
}

// ============================================================
// addPatientToWard
// Adds a patientId to this nurse's ward list.
// Avoids duplicates.
// ============================================================
void Nurse::addPatientToWard( int patientId )
{
    if ( isResponsibleFor(patientId) ) {
        cout << "Patient " << patientId
             << " already assigned to Nurse " << name << "." << endl;
        return;
    }
    wardPatients.push_back(patientId);
    cout << "Patient " << patientId
         << " added to ward of Nurse " << name << "." << endl;
}

// ============================================================
// removePatientFromWard
// Removes a patientId from this nurse's ward list.
// ============================================================
void Nurse::removePatientFromWard( int patientId )
{
    auto it = find(wardPatients.begin(), wardPatients.end(), patientId);
    if ( it == wardPatients.end() ) {
        cerr << "Patient " << patientId
             << " not found in ward of Nurse " << name << "." << endl;
        return;
    }
    wardPatients.erase(it);
    cout << "Patient " << patientId
         << " removed from ward of Nurse " << name << "." << endl;
}

// ============================================================
// isResponsibleFor
// Returns true if patientId is in this nurse's wardPatients list.
// ============================================================
bool Nurse::isResponsibleFor( int patientId ) const
{
    return find(wardPatients.begin(), wardPatients.end(), patientId)
           != wardPatients.end();
}

// ============================================================
// toStruct
// Serializes Nurse into a fixed-size NurseRecord struct for
// binary file I/O via FileManager (matches Christopher's pattern).
// ============================================================
Nurse::NurseRecord Nurse::toStruct() const
{
    NurseRecord r;
    r.nurseId = personId;
    r.age     = age;
    r.salary  = salary;
    strncpy(r.name,           name.c_str(),           49);  r.name[49]           = '\0';
    strncpy(r.gender,         gender.c_str(),          9);  r.gender[9]          = '\0';
    strncpy(r.phone,          phone.c_str(),          19);  r.phone[19]          = '\0';
    strncpy(r.email,          email.c_str(),          49);  r.email[49]          = '\0';
    strncpy(r.address,        address.c_str(),        99);  r.address[99]        = '\0';
    strncpy(r.employeeId,     employeeId.c_str(),     19);  r.employeeId[19]     = '\0';
    strncpy(r.department,     department.c_str(),     49);  r.department[49]     = '\0';
    strncpy(r.wardAssignment, wardAssignment.c_str(), 49);  r.wardAssignment[49] = '\0';
    strncpy(r.shiftSchedule,  shiftSchedule.c_str(),  49);  r.shiftSchedule[49]  = '\0';
    return r;
}

// ============================================================
// fromStruct (static)
// Reconstructs a Nurse object from a NurseRecord read from disk.
// ============================================================
Nurse Nurse::fromStruct( const NurseRecord& r )
{
    return Nurse( r.nurseId, r.name, r.age, r.gender,
                  r.phone, r.email, r.address,
                  r.employeeId, r.department, r.salary,
                  r.wardAssignment, r.shiftSchedule );
}
