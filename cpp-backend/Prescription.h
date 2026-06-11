#ifndef PRESCRIPTION_H
#define PRESCRIPTION_H

#include <string>
using namespace std;

struct PrescriptionRecord {
    int  prescriptionId;
    int  patientId;
    int  doctorId;
    char medication[100];
    char dosage[50];
    char frequency[50];
    char startDate[20];
    char endDate[20];
    char notes[200];
};

class Prescription
{
public:
    Prescription( int id = 0, int patientId = 0, int doctorId = 0,
                  string medication = "", string dosage = "",
                  string frequency = "", string startDate = "",
                  string endDate = "" );

    void displayInfo() const;
    string exportRecord() const;

    int    getPrescriptionId() const { return prescriptionId; }
    int    getPatientId()      const { return patientId; }
    int    getDoctorId()       const { return doctorId; }
    string getMedication()     const { return medication; }
    string getDosage()         const { return dosage; }
    string getFrequency()      const { return frequency; }
    string getStartDate()      const { return startDate; }
    string getEndDate()        const { return endDate; }
    string getNotes()          const { return notes; }
    void   setNotes( string n )      { notes = n; }

    PrescriptionRecord toStruct() const;
    static Prescription fromStruct( const PrescriptionRecord& r );

private:
    int    prescriptionId;
    int    patientId;
    int    doctorId;
    string medication;
    string dosage;
    string frequency;
    string startDate;
    string endDate;
    string notes;
};

#endif
