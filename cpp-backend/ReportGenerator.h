#ifndef REPORTGENERATOR_H
#define REPORTGENERATOR_H

#include "Patient.h"
#include "Doctor.h"
#include "Appointment.h"
#include "Bill.h"
#include "Prescription.h"
#include <vector>
#include <string>
using namespace std;

// ============================================================
// ReportGenerator
// Generates formatted text reports from data provided by
// HospitalSystem. Keeps all report formatting logic out of
// HospitalSystem to follow single-responsibility principle.
//
// All methods receive const references to the data vectors
// owned by HospitalSystem — no ownership transfer.
//
// Author: Doan Minh Toan
// ============================================================

class ReportGenerator
{
public:
    ReportGenerator() {}

    // --------------------------------------------------------
    // generatePatientSummary
    // Prints a single patient's full record including all
    // their appointments, prescriptions, and bills.
    // --------------------------------------------------------
    void generatePatientSummary( int patientId,
                                 const vector<Person*>&       people,
                                 const vector<Appointment*>&  appointments,
                                 const vector<Bill*>&         bills,
                                 const vector<Prescription*>& prescriptions ) const;

    // --------------------------------------------------------
    // generateAllPatientsReport
    // Prints a compact listing of all patients:
    // ID, name, diagnosis, status, assigned doctor.
    // --------------------------------------------------------
    void generateAllPatientsReport( const vector<Person*>& people ) const;

    // --------------------------------------------------------
    // generateAppointmentLog
    // Prints all appointments, optionally filtered by status.
    // statusFilter: -1 = all, 0 = Scheduled, 1 = Completed,
    //               2 = Cancelled
    // --------------------------------------------------------
    void generateAppointmentLog( const vector<Appointment*>& appointments,
                                 int statusFilter = -1 ) const;

    // --------------------------------------------------------
    // generatePrescriptionHistory
    // Prints all prescriptions for a specific patient.
    // --------------------------------------------------------
    void generatePrescriptionHistory( int patientId,
                                      const vector<Prescription*>& prescriptions ) const;

    // --------------------------------------------------------
    // generateBillingStatement
    // Prints a full billing statement for one patient:
    // lists all bills, amounts, payments, and outstanding balance.
    // --------------------------------------------------------
    void generateBillingStatement( int patientId,
                                   const vector<Bill*>& bills ) const;

    // --------------------------------------------------------
    // generateMonthlySummary
    // Prints aggregate statistics for a given month (YYYY-MM):
    //   - Total appointments booked / completed / cancelled
    //   - New patients registered
    //   - Total revenue collected
    //   - Outstanding balance
    // --------------------------------------------------------
    void generateMonthlySummary( const string& yearMonth,
                                 const vector<Person*>&       people,
                                 const vector<Appointment*>&  appointments,
                                 const vector<Bill*>&         bills ) const;

    // --------------------------------------------------------
    // exportToCSV
    // Writes a full data dump of all entities to a CSV file.
    // Uses exportRecord() from each object — same method
    // called by FileManager::exportAllToCSV().
    // --------------------------------------------------------
    void exportToCSV( const string& filename,
                      const vector<Person*>&       people,
                      const vector<Appointment*>&  appointments,
                      const vector<Bill*>&         bills,
                      const vector<Prescription*>& prescriptions ) const;

private:
    // --------------------------------------------------------
    // printDivider / printHeader
    // Helper formatting methods for consistent report layout.
    // --------------------------------------------------------
    void printDivider( char ch = '-', int width = 50 ) const;
    void printHeader ( const string& title ) const;

    // --------------------------------------------------------
    // statusToString
    // Converts AppointmentStatus enum to readable string.
    // --------------------------------------------------------
    string statusToString( int status ) const;

    // --------------------------------------------------------
    // paymentStatusToString
    // Converts PaymentStatus enum to readable string.
    // --------------------------------------------------------
    string paymentStatusToString( int status ) const;
};

#endif
