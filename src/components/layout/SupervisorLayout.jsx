import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, CalendarDays, Stethoscope, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SupervisorLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/supervisor/home', icon: Home },
    { name: 'Patients', path: '/supervisor/patients', icon: Users },
    { name: 'Doctors', path: '/supervisor/doctors', icon: Stethoscope },
    { name: 'Schedule', path: '/supervisor/schedule', icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              T
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">TalkAlign<span className="text-indigo-600 font-medium text-sm ml-1">Clinic</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-indigo-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className="text-sm font-medium text-slate-700">{user?.name || 'Admin'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-white md:bg-transparent border-b md:border-b-0 md:border-r border-slate-200 p-4 shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible sticky top-16 z-40">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 hidden md:block px-3">Clinic Admin</div>
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  active 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
          
          <div className="mt-auto hidden md:block pt-4">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
