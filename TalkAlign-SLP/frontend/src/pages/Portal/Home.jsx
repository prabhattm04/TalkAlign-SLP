import { Link } from 'react-router-dom';
import { CalendarHeart, CheckCircle2, ChevronRight, Video, FileHeart, Award } from 'lucide-react';
import { usePortal } from '../../hooks/usePortal.js';
import { formatDate } from '../../utils/helpers.js';

export default function PortalHome() {
  const { caregiver, patients, sessions, loading, error } = usePortal();

  if (loading) {
    return <div className="text-center py-10 text-slate-400">Loading your portal...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-rose-500">{error}</div>;
  }

  const patient = patients && patients.length > 0 ? patients[0] : null;
  const childName = patient?.name?.split(' ')[0] || 'your child';
  const latestSession = sessions.length > 0 ? sessions[0] : null;
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
            Hi there, {caregiver?.name.split(' ')[0] || 'Family'} 👋
          </h1>
          <p className="text-slate-600 max-w-lg leading-relaxed">
            {childName} is making wonderful progress! Check out the latest updates below.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Next Session Card - Currently no scheduled sessions logic in backend, hiding or showing placeholder */}
        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-soft flex flex-col justify-center items-center">
          <CalendarHeart className="w-8 h-8 text-rose-300 mb-2" />
          <p className="text-slate-500 text-center">No upcoming sessions scheduled right now. We will notify you when the next session is set!</p>
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
              activePractice.slice(0, 3).map(task => (
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
            <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">
              {latestSession.aiParentSummary || latestSession.summary || "No summary available for this session."}
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
