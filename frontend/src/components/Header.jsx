import { useState } from 'react';
import { Search, Bell, Calendar, LogOut, User, Settings, ChevronDown } from 'lucide-react';

export default function Header({ onLogout }) {
  const [dropdown, setDropdown] = useState(false);
  const [search, setSearch] = useState('');

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between flex-shrink-0 z-10">
      {/* Search */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          type="text"
          placeholder="Search patients, doctors, appointments..."
          className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-5 ml-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Calendar className="w-4 h-4" />
          <span className="hidden lg:inline font-medium">{currentDate}</span>
        </div>

        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="h-8 w-px bg-gray-200" />

        <div className="relative">
          <button
            onClick={() => setDropdown(!dropdown)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">Dr. Sarah Wilson</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
              SW
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdown ? 'rotate-180' : ''}`} />
          </button>

          {dropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdown(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20">
                <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">My Profile</span>
                </button>
                <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Settings</span>
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { setDropdown(false); onLogout(); }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-semibold">Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
