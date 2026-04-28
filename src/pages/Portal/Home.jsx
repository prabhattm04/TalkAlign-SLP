import { Link } from 'react-router-dom';
import { CalendarHeart, CheckCircle2, ChevronRight, Video, FileHeart, Award } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients.js';
import { useSessions } from '../../hooks/useSessions.js';
import { formatDate } from '../../utils/helpers.js';

export default function PortalHome() {
  // In a real app, we'd fetch the patient associated with the logged-in caregiver.
  // For now, we'll hardcode to 'p1' (Aarav).
  const childId = 'p1';
  const { patient, loading: pLoad } = usePatients().patients ? { patient: usePatients().patients.find(p => p.id === childId) } : { patient: null, loading: true };
  const { sessions, loading: sLoad } = useSessions(childId);

  if (pLoad || sLoad) {
    return <div className="text-center py-10 text-slate-400">Loading your portal...</div>;
  }

  const childName = patient?.name?.split(' ')[0] || 'your child';
  const completedSessions = sessions.filter(s => s.status === 'completed').sort((a, b) => new Date(b.date) - new Date(a.date));
  const nextSession = sessions.find(s => s.status === 'scheduled');
  const latestSession = completedSessions[0];

  // Get active home practice from the latest session
  const activePractice = latestSession?.homePractice?.filter(t => !t.completed) || [];

  return (
    <div className="space-y-6 page-enter">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-200/40 to-rose-200/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-sm">
            {childName.charAt(0)}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            Hi there, Aarav's Family 👋
          </h1>
          <p className="text-slate-600 max-w-lg leading-relaxed">
            Aarav is making wonderful progress! He completed a session recently and has a few practice tasks waiting.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Next Session Card */}
        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-soft">
          <div className="flex items-center gap-2 text-rose-600 font-semibold mb-4">
            <CalendarHeart className="w-5 h-5" />
            Next Session
          </div>
          {nextSession ? (
            <div className="space-y-4">
              <div>
                <p className="text-slate-500 text-sm">Date & Time</p>
                <p className="text-lg font-bold text-slate-800">
                  {formatDate(nextSession.date)} at {nextSession.time || 'TBD'}
                </p>
              </div>
              <div className="flex items-center gap-3 bg-rose-50 p-3 rounded-2xl border border-rose-100">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-xl shadow-sm">👩🏽‍⚕️</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{nextSession.therapist}</p>
                  <p className="text-xs text-slate-500">Speech-Language Pathologist</p>
                </div>
              </div>
              <button className="w-full py-3 rounded-2xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                <Video className="w-4 h-4" /> Join Telehealth
              </button>
            </div>
          ) : (
            <p className="text-slate-500">No upcoming sessions scheduled.</p>
          )}
        </div>

        {/* Home Practice Card */}
        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-soft flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-orange-600 font-semibold">
              <Award className="w-5 h-5" />
              Home Practice
            </div>
            <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
              {activePractice.length} Tasks
            </span>
          </div>
          
          <div className="flex-1 space-y-3">
            {activePractice.length > 0 ? (
              activePractice.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-orange-50/50 transition-colors border border-slate-100 cursor-pointer">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-slate-700 leading-snug">{task.title}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">All caught up on practice!</p>
              </div>
            )}
          </div>

          <Link to="/portal/practice" className="mt-4 w-full py-3 rounded-2xl bg-orange-50 text-orange-700 font-medium hover:bg-orange-100 transition-colors flex items-center justify-center gap-2">
            View All Tasks <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Latest Session Summary */}
      {latestSession && (
        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-purple-600 font-semibold">
              <FileHeart className="w-5 h-5" />
              Latest Session Update
            </div>
            <span className="text-sm text-slate-400">{formatDate(latestSession.date)}</span>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 mb-4">
            <p className="text-slate-700 leading-relaxed text-sm">
              {latestSession.aiParentSummary || latestSession.summary}
            </p>
          </div>
          <Link to={`/portal/sessions/${latestSession.id}`} className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1">
            Read full summary <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
