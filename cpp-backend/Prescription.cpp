#include "Prescription.h"
#include <iostream>
#include <sstream>
#include <cstring>

Prescription::Prescription( int id, int pid, int did,
                             string med, string dos,
                             string freq, string sd, string ed )
    : prescriptionId(id), patientId(pid), doctorId(did),
      medication(med), dosage(dos), frequency(freq),
      startDate(sd), endDate(ed) {}

void Prescription::displayInfo() const
{
    cout << "--- Prescription #" << prescriptionId << " ---" << endl;
    cout << "Patient ID:  " << patientId  << endl;
    cout << "Doctor ID:   " << doctorId   << endl;
    cout << "Medication:  " << medication << endl;
    cout << "Dosage:      " << dosage     << endl;
    cout << "Frequency:   " << frequency  << endl;
    cout << "Start Date:  " << startDate  << endl;
    cout << "End Date:    " << endDate    << endl;
    cout << "Notes:       " << notes      << endl;
}

string Prescription::exportRecord() const
{
    ostringstream oss;
    oss << "PRESCRIPTION," << prescriptionId << "," << patientId
        << "," << doctorId << "," << medication << "," << dosage
        << "," << frequency << "," << startDate << "," << endDate
        << "," << notes;
    return oss.str();
}

PrescriptionRecord Prescription::toStruct() const
{
    PrescriptionRecord r;
    r.prescriptionId = prescriptionId;
    r.patientId      = patientId;
    r.doctorId       = doctorId;
    strncpy(r.medication, medication.c_str(),  99);  r.medication[99]  = '\0';
    strncpy(r.dosage,     dosage.c_str(),      49);  r.dosage[49]      = '\0';
    strncpy(r.frequency,  frequency.c_str(),   49);  r.frequency[49]   = '\0';
    strncpy(r.startDate,  startDate.c_str(),   19);  r.startDate[19]   = '\0';
    strncpy(r.endDate,    endDate.c_str(),     19);  r.endDate[19]     = '\0';
    strncpy(r.notes,      notes.c_str(),      199);  r.notes[199]      = '\0';
    return r;
}

Prescription Prescription::fromStruct( const PrescriptionRecord& r )
{
    Prescription p( r.prescriptionId, r.patientId, r.doctorId,
                    r.medication, r.dosage, r.frequency,
                    r.startDate, r.endDate );
    p.setNotes(r.notes);
    return p;
}
