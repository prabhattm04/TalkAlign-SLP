import { Link } from 'react-router-dom';
import { CalendarHeart, ChevronRight, FileHeart } from 'lucide-react';
import { useSessions } from '../../hooks/useSessions.js';
import { formatDate } from '../../utils/helpers.js';

export default function PortalSessions() {
  const childId = 'p1';
  const { sessions, loading } = useSessions(childId);

  if (loading) {
    return <div className="text-center py-10 text-slate-400">Loading sessions...</div>;
  }

  const completedSessions = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6 page-enter">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarHeart className="w-6 h-6 text-rose-500" />
          Session History
        </h1>
        <p className="text-slate-500 mt-1">Review past sessions and see how much progress has been made.</p>
      </div>

      <div className="space-y-4">
        {completedSessions.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-rose-100 shadow-soft">
            <CalendarHeart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No sessions yet!</p>
          </div>
        ) : (
          completedSessions.map((session) => (
            <Link
              key={session.id}
              to={`/portal/sessions/${session.id}`}
              className="block bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-soft hover:shadow-md hover:border-rose-200 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                    <FileHeart className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{formatDate(session.date)}</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-3">With {session.therapist}</p>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 line-clamp-2 text-sm text-slate-600">
                      {session.aiParentSummary || session.summary}
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors mt-2">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
