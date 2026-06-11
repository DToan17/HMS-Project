#pragma once
#include <cstring>

struct Doctor {
    int    id            = 0;
    char   employee_id[32]  = {};
    char   name[128]        = {};
    char   specialization[64] = {};
    char   department[64]   = {};
    double salary           = 0;
    char   phone[32]        = {};
    char   email[128]       = {};
    bool   deleted          = false;
};

struct Patient {
    int    id               = 0;
    char   name[128]        = {};
    int    age              = 0;
    char   gender[16]       = {};
    char   phone[32]        = {};
    char   email[128]       = {};
    char   diagnosis[256]   = {};
    char   admission_status[32] = {};
    int    doctor_id        = 0;
    char   created_at[32]   = {};
    bool   deleted          = false;
};

struct Appointment {
    int    id           = 0;
    int    patient_id   = 0;
    int    doctor_id    = 0;
    char   date[16]     = {};
    char   appt_time[8] = {};
    char   reason[256]  = {};
    char   status[32]   = {};
    char   notes[512]   = {};
    bool   deleted      = false;
};

struct Bill {
    int    id           = 0;
    int    patient_id   = 0;
    double amount       = 0;
    double amount_paid  = 0;
    char   status[32]   = {};
    char   description[256] = {};
    char   created_at[32]   = {};
    bool   deleted      = false;
};

struct Prescription {
    int    id           = 0;
    int    patient_id   = 0;
    int    doctor_id    = 0;
    char   medication[128] = {};
    char   dosage[64]   = {};
    char   frequency[64]= {};
    char   start_date[16] = {};
    char   end_date[16] = {};
    char   notes[512]   = {};
    bool   deleted      = false;
};

struct Room {
    int    id           = 0;
    char   room_number[16] = {};
    char   type[32]     = {};
    char   status[32]   = {};
    int    patient_id   = 0;
    bool   deleted      = false;
};
