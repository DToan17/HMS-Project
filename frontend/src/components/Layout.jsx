import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ onLogout }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
