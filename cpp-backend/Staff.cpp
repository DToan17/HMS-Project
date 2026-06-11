#include "Staff.h"

Staff::Staff( int id, string name, int age,
              string gender, string phone,
              string email, string address,
              string employeeId, string department,
              double salary )
    : Person(id, name, age, gender, phone, email, address),
      employeeId(employeeId), department(department), salary(salary) {}
