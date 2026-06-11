#ifndef SCHEDULEMANAGER_H
#define SCHEDULEMANAGER_H

#include "Appointment.h"
#include <vector>
#include <string>
using namespace std;

// ============================================================
// ScheduleManager
// Standalone helper class owned by HospitalSystem.
// Responsible for all appointment conflict detection and
// time-slot availability logic.
//
// Kept separate from HospitalSystem to follow single-responsibility
// principle — HospitalSystem delegates all scheduling checks here.
//
// Author: Doan Minh Tung
// ============================================================

class ScheduleManager
{
public:
    ScheduleManager() {}

    // --------------------------------------------------------
    // checkDoctorConflict
    // Returns true if doctor (doctorId) already has a SCHEDULED
    // appointment on the given date + time.
    // Must be called before bookAppointment in HospitalSystem.
    // --------------------------------------------------------
    bool checkDoctorConflict( int doctorId,
                              const string& date,
                              const string& time,
                              const vector<Appointment*>& all ) const;

    // --------------------------------------------------------
    // checkPatientConflict
    // Returns true if patient (patientId) already has any
    // appointment (with any doctor) on the same date + time.
    // --------------------------------------------------------
    bool checkPatientConflict( int patientId,
                               const string& date,
                               const string& time,
                               const vector<Appointment*>& all ) const;

    // --------------------------------------------------------
    // canBook
    // Runs both conflict checks together.
    // Returns true only if BOTH doctor and patient are free.
    // Prints a descriptive error message if a conflict is found.
    // --------------------------------------------------------
    bool canBook( int patientId, int doctorId,
                  const string& date, const string& time,
                  const vector<Appointment*>& all ) const;

    // --------------------------------------------------------
    // getSuggestedSlots
    // Returns up to maxSuggestions alternative time slots
    // on the same date where the doctor is free.
    // Slots are generated from a fixed list of standard times.
    // --------------------------------------------------------
    vector<string> getSuggestedSlots( int doctorId,
                                      const string& date,
                                      const vector<Appointment*>& all,
                                      int maxSuggestions = 3 ) const;

    // --------------------------------------------------------
    // getAppointmentsForDoctor
    // Returns all SCHEDULED appointments for a given doctor.
    // --------------------------------------------------------
    vector<Appointment*> getAppointmentsForDoctor(
        int doctorId,
        const vector<Appointment*>& all ) const;

    // --------------------------------------------------------
    // getAppointmentsForPatient
    // Returns all appointments for a given patient.
    // --------------------------------------------------------
    vector<Appointment*> getAppointmentsForPatient(
        int patientId,
        const vector<Appointment*>& all ) const;

    // --------------------------------------------------------
    // validateDateTime
    // Returns true if date is in YYYY-MM-DD format and
    // time is in HH:MM format. Basic format check only.
    // --------------------------------------------------------
    bool validateDateTime( const string& date,
                           const string& time ) const;

    // --------------------------------------------------------
    // printScheduleForDoctor
    // Prints all upcoming (Scheduled) appointments for a doctor.
    // --------------------------------------------------------
    void printScheduleForDoctor( int doctorId,
                                 const vector<Appointment*>& all ) const;

private:
    // Standard hospital time slots used for suggestions
    static const vector<string> STANDARD_SLOTS;
};

#endif
