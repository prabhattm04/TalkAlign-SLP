import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, User2, Mic2, CalendarDays, FileText, ChevronRight, Stethoscope } from 'lucide-react';
import { usePatient } from '../../hooks/usePatients.js';
import { useSessions } from '../../hooks/useSessions.js';
import { formatDate } from '../../utils/helpers.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import TherapyPlanWorkspace from '../../components/patient/TherapyPlanWorkspace.jsx';

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-brand-600" />
      </div>
      <div>
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function PatientDetail() {
  const { id } = useParams();
  const { patient, loading: pLoad } = usePatient(id);
  const { sessions: allSessions, loading: sLoad } = useSessions();
  const [activeTab, setActiveTab] = useState('overview');

  // Filter sessions for this patient
  const sessions = allSessions.filter(s => s.patient_id === id);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'Session History' },
    { id: 'therapy-plan', label: 'Therapy Plan' },
    { id: 'documents', label: 'Documents & Reports' }
  ];

  if (pLoad) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading patient…</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="card p-12 text-center">
        <p className="text-slate-500">Patient not found.</p>
        <Link to="/dashboard/patients">
          <Button variant="secondary" size="sm" className="mt-4">Back to Patients</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/dashboard/patients" className="text-slate-500 hover:text-brand-600 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Patients
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">{patient.name}</span>
      </div>

      {/* Hero card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-3xl gradient-brand flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {patient.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-slate-900">{patient.name}</h2>
              <Badge status={patient.status}>{patient.status}</Badge>
            </div>
            <p className="text-slate-500 text-sm">{patient.condition}</p>
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">Age {patient.age}</span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">{patient.gender}</span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">{sessions.length} sessions</span>
            </div>
          </div>
          <Link to={`/dashboard/sessions/new?patientId=${patient.id}`}>
            <Button variant="primary" size="md">
              <Mic2 className="w-4 h-4" />
              Start Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-5 animate-fade-in">
            {/* Info panel */}
            <div className="space-y-5">
              <div className="card p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Patient Info</h3>
                <div className="space-y-4">
                  <InfoItem icon={User2}     label="Full Name"   value={patient.name} />
                  <InfoItem icon={CalendarDays} label="Last Session" value={sessions.length > 0 ? formatDate([...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))[0].date) : 'No sessions yet'} />
                  <InfoItem icon={Stethoscope}  label="Condition"   value={patient.condition} />
                  <InfoItem icon={Phone}     label="Caregiver"   value={patient.caregiver_name} />
                  {patient.caregiver_phone && (
                    <InfoItem icon={Phone}   label="Phone"       value={patient.caregiver_phone} />
                  )}
                </div>
              </div>

              {/* Notes */}
              {patient.notes && (
                <div className="card p-6">
                  <h3 className="font-semibold text-slate-900 mb-3">Initial Observations</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{patient.notes}</p>
                </div>
              )}
            </div>

            {/* Interest Tags & Quick Stats */}
            <div className="lg:col-span-2 space-y-5">
              <div className="card p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Interests & Hobbies</h3>
                {patient.tags && patient.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {patient.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium border border-brand-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No interests logged yet.</p>
                )}
              </div>
              
              <div className="card p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Progress Snapshot</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500">Total Sessions</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{sessions.length}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500">Completed</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{sessions.filter(s => s.status === 'completed').length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Session History</h3>
              <span className="text-xs text-slate-400">{sessions.length} total sessions</span>
            </div>
            <div className="divide-y divide-slate-100">
              {sLoad ? (
                <div className="p-12 text-center text-slate-400 text-sm">Loading sessions…</div>
              ) : sessions.length === 0 ? (
                <div className="p-12 text-center">
                  <Mic2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium">No sessions yet</p>
                  <p className="text-slate-400 text-xs mt-1">Start a new session to begin recording progress.</p>
                </div>
              ) : (
                [...sessions]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((s) => (
                    <div key={s.id} className="px-6 py-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-brand-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-slate-900">{formatDate(s.date)}</p>
                              <Badge status={s.status}>{s.status}</Badge>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{s.summary}</p>
                            <p className="text-xs text-slate-400 mt-1">{s.duration} min · {s.therapist}</p>
                          </div>
                        </div>
                        <Link to={`/dashboard/sessions/${s.id}`}>
                          <Button variant="ghost" size="sm" className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            View SOAP <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'therapy-plan' && (
          <TherapyPlanWorkspace patientId={id} />
        )}

        {activeTab === 'documents' && (
          <div className="card p-12 text-center animate-fade-in">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Reports & Documents</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">Upload external evaluations, IEPs, or export TalkAlign progress reports here.</p>
            <Button variant="secondary" className="mt-6">Upload Document</Button>
          </div>
        )}
      </div>
    </div>
  );
}
