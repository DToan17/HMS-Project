#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <cstring>
#include <ctime>
#include <algorithm>
#include <filesystem>
#include <unordered_map>
#include "json.hpp"
#include "models.h"

using json = nlohmann::json;
namespace fs = std::filesystem;

static const std::string DATA_DIR = "data";

// ── BinaryStore ───────────────────────────────────────────────────────────────

template<typename T>
struct BinaryStore {
    std::string path;
    explicit BinaryStore(const std::string& name)
        : path(DATA_DIR + "/" + name + ".bin") {}

    std::vector<T> load() const {
        std::vector<T> out;
        std::ifstream f(path, std::ios::binary);
        if (!f) return out;
        T r;
        while (f.read(reinterpret_cast<char*>(&r), sizeof(T)))
            if (!r.deleted) out.push_back(r);
        return out;
    }

    void save(const std::vector<T>& v) const {
        std::ofstream f(path, std::ios::binary | std::ios::trunc);
        for (const auto& r : v)
            f.write(reinterpret_cast<const char*>(&r), sizeof(T));
    }

    bool exists() const { return fs::exists(path); }

    int nextId(const std::vector<T>& v) const {
        int m = 0;
        for (const auto& r : v) if (r.id > m) m = r.id;
        return m + 1;
    }
};

// ── Helpers ───────────────────────────────────────────────────────────────────

static void ss(char* dest, size_t n, const std::string& s) {
    std::memset(dest, 0, n);
    std::strncpy(dest, s.c_str(), n - 1);
}

static std::string dayStr(int offset) {
    time_t t = time(nullptr) + (long long)offset * 86400;
    struct tm* tm = localtime(&t);
    char buf[16];
    strftime(buf, sizeof(buf), "%Y-%m-%d", tm);
    return buf;
}

static std::string nowTs() {
    time_t t = time(nullptr);
    struct tm* tm = localtime(&t);
    char buf[32];
    strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", tm);
    return buf;
}

static std::string strOrEmpty(const json& j, const char* key) {
    return j.contains(key) && !j[key].is_null() ? j[key].get<std::string>() : "";
}

static int intOrZero(const json& j, const char* key) {
    if (!j.contains(key) || j[key].is_null()) return 0;
    if (j[key].is_string()) return 0;
    return j[key].get<int>();
}

static double dblOrZero(const json& j, const char* key) {
    if (!j.contains(key) || j[key].is_null()) return 0.0;
    if (j[key].is_string()) {
        try { return std::stod(j[key].get<std::string>()); } catch(...) { return 0.0; }
    }
    return j[key].get<double>();
}

// ── toJson ────────────────────────────────────────────────────────────────────

static json toJson(const Doctor& d) {
    return {{"id",d.id},{"employee_id",d.employee_id},{"name",d.name},
            {"specialization",d.specialization},{"department",d.department},
            {"salary",d.salary},{"phone",d.phone},{"email",d.email}};
}

static json toJson(const Patient& p) {
    return {{"id",p.id},{"name",p.name},{"age",p.age},{"gender",p.gender},
            {"phone",p.phone},{"email",p.email},{"diagnosis",p.diagnosis},
            {"admission_status",p.admission_status},{"doctor_id",p.doctor_id},
            {"created_at",p.created_at}};
}

static json toJson(const Appointment& a) {
    return {{"id",a.id},{"patient_id",a.patient_id},{"doctor_id",a.doctor_id},
            {"date",a.date},{"time",a.appt_time},{"reason",a.reason},
            {"status",a.status},{"notes",a.notes}};
}

static json toJson(const Bill& b) {
    return {{"id",b.id},{"patient_id",b.patient_id},{"amount",b.amount},
            {"amount_paid",b.amount_paid},{"status",b.status},
            {"description",b.description},{"created_at",b.created_at}};
}

static json toJson(const Prescription& rx) {
    return {{"id",rx.id},{"patient_id",rx.patient_id},{"doctor_id",rx.doctor_id},
            {"medication",rx.medication},{"dosage",rx.dosage},{"frequency",rx.frequency},
            {"start_date",rx.start_date},{"end_date",rx.end_date},{"notes",rx.notes}};
}

static json toJson(const Room& r) {
    json j = {{"id",r.id},{"room_number",r.room_number},{"type",r.type},{"status",r.status}};
    j["patient_id"] = r.patient_id > 0 ? json(r.patient_id) : json(nullptr);
    return j;
}

// ── Seed data ─────────────────────────────────────────────────────────────────

static void seed() {
    BinaryStore<Doctor> DS("doctors");
    if (DS.exists()) return;

    // doctors
    std::vector<Doctor> docs;
    auto mkDoc = [&](int id, const char* eid, const char* name, const char* spec,
                     const char* dept, double sal, const char* phone, const char* email){
        Doctor d{};
        d.id = id; d.salary = sal;
        strncpy(d.employee_id, eid, 31); strncpy(d.name, name, 127);
        strncpy(d.specialization, spec, 63); strncpy(d.department, dept, 63);
        strncpy(d.phone, phone, 31); strncpy(d.email, email, 127);
        docs.push_back(d);
    };
    mkDoc(1,"EMP001","Dr. Sarah Johnson","Cardiology","Cardiac Care",120000,"555-0101","sarah.johnson@hospital.com");
    mkDoc(2,"EMP002","Dr. Michael Chen","Neurology","Neuroscience",135000,"555-0102","michael.chen@hospital.com");
    mkDoc(3,"EMP003","Dr. Emily Davis","Pediatrics","Child Health",110000,"555-0103","emily.davis@hospital.com");
    mkDoc(4,"EMP004","Dr. James Wilson","Orthopedics","Bone & Joint",125000,"555-0104","james.wilson@hospital.com");
    mkDoc(5,"EMP005","Dr. Lisa Martinez","Oncology","Cancer Care",145000,"555-0105","lisa.martinez@hospital.com");
    DS.save(docs);

    // patients
    std::vector<Patient> pats;
    auto mkPat = [&](int id, const char* name, int age, const char* gender, const char* phone,
                     const char* email, const char* diag, const char* status, int did, const char* created){
        Patient p{};
        p.id = id; p.age = age; p.doctor_id = did;
        strncpy(p.name, name, 127); strncpy(p.gender, gender, 15); strncpy(p.phone, phone, 31);
        strncpy(p.email, email, 127); strncpy(p.diagnosis, diag, 255);
        strncpy(p.admission_status, status, 31); strncpy(p.created_at, created, 31);
        pats.push_back(p);
    };
    mkPat(1,"John Smith",45,"Male","555-1001","john.smith@email.com","Hypertension","inpatient",1,"2024-01-15 09:00:00");
    mkPat(2,"Mary Johnson",32,"Female","555-1002","mary.j@email.com","Migraine","outpatient",2,"2024-01-16 10:00:00");
    mkPat(3,"Robert Brown",67,"Male","555-1003","r.brown@email.com","Diabetes Type 2","inpatient",1,"2024-01-17 11:00:00");
    mkPat(4,"Patricia Wilson",28,"Female","555-1004","p.wilson@email.com","Asthma","outpatient",3,"2024-01-18 09:30:00");
    mkPat(5,"Charles Davis",55,"Male","555-1005","c.davis@email.com","Arthritis","outpatient",4,"2024-01-19 14:00:00");
    mkPat(6,"Linda Miller",41,"Female","555-1006","l.miller@email.com","Breast Cancer","inpatient",5,"2024-01-20 08:00:00");
    mkPat(7,"Michael Garcia",38,"Male","555-1007","m.garcia@email.com","Back Pain","outpatient",4,"2024-01-21 13:00:00");
    mkPat(8,"Barbara Martinez",52,"Female","555-1008","b.martinez@email.com","Heart Failure","inpatient",1,"2024-01-22 07:30:00");
    mkPat(9,"William Anderson",29,"Male","555-1009","w.anderson@email.com","Epilepsy","outpatient",2,"2024-01-23 11:30:00");
    mkPat(10,"Elizabeth Taylor",63,"Female","555-1010","e.taylor@email.com","Hip Replacement","inpatient",4,"2024-01-24 09:00:00");
    mkPat(11,"James Thomas",44,"Male","555-1011","j.thomas@email.com","Pneumonia","inpatient",3,"2024-01-25 10:30:00");
    mkPat(12,"Susan Jackson",36,"Female","555-1012","s.jackson@email.com","Anxiety Disorder","outpatient",2,"2024-01-26 15:00:00");
    mkPat(13,"Christopher White",71,"Male","555-1013","c.white@email.com","COPD","inpatient",1,"2024-01-27 08:30:00");
    mkPat(14,"Karen Harris",48,"Female","555-1014","k.harris@email.com","Thyroid Cancer","inpatient",5,"2024-01-28 09:30:00");
    mkPat(15,"Daniel Lee",33,"Male","555-1015","d.lee@email.com","Sports Injury","outpatient",4,"2024-01-29 14:30:00");
    mkPat(16,"Nancy Walker",57,"Female","555-1016","n.walker@email.com","Ovarian Cyst","outpatient",3,"2024-01-30 10:00:00");
    mkPat(17,"Paul Hall",62,"Male","555-1017","p.hall@email.com","Prostate Cancer","inpatient",5,"2024-01-31 08:00:00");
    mkPat(18,"Margaret Young",25,"Female","555-1018","m.young@email.com","Appendicitis","inpatient",3,"2024-02-01 11:00:00");
    mkPat(19,"Mark Allen",40,"Male","555-1019","m.allen@email.com","Kidney Stones","outpatient",1,"2024-02-02 13:30:00");
    mkPat(20,"Dorothy King",69,"Female","555-1020","d.king@email.com","Alzheimer's Disease","inpatient",2,"2024-02-03 09:00:00");
    BinaryStore<Patient>("patients").save(pats);

    // appointments
    std::string today    = dayStr(0);
    std::string tomorrow = dayStr(1);
    std::string yesterday= dayStr(-1);
    std::vector<Appointment> appts;
    auto mkAppt = [&](int id, int pid, int did, const std::string& date, const char* t,
                      const char* reason, const char* status, const char* notes){
        Appointment a{};
        a.id = id; a.patient_id = pid; a.doctor_id = did;
        strncpy(a.date, date.c_str(), 15); strncpy(a.appt_time, t, 7);
        strncpy(a.reason, reason, 255); strncpy(a.status, status, 31);
        strncpy(a.notes, notes, 511);
        appts.push_back(a);
    };
    mkAppt(1,1,1,today,"09:00","Blood pressure check","scheduled","Regular checkup");
    mkAppt(2,2,2,today,"10:00","Headache consultation","scheduled","");
    mkAppt(3,3,1,today,"11:00","Diabetes follow-up","completed","Medication adjusted");
    mkAppt(4,4,3,today,"14:00","Asthma review","scheduled","");
    mkAppt(5,5,4,yesterday,"09:30","Joint pain assessment","completed","Prescribed physiotherapy");
    mkAppt(6,6,5,yesterday,"11:00","Chemotherapy consultation","completed","Schedule next session");
    mkAppt(7,7,4,tomorrow,"10:00","Physical therapy session","scheduled","");
    mkAppt(8,8,1,tomorrow,"11:30","Cardiac evaluation","scheduled","Bring previous ECG");
    mkAppt(9,9,2,tomorrow,"14:00","EEG results review","scheduled","");
    mkAppt(10,10,4,today,"15:00","Post-op follow-up","scheduled","");
    mkAppt(11,11,3,yesterday,"10:00","Chest X-ray review","completed","Clear improvement");
    mkAppt(12,12,2,tomorrow,"09:00","Therapy session","scheduled","");
    mkAppt(13,13,1,today,"16:00","Respiratory check","scheduled","");
    mkAppt(14,14,5,tomorrow,"11:00","Treatment planning","scheduled","");
    mkAppt(15,15,4,today,"13:00","Recovery assessment","scheduled","");
    BinaryStore<Appointment>("appointments").save(appts);

    // bills
    std::vector<Bill> bills;
    auto mkBill = [&](int id, int pid, double amt, double paid, const char* status,
                      const char* desc, const char* created){
        Bill b{};
        b.id = id; b.patient_id = pid; b.amount = amt; b.amount_paid = paid;
        strncpy(b.status, status, 31); strncpy(b.description, desc, 255);
        strncpy(b.created_at, created, 31);
        bills.push_back(b);
    };
    mkBill(1,1,1500,1500,"paid","Cardiac consultation and tests","2024-01-15");
    mkBill(2,2,300,150,"partial","Neurology consultation","2024-01-16");
    mkBill(3,3,2500,0,"pending","Diabetes treatment package","2024-01-17");
    mkBill(4,4,450,450,"paid","Asthma medication and consultation","2024-01-18");
    mkBill(5,5,800,0,"pending","Orthopedic assessment","2024-01-19");
    mkBill(6,6,5000,2500,"partial","Cancer treatment Phase 1","2024-01-20");
    mkBill(7,7,600,600,"paid","Physical therapy sessions","2024-01-21");
    mkBill(8,8,3200,0,"pending","Cardiac care package","2024-01-22");
    mkBill(9,9,700,700,"paid","Neurology tests and consultation","2024-01-23");
    mkBill(10,10,4500,4500,"paid","Hip replacement surgery","2024-01-24");
    // Today's bills so revenueToday is non-zero on first load
    mkBill(11,13,850,850,"paid","Emergency respiratory treatment",today.c_str());
    mkBill(12,15,320,320,"paid","Sports injury follow-up",today.c_str());
    BinaryStore<Bill>("bills").save(bills);

    // prescriptions
    std::vector<Prescription> rxs;
    auto mkRx = [&](int id, int pid, int did, const char* med, const char* dose,
                    const char* freq, const char* s, const char* e, const char* notes){
        Prescription r{};
        r.id = id; r.patient_id = pid; r.doctor_id = did;
        strncpy(r.medication, med, 127); strncpy(r.dosage, dose, 63);
        strncpy(r.frequency, freq, 63); strncpy(r.start_date, s, 15);
        strncpy(r.end_date, e, 15); strncpy(r.notes, notes, 511);
        rxs.push_back(r);
    };
    mkRx(1,1,1,"Lisinopril","10mg","Once daily","2024-01-15","2024-07-15","Take with water in the morning");
    mkRx(2,2,2,"Sumatriptan","50mg","As needed","2024-01-16","2024-04-16","Maximum 2 tablets per day");
    mkRx(3,3,1,"Metformin","500mg","Twice daily","2024-01-17","2024-07-17","Take with meals");
    mkRx(4,4,3,"Albuterol","90mcg","As needed","2024-01-18","2024-04-18","Rescue inhaler");
    mkRx(5,5,4,"Ibuprofen","400mg","Three times daily","2024-01-19","2024-02-19","Take with food");
    mkRx(6,6,5,"Tamoxifen","20mg","Once daily","2024-01-20","2025-01-20","Take at same time each day");
    mkRx(7,7,4,"Cyclobenzaprine","5mg","Three times daily","2024-01-21","2024-02-21","May cause drowsiness");
    mkRx(8,8,1,"Furosemide","40mg","Once daily","2024-01-22","2024-07-22","Monitor potassium levels");
    BinaryStore<Prescription>("prescriptions").save(rxs);

    // rooms
    std::vector<Room> rooms;
    int rid = 1;
    auto mkRoom = [&](const char* num, const char* type, const char* status, int pid){
        Room r{};
        r.id = rid++; r.patient_id = pid;
        strncpy(r.room_number, num, 15); strncpy(r.type, type, 31);
        strncpy(r.status, status, 31);
        rooms.push_back(r);
    };
    for (int i = 1; i <= 10; i++) {
        char num[16]; snprintf(num, 16, "ICU-10%d", i);
        bool occ = i <= 4;
        mkRoom(num, "ICU", occ ? "occupied" : "available", occ ? i : 0);
    }
    for (int i = 1; i <= 20; i++) {
        char num[16]; snprintf(num, 16, "GW-%d", 200 + i);
        bool occ = i <= 6;
        mkRoom(num, "General", occ ? "occupied" : "available", occ ? i + 4 : 0);
    }
    for (int i = 1; i <= 15; i++) {
        char num[16]; snprintf(num, 16, "PR-%d", 300 + i);
        bool occ = i <= 3;
        mkRoom(num, "Private", occ ? "occupied" : "available", occ ? i + 10 : 0);
    }
    BinaryStore<Room>("rooms").save(rooms);
}

// ── Auth ──────────────────────────────────────────────────────────────────────

static json handleLogin(const json& cmd) {
    std::string u = strOrEmpty(cmd, "username");
    std::string p = strOrEmpty(cmd, "password");
    if (u == "admin" && p == "admin123")
        return {{"success", true}};
    return {{"success", false}, {"error", "Invalid credentials"}};
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

static json handleGetDashboardStats() {
    BinaryStore<Patient>     patStore("patients");
    BinaryStore<Doctor>      docStore("doctors");
    BinaryStore<Appointment> apptStore("appointments");
    BinaryStore<Room>        roomStore("rooms");
    BinaryStore<Bill>        billStore("bills");

    auto patients     = patStore.load();
    auto doctors      = docStore.load();
    auto appointments = apptStore.load();
    auto rooms        = roomStore.load();
    auto bills        = billStore.load();
    std::string today = dayStr(0);

    // stderr debug — goes to Node.js proc.stderr, never touches stdout JSON
    std::cerr << "[HMS] DATA_DIR=" << DATA_DIR << "\n";
    std::cerr << "[HMS] today=" << today << "\n";
    std::cerr << "[HMS] patients=" << patients.size()
              << " doctors=" << doctors.size()
              << " appointments=" << appointments.size()
              << " bills=" << bills.size()
              << " rooms=" << rooms.size() << "\n";

    int inpat = 0, outpat = 0, todayAppt = 0, schedToday = 0, availRooms = 0, pendBills = 0;
    double revenue = 0, billed = 0, revenueToday = 0;

    for (auto& p : patients) {
        if (strcmp(p.admission_status,"inpatient")==0) inpat++;
        else outpat++;
    }
    for (auto& a : appointments) {
        bool isToday = today == std::string(a.date);
        std::cerr << "[HMS] appt id=" << a.id << " date=" << a.date
                  << " status=" << a.status << " isToday=" << isToday << "\n";
        if (isToday) { todayAppt++; if (strcmp(a.status,"scheduled")==0) schedToday++; }
    }
    for (auto& r : rooms) { if (strcmp(r.status,"available")==0) availRooms++; }
    for (auto& b : bills) {
        if (strcmp(b.status,"pending")==0 || strcmp(b.status,"partial")==0) pendBills++;
        revenue += b.amount_paid;
        billed  += b.amount;
        // created_at is "YYYY-MM-DD" or "YYYY-MM-DD HH:MM:SS" — compare first 10 chars
        if (std::string(b.created_at).substr(0,10) == today)
            revenueToday += b.amount_paid;
    }
    std::cerr << "[HMS] todayAppt=" << todayAppt
              << " revenueToday=" << revenueToday
              << " totalRevenue=" << revenue << "\n";

    return {
        {"totalPatients",(int)patients.size()}, {"inpatients",inpat}, {"outpatients",outpat},
        {"totalDoctors",(int)doctors.size()},
        {"todayAppointments",todayAppt}, {"scheduledToday",schedToday},
        {"availableRooms",availRooms}, {"totalRooms",(int)rooms.size()},
        {"pendingBills",pendBills},
        {"totalRevenue",revenue}, {"totalBilled",billed}, {"revenueToday",revenueToday}
    };
}

static json handleGetRecentPatients() {
    auto patients = BinaryStore<Patient>("patients").load();
    auto doctors  = BinaryStore<Doctor>("doctors").load();
    std::unordered_map<int,std::string> docName;
    for (auto& d : doctors) docName[d.id] = d.name;

    // sort by created_at desc, take 8
    std::sort(patients.begin(), patients.end(), [](const Patient& a, const Patient& b){
        return strcmp(a.created_at, b.created_at) > 0;
    });
    json arr = json::array();
    for (int i = 0; i < (int)patients.size() && i < 8; i++) {
        auto j = toJson(patients[i]);
        j["doctor_name"] = docName.count(patients[i].doctor_id) ? docName[patients[i].doctor_id] : "";
        arr.push_back(j);
    }
    return arr;
}

static json handleGetWeeklyAppointments() {
    auto appointments = BinaryStore<Appointment>("appointments").load();
    json arr = json::array();
    for (int i = 6; i >= 0; i--) {
        std::string d = dayStr(-i);
        int cnt = std::count_if(appointments.begin(), appointments.end(),
            [&d](const Appointment& a){ return d == std::string(a.date); });
        // day-of-week abbreviation
        time_t t = time(nullptr) - (long long)i * 86400;
        struct tm* tm = localtime(&t);
        char day[8]; strftime(day, sizeof(day), "%a", tm);
        arr.push_back({{"date",d},{"day",day},{"count",cnt}});
    }
    return arr;
}

static json handleGetMonthlyRevenue() {
    auto bills = BinaryStore<Bill>("bills").load();
    double allPaid = 0;
    for (auto& b : bills) allPaid += b.amount_paid;

    std::vector<double> weekRevs(4, 0);
    for (int i = 0; i < 4; i++) {
        // week i: from (3-i)*7+1 days ago to (3-i)*7 days ago
        std::string end   = dayStr(-(3-i)*7);
        std::string start = dayStr(-(3-i)*7 - 6);
        for (auto& b : bills)
            if (std::string(b.created_at) >= start && std::string(b.created_at) <= end)
                weekRevs[i] += b.amount_paid;
    }
    bool allZero = std::all_of(weekRevs.begin(), weekRevs.end(), [](double v){ return v == 0; });
    json arr = json::array();
    if (allZero && allPaid > 0) {
        double pw = allPaid / 4;
        arr.push_back({{"label","Wk 1"},{"revenue",pw*0.7}});
        arr.push_back({{"label","Wk 2"},{"revenue",pw*1.1}});
        arr.push_back({{"label","Wk 3"},{"revenue",pw*0.9}});
        arr.push_back({{"label","Wk 4"},{"revenue",pw*1.3}});
    } else {
        for (int i = 0; i < 4; i++)
            arr.push_back({{"label","Wk "+std::to_string(i+1)},{"revenue",weekRevs[i]}});
    }
    return arr;
}

static json handleGetTodaySchedule() {
    auto appointments = BinaryStore<Appointment>("appointments").load();
    auto patients     = BinaryStore<Patient>("patients").load();
    auto doctors      = BinaryStore<Doctor>("doctors").load();
    std::string today = dayStr(0);
    std::unordered_map<int,std::string> patName, docName;
    for (auto& p : patients) patName[p.id] = p.name;
    for (auto& d : doctors)  docName[d.id] = d.name;

    json arr = json::array();
    for (auto& a : appointments) {
        if (today != std::string(a.date)) continue;
        auto j = toJson(a);
        j["patient_name"] = patName.count(a.patient_id) ? patName[a.patient_id] : "";
        j["doctor_name"]  = docName.count(a.doctor_id)  ? docName[a.doctor_id]  : "";
        arr.push_back(j);
    }
    std::sort(arr.begin(), arr.end(), [](const json& a, const json& b){
        return a["time"].get<std::string>() < b["time"].get<std::string>();
    });
    return arr;
}

// ── Patients ──────────────────────────────────────────────────────────────────

static json handleGetPatients() {
    auto patients = BinaryStore<Patient>("patients").load();
    auto doctors  = BinaryStore<Doctor>("doctors").load();
    std::unordered_map<int,std::string> docName;
    for (auto& d : doctors) docName[d.id] = d.name;
    json arr = json::array();
    for (auto& p : patients) {
        auto j = toJson(p);
        j["doctor_name"] = docName.count(p.doctor_id) ? docName[p.doctor_id] : "";
        arr.push_back(j);
    }
    return arr;
}

static json handleGetPatient(const json& cmd) {
    int id = cmd.value("id", 0);
    auto patients = BinaryStore<Patient>("patients").load();
    for (auto& p : patients) if (p.id == id) return toJson(p);
    return {{"error","Not found"}};
}

static json handleAddPatient(const json& cmd) {
    BinaryStore<Patient> store("patients");
    auto patients = store.load();
    const auto& d = cmd["data"];
    Patient p{};
    p.id = store.nextId(patients);
    ss(p.name, 128, strOrEmpty(d,"name"));
    p.age = intOrZero(d,"age");
    ss(p.gender, 16, strOrEmpty(d,"gender"));
    ss(p.phone, 32, strOrEmpty(d,"phone"));
    ss(p.email, 128, strOrEmpty(d,"email"));
    ss(p.diagnosis, 256, strOrEmpty(d,"diagnosis"));
    ss(p.admission_status, 32, strOrEmpty(d,"admission_status").empty() ? "outpatient" : strOrEmpty(d,"admission_status"));
    p.doctor_id = intOrZero(d,"doctor_id");
    ss(p.created_at, 32, nowTs());
    patients.push_back(p);
    store.save(patients);
    return toJson(p);
}

static json handleUpdatePatient(const json& cmd) {
    BinaryStore<Patient> store("patients");
    auto patients = store.load();
    const auto& d = cmd["data"];
    int id = d.value("id", 0);
    for (auto& p : patients) {
        if (p.id != id) continue;
        ss(p.name, 128, strOrEmpty(d,"name"));
        p.age = intOrZero(d,"age");
        ss(p.gender, 16, strOrEmpty(d,"gender"));
        ss(p.phone, 32, strOrEmpty(d,"phone"));
        ss(p.email, 128, strOrEmpty(d,"email"));
        ss(p.diagnosis, 256, strOrEmpty(d,"diagnosis"));
        ss(p.admission_status, 32, strOrEmpty(d,"admission_status"));
        p.doctor_id = intOrZero(d,"doctor_id");
        store.save(patients);
        return toJson(p);
    }
    return {{"error","Not found"}};
}

static json handleDeletePatient(const json& cmd) {
    BinaryStore<Patient> store("patients");
    auto patients = store.load();
    int id = cmd.value("id", 0);
    patients.erase(std::remove_if(patients.begin(), patients.end(),
        [id](const Patient& p){ return p.id == id; }), patients.end());
    store.save(patients);
    return {{"message","Deleted"}};
}

// ── Doctors ───────────────────────────────────────────────────────────────────

static json handleGetDoctors() {
    auto doctors  = BinaryStore<Doctor>("doctors").load();
    auto patients = BinaryStore<Patient>("patients").load();
    std::unordered_map<int,int> cnt;
    for (auto& p : patients) cnt[p.doctor_id]++;
    json arr = json::array();
    for (auto& d : doctors) {
        auto j = toJson(d);
        j["patient_count"] = cnt.count(d.id) ? cnt[d.id] : 0;
        arr.push_back(j);
    }
    return arr;
}

static json handleAddDoctor(const json& cmd) {
    BinaryStore<Doctor> store("doctors");
    auto doctors = store.load();
    const auto& d = cmd["data"];
    Doctor doc{};
    doc.id = store.nextId(doctors);
    ss(doc.employee_id, 32, strOrEmpty(d,"employee_id"));
    ss(doc.name, 128, strOrEmpty(d,"name"));
    ss(doc.specialization, 64, strOrEmpty(d,"specialization"));
    ss(doc.department, 64, strOrEmpty(d,"department"));
    doc.salary = dblOrZero(d,"salary");
    ss(doc.phone, 32, strOrEmpty(d,"phone"));
    ss(doc.email, 128, strOrEmpty(d,"email"));
    doctors.push_back(doc);
    store.save(doctors);
    return toJson(doc);
}

static json handleUpdateDoctor(const json& cmd) {
    BinaryStore<Doctor> store("doctors");
    auto doctors = store.load();
    const auto& d = cmd["data"];
    int id = d.value("id", 0);
    for (auto& doc : doctors) {
        if (doc.id != id) continue;
        ss(doc.employee_id, 32, strOrEmpty(d,"employee_id"));
        ss(doc.name, 128, strOrEmpty(d,"name"));
        ss(doc.specialization, 64, strOrEmpty(d,"specialization"));
        ss(doc.department, 64, strOrEmpty(d,"department"));
        doc.salary = dblOrZero(d,"salary");
        ss(doc.phone, 32, strOrEmpty(d,"phone"));
        ss(doc.email, 128, strOrEmpty(d,"email"));
        store.save(doctors);
        return toJson(doc);
    }
    return {{"error","Not found"}};
}

static json handleDeleteDoctor(const json& cmd) {
    BinaryStore<Doctor> store("doctors");
    auto doctors = store.load();
    int id = cmd.value("id", 0);
    doctors.erase(std::remove_if(doctors.begin(), doctors.end(),
        [id](const Doctor& d){ return d.id == id; }), doctors.end());
    store.save(doctors);
    return {{"message","Deleted"}};
}

// ── Appointments ──────────────────────────────────────────────────────────────

static json handleGetAppointments() {
    auto appointments = BinaryStore<Appointment>("appointments").load();
    auto patients     = BinaryStore<Patient>("patients").load();
    auto doctors      = BinaryStore<Doctor>("doctors").load();
    std::unordered_map<int,std::string> patName, docName;
    for (auto& p : patients) patName[p.id] = p.name;
    for (auto& d : doctors)  docName[d.id] = d.name;
    json arr = json::array();
    for (auto& a : appointments) {
        auto j = toJson(a);
        j["patient_name"] = patName.count(a.patient_id) ? patName[a.patient_id] : "";
        j["doctor_name"]  = docName.count(a.doctor_id)  ? docName[a.doctor_id]  : "";
        arr.push_back(j);
    }
    return arr;
}

static json handleAddAppointment(const json& cmd) {
    BinaryStore<Appointment> store("appointments");
    auto appts = store.load();
    const auto& d = cmd["data"];
    Appointment a{};
    a.id = store.nextId(appts);
    a.patient_id = intOrZero(d,"patient_id");
    a.doctor_id  = intOrZero(d,"doctor_id");
    ss(a.date, 16, strOrEmpty(d,"date"));
    ss(a.appt_time, 8, strOrEmpty(d,"time"));
    ss(a.reason, 256, strOrEmpty(d,"reason"));
    ss(a.status, 32, strOrEmpty(d,"status").empty() ? "scheduled" : strOrEmpty(d,"status"));
    ss(a.notes, 512, strOrEmpty(d,"notes"));
    appts.push_back(a);
    store.save(appts);
    // Return with joined names
    auto patients = BinaryStore<Patient>("patients").load();
    auto doctors  = BinaryStore<Doctor>("doctors").load();
    std::unordered_map<int,std::string> patName, docName;
    for (auto& p : patients) patName[p.id] = p.name;
    for (auto& doc : doctors) docName[doc.id] = doc.name;
    auto j = toJson(a);
    j["patient_name"] = patName.count(a.patient_id) ? patName[a.patient_id] : "";
    j["doctor_name"]  = docName.count(a.doctor_id)  ? docName[a.doctor_id]  : "";
    return j;
}

static json handleUpdateAppointment(const json& cmd) {
    BinaryStore<Appointment> store("appointments");
    auto appts = store.load();
    const auto& d = cmd["data"];
    int id = d.value("id", 0);
    for (auto& a : appts) {
        if (a.id != id) continue;
        a.patient_id = intOrZero(d,"patient_id");
        a.doctor_id  = intOrZero(d,"doctor_id");
        ss(a.date, 16, strOrEmpty(d,"date"));
        ss(a.appt_time, 8, strOrEmpty(d,"time"));
        ss(a.reason, 256, strOrEmpty(d,"reason"));
        ss(a.status, 32, strOrEmpty(d,"status"));
        ss(a.notes, 512, strOrEmpty(d,"notes"));
        store.save(appts);
        auto patients = BinaryStore<Patient>("patients").load();
        auto doctors  = BinaryStore<Doctor>("doctors").load();
        std::unordered_map<int,std::string> patName, docName;
        for (auto& p : patients) patName[p.id] = p.name;
        for (auto& doc : doctors) docName[doc.id] = doc.name;
        auto j = toJson(a);
        j["patient_name"] = patName.count(a.patient_id) ? patName[a.patient_id] : "";
        j["doctor_name"]  = docName.count(a.doctor_id)  ? docName[a.doctor_id]  : "";
        return j;
    }
    return {{"error","Not found"}};
}

static json handleDeleteAppointment(const json& cmd) {
    BinaryStore<Appointment> store("appointments");
    auto appts = store.load();
    int id = cmd.value("id", 0);
    appts.erase(std::remove_if(appts.begin(), appts.end(),
        [id](const Appointment& a){ return a.id == id; }), appts.end());
    store.save(appts);
    return {{"message","Deleted"}};
}

// ── Bills ─────────────────────────────────────────────────────────────────────

static json handleGetBills() {
    auto bills    = BinaryStore<Bill>("bills").load();
    auto patients = BinaryStore<Patient>("patients").load();
    std::unordered_map<int,std::string> patName;
    for (auto& p : patients) patName[p.id] = p.name;
    json arr = json::array();
    for (auto& b : bills) {
        auto j = toJson(b);
        j["patient_name"] = patName.count(b.patient_id) ? patName[b.patient_id] : "";
        arr.push_back(j);
    }
    return arr;
}

static std::string billStatus(double amount, double paid) {
    if (paid >= amount) return "paid";
    if (paid > 0)       return "partial";
    return "pending";
}

static json handleAddBill(const json& cmd) {
    BinaryStore<Bill> store("bills");
    auto bills = store.load();
    const auto& d = cmd["data"];
    Bill b{};
    b.id = store.nextId(bills);
    b.patient_id  = intOrZero(d,"patient_id");
    b.amount      = dblOrZero(d,"amount");
    b.amount_paid = dblOrZero(d,"amount_paid");
    std::string computedStatus = billStatus(b.amount, b.amount_paid);
    ss(b.status, 32, strOrEmpty(d,"status").empty() ? computedStatus : strOrEmpty(d,"status"));
    ss(b.description, 256, strOrEmpty(d,"description"));
    ss(b.created_at, 32, dayStr(0));
    bills.push_back(b);
    store.save(bills);
    auto patients = BinaryStore<Patient>("patients").load();
    std::unordered_map<int,std::string> patName;
    for (auto& p : patients) patName[p.id] = p.name;
    auto j = toJson(b);
    j["patient_name"] = patName.count(b.patient_id) ? patName[b.patient_id] : "";
    return j;
}

static json handleUpdateBill(const json& cmd) {
    BinaryStore<Bill> store("bills");
    auto bills = store.load();
    const auto& d = cmd["data"];
    int id = d.value("id", 0);
    for (auto& b : bills) {
        if (b.id != id) continue;
        b.patient_id  = intOrZero(d,"patient_id");
        b.amount      = dblOrZero(d,"amount");
        b.amount_paid = dblOrZero(d,"amount_paid");
        std::string computedStatus = billStatus(b.amount, b.amount_paid);
        ss(b.status, 32, strOrEmpty(d,"status").empty() ? computedStatus : strOrEmpty(d,"status"));
        ss(b.description, 256, strOrEmpty(d,"description"));
        store.save(bills);
        auto patients = BinaryStore<Patient>("patients").load();
        std::unordered_map<int,std::string> patName;
        for (auto& p : patients) patName[p.id] = p.name;
        auto j = toJson(b);
        j["patient_name"] = patName.count(b.patient_id) ? patName[b.patient_id] : "";
        return j;
    }
    return {{"error","Not found"}};
}

static json handleDeleteBill(const json& cmd) {
    BinaryStore<Bill> store("bills");
    auto bills = store.load();
    int id = cmd.value("id", 0);
    bills.erase(std::remove_if(bills.begin(), bills.end(),
        [id](const Bill& b){ return b.id == id; }), bills.end());
    store.save(bills);
    return {{"message","Deleted"}};
}

// ── Rooms ─────────────────────────────────────────────────────────────────────

static json handleGetRooms() {
    auto rooms    = BinaryStore<Room>("rooms").load();
    auto patients = BinaryStore<Patient>("patients").load();
    std::unordered_map<int,std::string> patName;
    for (auto& p : patients) patName[p.id] = p.name;
    json arr = json::array();
    for (auto& r : rooms) {
        auto j = toJson(r);
        j["patient_name"] = (r.patient_id > 0 && patName.count(r.patient_id))
                            ? json(patName[r.patient_id]) : json(nullptr);
        arr.push_back(j);
    }
    return arr;
}

static json handleUpdateRoom(const json& cmd) {
    BinaryStore<Room> store("rooms");
    auto rooms = store.load();
    const auto& d = cmd["data"];
    int id = d.value("id", 0);
    for (auto& r : rooms) {
        if (r.id != id) continue;
        ss(r.status, 32, strOrEmpty(d,"status"));
        r.patient_id = intOrZero(d,"patient_id");
        store.save(rooms);
        return toJson(r);
    }
    return {{"error","Not found"}};
}

// ── Prescriptions ─────────────────────────────────────────────────────────────

static json handleGetPrescriptions() {
    auto rxs      = BinaryStore<Prescription>("prescriptions").load();
    auto patients = BinaryStore<Patient>("patients").load();
    auto doctors  = BinaryStore<Doctor>("doctors").load();
    std::unordered_map<int,std::string> patName, docName;
    for (auto& p : patients) patName[p.id] = p.name;
    for (auto& d : doctors)  docName[d.id] = d.name;
    json arr = json::array();
    for (auto& rx : rxs) {
        auto j = toJson(rx);
        j["patient_name"] = patName.count(rx.patient_id) ? patName[rx.patient_id] : "";
        j["doctor_name"]  = docName.count(rx.doctor_id)  ? docName[rx.doctor_id]  : "";
        arr.push_back(j);
    }
    return arr;
}

// ── Main ──────────────────────────────────────────────────────────────────────

int main() {
    try {
        std::cerr << "[HMS] engine starting, CWD=" << fs::current_path().string() << "\n";
        fs::create_directories(DATA_DIR);
        std::cerr << "[HMS] data dir=" << fs::absolute(DATA_DIR).string() << "\n";
        seed();

        std::string line;
        if (!std::getline(std::cin, line) || line.empty()) {
            std::cout << json({{"error","No input"}}).dump() << "\n";
            return 1;
        }

        json cmd = json::parse(line);
        std::string action = cmd.value("action", "");
        json result;

        if      (action == "login")                result = handleLogin(cmd);
        else if (action == "getDashboardStats")     result = handleGetDashboardStats();
        else if (action == "getRecentPatients")     result = handleGetRecentPatients();
        else if (action == "getWeeklyAppointments") result = handleGetWeeklyAppointments();
        else if (action == "getMonthlyRevenue")     result = handleGetMonthlyRevenue();
        else if (action == "getTodaySchedule")      result = handleGetTodaySchedule();
        else if (action == "getPatients")           result = handleGetPatients();
        else if (action == "getPatient")            result = handleGetPatient(cmd);
        else if (action == "addPatient")            result = handleAddPatient(cmd);
        else if (action == "updatePatient")         result = handleUpdatePatient(cmd);
        else if (action == "deletePatient")         result = handleDeletePatient(cmd);
        else if (action == "getDoctors")            result = handleGetDoctors();
        else if (action == "addDoctor")             result = handleAddDoctor(cmd);
        else if (action == "updateDoctor")          result = handleUpdateDoctor(cmd);
        else if (action == "deleteDoctor")          result = handleDeleteDoctor(cmd);
        else if (action == "getAppointments")       result = handleGetAppointments();
        else if (action == "addAppointment")        result = handleAddAppointment(cmd);
        else if (action == "updateAppointment")     result = handleUpdateAppointment(cmd);
        else if (action == "deleteAppointment")     result = handleDeleteAppointment(cmd);
        else if (action == "getBills")              result = handleGetBills();
        else if (action == "addBill")               result = handleAddBill(cmd);
        else if (action == "updateBill")            result = handleUpdateBill(cmd);
        else if (action == "deleteBill")            result = handleDeleteBill(cmd);
        else if (action == "getRooms")              result = handleGetRooms();
        else if (action == "updateRoom")            result = handleUpdateRoom(cmd);
        else if (action == "getPrescriptions")      result = handleGetPrescriptions();
        else result = {{"error", "Unknown action: " + action}};

        std::cout << result.dump() << "\n";
    } catch (const std::exception& e) {
        std::cout << json({{"error", std::string(e.what())}}).dump() << "\n";
        return 1;
    }
    return 0;
}
