import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, CalendarHeart, ClipboardCheck, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function PortalLayout() {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/portal/home', icon: Home },
    { name: 'Sessions', path: '/portal/sessions', icon: CalendarHeart },
    { name: 'Practice', path: '/portal/practice', icon: ClipboardCheck },
    { name: 'Progress', path: '/portal/progress', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50 flex flex-col font-sans selection:bg-rose-200">
      
      {/* Top Header (Desktop & Mobile) */}
      <header className="bg-white/80 backdrop-blur-md border-b border-rose-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="text-xl font-bold text-slate-800">TalkAlign<span className="text-rose-500 font-medium text-sm ml-1">Family</span></span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    active ? 'text-rose-600' : 'text-slate-500 hover:text-rose-500'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="ml-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </nav>

          {/* Mobile Logout (Header) */}
          <button onClick={logout} className="md:hidden text-slate-400 hover:text-slate-600 p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-rose-100 pb-safe z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                  active ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'
                }`}
              >
                <div className={`p-1.5 rounded-full transition-colors ${active ? 'bg-rose-100' : 'bg-transparent'}`}>
                  <Icon className={`w-5 h-5 ${active ? 'fill-rose-100' : ''}`} />
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
