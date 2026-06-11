#include "HospitalSystem.h"
#include <iostream>
using namespace std;

void showMenu()
{
    cout << "\n========== HOSPITAL SYSTEM ==========" << endl;
    cout << "1.  Add Patient"          << endl;
    cout << "2.  Search Patient by ID" << endl;
    cout << "3.  Search Patient by Name" << endl;
    cout << "4.  Update Patient"       << endl;
    cout << "5.  Remove Patient"       << endl;
    cout << "6.  List All Patients"    << endl;
    cout << "7.  Add Doctor"           << endl;
    cout << "8.  List All Doctors"     << endl;
    cout << "9.  Book Appointment"     << endl;
    cout << "10. Cancel Appointment"   << endl;
    cout << "11. Complete Appointment" << endl;
    cout << "12. List All Appointments"<< endl;
    cout << "13. Create Bill"          << endl;
    cout << "14. Process Payment"      << endl;
    cout << "15. List All Bills"       << endl;
    cout << "16. Add Prescription"     << endl;
    cout << "17. List All Prescriptions"<< endl;
    cout << "18. Generate Full Report" << endl;
    cout << "19. Generate Patient Report"<< endl;
    cout << "0.  Exit"                 << endl;
    cout << "=====================================" << endl;
    cout << "Choice: ";
}

int main()
{
    HospitalSystem system;
    int choice;

    do {
        showMenu();
        cin >> choice;
        cin.ignore();

        if ( choice == 1 )
        {
            string name, gender, phone, email, address, diagnosis;
            int age; int doctorId;
            cout << "Name: ";       getline(cin, name);
            cout << "Age: ";        cin >> age; cin.ignore();
            cout << "Gender: ";     getline(cin, gender);
            cout << "Phone: ";      getline(cin, phone);
            cout << "Email: ";      getline(cin, email);
            cout << "Address: ";    getline(cin, address);
            cout << "Diagnosis: ";  getline(cin, diagnosis);
            cout << "Doctor ID: ";  cin >> doctorId; cin.ignore();

            Patient p(0, name, age, gender, phone, email,
                      address, diagnosis, Outpatient, doctorId);
            system.addPatient(p);
        }
        else if ( choice == 2 )
        {
            int id;
            cout << "Patient ID: "; cin >> id; cin.ignore();
            Patient* p = system.searchPatient(id);
            if (p) p->displayInfo();
            else   cout << "Patient not found." << endl;
        }
        else if ( choice == 3 )
        {
            string name;
            cout << "Name: "; getline(cin, name);
            Patient* p = system.searchPatientByName(name);
            if (p) p->displayInfo();
            else   cout << "Patient not found." << endl;
        }
        else if ( choice == 4 )
        {
            int id; string name, gender, phone, email, address, diagnosis;
            int age, doctorId, status;
            cout << "Patient ID to update: "; cin >> id; cin.ignore();
            cout << "New Name: ";      getline(cin, name);
            cout << "New Age: ";       cin >> age; cin.ignore();
            cout << "New Gender: ";    getline(cin, gender);
            cout << "New Phone: ";     getline(cin, phone);
            cout << "New Email: ";     getline(cin, email);
            cout << "New Address: ";   getline(cin, address);
            cout << "New Diagnosis: "; getline(cin, diagnosis);
            cout << "Status (0=Admitted 1=Discharged 2=Outpatient): ";
            cin >> status; cin.ignore();
            cout << "Doctor ID: ";     cin >> doctorId; cin.ignore();

            Patient p(id, name, age, gender, phone, email,
                      address, diagnosis,
                      (AdmissionStatus)status, doctorId);
            system.updatePatient(p);
        }
        else if ( choice == 5 )
        {
            int id;
            cout << "Patient ID to remove: "; cin >> id; cin.ignore();
            system.removePatient(id);
        }
        else if ( choice == 6 )
        {
            system.listAllPatients();
        }
        else if ( choice == 7 )
        {
            string name, gender, phone, email, address;
            string empId, dept, spec;
            int age; double salary;
            cout << "Name: ";           getline(cin, name);
            cout << "Age: ";            cin >> age; cin.ignore();
            cout << "Gender: ";         getline(cin, gender);
            cout << "Phone: ";          getline(cin, phone);
            cout << "Email: ";          getline(cin, email);
            cout << "Address: ";        getline(cin, address);
            cout << "Employee ID: ";    getline(cin, empId);
            cout << "Department: ";     getline(cin, dept);
            cout << "Salary: ";         cin >> salary; cin.ignore();
            cout << "Specialization: "; getline(cin, spec);

            Doctor d(0, name, age, gender, phone, email,
                     address, empId, dept, salary, spec);
            system.addDoctor(d);
        }
        else if ( choice == 8 )
        {
            system.listAllDoctors();
        }
        else if ( choice == 9 )
        {
            int pid, did;
            string date, time, reason;
            cout << "Patient ID: ";  cin >> pid; cin.ignore();
            cout << "Doctor ID: ";   cin >> did; cin.ignore();
            cout << "Date (YYYY-MM-DD): "; getline(cin, date);
            cout << "Time (HH:MM): ";      getline(cin, time);
            cout << "Reason: ";            getline(cin, reason);

            Appointment a(0, pid, did, date, time, reason);
            system.bookAppointment(a);
        }
        else if ( choice == 10 )
        {
            int id;
            cout << "Appointment ID to cancel: "; cin >> id; cin.ignore();
            system.cancelAppointment(id);
        }
        else if ( choice == 11 )
        {
            int id;
            cout << "Appointment ID to complete: "; cin >> id; cin.ignore();
            system.completeAppointment(id);
        }
        else if ( choice == 12 )
        {
            system.listAllAppointments();
        }
        else if ( choice == 13 )
        {
            int pid; double amount;
            string date, desc;
            cout << "Patient ID: "; cin >> pid; cin.ignore();
            cout << "Amount: $";    cin >> amount; cin.ignore();
            cout << "Date: ";       getline(cin, date);
            cout << "Description: ";getline(cin, desc);

            Bill b(0, pid, amount, date, desc);
            system.createBill(b);
        }
        else if ( choice == 14 )
        {
            int id; double amount;
            cout << "Bill ID: ";      cin >> id; cin.ignore();
            cout << "Payment: $";     cin >> amount; cin.ignore();
            system.processPayment(id, amount);
        }
        else if ( choice == 15 )
        {
            system.listAllBills();
        }
        else if ( choice == 16 )
        {
            int pid, did;
            string med, dos, freq, sd, ed;
            cout << "Patient ID: ";   cin >> pid; cin.ignore();
            cout << "Doctor ID: ";    cin >> did; cin.ignore();
            cout << "Medication: ";   getline(cin, med);
            cout << "Dosage: ";       getline(cin, dos);
            cout << "Frequency: ";    getline(cin, freq);
            cout << "Start Date: ";   getline(cin, sd);
            cout << "End Date: ";     getline(cin, ed);

            Prescription p(0, pid, did, med, dos, freq, sd, ed);
            system.addPrescription(p);
        }
        else if ( choice == 17 )
        {
            system.listAllPrescriptions();
        }
        else if ( choice == 18 )
        {
            string filename;
            cout << "Output filename (e.g. report.csv): ";
            getline(cin, filename);
            system.generateReport(filename);
        }
        else if ( choice == 19 )
        {
            int id;
            cout << "Patient ID: "; cin >> id; cin.ignore();
            system.generatePatientReport(id);
        }
        else if ( choice != 0 )
        {
            cout << "Invalid choice." << endl;
        }

    } while ( choice != 0 );

    cout << "System shutting down. Goodbye!" << endl;
    return 0;
}
