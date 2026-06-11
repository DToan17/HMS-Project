import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Doctors from './pages/Doctors';
import Settings from './pages/Settings';
import Rooms from './pages/Rooms';
import Revenue from './pages/Revenue';

const AUTH_KEY = 'medicare_auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'authenticated';
  });

  const handleLogin = () => {
    localStorage.setItem(AUTH_KEY, 'authenticated');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="*" element={<Login onLogin={handleLogin} />} />
          </>
        ) : (
          <Route path="/" element={<Layout onLogout={handleLogout} />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"    element={<Dashboard />} />
            <Route path="patients"     element={<Patients />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="doctors"      element={<Doctors />} />
            <Route path="rooms"        element={<Rooms />} />
            <Route path="revenue"      element={<Revenue />} />
            <Route path="settings"     element={<Settings />} />
            <Route path="*"            element={<Navigate to="/dashboard" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}
