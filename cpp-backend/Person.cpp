#include "Person.h"

Person::Person( int id, string n, int a,
                string g, string p, string e, string addr )
    : personId(id), name(n), age(a),
      gender(g), phone(p), email(e), address(addr) {}

bool Person::validateData() const
{
    if ( name.empty() )        { cerr << "Error: Name is empty."        << endl; return false; }
    if ( age <= 0 || age > 150){ cerr << "Error: Invalid age."          << endl; return false; }
    if ( gender.empty() )      { cerr << "Error: Gender is empty."      << endl; return false; }
    if ( phone.empty() )       { cerr << "Error: Phone is empty."       << endl; return false; }
    return true;
}
