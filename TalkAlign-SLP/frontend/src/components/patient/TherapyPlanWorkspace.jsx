import { useState } from 'react';
import { Target, Plus, Sparkles, CheckCircle2, Circle, PlayCircle, MoreHorizontal, Trash2, Edit3, X } from 'lucide-react';
import { useGoals } from '../../hooks/useGoals.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

// -----------------------------------------------------------------------------
// Modals
// -----------------------------------------------------------------------------
function GoalModal({ goal, onClose, onSave, patientId }) {
  const isEdit = !!goal;
  const [form, setForm] = useState({
    title: goal?.title || '',
    type: goal?.type || 'short_term',
    status: goal?.status || 'not_started',
    baseline: goal?.baseline || '',
    target: goal?.target || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title) return;
    setLoading(true);
    try {
      if (isEdit) {
        await onSave(goal.id, form);
      } else {
        await onSave({ ...form, patient_id: patientId });
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-soft-lg w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit Goal' : 'Add New Goal'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          <Input id="goal-title" label="Goal Title" value={form.title} onChange={(e) => setForm(f => ({...f, title: e.target.value}))} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={(e) => setForm(f => ({...f, type: e.target.value}))}>
                <option value="short_term">Short-Term</option>
                <option value="long_term">Long-Term</option>
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={(e) => setForm(f => ({...f, status: e.target.value}))}>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="achieved">Achieved</option>
              </select>
            </div>
          </div>
          <Input id="goal-baseline" label="Baseline (Optional)" value={form.baseline} onChange={(e) => setForm(f => ({...f, baseline: e.target.value}))} />
          <Input id="goal-target" label="Target (Optional)" value={form.target} onChange={(e) => setForm(f => ({...f, target: e.target.value}))} />
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" loading={loading} onClick={handleSubmit} disabled={!form.title}>
              {isEdit ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutoSuggestModal({ onClose, onSuggest, onSaveMultiple }) {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);

  useState(() => {
    onSuggest().then(data => {
      setSuggestions(data);
      // Select all by default
      setSelected(new Set(data.map((_, i) => i)));
    }).catch(err => {
      console.error(err);
      alert(err.message || "Failed to fetch suggestions");
    }).finally(() => {
      setLoading(false);
    });
  });

  const toggleSelect = (i) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const toSave = suggestions.filter((_, i) => selected.has(i));
      await onSaveMultiple(toSave);
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save goals");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-soft-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold text-slate-900">AI Suggested Goals</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
              <p className="text-slate-500">Analyzing past sessions...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No suggestions found. The patient might need more completed sessions.
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Select the goals you want to add to the therapy plan:</p>
              {suggestions.map((s, i) => (
                <div key={i} 
                     className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selected.has(i) ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'}`}
                     onClick={() => toggleSelect(i)}>
                  <div className="flex gap-3">
                    <div className="mt-1">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${selected.has(i) ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-300'}`}>
                        {selected.has(i) && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{s.title}</h4>
                      <p className="text-xs text-purple-700 font-medium uppercase mt-1">{s.type.replace('_', '-')}</p>
                      <div className="text-xs text-slate-500 mt-2 space-y-1">
                        {s.baseline && <div><strong>Baseline:</strong> {s.baseline}</div>}
                        {s.target && <div><strong>Target:</strong> {s.target}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-100 shrink-0">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSave} disabled={loading || selected.size === 0}>
            Add {selected.size} Goal{selected.size !== 1 && 's'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Workspace
// -----------------------------------------------------------------------------
export default function TherapyPlanWorkspace({ patientId }) {
  const { goals, loading, addGoal, editGoal, removeGoal, suggestGoals } = useGoals(patientId);
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  if (loading) {
    return <div className="py-10 text-center text-slate-400">Loading therapy plan...</div>;
  }

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

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await removeGoal(id);
      } catch (err) {
        alert(err.message || "Failed to delete");
      }
    }
  };

  const handleEdit = (e, goal) => {
    e.stopPropagation();
    setEditingGoal(goal);
  };

  const toggleStatus = async (e, goal) => {
    e.stopPropagation();
    const nextStatus = goal.status === 'not_started' ? 'in_progress' : 
                       goal.status === 'in_progress' ? 'achieved' : 'not_started';
    try {
      await editGoal(goal.id, { status: nextStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const saveMultipleSuggestions = async (suggestionsToSave) => {
    for (const g of suggestionsToSave) {
      await addGoal({ ...g, patient_id: patientId });
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
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No therapy goals established yet.</p>
          </div>
        ) : (
          goals.map(goal => (
            <div key={goal.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 group">
              <div className="p-5 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex-1 flex gap-4">
                  {/* Quick toggle status */}
                  <button onClick={(e) => toggleStatus(e, goal)} className="mt-1 flex-shrink-0" title="Click to cycle status">
                    {goal.status === 'achieved' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : 
                     goal.status === 'in_progress' ? <PlayCircle className="w-6 h-6 text-blue-500" /> :
                     <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{goal.type?.replace('_', '-')}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(goal.status)}`}>
                        {getStatusText(goal.status)}
                      </span>
                    </div>
                    <h3 className={`text-lg font-bold leading-snug ${goal.status === 'achieved' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{goal.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span><strong className="text-slate-600">Baseline:</strong> {goal.baseline || '—'}</span>
                      <span className="hidden sm:inline">•</span>
                      <span><strong className="text-slate-600">Target:</strong> {goal.target || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleEdit(e, goal)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Goal">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => handleDelete(e, goal.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Goal">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Centralized Action Buttons */}
      <div className="flex justify-center gap-3 pt-4">
        <Button variant="secondary" onClick={() => setShowSuggestModal(true)}>
          <Sparkles className="w-4 h-4 text-purple-500 mr-2 inline" /> Auto-Suggest Goals
        </Button>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2 inline" /> Add Manual Goal
        </Button>
      </div>

      {showAddModal && (
        <GoalModal 
          patientId={patientId}
          onClose={() => setShowAddModal(false)}
          onSave={addGoal}
        />
      )}

      {editingGoal && (
        <GoalModal 
          patientId={patientId}
          goal={editingGoal}
          onClose={() => setEditingGoal(null)}
          onSave={editGoal}
        />
      )}

      {showSuggestModal && (
        <AutoSuggestModal 
          onClose={() => setShowSuggestModal(false)}
          onSuggest={suggestGoals}
          onSaveMultiple={saveMultipleSuggestions}
        />
      )}
    </div>
  );
}

