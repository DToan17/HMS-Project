import { useEffect, useState } from 'react';
import { Plus, X, Calendar, Clock, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { appointmentsAPI, doctorsAPI, patientsAPI } from '../api/client';

const STATUSES = ['Confirmed', 'Pending', 'Cancelled'];
const TYPES = ['Consultation', 'Follow-up', 'Check-up', 'Emergency', 'Treatment', 'Surgery Consult'];
const STATUS_COLORS = {
  Confirmed: 'bg-teal-100 text-teal-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const empty = {
  patientName: '', patientId: '', doctorId: '', doctorName: '',
  department: 'General Medicine', date: '', time: '09:00',
  type: 'Consultation', status: 'Pending', notes: '',
};

function pad(n) { return String(n).padStart(2, '0'); }
function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function firstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('calendar'); // 'calendar' | 'list'
  const [today] = useState(new Date());
  const [cal, setCal] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    appointmentsAPI.list()
      .then(r => setAppointments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    doctorsAPI.list().then(r => setDoctors(r.data)).catch(() => {});
    patientsAPI.list().then(r => setPatients(r.data)).catch(() => {});
  }, []);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const prevMonth = () => setCal(c => c.month === 0 ? { year: c.year-1, month: 11 } : { ...c, month: c.month-1 });
  const nextMonth = () => setCal(c => c.month === 11 ? { year: c.year+1, month: 0 } : { ...c, month: c.month+1 });

  const apptsByDate = appointments.reduce((acc, a) => {
    if (!acc[a.date]) acc[a.date] = [];
    acc[a.date].push(a);
    return acc;
  }, {});

  const selectedAppts = apptsByDate[selectedDate] ?? [];
  const filteredList = appointments.filter(a => {
    if (search) {
      const s = search.toLowerCase();
      return a.patientName.toLowerCase().includes(s) || a.doctorName.toLowerCase().includes(s);
    }
    return true;
  });

  const openAdd = () => {
    setForm({ ...empty, date: selectedDate });
    setEditing(null);
    setShowModal(true);
  };
  const openEdit = (a) => {
    setForm({ ...a });
    setEditing(a.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await appointmentsAPI.update(editing, form);
      else await appointmentsAPI.create(form);
      setShowModal(false);
      load();
    } catch { alert('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    await appointmentsAPI.delete(id).catch(() => {});
    load();
  };

  const handleDoctorChange = (e) => {
    const doc = doctors.find(d => d.id === e.target.value);
    setForm(f => ({ ...f, doctorId: e.target.value, doctorName: doc?.name ?? '', department: doc?.department ?? f.department }));
  };
  const handlePatientChange = (e) => {
    const p = patients.find(p => p.id === e.target.value);
    setForm(f => ({ ...f, patientId: e.target.value, patientName: p?.name ?? '' }));
  };

  const days = daysInMonth(cal.year, cal.month);
  const firstDay = firstDayOfMonth(cal.year, cal.month);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and schedule patient appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-2xl p-1">
            {['calendar','list'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${view === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 sidebar-gradient text-white px-4 py-2.5 rounded-2xl text-sm font-semibold hover:opacity-90 shadow-lg shadow-teal-500/25">
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">
                {monthNames[cal.month]} {cal.year}
              </h3>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {dayNames.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: days }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${cal.year}-${pad(cal.month+1)}-${pad(day)}`;
                const isToday = dateStr === today.toISOString().split('T')[0];
                const isSelected = dateStr === selectedDate;
                const hasAppts = apptsByDate[dateStr]?.length > 0;

                return (
                  <button key={day} onClick={() => setSelectedDate(dateStr)}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                        : isToday
                        ? 'bg-teal-50 text-teal-700 border-2 border-teal-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}>
                    {day}
                    {hasAppts && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-teal-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day appointments */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900">
                  {new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <p className="text-sm text-gray-500">{selectedAppts.length} appointment{selectedAppts.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={openAdd}
                className="p-2 rounded-xl sidebar-gradient text-white hover:opacity-90 transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {selectedAppts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Calendar className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">No appointments</p>
                <p className="text-xs mt-1">Click + to book one</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[500px]">
                {selectedAppts.map(a => (
                  <div key={a.id} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-teal-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{a.time}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[a.status]}`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{a.patientName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.doctorName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.type} • {a.department}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openEdit(a)}
                        className="flex-1 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-white transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(a.id)}
                        className="flex-1 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-4 shadow-sm flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search appointments..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
            </div>
          </div>

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
                      {['Patient', 'Doctor', 'Department', 'Date', 'Time', 'Type', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left font-semibold text-gray-500 px-6 py-4 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredList.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-12 text-gray-400">No appointments found</td></tr>
                    )}
                    {filteredList.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">{a.patientName}</td>
                        <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{a.doctorName}</td>
                        <td className="px-6 py-4 text-gray-700">{a.department}</td>
                        <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{a.date}</td>
                        <td className="px-6 py-4 text-gray-700">{a.time}</td>
                        <td className="px-6 py-4 text-gray-700">{a.type}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[a.status]}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(a)}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(a.id)}
                              className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors">
                              Cancel
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
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit Appointment' : 'Book Appointment'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Patient</label>
                <select value={form.patientId} onChange={handlePatientChange}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Doctor</label>
                <select value={form.doctorId} onChange={handleDoctorChange}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
                  <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-2xl sidebar-gradient text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-teal-500/25 disabled:opacity-70">
                {saving ? 'Saving...' : (editing ? 'Update' : 'Book Appointment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
