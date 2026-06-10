import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Plus, X } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import axios from 'axios';

const SOURCES = ['Consultation', 'Surgery', 'Medicine', 'Lab Tests', 'Radiology', 'Other'];
const SOURCE_COLORS = {
  Consultation: '#14b8a6', Surgery: '#3b82f6', Medicine: '#8b5cf6',
  'Lab Tests':  '#f59e0b', Radiology:  '#ec4899', Other: '#6b7280',
};

const tooltipStyle = {
  backgroundColor: 'white', border: 'none', borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px',
};

export default function Revenue() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]     = useState({ date: '', amount: '', source: 'Consultation', patient: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    axios.get('/api/revenue')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.amount || !form.date) return;
    setSaving(true);
    await axios.post('/api/revenue', { ...form, amount: Number(form.amount) }).catch(() => {});
    setShowModal(false);
    setForm({ date: '', amount: '', source: 'Consultation', patient: '', notes: '' });
    load();
    setSaving(false);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? 'Loading...' : `$${data?.totalRevenue?.toLocaleString() ?? 0} total (last 30 days)`}
          </p>
        </div>
        <button onClick={() => { setForm(f => ({ ...f, date: today })); setShowModal(true); }}
          className="flex items-center gap-2 sidebar-gradient text-white px-4 py-2.5 rounded-2xl text-sm font-semibold hover:opacity-90 shadow-lg shadow-teal-500/25">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-3xl animate-pulse shadow-sm" />
          ))
        ) : (
          (data?.summary ?? []).map(s => (
            <div key={s.source} className="bg-white rounded-3xl p-4 shadow-sm">
              <div className="w-8 h-8 rounded-xl mb-3 flex items-center justify-center"
                style={{ backgroundColor: SOURCE_COLORS[s.source] + '20' }}>
                <DollarSign className="w-4 h-4" style={{ color: SOURCE_COLORS[s.source] }} />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">{s.source}</p>
              <p className="text-xl font-bold text-gray-900">${Math.round(s.total).toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.count} entries</p>
            </div>
          ))
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-1">Daily Revenue (Last 30 Days)</h3>
          <p className="text-sm text-gray-500 mb-5">Revenue trend over time</p>
          {loading ? (
            <div className="h-48 bg-gray-50 rounded-2xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.daily ?? []}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }}
                  tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle}
                  formatter={v => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#14b8a6"
                  strokeWidth={2.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-1">By Source</h3>
          <p className="text-sm text-gray-500 mb-5">Revenue breakdown</p>
          {loading ? (
            <div className="h-48 bg-gray-50 rounded-2xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.summary ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="source" width={72} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle}
                  formatter={v => [`$${Number(v).toLocaleString()}`, 'Total']} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {(data?.summary ?? []).map(s => (
                    <Cell key={s.source} fill={SOURCE_COLORS[s.source] ?? '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent entries table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Recent Entries</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date', 'Source', 'Amount', 'Patient', 'Notes'].map(h => (
                    <th key={h} className="text-left font-semibold text-gray-500 px-6 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(data?.rows ?? []).slice(0, 20).map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-700 whitespace-nowrap">{r.date}</td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: SOURCE_COLORS[r.source] ?? '#6b7280' }}>
                        {r.source}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-900">${r.amount.toLocaleString()}</td>
                    <td className="px-6 py-3 text-gray-500">{r.patient || '—'}</td>
                    <td className="px-6 py-3 text-gray-500">{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Add Revenue Entry</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount ($)</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Source</label>
                <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Patient (optional)</label>
                <input type="text" value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))}
                  placeholder="Patient name"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={saving || !form.amount || !form.date}
                className="flex-1 py-3 rounded-2xl sidebar-gradient text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-teal-500/25 disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
