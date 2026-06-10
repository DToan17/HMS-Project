import { useEffect, useState } from 'react';
import { Plus, Search, Star, Users, Phone, Mail, X, Pencil } from 'lucide-react';
import { doctorsAPI } from '../api/client';

const DEPARTMENTS = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General Medicine', 'Dermatology'];
const STATUS_COLORS = {
  Available: 'bg-teal-100 text-teal-700',
  Busy: 'bg-yellow-100 text-yellow-700',
  'On Leave': 'bg-gray-100 text-gray-600',
};
const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700', 'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700', 'bg-teal-100 text-teal-700',
];

const empty = { name: '', specialty: '', department: 'General Medicine', experience: '', phone: '', email: '', status: 'Available', avatar: '' };

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);

  const load = () => {
    setLoading(true);
    doctorsAPI.list({ department: filterDept, status: filterStatus })
      .then(r => setDoctors(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterDept, filterStatus]);

  const filtered = doctors.filter(d => {
    if (!search) return true;
    const s = search.toLowerCase();
    return d.name.toLowerCase().includes(s) || d.specialty.toLowerCase().includes(s);
  });

  const openAdd = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = (d) => { setForm({ ...d }); setEditing(d.id); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, avatar: form.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0,2) };
    try {
      if (editing) await doctorsAPI.update(editing, payload);
      else await doctorsAPI.create(payload);
      setShowModal(false);
      load();
    } catch { alert('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-500 text-sm mt-1">Medical staff directory</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 sidebar-gradient text-white px-4 py-2.5 rounded-2xl text-sm font-semibold hover:opacity-90 shadow-lg shadow-teal-500/25">
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
          <option value="">All Status</option>
          {['Available','Busy','On Leave'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">No doctors found</div>
          )}
          {filtered.map((doc, i) => (
            <div key={doc.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <button onClick={() => setViewDoc(doc)} className="flex items-center gap-4 text-left hover:opacity-80 transition-opacity">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {doc.avatar || doc.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{doc.name}</h3>
                    <p className="text-sm text-gray-500">{doc.specialty}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.department}</p>
                  </div>
                </button>
                <button onClick={() => openEdit(doc)} className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors flex-shrink-0">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[doc.status]}`}>
                  {doc.status}
                </span>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-bold text-gray-700">{doc.rating}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-xs text-gray-500">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{doc.patients} patients • {doc.experience}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-500">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{doc.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-500">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{doc.email}</span>
                </div>
              </div>

              <button onClick={() => setViewDoc(doc)}
                className="w-full mt-4 py-2.5 rounded-2xl border-2 border-teal-200 text-teal-700 text-sm font-semibold hover:bg-teal-50 transition-colors">
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit Doctor' : 'Add New Doctor'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', full: true },
                { label: 'Specialty', key: 'specialty', type: 'text' },
                { label: 'Experience', key: 'experience', type: 'text', placeholder: 'e.g. 10 years' },
                { label: 'Phone', key: 'phone', type: 'tel' },
                { label: 'Email', key: 'email', type: 'email', full: true },
              ].map(({ label, key, type, full, placeholder }) => (
                <div key={key} className={full ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input type={type} value={form[key] ?? ''} placeholder={placeholder}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                </div>
              ))}
              {[
                { label: 'Department', key: 'department', opts: DEPARTMENTS },
                { label: 'Status', key: 'status', opts: ['Available','Busy','On Leave'] },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <select value={form[key] ?? ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-2xl sidebar-gradient text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-teal-500/25 disabled:opacity-70">
                {saving ? 'Saving...' : (editing ? 'Update Doctor' : 'Add Doctor')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {viewDoc && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Doctor Profile</h2>
              <button onClick={() => setViewDoc(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-5 mb-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl border border-teal-100">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 ${AVATAR_COLORS[doctors.indexOf(viewDoc) % AVATAR_COLORS.length]}`}>
                  {viewDoc.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{viewDoc.name}</h3>
                  <p className="text-sm text-gray-600">{viewDoc.specialty}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[viewDoc.status]}`}>
                      {viewDoc.status}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                      <Star className="w-3 h-3 fill-current" /> {viewDoc.rating}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Department', val: viewDoc.department },
                  { label: 'Experience', val: viewDoc.experience },
                  { label: 'Total Patients', val: viewDoc.patients },
                  { label: 'Phone', val: viewDoc.phone },
                  { label: 'Email', val: viewDoc.email, full: true },
                ].map(({ label, val, full }) => (
                  <div key={label} className={`p-3 bg-gray-50 rounded-xl ${full ? 'col-span-2' : ''}`}>
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-900">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
