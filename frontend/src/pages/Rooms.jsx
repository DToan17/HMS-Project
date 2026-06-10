import { useEffect, useState } from 'react';
import { BedDouble, Search, RefreshCw } from 'lucide-react';
import axios from 'axios';

const TYPE_COLORS = {
  General:   { bg: 'bg-blue-50',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700' },
  ICU:       { bg: 'bg-red-50',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700' },
  Surgery:   { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  Emergency: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
};

const STATUS_COLORS = {
  Available:   'bg-teal-100 text-teal-700',
  Occupied:    'bg-red-100 text-red-700',
  Maintenance: 'bg-yellow-100 text-yellow-700',
};

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => {
    setLoading(true);
    axios.get('/api/rooms', { params: { type: filterType || undefined, status: filterStatus || undefined } })
      .then(r => setRooms(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterType, filterStatus]);

  const filtered = rooms.filter(r => {
    if (!search) return true;
    return r.number.toLowerCase().includes(search.toLowerCase()) ||
           r.patient.toLowerCase().includes(search.toLowerCase());
  });

  const types = ['General', 'ICU', 'Surgery', 'Emergency'];
  const summary = types.map(t => ({
    type: t,
    total: rooms.filter(r => r.type === t).length,
    available: rooms.filter(r => r.type === t && r.status === 'Available').length,
  }));

  const handleStatusChange = async (room, newStatus) => {
    await axios.put(`/api/rooms/${room.id}`, { status: newStatus }).catch(() => {});
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Availability</h1>
          <p className="text-gray-500 text-sm mt-1">
            {rooms.filter(r => r.status === 'Available').length} of {rooms.length} rooms available
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map(s => {
          const c = TYPE_COLORS[s.type] ?? TYPE_COLORS.General;
          return (
            <div key={s.type} className={`${c.bg} rounded-3xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{s.type}</span>
                <BedDouble className={`w-5 h-5 ${c.text}`} />
              </div>
              <p className={`text-3xl font-bold ${c.text}`}>{s.available}</p>
              <p className={`text-xs mt-1 ${c.text} opacity-70`}>{s.available} / {s.total} available</p>
              <div className="mt-3 h-1.5 bg-white/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.text.replace('text-', 'bg-')}`}
                  style={{ width: `${s.total ? (s.available / s.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search room or patient..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
          <option value="">All Status</option>
          {['Available', 'Occupied', 'Maintenance'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Room grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">No rooms found</div>
          )}
          {filtered.map(room => {
            const c = TYPE_COLORS[room.type] ?? TYPE_COLORS.General;
            return (
              <div key={room.id}
                className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">{room.number}</span>
                  <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-semibold ${c.badge}`}>{room.type}</span>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${STATUS_COLORS[room.status]}`}>
                  {room.status}
                </span>
                {room.patient && (
                  <p className="text-xs text-gray-500 truncate">{room.patient}</p>
                )}
                {room.notes && (
                  <p className="text-xs text-orange-600 truncate mt-0.5">{room.notes}</p>
                )}
                {/* Quick status toggle */}
                {room.status !== 'Maintenance' && (
                  <button
                    onClick={() => handleStatusChange(room, room.status === 'Available' ? 'Occupied' : 'Available')}
                    className="mt-2 w-full text-[10px] font-semibold py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                    {room.status === 'Available' ? 'Mark Occupied' : 'Mark Available'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
