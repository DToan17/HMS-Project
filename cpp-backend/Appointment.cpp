#include "Appointment.h"
#include <iostream>
#include <sstream>
#include <cstring>

Appointment::Appointment( int id, int pid, int did,
                           string d, string t, string r )
    : appointmentId(id), patientId(pid), doctorId(did),
      date(d), time(t), reason(r), status(Scheduled) {}

void Appointment::displayInfo() const
{
    string statusStr[] = {"Scheduled","Completed","Cancelled"};
    cout << "--- Appointment #" << appointmentId << " ---" << endl;
    cout << "Patient ID: " << patientId  << endl;
    cout << "Doctor ID:  " << doctorId   << endl;
    cout << "Date:       " << date       << endl;
    cout << "Time:       " << time       << endl;
    cout << "Reason:     " << reason     << endl;
    cout << "Status:     " << statusStr[status] << endl;
    cout << "Notes:      " << notes      << endl;
}

string Appointment::exportRecord() const
{
    string statusStr[] = {"Scheduled","Completed","Cancelled"};
    ostringstream oss;
    oss << "APPOINTMENT," << appointmentId << "," << patientId
        << "," << doctorId << "," << date << "," << time
        << "," << reason << "," << statusStr[status] << "," << notes;
    return oss.str();
}

AppointmentRecord Appointment::toStruct() const
{
    AppointmentRecord r;
    r.appointmentId = appointmentId;
    r.patientId     = patientId;
    r.doctorId      = doctorId;
    r.status        = (int)status;
    strncpy(r.date,   date.c_str(),   19);   r.date[19]   = '\0';
    strncpy(r.time,   time.c_str(),    9);   r.time[9]    = '\0';
    strncpy(r.reason, reason.c_str(), 99);   r.reason[99] = '\0';
    strncpy(r.notes,  notes.c_str(), 199);   r.notes[199] = '\0';
    return r;
}

Appointment Appointment::fromStruct( const AppointmentRecord& r )
{
    Appointment a( r.appointmentId, r.patientId, r.doctorId,
                   r.date, r.time, r.reason );
    a.setStatus( (AppointmentStatus)r.status );
    a.setNotes( r.notes );
    return a;
}
