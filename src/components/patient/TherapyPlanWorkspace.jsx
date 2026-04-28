import { useState } from 'react';
import { Target, Plus, Sparkles, CheckCircle2, Circle, PlayCircle, MoreHorizontal } from 'lucide-react';
import { useGoals } from '../../hooks/useGoals.js';
import Button from '../ui/Button.jsx';

export default function TherapyPlanWorkspace({ patientId }) {
  const { goals, loading } = useGoals(patientId);
  const [expandedGoalId, setExpandedGoalId] = useState(null);

  if (loading) {
    return <div className="py-10 text-center text-slate-400">Loading therapy plan...</div>;
  }

  const toggleExpand = (id) => {
    setExpandedGoalId(prev => prev === id ? null : id);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'achieved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'achieved': return 'Achieved';
      case 'in_progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Active Therapy Plan</h2>
            <p className="text-sm text-slate-500">{goals.length} Goals Tracked</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="hidden sm:flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" /> Auto-Suggest
          </Button>
          <Button variant="primary" size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Goal
          </Button>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No therapy goals established yet.</p>
            <Button variant="secondary" size="sm" className="mt-4">Create First Goal</Button>
          </div>
        ) : (
          goals.map(goal => (
            <div key={goal.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200">
              {/* Goal Card Header (Clickable) */}
              <div 
                className="p-5 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => toggleExpand(goal.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Long-Term Goal</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(goal.status)}`}>
                      {getStatusText(goal.status)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 leading-snug">{goal.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span><strong className="text-slate-600">Baseline:</strong> {goal.baseline}</span>
                    <span className="hidden sm:inline">•</span>
                    <span><strong className="text-slate-600">Target:</strong> {goal.target}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Progress Ring Stub */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-100 flex items-center justify-center relative">
                      <span className="text-xs font-bold text-indigo-700">
                        {Math.round((goal.objectives.filter(o => o.status === 'achieved').length / goal.objectives.length) * 100) || 0}%
                      </span>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Goal Expanded Content */}
              {expandedGoalId === goal.id && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-6 animate-fade-in">
                  
                  {/* Short-term Objectives */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Short-Term Objectives</h4>
                    <div className="space-y-2">
                      {goal.objectives.map(obj => (
                        <div key={obj.id} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200">
                          {obj.status === 'achieved' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          ) : obj.status === 'in_progress' ? (
                            <PlayCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className={`text-sm ${obj.status === 'achieved' ? 'text-slate-500 line-through' : 'text-slate-800 font-medium'}`}>
                              {obj.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activities / Exercises */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Recommended Activities</h4>
                      <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Activity
                      </button>
                    </div>
                    {goal.activities && goal.activities.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {goal.activities.map(activity => (
                          <div key={activity.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div>
                              <p className="text-sm font-bold text-slate-800 mb-2">{activity.title}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {activity.tags.map(tag => (
                                  <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="mt-3 text-right">
                              <span className={`text-[10px] font-bold uppercase ${
                                activity.difficulty === 'Easy' ? 'text-green-600' :
                                activity.difficulty === 'Medium' ? 'text-orange-600' : 'text-rose-600'
                              }`}>
                                {activity.difficulty}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No activities assigned to this goal yet.</p>
                    )}
                  </div>
                  
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
