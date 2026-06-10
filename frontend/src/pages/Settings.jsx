import { useState } from 'react';
import { Bell, Lock, User, Building2, Palette, Shield, CheckCircle } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'hospital', label: 'Hospital', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-teal-500' : 'bg-gray-300'}`}>
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function InputField({ label, value, onChange, type = 'text', disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange?.(e.target.value)} disabled={disabled}
        className={`w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`} />
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'Sarah', lastName: 'Wilson', email: 'swilson@medicare.com',
    phone: '+1 555 000 0001', role: 'Administrator', department: 'Administration',
  });
  const [hospital, setHospital] = useState({
    name: 'MediCare General Hospital', address: '1 Hospital Drive, Springfield, IL',
    phone: '+1 555 000 0100', email: 'info@medicare.com', timezone: 'America/Chicago', beds: '450',
  });
  const [notifs, setNotifs] = useState({
    newAppointment: true, appointmentReminder: true, patientAdmission: false,
    criticalAlert: true, dailyReport: false, emailNotifs: true,
  });
  const [colors, setColors] = useState({ primary: '#0d9488', accent: '#3b82f6' });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and system preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab sidebar */}
        <nav className="bg-white rounded-3xl p-3 shadow-sm lg:w-56 flex lg:flex-col flex-row overflow-x-auto flex-shrink-0 h-fit gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === id ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {tab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>

              {/* Avatar */}
              <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-2xl">
                <div className="w-20 h-20 rounded-2xl bg-teal-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {profile.firstName[0]}{profile.lastName[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{profile.firstName} {profile.lastName}</p>
                  <p className="text-sm text-gray-500">{profile.role} • {profile.department}</p>
                  <button className="mt-2 text-sm text-teal-600 font-semibold hover:underline">Change Avatar</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="First Name" value={profile.firstName} onChange={v => setProfile(p => ({ ...p, firstName: v }))} />
                <InputField label="Last Name" value={profile.lastName} onChange={v => setProfile(p => ({ ...p, lastName: v }))} />
                <InputField label="Email Address" value={profile.email} onChange={v => setProfile(p => ({ ...p, email: v }))} type="email" />
                <InputField label="Phone Number" value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} type="tel" />
                <InputField label="Role" value={profile.role} disabled />
                <InputField label="Department" value={profile.department} onChange={v => setProfile(p => ({ ...p, department: v }))} />
              </div>
            </div>
          )}

          {tab === 'hospital' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Hospital Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Hospital Name" value={hospital.name} onChange={v => setHospital(h => ({ ...h, name: v }))} />
                <InputField label="Contact Phone" value={hospital.phone} onChange={v => setHospital(h => ({ ...h, phone: v }))} type="tel" />
                <InputField label="Email" value={hospital.email} onChange={v => setHospital(h => ({ ...h, email: v }))} type="email" />
                <InputField label="Total Beds" value={hospital.beds} onChange={v => setHospital(h => ({ ...h, beds: v }))} type="number" />
                <div className="sm:col-span-2">
                  <InputField label="Address" value={hospital.address} onChange={v => setHospital(h => ({ ...h, address: v }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
                  <select value={hospital.timezone} onChange={e => setHospital(h => ({ ...h, timezone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                    {['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Europe/London'].map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: 'newAppointment', label: 'New Appointment', desc: 'Notify when a new appointment is booked' },
                  { key: 'appointmentReminder', label: 'Appointment Reminders', desc: '1 hour before each appointment' },
                  { key: 'patientAdmission', label: 'Patient Admissions', desc: 'Notify on new patient admissions' },
                  { key: 'criticalAlert', label: 'Critical Alerts', desc: 'Urgent patient status changes' },
                  { key: 'dailyReport', label: 'Daily Summary Report', desc: 'End-of-day activity report' },
                  { key: 'emailNotifs', label: 'Email Notifications', desc: 'Send notifications to email' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                    <Toggle checked={notifs[key]} onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Security Settings</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <InputField label="Current Password" value="" type="password" onChange={() => {}} />
                  <InputField label="New Password" value="" type="password" onChange={() => {}} />
                  <InputField label="Confirm New Password" value="" type="password" onChange={() => {}} />
                </div>
                <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Password Requirements</p>
                      <ul className="mt-1 space-y-1 text-xs text-blue-700 list-disc list-inside">
                        <li>At least 8 characters long</li>
                        <li>At least one uppercase letter</li>
                        <li>At least one number</li>
                        <li>At least one special character</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Enable 2FA</p>
                      <p className="text-xs text-gray-500 mt-0.5">Add extra security to your account</p>
                    </div>
                    <Toggle checked={false} onChange={() => {}} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'appearance' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Theme Mode</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['Light', 'Dark', 'System'].map(mode => (
                      <button key={mode}
                        className={`py-3 rounded-2xl border-2 text-sm font-semibold transition-all ${
                          mode === 'Light' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Primary Color</p>
                  <div className="flex flex-wrap gap-3">
                    {['#0d9488','#6366f1','#f43f5e','#f59e0b','#10b981','#3b82f6'].map(color => (
                      <button key={color}
                        onClick={() => setColors(c => ({ ...c, primary: color }))}
                        style={{ backgroundColor: color }}
                        className={`w-10 h-10 rounded-xl transition-transform hover:scale-110 ${colors.primary === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Font Size</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['Small','Medium','Large'].map(size => (
                      <button key={size}
                        className={`py-3 rounded-2xl border-2 text-sm font-semibold transition-all ${
                          size === 'Medium' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="flex items-center gap-2 text-sm text-teal-600 font-semibold">
                <CheckCircle className="w-4 h-4" /> Settings saved!
              </span>
            )}
            <button onClick={handleSave}
              className="px-6 py-3 rounded-2xl sidebar-gradient text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-teal-500/25 transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
