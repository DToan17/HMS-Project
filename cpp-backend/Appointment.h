#ifndef APPOINTMENT_H
#define APPOINTMENT_H

#include <string>
using namespace std;

enum AppointmentStatus { Scheduled, Completed, Cancelled };

struct AppointmentRecord {
    int    appointmentId;
    int    patientId;
    int    doctorId;
    char   date[20];
    char   time[10];
    char   reason[100];
    int    status;   // AppointmentStatus as int
    char   notes[200];
};

class Appointment
{
public:
    Appointment( int id = 0, int patientId = 0, int doctorId = 0,
                 string date = "", string time = "",
                 string reason = "" );

    void displayInfo() const;
    string exportRecord() const;

    int    getAppointmentId() const { return appointmentId; }
    int    getPatientId()     const { return patientId; }
    int    getDoctorId()      const { return doctorId; }
    string getDate()          const { return date; }
    string getTime()          const { return time; }
    string getReason()        const { return reason; }
    AppointmentStatus getStatus() const { return status; }
    string getNotes()         const { return notes; }

    void setStatus( AppointmentStatus s ) { status = s; }
    void setNotes( string n )             { notes = n; }
    void setDate( string d )              { date = d; }
    void setTime( string t )              { time = t; }

    AppointmentRecord toStruct() const;
    static Appointment fromStruct( const AppointmentRecord& r );

private:
    int               appointmentId;
    int               patientId;
    int               doctorId;
    string            date;
    string            time;
    string            reason;
    AppointmentStatus status;
    string            notes;
};

#endif
