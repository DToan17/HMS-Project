#include "ScheduleManager.h"
#include <iostream>
#include <algorithm>
using namespace std;

// ============================================================
// Standard hospital appointment slots
// Used by getSuggestedSlots() to find free alternative times
// ============================================================
const vector<string> ScheduleManager::STANDARD_SLOTS = {
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
};

// ============================================================
// checkDoctorConflict
// Scans all appointments to see if the doctor already has a
// SCHEDULED appointment at the exact same date and time.
// Returns true = conflict exists (cannot book).
// ============================================================
bool ScheduleManager::checkDoctorConflict( int doctorId,
                                            const string& date,
                                            const string& time,
                                            const vector<Appointment*>& all ) const
{
    for ( const auto* a : all )
    {
        if ( a->getDoctorId()  == doctorId  &&
             a->getDate()      == date      &&
             a->getTime()      == time      &&
             a->getStatus()    == Scheduled )
        {
            return true;  // conflict found
        }
    }
    return false;
}

// ============================================================
// checkPatientConflict
// Checks if the patient already has ANY appointment (with any
// doctor) at the same date and time slot.
// Returns true = conflict exists (cannot book).
// ============================================================
bool ScheduleManager::checkPatientConflict( int patientId,
                                             const string& date,
                                             const string& time,
                                             const vector<Appointment*>& all ) const
{
    for ( const auto* a : all )
    {
        if ( a->getPatientId() == patientId &&
             a->getDate()      == date      &&
             a->getTime()      == time      &&
             a->getStatus()    == Scheduled )
        {
            return true;  // patient already booked at this time
        }
    }
    return false;
}

// ============================================================
// canBook
// Runs both conflict checks in sequence.
// Prints a clear error message describing which conflict
// was detected so the caller can display it to the user.
// Returns true only if BOTH checks pass (no conflicts).
// ============================================================
bool ScheduleManager::canBook( int patientId, int doctorId,
                                const string& date, const string& time,
                                const vector<Appointment*>& all ) const
{
    // Check 1: Is the doctor free?
    if ( checkDoctorConflict(doctorId, date, time, all) )
    {
        cerr << "Conflict: Doctor (ID " << doctorId
             << ") already has a scheduled appointment on "
             << date << " at " << time << "." << endl;

        // Suggest alternatives automatically
        vector<string> suggestions = getSuggestedSlots(doctorId, date, all, 3);
        if ( !suggestions.empty() ) {
            cout << "Suggested available slots on " << date << ":" << endl;
            for ( const string& slot : suggestions )
                cout << "  -> " << slot << endl;
        } else {
            cout << "No available slots found for Doctor "
                 << doctorId << " on " << date << "." << endl;
        }
        return false;
    }

    // Check 2: Is the patient free?
    if ( checkPatientConflict(patientId, date, time, all) )
    {
        cerr << "Conflict: Patient (ID " << patientId
             << ") already has an appointment on "
             << date << " at " << time << "." << endl;
        return false;
    }

    return true;  // all clear — booking can proceed
}

// ============================================================
// getSuggestedSlots
// Iterates over STANDARD_SLOTS and returns up to maxSuggestions
// time slots on the given date where the doctor has no
// SCHEDULED appointments.
// ============================================================
vector<string> ScheduleManager::getSuggestedSlots( int doctorId,
                                                    const string& date,
                                                    const vector<Appointment*>& all,
                                                    int maxSuggestions ) const
{
    vector<string> available;

    for ( const string& slot : STANDARD_SLOTS )
    {
        // Check if doctor is free at this slot
        if ( !checkDoctorConflict(doctorId, date, slot, all) )
        {
            available.push_back(slot);
            if ( (int)available.size() >= maxSuggestions )
                break;
        }
    }
    return available;
}

// ============================================================
// getAppointmentsForDoctor
// Filters all appointments by doctorId and Scheduled status.
// Returns raw pointers — ownership stays with HospitalSystem.
// ============================================================
vector<Appointment*> ScheduleManager::getAppointmentsForDoctor(
    int doctorId,
    const vector<Appointment*>& all ) const
{
    vector<Appointment*> result;
    for ( auto* a : all )
        if ( a->getDoctorId() == doctorId && a->getStatus() == Scheduled )
            result.push_back(a);
    return result;
}

// ============================================================
// getAppointmentsForPatient
// Filters all appointments by patientId (all statuses).
// ============================================================
vector<Appointment*> ScheduleManager::getAppointmentsForPatient(
    int patientId,
    const vector<Appointment*>& all ) const
{
    vector<Appointment*> result;
    for ( auto* a : all )
        if ( a->getPatientId() == patientId )
            result.push_back(a);
    return result;
}

// ============================================================
// validateDateTime
// Basic format validation for date (YYYY-MM-DD) and time (HH:MM).
// Checks length and that separators are in correct positions.
// Does NOT check calendar validity (e.g. Feb 30).
// ============================================================
bool ScheduleManager::validateDateTime( const string& date,
                                         const string& time ) const
{
    // Date: must be exactly "YYYY-MM-DD" = 10 chars
    if ( date.size() != 10 ||
         date[4] != '-' || date[7] != '-' ) {
        cerr << "Error: Date must be in YYYY-MM-DD format." << endl;
        return false;
    }

    // Time: must be exactly "HH:MM" = 5 chars
    if ( time.size() != 5 || time[2] != ':' ) {
        cerr << "Error: Time must be in HH:MM format." << endl;
        return false;
    }

    return true;
}

// ============================================================
// printScheduleForDoctor
// Prints a formatted schedule list for a specific doctor,
// showing only SCHEDULED (upcoming) appointments.
// ============================================================
void ScheduleManager::printScheduleForDoctor( int doctorId,
                                               const vector<Appointment*>& all ) const
{
    cout << "\n===== SCHEDULE FOR DOCTOR ID: " << doctorId << " =====" << endl;
    vector<Appointment*> schedule = getAppointmentsForDoctor(doctorId, all);

    if ( schedule.empty() ) {
        cout << "No upcoming appointments." << endl;
        return;
    }

    for ( const auto* a : schedule ) {
        cout << "  Appointment #" << a->getAppointmentId()
             << " | Patient: "   << a->getPatientId()
             << " | Date: "      << a->getDate()
             << " | Time: "      << a->getTime()
             << " | Reason: "    << a->getReason()
             << endl;
    }
    cout << "================================================" << endl;
}
