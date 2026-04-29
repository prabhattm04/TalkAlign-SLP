import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarHeart, FileHeart, Award, MessageSquareHeart } from 'lucide-react';
import { useSession } from '../../hooks/useSessions.js';
import { formatDate } from '../../utils/helpers.js';

export default function PortalSessionDetail() {
  const { id } = useParams();
  const { session, loading } = useSession(id);

  if (loading) {
    return <div className="text-center py-10 text-slate-400">Loading session...</div>;
  }

  if (!session) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500 mb-4">Session not found.</p>
        <Link to="/portal/sessions" className="text-rose-600 font-medium">Back to Sessions</Link>
      </div>
    );
  }

  const hasPractice = session.homePractice && session.homePractice.length > 0;

  return (
    <div className="space-y-6 page-enter pb-10">
      <Link to="/portal/sessions" className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-medium text-sm transition-colors mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to History
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-rose-400 flex items-center justify-center text-white shadow-sm">
            <FileHeart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{formatDate(session.date)}</h1>
            <p className="text-slate-500 font-medium">Session with {session.therapist}</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Summary Section */}
          <section>
            <h2 className="text-lg font-bold text-purple-700 flex items-center gap-2 mb-3">
              <MessageSquareHeart className="w-5 h-5" /> How it went
            </h2>
            <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
              <p className="text-slate-700 leading-relaxed">
                {session.aiParentSummary || session.summary}
              </p>
            </div>
          </section>

          {/* Practice Section */}
          <section>
            <h2 className="text-lg font-bold text-orange-600 flex items-center gap-2 mb-3">
              <Award className="w-5 h-5" /> Assigned Practice
            </h2>
            {hasPractice ? (
              <div className="space-y-3">
                {session.homePractice.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-4 rounded-2xl bg-orange-50/30 border border-orange-100">
                    <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 ${task.completed ? 'bg-orange-500 border-orange-500' : 'border-slate-300'}`}>
                      {task.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium leading-snug ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                        {task.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-sm">No specific homework assigned for this session.</p>
            )}
          </section>

          {/* Therapist Note Fallback */}
          {!session.aiParentSummary && session.soap?.plan && (
            <section>
              <h2 className="text-lg font-bold text-teal-600 mb-3">Therapist Plan</h2>
              <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100">
                <p className="text-slate-700 leading-relaxed text-sm">
                  {session.soap.plan}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
