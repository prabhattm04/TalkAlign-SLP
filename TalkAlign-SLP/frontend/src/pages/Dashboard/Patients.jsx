import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, UserRound, ChevronRight, X } from 'lucide-react';
import { usePatients } from '../../hooks/usePatients.js';
import { useSessions } from '../../hooks/useSessions.js';
import { formatDate } from '../../utils/helpers.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Badge from '../../components/ui/Badge.jsx';

const INTEREST_TAGS = ['Dinosaurs', 'Space', 'Cars', 'Animals', 'Art', 'Music', 'Sports', 'Video Games'];

function AddPatientModal({ onClose, onAdd }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ 
    name: '', age: '', gender: '', caregiver: '', 
    condition: '', notes: '', tags: [] 
  });
  const [customTag, setCustomTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validateStep1() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.age || isNaN(form.age)) e.age = 'Valid age is required.';
    return e;
  }

  function validateStep2() {
    const e = {};
    if (!form.condition.trim()) e.condition = 'Condition is required.';
    return e;
  }

  const handleNext = () => {
    let e = {};
    if (step === 1) e = validateStep1();
    if (step === 2) e = validateStep2();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        condition: form.condition,
        notes: form.notes || undefined,
        tags: form.tags,
        caregiver_name: form.caregiver || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to add patient:', err);
      setErrors({ submit: err.message || 'Failed to add patient.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-soft-lg border border-white w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add New Patient</h3>
            <p className="text-sm text-slate-500">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div className="bg-brand-500 h-1 transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="p-6 space-y-6">
          {errors.submit && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {errors.submit}
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="font-semibold text-slate-900">Demographics</h4>
              <Input id="add-name" label="Full Name" placeholder="Patient name" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
              <div className="grid grid-cols-2 gap-4">
                <Input id="add-age" label="Age" type="number" placeholder="7" value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} error={errors.age} />
                <div>
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender}
                    onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <Input id="add-caregiver" label="Caregiver Name (optional)" placeholder="Parent / Guardian"
                value={form.caregiver} onChange={(e) => setForm((f) => ({ ...f, caregiver: e.target.value }))} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="font-semibold text-slate-900">Clinical Information</h4>
              <Input id="add-condition" label="Primary Condition" placeholder="e.g. Articulation Disorder"
                value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
                error={errors.condition} />
              <div>
                <label className="form-label">Initial Notes</label>
                <textarea className="form-input resize-none h-28" placeholder="Initial observations or history…"
                  value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="font-semibold text-slate-900">Interests & Hobbies</h4>
              <p className="text-sm text-slate-500">Select topics to help build rapport during therapy sessions, or type your own.</p>
              
              <Input 
                id="custom-tag" 
                placeholder="Type a custom interest and press Enter…"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    const val = customTag.trim();
                    if (val && !form.tags.includes(val)) {
                      setForm(f => ({ ...f, tags: [...f.tags, val] }));
                    }
                    setCustomTag('');
                  }
                }}
              />

              <div className="flex flex-wrap gap-2 mt-2">
                {Array.from(new Set([...INTEREST_TAGS, ...form.tags])).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      form.tags.includes(tag) 
                        ? 'bg-brand-50 border-brand-200 text-brand-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-100/50">
            {step > 1 && (
              <Button type="button" variant="ghost" size="md" className="flex-1" onClick={() => setStep(s => s - 1)}>Back</Button>
            )}
            {step < 3 ? (
              <Button type="button" variant="primary" size="md" className="flex-1" onClick={handleNext}>Next Step</Button>
            ) : (
              <Button type="submit" variant="primary" size="md" className="flex-1" loading={loading}>Complete Intake</Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Patients() {
  const { patients, loading, addPatient } = usePatients();
  const { sessions } = useSessions();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 5;

  const filtered = patients.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPatientStats = (patientId) => {
    const pSess = sessions.filter(s => s.patient_id === patientId);
    const totalSessions = pSess.length;
    const completedSess = pSess.filter(s => s.status === 'completed').sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastSession = completedSess.length > 0 ? completedSess[0].date : null;
    return { totalSessions, lastSession };
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Patients</h2>
          <p className="section-subtitle">{patients.length} total patients under your care</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Add Patient
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full max-w-sm">
          <Input
            id="patient-search"
            placeholder="Search by name or condition…"
            icon={Search}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="w-full sm:w-48">
          <select 
            className="form-input" 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="discharged">Discharged</option>
          </select>
        </div>
      </div>

      {/* Patient cards / table */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400">Loading patients…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <UserRound className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No patients found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or add a new patient.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Age</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Condition</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Session</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((p) => {
                  const { totalSessions, lastSession } = getPatientStats(p.id);
                  return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-400">{totalSessions || 0} sessions total</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{p.age} yrs</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{p.condition}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{lastSession ? formatDate(lastSession) : '—'}</td>
                    <td className="px-6 py-4"><Badge status={p.status}>{p.status}</Badge></td>
                    <td className="px-6 py-4">
                      <Link to={`/dashboard/patients/${p.id}`}>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          View <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {paginated.map((p) => {
              const { lastSession } = getPatientStats(p.id);
              return (
              <Link key={p.id} to={`/dashboard/patients/${p.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-11 h-11 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.condition} · Age {p.age}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{lastSession ? formatDate(lastSession) : 'No sessions'}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge status={p.status}>{p.status}</Badge>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
            )})}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-medium text-slate-900">{filtered.length}</span> results
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <AddPatientModal
          onClose={() => setShowModal(false)}
          onAdd={addPatient}
        />
      )}
    </div>
  );
}
