#ifndef STAFF_H
#define STAFF_H

#include "Person.h"

// Staff is intermediate — never instantiated directly
class Staff : public Person
{
public:
    Staff( int id = 0, string name = "", int age = 0,
           string gender = "", string phone = "",
           string email = "", string address = "",
           string employeeId = "", string department = "",
           double salary = 0.0 );

    virtual ~Staff() {}

    // Still pure virtual — subclasses must implement
    void   displayInfo()  const override = 0;
    string exportRecord() const override = 0;

    // Staff-specific methods
    string getEmployeeId()  const { return employeeId; }
    string getDepartment()  const { return department; }
    double getSalary()      const { return salary; }
    void   setSalary( double s )       { salary = s; }
    void   setDepartment( string d )   { department = d; }
    void   setEmployeeId( string id )  { employeeId = id; }

protected:
    string employeeId;
    string department;
    double salary;
};

#endif
