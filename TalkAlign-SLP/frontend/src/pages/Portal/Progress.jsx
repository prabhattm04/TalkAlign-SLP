import { Sparkles, TrendingUp, Star, Lock } from 'lucide-react';
import { usePortal } from '../../hooks/usePortal.js';

export default function PortalProgress() {
  const { sessions, loading } = usePortal();

  if (loading) {
    return <div className="text-center py-10 text-slate-400">Loading progress...</div>;
  }

  const totalSessions = sessions.length;
  // Calculate completed tasks from all sessions
  const completedTasksCount = sessions.reduce((total, session) => {
    const sessionTasks = session.homePractice || [];
    return total + sessionTasks.filter(t => t.completed).length;
  }, 0);

  return (
    <div className="space-y-6 page-enter">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          Progress & Goals
        </h1>
        <p className="text-slate-500 mt-1">See how far we've come together!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-soft text-center">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalSessions}</p>
          <p className="text-xs text-slate-500 font-medium">Total Sessions</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-orange-100 shadow-soft text-center">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-2">
            <Star className="w-5 h-5 text-orange-600 fill-orange-200" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{completedTasksCount}</p>
          <p className="text-xs text-slate-500 font-medium">Tasks Completed</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-soft mt-8">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
           <Lock className="w-6 h-6 text-slate-300" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Detailed Analytics Coming Soon</h2>
        <p className="text-slate-500 max-w-sm mx-auto text-sm">
          We are currently working on bringing you a comprehensive view of your child's milestones and target accuracy. Stay tuned!
        </p>
      </div>

    </div>
  );
}
