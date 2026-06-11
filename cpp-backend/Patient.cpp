#include "Patient.h"
#include <iomanip>
#include <sstream>

Patient::Patient( int id, string name, int age,
                  string gender, string phone,
                  string email, string address,
                  string diagnosis,
                  AdmissionStatus status, int doctorId )
    : Person(id, name, age, gender, phone, email, address),
      diagnosis(diagnosis), admissionStatus(status),
      assignedDoctorId(doctorId) {}

void Patient::addMedicalHistory( const string& entry )
{
    medicalHistory.push_back(entry);
}

string Patient::getAdmissionStatusStr() const
{
    switch ( admissionStatus ) {
        case Admitted:   return "Admitted";
        case Discharged: return "Discharged";
        case Outpatient: return "Outpatient";
        default:         return "Unknown";
    }
}

void Patient::displayInfo() const
{
    cout << "========== PATIENT INFO ==========" << endl;
    cout << "ID:         " << personId           << endl;
    cout << "Name:       " << name               << endl;
    cout << "Age:        " << age                << endl;
    cout << "Gender:     " << gender             << endl;
    cout << "Phone:      " << phone              << endl;
    cout << "Email:      " << email              << endl;
    cout << "Address:    " << address            << endl;
    cout << "Diagnosis:  " << diagnosis          << endl;
    cout << "Status:     " << getAdmissionStatusStr() << endl;
    cout << "Doctor ID:  " << assignedDoctorId   << endl;
    cout << "Medical History:" << endl;
    for ( const string& h : medicalHistory )
        cout << "  - " << h << endl;
    cout << "Fee:        $" << fixed << setprecision(2) << calculateFee() << endl;
    cout << "=================================="  << endl;
}

string Patient::exportRecord() const
{
    ostringstream oss;
    oss << "PATIENT," << personId << "," << name << ","
        << age << "," << gender << "," << phone << ","
        << email << "," << address << ","
        << diagnosis << "," << getAdmissionStatusStr() << ","
        << assignedDoctorId;
    return oss.str();
}

bool Patient::validateData() const
{
    if ( !Person::validateData() ) return false;
    if ( diagnosis.empty() ) {
        cerr << "Error: Diagnosis is empty." << endl;
        return false;
    }
    return true;
}

double Patient::calculateFee() const
{
    double base = 100.0;
    switch ( admissionStatus ) {
        case Admitted:   return base * 10.0;
        case Outpatient: return base * 2.0;
        case Discharged: return base * 5.0;
        default:         return base;
    }
}
