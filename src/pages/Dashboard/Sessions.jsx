import { Link } from 'react-router-dom';
import { Mic2, CalendarDays, Clock, ChevronRight } from 'lucide-react';
import { useSessions } from '../../hooks/useSessions.js';
import { usePatients } from '../../hooks/usePatients.js';
import { formatDate } from '../../utils/helpers.js';
import Badge from '../../components/ui/Badge.jsx';

export default function Sessions() {
  const { sessions, loading: sLoad } = useSessions();
  const { patients, loading: pLoad } = usePatients();

  const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));

  function getPatient(patientId) {
    return patients.find((p) => p.id === patientId);
  }

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h2 className="section-title">Sessions</h2>
        <p className="section-subtitle">{sessions.length} total sessions recorded</p>
      </div>

      {(sLoad || pLoad) ? (
        <div className="card p-12 text-center text-slate-400">Loading sessions…</div>
      ) : sorted.length === 0 ? (
        <div className="card p-16 text-center">
          <Mic2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No sessions yet</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden">
          {sorted.map((s) => {
            const patient = getPatient(s.patientId);
            return (
              <div key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Mic2 className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900">{patient?.name ?? 'Unknown Patient'}</p>
                    <Badge status={s.status}>{s.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{s.summary}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <CalendarDays className="w-3 h-3" />{formatDate(s.date)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />{s.duration} min
                    </span>
                  </div>
                </div>
                <Link to={`/dashboard/sessions/${s.id}`}>
                  <button className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors opacity-0 group-hover:opacity-100">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
