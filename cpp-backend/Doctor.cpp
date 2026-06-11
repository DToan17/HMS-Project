#include "Doctor.h"
#include <sstream>
#include <iomanip>

Doctor::Doctor( int id, string name, int age,
                string gender, string phone,
                string email, string address,
                string employeeId, string department,
                double salary, string specialization )
    : Staff(id, name, age, gender, phone, email, address,
            employeeId, department, salary),
      specialization(specialization) {}

void Doctor::displayInfo() const
{
    cout << "========== DOCTOR INFO ==========" << endl;
    cout << "ID:             " << personId          << endl;
    cout << "Employee ID:    " << employeeId        << endl;
    cout << "Name:           " << name              << endl;
    cout << "Age:            " << age               << endl;
    cout << "Gender:         " << gender            << endl;
    cout << "Phone:          " << phone             << endl;
    cout << "Email:          " << email             << endl;
    cout << "Department:     " << department        << endl;
    cout << "Specialization: " << specialization    << endl;
    cout << "Salary:         $" << fixed << setprecision(2) << salary << endl;
    cout << "=================================" << endl;
}

string Doctor::exportRecord() const
{
    ostringstream oss;
    oss << "DOCTOR," << personId << "," << name << ","
        << age << "," << gender << "," << phone << ","
        << email << "," << address << ","
        << employeeId << "," << department << ","
        << salary << "," << specialization;
    return oss.str();
}
