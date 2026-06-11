#include "AuthManager.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <iomanip>
#include <cstring>
#include <sys/stat.h>
using namespace std;

const string AuthManager::USERS_FILE = "users.dat";

// ============================================================
// Constructor
// Initializes users.dat on first launch, then loads all
// user records into memory for fast in-session lookup.
// ============================================================
AuthManager::AuthManager()
    : loggedIn(false), sessionLinkedId(-1)
{
    initializeFiles();
    loadUsers();
    cout << "AuthManager initialized. "
         << userRecords.size() << " user(s) loaded." << endl;
}

AuthManager::~AuthManager()
{
    if ( loggedIn ) logout();
}

// ============================================================
// initializeFiles
// Creates users.dat if it does not exist.
// On first launch, inserts a default Admin account so the
// system is immediately accessible without manual setup.
// Default credentials: username="admin", password="admin123"
// ============================================================
void AuthManager::initializeFiles()
{
    if ( fileExists(USERS_FILE) ) return;

    // Create empty file
    ofstream f( USERS_FILE, ios::binary | ios::out );
    f.close();
    cout << "Created: " << USERS_FILE << endl;

    // Insert default admin account
    registerUser("admin", "admin123", "Admin", -1);
    cout << "Default admin account created. "
         << "Username: admin | Password: admin123" << endl;
}

bool AuthManager::fileExists( const string& filename ) const
{
    struct stat buffer;
    return ( stat(filename.c_str(), &buffer) == 0 );
}

// ============================================================
// hashPassword
// Simple non-cryptographic hash for coursework use.
// Produces a consistent hex string from any password.
// ============================================================
string AuthManager::hashPassword( const string& password ) const
{
    unsigned long hash = 5381;
    for ( char c : password )
        hash = ((hash << 5) + hash) + (unsigned char)c;  // hash * 33 + c

    ostringstream oss;
    oss << hex << setw(16) << setfill('0') << hash;
    return oss.str();
}

// ============================================================
// loadUsers
// Reads all UserRecord structs from users.dat into the
// userRecords vector using sequential binary read.
// ============================================================
void AuthManager::loadUsers()
{
    userRecords.clear();
    ifstream f( USERS_FILE, ios::binary );
    if ( !f.is_open() ) return;

    UserRecord u;
    while ( f.read(reinterpret_cast<char*>(&u), sizeof(UserRecord)) )
        userRecords.push_back(u);

    f.close();
}

// ============================================================
// saveUser
// Appends a new UserRecord to the end of users.dat.
// Mirrors the pattern used in FileManager::savePatient().
// ============================================================
void AuthManager::saveUser( const UserRecord& u )
{
    fstream f( USERS_FILE, ios::in | ios::out | ios::binary );
    if ( !f.is_open() ) {
        ofstream nf( USERS_FILE, ios::binary ); nf.close();
        f.open( USERS_FILE, ios::in | ios::out | ios::binary );
    }
    f.seekp( 0, ios::end );
    f.write( reinterpret_cast<const char*>(&u), sizeof(UserRecord) );
    f.close();
}

// ============================================================
// updateUserRecord
// Overwrites an existing UserRecord at a known byte offset
// using seekp() — same O(1) in-place update as FileManager.
// ============================================================
void AuthManager::updateUserRecord( const UserRecord& u, long offset )
{
    fstream f( USERS_FILE, ios::in | ios::out | ios::binary );
    if ( !f.is_open() ) { cerr << "Cannot open " << USERS_FILE << endl; return; }
    f.seekp( offset );   // jump directly to the record
    f.write( reinterpret_cast<const char*>(&u), sizeof(UserRecord) );
    f.close();
}

// ============================================================
// findUserOffset
// Scans users.dat to find the byte offset of a username.
// Returns -1 if username not found.
// ============================================================
long AuthManager::findUserOffset( const string& username ) const
{
    ifstream f( USERS_FILE, ios::binary );
    if ( !f.is_open() ) return -1;

    UserRecord u;
    long offset = 0;
    while ( f.read(reinterpret_cast<char*>(&u), sizeof(UserRecord)) )
    {
        if ( string(u.username) == username ) {
            f.close();
            return offset;
        }
        offset += sizeof(UserRecord);
    }
    f.close();
    return -1;
}

// ============================================================
// login
// 1. Search userRecords for matching username
// 2. Compare hashed password
// 3. Set session variables on success
// ============================================================
bool AuthManager::login( const string& username, const string& password )
{
    if ( loggedIn ) {
        cerr << "Already logged in as " << sessionUsername
             << ". Please logout first." << endl;
        return false;
    }

    string hashed = hashPassword(password);

    for ( const UserRecord& u : userRecords )
    {
        if ( string(u.username) == username )
        {
            if ( string(u.passwordHash) == hashed )
            {
                // Credentials match — start session
                loggedIn          = true;
                sessionUsername   = username;
                sessionRole       = string(u.role);
                sessionLinkedId   = u.linkedPersonId;
                cout << "Login successful. Welcome, "
                     << username << " (" << sessionRole << ")." << endl;
                return true;
            }
            else
            {
                cerr << "Login failed: incorrect password." << endl;
                return false;
            }
        }
    }

    cerr << "Login failed: username \"" << username << "\" not found." << endl;
    return false;
}

// ============================================================
// logout
// Clears all session variables.
// ============================================================
void AuthManager::logout()
{
    if ( !loggedIn ) {
        cout << "No active session to log out from." << endl;
        return;
    }
    cout << "Goodbye, " << sessionUsername << "." << endl;
    loggedIn        = false;
    sessionUsername = "";
    sessionRole     = "";
    sessionLinkedId = -1;
}

// ============================================================
// getRole / getLinkedPersonId / getCurrentUsername
// Session accessors — return empty/default if not logged in.
// ============================================================
string AuthManager::getRole() const
{
    return loggedIn ? sessionRole : "";
}

int AuthManager::getLinkedPersonId() const
{
    return loggedIn ? sessionLinkedId : -1;
}

string AuthManager::getCurrentUsername() const
{
    return loggedIn ? sessionUsername : "";
}

// ============================================================
// hasPermission
// Checks role-based permissions for a requested action.
// Admin has full access.
// Doctor has limited access to clinical actions.
// Nurse has the most restricted access.
// ============================================================
bool AuthManager::hasPermission( const string& action ) const
{
    if ( !loggedIn ) {
        cerr << "Access denied: not logged in." << endl;
        return false;
    }

    // Admin has unrestricted access to everything
    if ( sessionRole == "Admin" ) return true;

    // Doctor permissions
    if ( sessionRole == "Doctor" ) {
        if ( action == "view_own_appointments" ) return true;
        if ( action == "manage_prescriptions"  ) return true;
        if ( action == "view_assigned_patients") return true;
        if ( action == "view_reports"          ) return true;
        cerr << "Access denied: Doctors cannot perform \""
             << action << "\"." << endl;
        return false;
    }

    // Nurse permissions
    if ( sessionRole == "Nurse" ) {
        if ( action == "view_ward_patients"  ) return true;
        if ( action == "update_patient_notes") return true;
        cerr << "Access denied: Nurses cannot perform \""
             << action << "\"." << endl;
        return false;
    }

    cerr << "Access denied: unknown role \"" << sessionRole << "\"." << endl;
    return false;
}

// ============================================================
// registerUser
// Creates a new user account and saves it to users.dat.
// Checks for duplicate usernames before creating.
// Passwords are hashed before storage.
// ============================================================
bool AuthManager::registerUser( const string& username,
                                 const string& password,
                                 const string& role,
                                 int linkedPersonId )
{
    // Check for duplicate username
    for ( const UserRecord& u : userRecords )
        if ( string(u.username) == username ) {
            cerr << "Error: Username \"" << username
                 << "\" already exists." << endl;
            return false;
        }

    // Validate role
    if ( role != "Admin" && role != "Doctor" && role != "Nurse" ) {
        cerr << "Error: Role must be Admin, Doctor, or Nurse." << endl;
        return false;
    }

    // Build record
    UserRecord u;
    u.userId        = (int)userRecords.size() + 1;
    u.linkedPersonId= linkedPersonId;
    strncpy(u.username,     username.c_str(),              49); u.username[49]     = '\0';
    strncpy(u.passwordHash, hashPassword(password).c_str(),63); u.passwordHash[63] = '\0';
    strncpy(u.role,         role.c_str(),                  19); u.role[19]         = '\0';

    saveUser(u);
    userRecords.push_back(u);   // keep in-memory list up to date

    cout << "User \"" << username << "\" registered with role: " << role << endl;
    return true;
}

// ============================================================
// changePassword
// Verifies the old password, then overwrites the hash
// in-place using seekp() at the known file offset.
// ============================================================
bool AuthManager::changePassword( const string& username,
                                   const string& oldPassword,
                                   const string& newPassword )
{
    string oldHash = hashPassword(oldPassword);
    string newHash = hashPassword(newPassword);

    long offset = 0;
    for ( UserRecord& u : userRecords )
    {
        if ( string(u.username) == username )
        {
            if ( string(u.passwordHash) != oldHash ) {
                cerr << "Error: Old password is incorrect." << endl;
                return false;
            }
            // Update in-memory record
            strncpy(u.passwordHash, newHash.c_str(), 63);
            u.passwordHash[63] = '\0';

            // Write updated record to disk at known offset
            updateUserRecord(u, offset);
            cout << "Password changed successfully for \""
                 << username << "\"." << endl;
            return true;
        }
        offset += sizeof(UserRecord);
    }

    cerr << "Error: Username \"" << username << "\" not found." << endl;
    return false;
}

// ============================================================
// printCurrentSession
// Displays session info — useful for debugging and the console
// main menu to show who is currently logged in.
// ============================================================
void AuthManager::printCurrentSession() const
{
    if ( !loggedIn ) {
        cout << "No active session." << endl;
        return;
    }
    cout << "=== Current Session ===" << endl;
    cout << "Username:  " << sessionUsername  << endl;
    cout << "Role:      " << sessionRole      << endl;
    cout << "Person ID: " << sessionLinkedId  << endl;
    cout << "=======================" << endl;
}
