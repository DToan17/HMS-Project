#include "Bill.h"
#include <iostream>
#include <iomanip>
#include <sstream>
#include <cstring>

Bill::Bill( int id, int pid, double amt,
            string d, string desc )
    : billId(id), patientId(pid), amount(amt),
      amountPaid(0.0), paymentStatus(Pending),
      date(d), description(desc) {}

void Bill::makePayment( double payment )
{
    if ( payment <= 0 ) { cerr << "Invalid payment amount." << endl; return; }
    amountPaid += payment;
    if ( amountPaid >= amount )
        paymentStatus = Paid;
    cout << "Payment of $" << fixed << setprecision(2) << payment
         << " received. Balance: $" << getBalance() << endl;
}

void Bill::displayInfo() const
{
    string statusStr[] = {"Pending","Paid","Overdue"};
    cout << "--- Bill #" << billId << " ---" << endl;
    cout << "Patient ID:   " << patientId   << endl;
    cout << "Date:         " << date        << endl;
    cout << "Description:  " << description << endl;
    cout << "Amount:       $" << fixed << setprecision(2) << amount      << endl;
    cout << "Amount Paid:  $" << amountPaid  << endl;
    cout << "Balance:      $" << getBalance() << endl;
    cout << "Status:       " << statusStr[paymentStatus] << endl;
}

string Bill::exportRecord() const
{
    string statusStr[] = {"Pending","Paid","Overdue"};
    ostringstream oss;
    oss << "BILL," << billId << "," << patientId << ","
        << amount << "," << amountPaid << ","
        << statusStr[paymentStatus] << "," << date << "," << description;
    return oss.str();
}

BillRecord Bill::toStruct() const
{
    BillRecord r;
    r.billId        = billId;
    r.patientId     = patientId;
    r.amount        = amount;
    r.amountPaid    = amountPaid;
    r.paymentStatus = (int)paymentStatus;
    strncpy(r.date,        date.c_str(),        19);  r.date[19]        = '\0';
    strncpy(r.description, description.c_str(), 199); r.description[199]= '\0';
    return r;
}

Bill Bill::fromStruct( const BillRecord& r )
{
    Bill b( r.billId, r.patientId, r.amount, r.date, r.description );
    b.amountPaid    = r.amountPaid;
    b.paymentStatus = (PaymentStatus)r.paymentStatus;
    return b;
}
