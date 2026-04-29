import { useState, useEffect } from 'react';
import { Award, CheckCircle2, Sparkles } from 'lucide-react';
import { useSessions } from '../../hooks/useSessions.js';

export default function PortalPractice() {
  const childId = 'p1';
  const { sessions, loading } = useSessions(childId);
  const [tasks, setTasks] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (sessions) {
      // Gather all home practice tasks from completed sessions
      const allTasks = sessions
        .filter(s => s.status === 'completed' && s.homePractice)
        .flatMap(s => s.homePractice);
      setTasks(allTasks);
    }
  }, [sessions]);

  if (loading) {
    return <div className="text-center py-10 text-slate-400">Loading tasks...</div>;
  }

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const toggleTask = (taskId) => {
    setTasks(current =>
      current.map(t => {
        if (t.id === taskId) {
          const isNowCompleted = !t.completed;
          if (isNowCompleted) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
          }
          return { ...t, completed: isNowCompleted };
        }
        return t;
      })
    );
  };

  return (
    <div className="space-y-6 page-enter relative">
      {/* Confetti Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          <div className="absolute animate-bounce"><Sparkles className="w-16 h-16 text-yellow-400" /></div>
          <div className="absolute animate-ping delay-100"><Sparkles className="w-10 h-10 text-rose-400 ml-20 -mt-10" /></div>
          <div className="absolute animate-pulse delay-200"><Sparkles className="w-12 h-12 text-purple-400 -ml-20 mt-10" /></div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Award className="w-6 h-6 text-orange-500" />
          Home Practice
        </h1>
        <p className="text-slate-500 mt-1">Consistency is key! Complete these activities with your child.</p>
      </div>

      {/* Active Tasks */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          To Do <span className="text-sm font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{activeTasks.length}</span>
        </h2>
        {activeTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-orange-100 shadow-soft">
            <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-slate-600 font-medium">All caught up! Great job.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-orange-100 shadow-soft cursor-pointer hover:border-orange-300 transition-all group"
              >
                <div className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center flex-shrink-0 group-hover:border-orange-400 transition-colors" />
                <p className="text-slate-700 font-medium flex-1">{task.title}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <section className="space-y-4 pt-6">
          <h2 className="text-lg font-bold text-slate-500">Completed</h2>
          <div className="space-y-3 opacity-60">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 cursor-pointer hover:bg-slate-50"
              >
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <p className="text-slate-500 font-medium line-through flex-1">{task.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
