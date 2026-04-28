import { Users, CalendarCheck, FileText, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePatients } from '../../hooks/usePatients.js';
import { useSessions } from '../../hooks/useSessions.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, statusBadgeClass } from '../../utils/helpers.js';
import Badge from '../../components/ui/Badge.jsx';

function StatCard({ icon: Icon, label, value, delta, color, bg }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
        {delta && (
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {delta}
          </p>
        )}
      </div>
    </div>
  );
}

function ActivityChart() {
  const data = [
    { day: 'Mon', count: 3, h: '30%' },
    { day: 'Tue', count: 5, h: '50%' },
    { day: 'Wed', count: 2, h: '20%' },
    { day: 'Thu', count: 8, h: '80%' },
    { day: 'Fri', count: 6, h: '60%' },
    { day: 'Sat', count: 0, h: '5%' },
    { day: 'Sun', count: 1, h: '10%' },
  ];
  return (
    <div className="card p-6 flex flex-col justify-between h-full">
      <div>
        <h3 className="font-semibold text-slate-900">Activity Trend</h3>
        <p className="text-sm text-slate-500 mb-6">Sessions completed this week</p>
      </div>
      <div className="flex items-end justify-between gap-3 h-32 mt-auto">
        {data.map((d) => (
          <div key={d.day} className="flex flex-col items-center gap-2 flex-1 group h-full justify-end">
            <div className="w-full bg-slate-50 rounded-t-lg relative flex flex-col justify-end transition-colors h-full">
               <div 
                 className="w-full bg-brand-500 rounded-t-lg transition-all duration-500 group-hover:bg-brand-600"
                 style={{ height: d.h }}
               />
               <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                 {d.count}
               </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const { patients, loading: pLoading } = usePatients();
  const { sessions, loading: sLoading } = useSessions();

  const activePts  = patients.filter((p) => p.status === 'active').length;
  const recentSess = [...sessions]
    .filter((s) => s.status === 'completed' || s.status === 'in-progress')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const upcomingSess = [...sessions]
    .filter((s) => s.status === 'scheduled')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-6 page-enter">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Good morning, {user?.name?.split(' ')[0] ?? 'Doctor'} 👋
        </h2>
        <p className="text-slate-500 mt-1 text-sm">Here's what's happening with your patients today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Users}
          label="Total Patients"
          value={pLoading ? '—' : patients.length}
          delta={`${activePts} active`}
          color="text-brand-600"
          bg="bg-brand-50"
        />
        <StatCard
          icon={CalendarCheck}
          label="Total Sessions"
          value={sLoading ? '—' : sessions.length}
          delta="This month"
          color="text-teal-600"
          bg="bg-teal-50"
        />
        <StatCard
          icon={FileText}
          label="SOAP Notes"
          value={sLoading ? '—' : sessions.filter((s) => s.status === 'completed').length}
          delta="All time"
          color="text-violet-600"
          bg="bg-violet-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Patients"
          value={pLoading ? '—' : activePts}
          color="text-rose-600"
          bg="bg-rose-50"
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* LEFT COLUMN (col-span-3) */}
        <div className="lg:col-span-3 space-y-5">
          <ActivityChart />

          <div className="card">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Recent Sessions</h3>
              <Link to="/dashboard/sessions" className="text-brand-600 text-sm font-medium hover:text-brand-700 flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="p-6 space-y-3">
              {sLoading ? (
                <div className="text-slate-400 text-sm text-center py-8">Loading sessions…</div>
              ) : recentSess.length === 0 ? (
                <div className="text-slate-400 text-sm text-center py-8">No sessions yet.</div>
              ) : (
                recentSess.map((s) => {
                  const patient = patients.find((p) => p.id === s.patientId);
                  return (
                    <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {patient?.name?.charAt(0) ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{patient?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-slate-500 truncate">{s.summary}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge status={s.status}>{s.status}</Badge>
                        <p className="text-xs text-slate-400 mt-1">{formatDate(s.date)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (col-span-2) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Upcoming Sessions</h3>
            </div>
            <div className="p-4 space-y-2">
              {sLoading ? (
                <div className="text-slate-400 text-sm text-center py-8">Loading…</div>
              ) : upcomingSess.length === 0 ? (
                <div className="text-slate-400 text-sm text-center py-4">No upcoming sessions.</div>
              ) : (
                upcomingSess.map((s) => {
                  const patient = patients.find((p) => p.id === s.patientId);
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold flex-shrink-0">
                        {patient?.name?.charAt(0) ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{patient?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <CalendarCheck className="w-3 h-3" /> {formatDate(s.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700">{s.time || 'TBD'}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">My Patients</h3>
              <Link to="/dashboard/patients" className="text-brand-600 text-sm font-medium hover:text-brand-700 flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="p-4 space-y-2">
              {pLoading ? (
                <div className="text-slate-400 text-sm text-center py-8">Loading…</div>
              ) : (
                patients.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    to={`/dashboard/patients/${p.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate group-hover:text-brand-700 transition-colors">{p.name}</p>
                      <p className="text-xs text-slate-500">Age {p.age} · {p.condition}</p>
                    </div>
                    <Badge status={p.status}>{p.status}</Badge>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
