import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar({ onMenuClick, title }) {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-white/50 backdrop-blur-sm border-b border-white/50 flex items-center px-4 lg:px-8 gap-4 sticky top-0 z-10">
      {/* Hamburger (mobile only) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="text-lg font-semibold text-slate-900 flex-1">{title}</h1>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0) ?? 'D'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.name ?? 'Doctor'}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role ?? 'doctor'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
