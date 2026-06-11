import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, Calendar, Building2, DollarSign, TrendingUp, Activity, ArrowUpRight, Clock,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

const STATUS_COLORS = {
  Active:   'bg-teal-100 text-teal-700',
  Inactive: 'bg-gray-100 text-gray-600',
  Critical: 'bg-red-100 text-red-700',
};

const APPT_STATUS_COLORS = {
  Confirmed: 'bg-teal-100 text-teal-700',
  Pending:   'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
};

function StatCard({ title, value, change, trend, icon: Icon, iconBg, iconColor, to, loading }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer text-left w-full group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
            {title}
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </p>
          {loading ? (
            <div className="h-9 w-24 bg-gray-100 rounded-xl animate-pulse mb-2" />
          ) : (
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
          )}
          <div className="flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
            {trend === 'neutral' && <Activity className="w-4 h-4 text-gray-500" />}
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-gray-600'}`}>
              {change}
            </span>
          </div>
        </div>
        <div className={`${iconBg} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </button>
  );
}

const tooltipStyle = {
  backgroundColor: 'white', border: 'none', borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px',
};

function ChartSkeleton() {
  return <div className="h-48 bg-gray-50 rounded-2xl animate-pulse" />;
}

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios.get('/api/dashboard/stats')
      .then(r => { if (!cancelled) { setStats(r.data); setError(false); } })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const statCards = [
    {
      title: 'Total Patients', to: '/patients',
      value: loading ? '—' : (stats?.totalPatients?.toLocaleString() ?? '—'),
      change: '+12.5% this month', trend: 'up',
      icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-blue-500',
    },
    {
      title: 'Today Appointments', to: '/appointments',
      value: loading ? '—' : (stats?.todayAppointments ?? '—'),
      change: '+8.2% vs yesterday', trend: 'up',
      icon: Calendar, iconBg: 'bg-teal-50', iconColor: 'text-teal-500',
    },
    {
      title: 'Room Availability', to: '/rooms',
      value: loading ? '—' : `${stats?.roomAvailability?.available ?? 0}/${stats?.roomAvailability?.total ?? 0}`,
      change: `${stats?.roomAvailability ? Math.round((1 - stats.roomAvailability.available / stats.roomAvailability.total) * 100) : 73}% occupied`,
      trend: 'neutral',
      icon: Building2, iconBg: 'bg-purple-50', iconColor: 'text-purple-500',
    },
    {
      title: 'Revenue Today', to: '/revenue',
      value: loading ? '—' : `$${(stats?.revenueToday ?? 0).toLocaleString()}`,
      change: '+15.3% vs yesterday', trend: 'up',
      icon: DollarSign, iconBg: 'bg-green-50', iconColor: 'text-green-500',
    },
  ];

  const topRevMonth = stats?.monthlyRevenue?.slice(-1)[0]?.revenue;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back! Here's what's happening with your hospital today.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm font-medium">
          ⚠️ Could not reach the API. Make sure the backend is running on port 3001.
        </div>
      )}

      {/* Stat Cards — clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map(card => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Weekly Appointments</h3>
              <p className="text-sm text-gray-500">Last 7 days overview</p>
            </div>
            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
              <ArrowUpRight className="w-3 h-3" /> +8.2%
            </span>
          </div>
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats?.weeklyAppointments ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="appointments" stroke="#14b8a6" strokeWidth={3}
                  dot={{ fill: '#14b8a6', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Monthly Revenue</h3>
              <p className="text-sm text-gray-500">Last 6 months trend</p>
            </div>
            <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
              <Activity className="w-3 h-3" />
              {topRevMonth ? `$${Math.round(topRevMonth / 1000)}K` : '—'}
            </span>
          </div>
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats?.monthlyRevenue ?? []}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle}
                  formatter={v => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6"
                  strokeWidth={3} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Patients */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Recent Patients</h3>
          <Link to="/patients" className="text-sm text-teal-600 font-semibold hover:underline">
            View All →
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Patient', 'ID', 'Department', 'Doctor', 'Last Visit', 'Status'].map(h => (
                    <th key={h} className="text-left font-semibold text-gray-500 pb-3 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(stats?.recentPatients ?? []).map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs flex-shrink-0">
                          {p.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.age}y • {p.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 font-mono text-xs whitespace-nowrap">
                      {p.patientId ?? p.patient_id}
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{p.department}</td>
                    <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">{p.doctor}</td>
                    <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                      {p.lastVisit ?? p.last_visit}
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Today's Schedule</h3>
          <Link to="/appointments" className="text-sm text-teal-600 font-semibold hover:underline">
            Full Calendar →
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(stats?.todaySchedule ?? []).length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No appointments scheduled for today</p>
            ) : (
              (stats.todaySchedule).map((appt, i) => (
                <div key={appt.id ?? i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-1.5 text-gray-500 w-16 flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">{appt.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {appt.patient_name ?? appt.patientName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {appt.doctor_name ?? appt.doctorName} • {appt.department}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${APPT_STATUS_COLORS[appt.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
