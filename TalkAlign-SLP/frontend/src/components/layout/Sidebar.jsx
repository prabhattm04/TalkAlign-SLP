import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Mic2,
  LogOut,
  Stethoscope,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { to: '/dashboard',          label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/patients', label: 'Patients',  icon: Users            },
  { to: '/dashboard/sessions', label: 'Sessions',  icon: Mic2             },
];

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 flex flex-col
          bg-white/80 backdrop-blur-lg border-r border-white shadow-soft
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto lg:my-4 lg:ml-4 lg:rounded-3xl lg:border lg:w-[260px]
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 shadow-soft flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-xl tracking-tight">TalkAlign</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <p className="px-4 mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Main Menu
          </p>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-slate-100/50">
          <div className="flex items-center gap-3 px-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-500 shadow-soft flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0) ?? 'D'}
            </div>
            <div className="overflow-hidden">
              <p className="text-slate-900 text-sm font-bold truncate">{user?.name ?? 'Doctor'}</p>
              <p className="text-slate-500 text-xs truncate capitalize">{user?.role ?? 'doctor'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
