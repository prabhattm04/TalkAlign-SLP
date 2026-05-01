import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic2, CalendarDays, Clock, ChevronRight, Plus, X, User2 } from 'lucide-react';
import { useSessions } from '../../hooks/useSessions.js';
import { usePatients } from '../../hooks/usePatients.js';
import { formatDate } from '../../utils/helpers.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';

function NewSessionModal({ patients, onClose, onCreate }) {
  const today = new Date().toISOString().slice(0, 16); // datetime-local format
  const [patientId, setPatientId] = useState('');
  const [date, setDate]           = useState(today);
  const [summary, setSummary]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!patientId) { setError('Please select a patient.'); return; }
    setError('');
    setLoading(true);
    try {
      await onCreate({ patient_id: patientId, date: new Date(date).toISOString(), summary: summary || undefined });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create session.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-soft-lg border border-white w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">New Session</h3>
            <p className="text-sm text-slate-500">Create a therapy session for a patient</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="form-label">Patient</label>
            <div className="relative">
              <User2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                className="form-input pl-9"
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                required
              >
                <option value="">Select a patient…</option>
                {patients
                  .filter(p => p.status === 'active')
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.condition}</option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Date & Time</label>
            <input
              type="datetime-local"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Summary <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              className="form-input resize-none h-20"
              placeholder="Brief description of session goals or focus area…"
              value={summary}
              onChange={e => setSummary(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-100/50">
            <Button type="button" variant="ghost" size="md" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" className="flex-1" loading={loading}>
              Create Session
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Sessions() {
  const navigate = useNavigate();
  const { sessions, loading: sLoad, createSession } = useSessions();
  const { patients, loading: pLoad }                = usePatients();
  const [showModal, setShowModal]                   = useState(false);

  const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));

  function getPatient(patientId) {
    return patients.find(p => p.id === patientId);
  }

  async function handleCreate(data) {
    const newSession = await createSession(data);
    setShowModal(false);
    navigate(`/dashboard/sessions/${newSession.id}`);
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Sessions</h2>
          <p className="section-subtitle">{sessions.length} total sessions recorded</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> New Session
        </Button>
      </div>

      {(sLoad || pLoad) ? (
        <div className="card p-12 text-center text-slate-400">Loading sessions…</div>
      ) : sorted.length === 0 ? (
        <div className="card p-16 text-center">
          <Mic2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No sessions yet</p>
          <p className="text-slate-400 text-sm mt-1">Create a new session to get started.</p>
          <Button variant="primary" size="md" className="mt-6" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> New Session
          </Button>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden">
          {sorted.map(s => {
            const patient = getPatient(s.patient_id);
            // patient name may also come directly from the sessions join
            const patientName = patient?.name ?? s.patient?.name ?? 'Unknown Patient';
            return (
              <div key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Mic2 className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-slate-900">{s.title || patientName}</p>
                    {s.title && <span className="text-sm font-semibold text-slate-500 hidden sm:inline">· {patientName}</span>}
                    <Badge status={s.status}>{s.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{s.summary}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <CalendarDays className="w-3 h-3" />{formatDate(s.date)}
                    </span>
                    {s.duration && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />{s.duration} min
                      </span>
                    )}
                  </div>
                </div>
                <Link to={`/dashboard/sessions/${s.id}`}>
                  <button className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors opacity-0 group-hover:opacity-100">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <NewSessionModal
          patients={patients}
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
