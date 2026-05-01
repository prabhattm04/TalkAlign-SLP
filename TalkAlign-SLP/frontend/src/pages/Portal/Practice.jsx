import { useState, useEffect } from 'react';
import { Award, CheckCircle2, Sparkles, Target, Activity, Calendar } from 'lucide-react';
import { usePortal } from '../../hooks/usePortal.js';

export default function PortalPractice() {
  const { sessions, goals, loading, toggleTask: apiToggleTask } = usePortal();
  const [tasks, setTasks] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (sessions) {
      // Gather all home practice tasks from completed sessions
      const allTasks = sessions
        .filter(s => s.status === 'completed' && s.homePractice)
        .flatMap(s => s.homePractice.map(t => ({
          ...t,
          sessionDate: s.date
        })));
      setTasks(allTasks);
    }
  }, [sessions]);

  if (loading) {
    return <div className="text-center py-10 text-slate-400">Loading tasks...</div>;
  }

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const isNowCompleted = !task.completed;
    
    // Optimistic UI Update locally for quick feedback
    setTasks(current =>
      current.map(t => {
        if (t.id === taskId) {
          if (isNowCompleted) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
          }
          return { ...t, completed: isNowCompleted };
        }
        return t;
      })
    );

    // Call API (the hook will also update its state)
    await apiToggleTask(taskId, isNowCompleted);
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

      {/* Therapy Goals Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500" />
          Therapy Goals <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{goals?.length || 0}</span>
        </h2>
        <p className="text-sm text-slate-500">Long-term targets and milestones set by your therapist.</p>
        
        {(!goals || goals.length === 0) ? (
          <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 shadow-soft">
            <p className="text-slate-500">No active goals set yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const isAchieved = goal.status === 'achieved';
              return (
                <div key={goal.id} className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-soft relative overflow-hidden">
                  {isAchieved && <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">ACHIEVED</div>}
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isAchieved ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-500'}`}>
                      {isAchieved ? <CheckCircle2 className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{goal.type?.replace('_', '-')}</span>
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(goal.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className={`font-bold leading-snug ${isAchieved ? 'text-slate-500' : 'text-slate-800'}`}>{goal.title}</h3>
                      {goal.target && <p className="text-sm text-slate-500 mt-1"><strong>Target:</strong> {goal.target}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Active Tasks */}
      <section className="space-y-4 mt-10">
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
                <div className="flex-1">
                  <p className="text-slate-700 font-medium">{task.title}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Assigned: {new Date(task.sessionDate).toLocaleDateString()}
                  </p>
                </div>
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
                <div className="flex-1">
                  <p className="text-slate-500 font-medium line-through">{task.title}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Assigned: {new Date(task.sessionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
