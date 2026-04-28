import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

// Map routes to page titles
const TITLES = {
  '/dashboard':          'Dashboard',
  '/dashboard/patients': 'Patients',
  '/dashboard/sessions': 'Sessions',
};

function getTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith('/dashboard/patients/')) return 'Patient Details';
  if (pathname.startsWith('/dashboard/sessions/')) return 'Session';
  return 'TalkAlign';
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          title={getTitle(pathname)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="page-enter max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
