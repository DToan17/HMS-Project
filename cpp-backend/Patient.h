#ifndef PATIENT_H
#define PATIENT_H

#include "Person.h"
#include <vector>

enum AdmissionStatus { Admitted, Discharged, Outpatient };

class Patient : public Person
{
public:
    Patient( int id = 0, string name = "", int age = 0,
             string gender = "", string phone = "",
             string email = "", string address = "",
             string diagnosis = "",
             AdmissionStatus status = Outpatient,
             int doctorId = 0 );

    // Overrides
    void   displayInfo()    const override;
    string exportRecord()   const override;
    bool   validateData()   const override;
    double calculateFee()   const override;

    // Medical history
    void   addMedicalHistory( const string& entry );
    vector<string> getMedicalHistory() const { return medicalHistory; }

    // Admission status
    AdmissionStatus getAdmissionStatus() const { return admissionStatus; }
    void setAdmissionStatus( AdmissionStatus s ) { admissionStatus = s; }
    string getAdmissionStatusStr() const;

    // Getters / Setters
    string getDiagnosis()       const { return diagnosis; }
    int    getAssignedDoctorId()const { return assignedDoctorId; }
    void   setDiagnosis( string d )      { diagnosis = d; }
    void   setAssignedDoctorId( int id ) { assignedDoctorId = id; }

private:
    string          diagnosis;
    AdmissionStatus admissionStatus;
    vector<string>  medicalHistory;
    int             assignedDoctorId;
};

#endif
