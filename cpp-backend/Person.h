#ifndef PERSON_H
#define PERSON_H

#include <iostream>
#include <string>
using namespace std;

class Person
{
public:
    Person( int id = 0, string name = "", int age = 0,
            string gender = "", string phone = "",
            string email = "", string address = "" );
    virtual ~Person() {}

    // Pure virtual
    virtual void displayInfo()   const = 0;
    virtual string exportRecord() const = 0;

    // Virtual with default implementation
    virtual double calculateFee() const { return 0.0; }
    virtual bool   validateData() const;

    // Getters
    int    getPersonId()  const { return personId; }
    string getName()      const { return name; }
    int    getAge()       const { return age; }
    string getGender()    const { return gender; }
    string getPhone()     const { return phone; }
    string getEmail()     const { return email; }
    string getAddress()   const { return address; }

    // Setters
    void setPersonId( int id )         { personId = id; }
    void setName( string n )           { name = n; }
    void setAge( int a )               { age = a; }
    void setGender( string g )         { gender = g; }
    void setPhone( string p )          { phone = p; }
    void setEmail( string e )          { email = e; }
    void setAddress( string a )        { address = a; }

protected:
    int    personId;
    string name;
    int    age;
    string gender;
    string phone;
    string email;
    string address;
};

#endif
