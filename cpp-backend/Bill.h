#ifndef BILL_H
#define BILL_H

#include <string>
using namespace std;

enum PaymentStatus { Pending, Paid, Overdue };

struct BillRecord {
    int    billId;
    int    patientId;
    double amount;
    double amountPaid;
    int    paymentStatus;  // PaymentStatus as int
    char   date[20];
    char   description[200];
};

class Bill
{
public:
    Bill( int id = 0, int patientId = 0, double amount = 0.0,
          string date = "", string description = "" );

    void displayInfo() const;
    string exportRecord() const;

    int    getBillId()       const { return billId; }
    int    getPatientId()    const { return patientId; }
    double getAmount()       const { return amount; }
    double getAmountPaid()   const { return amountPaid; }
    double getBalance()      const { return amount - amountPaid; }
    PaymentStatus getStatus()const { return paymentStatus; }
    string getDate()         const { return date; }
    string getDescription()  const { return description; }

    void makePayment( double payment );
    void setStatus( PaymentStatus s ) { paymentStatus = s; }

    BillRecord toStruct() const;
    static Bill fromStruct( const BillRecord& r );

private:
    int           billId;
    int           patientId;
    double        amount;
    double        amountPaid;
    PaymentStatus paymentStatus;
    string        date;
    string        description;
};

#endif
