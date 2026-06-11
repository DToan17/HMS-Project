#include "ReportGenerator.h"
#include <iostream>
#include <fstream>
#include <iomanip>
#include <sstream>
using namespace std;

// ============================================================
// printDivider
// Prints a horizontal line of a given character and width.
// Used to separate sections in console reports.
// ============================================================
void ReportGenerator::printDivider( char ch, int width ) const
{
    cout << string(width, ch) << endl;
}

// ============================================================
// printHeader
// Prints a titled section header with dividers above and below.
// ============================================================
void ReportGenerator::printHeader( const string& title ) const
{
    printDivider('=', 55);
    cout << "  " << title << endl;
    printDivider('=', 55);
}

// ============================================================
// statusToString
// Converts AppointmentStatus integer to a display string.
// ============================================================
string ReportGenerator::statusToString( int status ) const
{
    switch (status) {
        case 0: return "Scheduled";
        case 1: return "Completed";
        case 2: return "Cancelled";
        default: return "Unknown";
    }
}

// ============================================================
// paymentStatusToString
// Converts PaymentStatus integer to a display string.
// ============================================================
string ReportGenerator::paymentStatusToString( int status ) const
{
    switch (status) {
        case 0: return "Pending";
        case 1: return "Paid";
        case 2: return "Overdue";
        default: return "Unknown";
    }
}

// ============================================================
// generatePatientSummary
// Full 360-degree view of one patient:
// personal info + all appointments + all prescriptions + all bills.
// ============================================================
void ReportGenerator::generatePatientSummary(
    int patientId,
    const vector<Person*>&       people,
    const vector<Appointment*>&  appointments,
    const vector<Bill*>&         bills,
    const vector<Prescription*>& prescriptions ) const
{
    // Find patient
    Patient* target = nullptr;
    for ( auto* p : people ) {
        Patient* pat = dynamic_cast<Patient*>(p);
        if ( pat && pat->getPersonId() == patientId ) {
            target = pat;
            break;
        }
    }

    if ( !target ) {
        cerr << "Report Error: Patient ID " << patientId << " not found." << endl;
        return;
    }

    printHeader("PATIENT SUMMARY REPORT");
    target->displayInfo();

    // --- Appointments section ---
    cout << "\n--- Appointments ---" << endl;
    bool hasAppt = false;
    for ( const auto* a : appointments ) {
        if ( a->getPatientId() == patientId ) {
            cout << "  #" << a->getAppointmentId()
                 << " | Doctor: " << a->getDoctorId()
                 << " | " << a->getDate() << " " << a->getTime()
                 << " | " << statusToString((int)a->getStatus())
                 << " | " << a->getReason() << endl;
            hasAppt = true;
        }
    }
    if (!hasAppt) cout << "  No appointments on record." << endl;

    // --- Prescriptions section ---
    cout << "\n--- Prescriptions ---" << endl;
    bool hasPresc = false;
    for ( const auto* p : prescriptions ) {
        if ( p->getPatientId() == patientId ) {
            cout << "  #" << p->getPrescriptionId()
                 << " | Doctor: " << p->getDoctorId()
                 << " | " << p->getMedication()
                 << " " << p->getDosage()
                 << " | " << p->getFrequency()
                 << " | " << p->getStartDate()
                 << " to " << p->getEndDate() << endl;
            hasPresc = true;
        }
    }
    if (!hasPresc) cout << "  No prescriptions on record." << endl;

    // --- Bills section ---
    cout << "\n--- Bills ---" << endl;
    double totalOwed = 0.0, totalPaid = 0.0;
    bool hasBill = false;
    for ( const auto* b : bills ) {
        if ( b->getPatientId() == patientId ) {
            cout << "  Bill #" << b->getBillId()
                 << " | " << b->getDate()
                 << " | $" << fixed << setprecision(2) << b->getAmount()
                 << " | Paid: $" << b->getAmountPaid()
                 << " | " << paymentStatusToString((int)b->getStatus())
                 << endl;
            totalOwed += b->getAmount();
            totalPaid += b->getAmountPaid();
            hasBill = true;
        }
    }
    if (!hasBill) cout << "  No bills on record." << endl;
    else {
        printDivider('-', 40);
        cout << "  Total Charged:  $" << fixed << setprecision(2) << totalOwed << endl;
        cout << "  Total Paid:     $" << totalPaid << endl;
        cout << "  Balance Due:    $" << (totalOwed - totalPaid) << endl;
    }

    printDivider('=', 55);
}

// ============================================================
// generateAllPatientsReport
// Compact table listing all patients in the system.
// ============================================================
void ReportGenerator::generateAllPatientsReport(
    const vector<Person*>& people ) const
{
    printHeader("ALL PATIENTS REPORT");
    cout << left
         << setw(6)  << "ID"
         << setw(22) << "Name"
         << setw(20) << "Diagnosis"
         << setw(13) << "Status"
         << setw(10) << "Doctor ID"
         << endl;
    printDivider('-', 71);

    int count = 0;
    for ( const auto* p : people ) {
        const Patient* pat = dynamic_cast<const Patient*>(p);
        if (!pat) continue;
        cout << left
             << setw(6)  << pat->getPersonId()
             << setw(22) << pat->getName().substr(0, 20)
             << setw(20) << pat->getDiagnosis().substr(0, 18)
             << setw(13) << pat->getAdmissionStatusStr()
             << setw(10) << pat->getAssignedDoctorId()
             << endl;
        count++;
    }
    printDivider('-', 71);
    cout << "Total patients: " << count << endl;
    printDivider('=', 55);
}

// ============================================================
// generateAppointmentLog
// Full appointment log with optional status filter.
// statusFilter: -1=all, 0=Scheduled, 1=Completed, 2=Cancelled
// ============================================================
void ReportGenerator::generateAppointmentLog(
    const vector<Appointment*>& appointments,
    int statusFilter ) const
{
    string filterLabel = (statusFilter == -1) ? "ALL" : statusToString(statusFilter);
    printHeader("APPOINTMENT LOG  [" + filterLabel + "]");

    cout << left
         << setw(6)  << "ID"
         << setw(10) << "Patient"
         << setw(10) << "Doctor"
         << setw(13) << "Date"
         << setw(8)  << "Time"
         << setw(12) << "Status"
         << "Reason" << endl;
    printDivider('-', 75);

    int count = 0;
    for ( const auto* a : appointments ) {
        if ( statusFilter != -1 && (int)a->getStatus() != statusFilter )
            continue;
        cout << left
             << setw(6)  << a->getAppointmentId()
             << setw(10) << a->getPatientId()
             << setw(10) << a->getDoctorId()
             << setw(13) << a->getDate()
             << setw(8)  << a->getTime()
             << setw(12) << statusToString((int)a->getStatus())
             << a->getReason().substr(0, 30) << endl;
        count++;
    }
    printDivider('-', 75);
    cout << "Total: " << count << " appointment(s)." << endl;
    printDivider('=', 55);
}

// ============================================================
// generatePrescriptionHistory
// All prescriptions for one patient, formatted for easy reading.
// ============================================================
void ReportGenerator::generatePrescriptionHistory(
    int patientId,
    const vector<Prescription*>& prescriptions ) const
{
    printHeader("PRESCRIPTION HISTORY  [Patient " +
                to_string(patientId) + "]");

    int count = 0;
    for ( const auto* p : prescriptions ) {
        if ( p->getPatientId() != patientId ) continue;
        cout << "  Rx #" << p->getPrescriptionId() << endl;
        cout << "    Doctor:      " << p->getDoctorId()    << endl;
        cout << "    Medication:  " << p->getMedication()  << endl;
        cout << "    Dosage:      " << p->getDosage()      << endl;
        cout << "    Frequency:   " << p->getFrequency()   << endl;
        cout << "    Period:      " << p->getStartDate()
             << " to "             << p->getEndDate()      << endl;
        if (!p->getNotes().empty())
            cout << "    Notes:       " << p->getNotes()   << endl;
        printDivider('-', 40);
        count++;
    }
    if ( count == 0 )
        cout << "  No prescriptions found for Patient " << patientId << "." << endl;
    else
        cout << "Total: " << count << " prescription(s)." << endl;
    printDivider('=', 55);
}

// ============================================================
// generateBillingStatement
// Itemized billing statement for one patient with totals.
// ============================================================
void ReportGenerator::generateBillingStatement(
    int patientId,
    const vector<Bill*>& bills ) const
{
    printHeader("BILLING STATEMENT  [Patient " +
                to_string(patientId) + "]");

    double totalCharged = 0.0;
    double totalPaid    = 0.0;
    int    count        = 0;

    cout << left
         << setw(8)  << "Bill ID"
         << setw(13) << "Date"
         << setw(12) << "Amount"
         << setw(12) << "Paid"
         << setw(12) << "Balance"
         << "Status" << endl;
    printDivider('-', 65);

    for ( const auto* b : bills ) {
        if ( b->getPatientId() != patientId ) continue;
        cout << left
             << setw(8)  << b->getBillId()
             << setw(13) << b->getDate()
             << "$" << setw(11) << fixed << setprecision(2) << b->getAmount()
             << "$" << setw(11) << b->getAmountPaid()
             << "$" << setw(11) << b->getBalance()
             << paymentStatusToString((int)b->getStatus())
             << endl;
        totalCharged += b->getAmount();
        totalPaid    += b->getAmountPaid();
        count++;
    }

    printDivider('-', 65);
    if ( count == 0 ) {
        cout << "  No bills found for Patient " << patientId << "." << endl;
    } else {
        cout << right << setw(34) << "TOTAL CHARGED:  $"
             << fixed << setprecision(2) << totalCharged << endl;
        cout << right << setw(34) << "TOTAL PAID:     $" << totalPaid << endl;
        cout << right << setw(34) << "OUTSTANDING:    $"
             << (totalCharged - totalPaid) << endl;
    }
    printDivider('=', 55);
}

// ============================================================
// generateMonthlySummary
// Aggregates statistics for a given month (format: "YYYY-MM").
// Counts appointments, new patients, and billing revenue.
// ============================================================
void ReportGenerator::generateMonthlySummary(
    const string& yearMonth,
    const vector<Person*>&       people,
    const vector<Appointment*>&  appointments,
    const vector<Bill*>&         bills ) const
{
    printHeader("MONTHLY SUMMARY  [" + yearMonth + "]");

    // Count appointments by status
    int scheduled = 0, completed = 0, cancelled = 0;
    for ( const auto* a : appointments ) {
        // Check if appointment date starts with yearMonth prefix
        if ( a->getDate().substr(0, 7) != yearMonth ) continue;
        switch ( a->getStatus() ) {
            case Scheduled:  scheduled++;  break;
            case Completed:  completed++;  break;
            case Cancelled:  cancelled++;  break;
        }
    }

    // Count new patients (use personId range as proxy — real
    // systems would store registration date; we use assignedDoctorId
    // date which isn't available here, so we count all patients)
    int patientCount = 0;
    for ( const auto* p : people )
        if ( dynamic_cast<const Patient*>(p) ) patientCount++;

    // Sum billing for the month
    double revenue    = 0.0;
    double outstanding= 0.0;
    for ( const auto* b : bills ) {
        if ( b->getDate().substr(0, 7) != yearMonth ) continue;
        revenue     += b->getAmountPaid();
        outstanding += b->getBalance();
    }

    // Print summary
    cout << "  Appointments:" << endl;
    cout << "    Scheduled:   " << scheduled  << endl;
    cout << "    Completed:   " << completed  << endl;
    cout << "    Cancelled:   " << cancelled  << endl;
    cout << "    Total:       " << (scheduled + completed + cancelled) << endl;
    cout << endl;
    cout << "  Patients in System: " << patientCount << endl;
    cout << endl;
    cout << "  Financials:" << endl;
    cout << "    Revenue Collected: $"
         << fixed << setprecision(2) << revenue     << endl;
    cout << "    Outstanding:       $" << outstanding << endl;

    printDivider('=', 55);
}

// ============================================================
// exportToCSV
// Dumps all entities to a CSV file using their exportRecord()
// methods — consistent with FileManager::exportAllToCSV().
// ============================================================
void ReportGenerator::exportToCSV(
    const string& filename,
    const vector<Person*>&       people,
    const vector<Appointment*>&  appointments,
    const vector<Bill*>&         bills,
    const vector<Prescription*>& prescriptions ) const
{
    ofstream f(filename);
    if (!f.is_open()) {
        cerr << "Report Error: Cannot open file \"" << filename << "\"." << endl;
        return;
    }

    f << "=== PEOPLE ===" << endl;
    for (const auto* p : people)
        f << p->exportRecord() << endl;

    f << "=== APPOINTMENTS ===" << endl;
    for (const auto* a : appointments)
        f << a->exportRecord() << endl;

    f << "=== BILLS ===" << endl;
    for (const auto* b : bills)
        f << b->exportRecord() << endl;

    f << "=== PRESCRIPTIONS ===" << endl;
    for (const auto* p : prescriptions)
        f << p->exportRecord() << endl;

    f.close();
    cout << "Report exported to \"" << filename << "\"." << endl;
}
