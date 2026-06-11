#ifndef AUTHMANAGER_H
#define AUTHMANAGER_H

#include <string>
#include <fstream>
#include <vector>
using namespace std;

// ============================================================
// AuthManager
// Manages login, logout, and role-based access control.
// Reads/writes credentials from users.dat using the same
// binary file I/O pattern as FileManager.
//
// Two roles are supported:
//   - "Admin"  : full access to all modules
//   - "Doctor" : access to own appointments, prescriptions,
//                and assigned patients only
//   - "Nurse"  : access to ward patients and care notes only
//
// Author: Doan Minh Toan
// ============================================================

// Fixed-size struct for binary storage in users.dat
struct UserRecord {
    int  userId;
    char username[50];
    char passwordHash[64];  // simple hash stored as hex string
    char role[20];          // "Admin", "Doctor", or "Nurse"
    int  linkedPersonId;    // personId of the Doctor/Nurse in the system
                            // -1 for Admin (not linked to a Person)
};

class AuthManager
{
public:
    // --------------------------------------------------------
    // Constructor / Destructor
    // Initializes users.dat on first launch.
    // Loads all user records into memory on startup.
    // --------------------------------------------------------
    AuthManager();
    ~AuthManager();

    // --------------------------------------------------------
    // login
    // Validates username + password against users.dat.
    // Sets currentUser and isLoggedIn on success.
    // Returns true on success, false on failure.
    // --------------------------------------------------------
    bool login( const string& username, const string& password );

    // --------------------------------------------------------
    // logout
    // Clears the current session.
    // --------------------------------------------------------
    void logout();

    // --------------------------------------------------------
    // isAuthenticated
    // Returns true if a user is currently logged in.
    // --------------------------------------------------------
    bool isAuthenticated() const { return loggedIn; }

    // --------------------------------------------------------
    // getRole
    // Returns the role of the currently logged-in user.
    // Returns "" if no user is logged in.
    // --------------------------------------------------------
    string getRole() const;

    // --------------------------------------------------------
    // getLinkedPersonId
    // Returns the personId linked to the current session
    // (i.e. the Doctor or Nurse's own ID in the system).
    // Returns -1 for Admin or if not logged in.
    // --------------------------------------------------------
    int getLinkedPersonId() const;

    // --------------------------------------------------------
    // getCurrentUsername
    // Returns the username of the currently logged-in user.
    // --------------------------------------------------------
    string getCurrentUsername() const;

    // --------------------------------------------------------
    // hasPermission
    // Checks if the current role has permission for an action.
    // Actions: "manage_patients", "manage_staff",
    //          "view_all_appointments", "manage_billing",
    //          "view_reports", "manage_users"
    // --------------------------------------------------------
    bool hasPermission( const string& action ) const;

    // --------------------------------------------------------
    // registerUser (Admin only)
    // Creates a new user record and saves to users.dat.
    // Returns false if username already exists.
    // --------------------------------------------------------
    bool registerUser( const string& username,
                       const string& password,
                       const string& role,
                       int linkedPersonId = -1 );

    // --------------------------------------------------------
    // changePassword
    // Updates password for a given username.
    // Requires old password verification.
    // --------------------------------------------------------
    bool changePassword( const string& username,
                         const string& oldPassword,
                         const string& newPassword );

    // --------------------------------------------------------
    // printCurrentSession
    // Prints who is logged in and their role.
    // --------------------------------------------------------
    void printCurrentSession() const;

private:
    static const string USERS_FILE;  // "users.dat"

    // In-memory session (cleared on logout)
    bool   loggedIn;
    string sessionUsername;
    string sessionRole;
    int    sessionLinkedId;

    // All loaded user records (for fast lookup)
    vector<UserRecord> userRecords;

    // --------------------------------------------------------
    // hashPassword
    // Simple hash function — XOR + shift based.
    // NOT cryptographically secure, suitable for coursework.
    // Returns a hex string of fixed length.
    // --------------------------------------------------------
    string hashPassword( const string& password ) const;

    // --------------------------------------------------------
    // loadUsers / saveUsers
    // Load all UserRecords from users.dat into userRecords vector.
    // saveUser writes a single new record to end of file.
    // updateUserRecord overwrites an existing record in-place
    // using seekp() — same pattern as FileManager.
    // --------------------------------------------------------
    void loadUsers();
    void saveUser( const UserRecord& u );
    void updateUserRecord( const UserRecord& u, long offset );
    long findUserOffset( const string& username ) const;

    // --------------------------------------------------------
    // initializeFiles
    // Creates users.dat if it doesn't exist.
    // Also creates a default Admin account on first launch
    // so the system is always accessible.
    // --------------------------------------------------------
    void initializeFiles();
    bool fileExists( const string& filename ) const;
};

#endif
