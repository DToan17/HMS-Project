import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Stethoscope,
  Settings, Cross, ChevronRight, BedDouble, DollarSign, LogOut,
} from 'lucide-react';

const navSections = [
  {
    title: 'MAIN',
    items: [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'PATIENT MANAGEMENT',
    items: [
      { path: '/patients',     label: 'Patients',     icon: Users },
      { path: '/appointments', label: 'Appointments', icon: Calendar },
      { path: '/doctors',      label: 'Doctors',      icon: Stethoscope },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { path: '/rooms',   label: 'Rooms',   icon: BedDouble },
      { path: '/revenue', label: 'Revenue', icon: DollarSign },
    ],
  },
  {
    title: 'SYSTEM',
    items: [{ path: '/settings', label: 'Settings', icon: Settings }],
  },
];

export default function Sidebar({ onLogout }) {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 min-h-screen sidebar-gradient text-white flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Cross className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-lg leading-tight">MediCare</p>
          <p className="text-xs text-white/60">Hospital Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-white/40 tracking-widest">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ path, label, icon: Icon }) => {
                const active = pathname === path || (pathname === '/' && path === '/dashboard');
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                      active
                        ? 'bg-white text-teal-700 shadow-lg'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-teal-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 pb-6 pt-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-red-500/20 hover:text-red-300 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
