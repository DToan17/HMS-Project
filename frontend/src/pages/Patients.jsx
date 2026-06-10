import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, User, Phone, Mail, MapPin, Droplet, Calendar } from 'lucide-react';
import { patientsAPI, doctorsAPI } from '../api/client';

const DEPARTMENTS = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General Medicine', 'Dermatology'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUSES = ['Active', 'Inactive', 'Critical'];

const STATUS_COLORS = {
  Active: 'bg-teal-100 text-teal-700',
  Inactive: 'bg-gray-100 text-gray-600',
  Critical: 'bg-red-100 text-red-700',
};

const empty = {
  name: '', age: '', gender: 'Male', bloodGroup: 'A+', phone: '', email: '',
  address: '', department: 'General Medicine', doctor: '', diagnosis: '',
  status: 'Active', allergies: '',
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewPatient, setViewPatient] = useState(null);

  const load = () => {
    setLoading(true);
    patientsAPI.list({ search, status: filterStatus, department: filterDept })
      .then(r => setPatients(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterStatus, filterDept]);
  useEffect(() => {
    doctorsAPI.list().then(r => setDoctors(r.data)).catch(() => {});
  }, []);

  const openAdd = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = (p) => {
    setForm({ ...p, allergies: (p.allergies ?? []).join(', ') });
    setEditing(p.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      age: Number(form.age),
      allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()) : [],
    };
    try {
      if (editing) await patientsAPI.update(editing, payload);
      else await patientsAPI.create(payload);
      setShowModal(false);
      load();
    } catch {
      alert('Failed to save patient');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await patientsAPI.delete(deleteId).catch(() => {});
    setDeleteId(null);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all patient records</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 sidebar-gradient text-white px-4 py-2.5 rounded-2xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-teal-500/25">
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Patient', 'ID', 'Age / Gender', 'Blood', 'Department', 'Doctor', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left font-semibold text-gray-500 px-6 py-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {patients.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No patients found</td></tr>
                )}
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => setViewPatient(p)} className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity">
                        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs flex-shrink-0">
                          {p.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-36">{p.diagnosis}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.patientId}</td>
                    <td className="px-6 py-4 text-gray-700">{p.age}y / {p.gender}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-semibold">{p.bloodGroup}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{p.department}</td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{p.doctor}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit Patient' : 'Add New Patient'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', full: true },
                { label: 'Age', key: 'age', type: 'number' },
                { label: 'Phone', key: 'phone', type: 'tel' },
                { label: 'Email', key: 'email', type: 'email', full: true },
                { label: 'Address', key: 'address', type: 'text', full: true },
                { label: 'Diagnosis', key: 'diagnosis', type: 'text', full: true },
                { label: 'Allergies (comma-separated)', key: 'allergies', type: 'text', full: true },
              ].map(({ label, key, type, full }) => (
                <div key={key} className={full ? 'sm:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input type={type} value={form[key] ?? ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                </div>
              ))}
              {[
                { label: 'Gender', key: 'gender', opts: ['Male', 'Female', 'Other'] },
                { label: 'Blood Group', key: 'bloodGroup', opts: BLOOD_GROUPS },
                { label: 'Department', key: 'department', opts: DEPARTMENTS },
                { label: 'Status', key: 'status', opts: STATUSES },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <select value={form[key] ?? ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assigned Doctor</label>
                <select value={form.doctor ?? ''} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-2xl sidebar-gradient text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-teal-500/25 disabled:opacity-70">
                {saving ? 'Saving...' : (editing ? 'Update Patient' : 'Add Patient')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Patient?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleDelete}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {viewPatient && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Patient Profile</h2>
              <button onClick={() => setViewPatient(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl flex-shrink-0">
                  {viewPatient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{viewPatient.name}</h3>
                      <p className="text-sm text-gray-500">{viewPatient.patientId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[viewPatient.status]}`}>
                      {viewPatient.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Calendar, label: 'Age', val: `${viewPatient.age} Years`, bg: 'bg-blue-50', ic: 'text-blue-600' },
                  { icon: User, label: 'Gender', val: viewPatient.gender, bg: 'bg-pink-50', ic: 'text-pink-600' },
                  { icon: Droplet, label: 'Blood Group', val: viewPatient.bloodGroup, bg: 'bg-red-50', ic: 'text-red-600' },
                  { icon: Phone, label: 'Contact', val: viewPatient.phone, bg: 'bg-green-50', ic: 'text-green-600' },
                ].map(({ icon: Icon, label, val, bg, ic }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${ic}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-semibold text-gray-900">{val}</p>
                    </div>
                  </div>
                ))}
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-semibold text-gray-900">{viewPatient.address}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs text-gray-500 mb-1">Diagnosis</p>
                <p className="text-sm font-semibold text-gray-900">{viewPatient.diagnosis}</p>
              </div>
              {viewPatient.allergies?.length > 0 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                  <p className="text-xs font-semibold text-orange-700 mb-2">⚠️ Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {viewPatient.allergies.map(a => (
                      <span key={a} className="px-2.5 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
