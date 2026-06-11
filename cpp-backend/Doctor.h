#ifndef DOCTOR_H
#define DOCTOR_H

#include "Staff.h"
#include <vector>

class Doctor : public Staff
{
public:
    Doctor( int id = 0, string name = "", int age = 0,
            string gender = "", string phone = "",
            string email = "", string address = "",
            string employeeId = "", string department = "",
            double salary = 0.0, string specialization = "" );

    void   displayInfo()  const override;
    string exportRecord() const override;
    double calculateFee() const override { return salary * 0.1; }

    string getSpecialization() const { return specialization; }
    void   setSpecialization( string s ) { specialization = s; }

    void addPatientId( int id ) { patientIds.push_back(id); }
    vector<int> getPatientIds() const { return patientIds; }

private:
    string      specialization;
    vector<int> patientIds;
};

#endif
