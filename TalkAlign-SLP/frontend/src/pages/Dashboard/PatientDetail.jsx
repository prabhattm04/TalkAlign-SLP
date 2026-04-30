import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, User2, Mic2, CalendarDays, FileText, ChevronRight, Stethoscope, Edit3, X, Clock, Trash2 } from 'lucide-react';
import { usePatient, usePatients } from '../../hooks/usePatients.js';
import { useSessions } from '../../hooks/useSessions.js';
import { formatDate } from '../../utils/helpers.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import TherapyPlanWorkspace from '../../components/patient/TherapyPlanWorkspace.jsx';

const INTEREST_TAGS = ['Dinosaurs', 'Space', 'Cars', 'Animals', 'Art', 'Music', 'Sports', 'Video Games'];

function EditPatientModal({ patient, onClose, onSave }) {
  const [form, setForm] = useState({
    name: patient.name || '',
    age: patient.age || '',
    gender: patient.gender || '',
    condition: patient.condition || '',
    caregiver: patient.caregiver_name || '',
    caregiver_phone: patient.caregiver_phone || '',
    caregiver_email: patient.caregiver_email || '',
    notes: patient.notes || '',
    tags: patient.tags || [],
    patient_id: patient.patient_id || ''
  });
  const [customTag, setCustomTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setErrors({});
    try {
      await onSave(patient.id, {
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        condition: form.condition,
        notes: form.notes || undefined,
        tags: form.tags,
        caregiver_name: form.caregiver || undefined,
        caregiver_phone: form.caregiver_phone || undefined,
        caregiver_email: form.caregiver_email || undefined,
        patient_id: form.patient_id || undefined
      });
      onClose();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to update patient.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-soft-lg border border-white w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="sticky top-0 bg-white/95 backdrop-blur-md flex items-center justify-between p-6 border-b border-slate-100/50 z-10">
          <h3 className="text-lg font-bold text-slate-900">Edit Patient Details</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {errors.submit && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {errors.submit}
            </div>
          )}
          
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">System & Demographics</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input id="edit-patient-id" label="Patient ID (System ID)" value={form.patient_id}
                onChange={(e) => setForm(f => ({...f, patient_id: e.target.value}))} />
              <Input id="edit-name" label="Full Name" value={form.name}
                onChange={(e) => setForm(f => ({...f, name: e.target.value}))} />
              <Input id="edit-age" label="Age" type="number" value={form.age}
                onChange={(e) => setForm(f => ({...f, age: e.target.value}))} />
              <div>
                <label className="form-label">Gender</label>
                <select className="form-input" value={form.gender} onChange={(e) => setForm(f => ({...f, gender: e.target.value}))}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Caregiver Contact</h4>
            <Input id="edit-caregiver" label="Caregiver Name" value={form.caregiver}
              onChange={(e) => setForm(f => ({...f, caregiver: e.target.value}))} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="edit-phone" label="Phone Number" value={form.caregiver_phone}
                onChange={(e) => setForm(f => ({...f, caregiver_phone: e.target.value}))} />
              <Input id="edit-email" label="Email Address" type="email" value={form.caregiver_email}
                onChange={(e) => setForm(f => ({...f, caregiver_email: e.target.value}))} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Clinical Info</h4>
            <Input id="edit-condition" label="Condition" value={form.condition}
              onChange={(e) => setForm(f => ({...f, condition: e.target.value}))} />
            <div>
              <label className="form-label">Initial Notes</label>
              <textarea className="form-input resize-none h-24" value={form.notes}
                onChange={(e) => setForm(f => ({...f, notes: e.target.value}))} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Interests & Hobbies</h4>
            <Input id="custom-tag-edit" placeholder="Type and press Enter…" value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); e.stopPropagation();
                  const val = customTag.trim();
                  if (val && !form.tags.includes(val)) setForm(f => ({ ...f, tags: [...f.tags, val] }));
                  setCustomTag('');
                }
              }} />
            <div className="flex flex-wrap gap-2 mt-2">
              {Array.from(new Set([...INTEREST_TAGS, ...form.tags])).map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${form.tags.includes(tag) ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={loading}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleSessionModal({ patientId, onClose, onSchedule }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSchedule = async () => {
    if (!date || !time) return;
    setLoading(true);
    try {
      const combinedDate = new Date(`${date}T${time}`).toISOString();
      await onSchedule({ patient_id: patientId, date: combinedDate, status: 'scheduled' });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-soft-lg w-full max-w-sm overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Schedule Session</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          <Input id="schedule-date" label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input id="schedule-time" label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <Button variant="primary" className="w-full mt-2" loading={loading} onClick={handleSchedule} disabled={!date || !time}>Schedule</Button>
        </div>
      </div>
    </div>
  );
}

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
  const { updatePatient } = usePatients();
  const { sessions: allSessions, loading: sLoad, createSession, deleteSession } = useSessions();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  // Filter sessions
  const sessions = allSessions.filter(s => s.patient_id === id);
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && new Date(s.date) > new Date()).sort((a,b) => new Date(a.date) - new Date(b.date));

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      try {
        await deleteSession(sessionId);
      } catch (err) {
        console.error("Failed to delete session:", err);
        alert(err.message || "Failed to delete session");
      }
    }
  };

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
              <div className="card p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Patient Info</h3>
                  <button onClick={() => setShowEditModal(true)} className="text-brand-600 hover:bg-brand-50 p-2 rounded-full transition-colors" title="Edit Patient">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {patient.patient_id && (
                    <InfoItem icon={User2}     label="System ID"   value={patient.patient_id} />
                  )}
                  <InfoItem icon={User2}     label="Full Name"   value={patient.name} />
                  <InfoItem icon={CalendarDays} label="Last Session" value={sessions.filter(s => s.status === 'completed').length > 0 ? formatDate([...sessions].filter(s => s.status === 'completed').sort((a, b) => new Date(b.date) - new Date(a.date))[0].date) : 'No sessions yet'} />
                  <InfoItem icon={Stethoscope}  label="Condition"   value={patient.condition} />
                  <InfoItem icon={Phone}     label="Caregiver"   value={patient.caregiver_name} />
                  {patient.caregiver_phone && (
                    <InfoItem icon={Phone}   label="Phone"       value={patient.caregiver_phone} />
                  )}
                  {patient.caregiver_email && (
                    <InfoItem icon={User2}   label="Email"       value={patient.caregiver_email} />
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

            {/* Interest Tags & Quick Stats & Upcoming Sessions */}
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

              {/* Upcoming Sessions */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Upcoming Sessions</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowScheduleModal(true)}>
                    <Clock className="w-4 h-4 mr-1" /> Schedule
                  </Button>
                </div>
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingSessions.map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-brand-50/50 border border-brand-100 p-3 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <CalendarDays className="w-4 h-4 text-brand-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{formatDate(s.date).split(' at ')[0] || formatDate(s.date)}</p>
                            <p className="text-xs text-brand-600 font-medium">at {new Date(s.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                        </div>
                        <Badge status="scheduled">Scheduled</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                    <p className="text-sm text-slate-500 font-medium">No session scheduled</p>
                    <p className="text-xs text-slate-400 mt-1">Book an upcoming session above.</p>
                  </div>
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
                  .map((s) => {
                    const isExpanded = expandedSessionId === s.id;
                    return (
                    <div key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group">
                      <div 
                        className="px-6 py-4 flex items-start justify-between gap-4 cursor-pointer"
                        onClick={() => setExpandedSessionId(isExpanded ? null : s.id)}
                      >
                        <div className="flex gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-brand-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-slate-900">{formatDate(s.date)}</p>
                              <Badge status={s.status}>{s.status}</Badge>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{s.summary || 'No summary available'}</p>
                            <p className="text-xs text-slate-400 mt-1">{s.duration || 0} min · Therapist</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Link to={`/dashboard/sessions/${s.id}`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              View SOAP <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                          <button 
                            onClick={(e) => handleDeleteSession(e, s.id)}
                            className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete Session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 animate-fade-in border-t border-slate-100/50 bg-slate-50/50">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                            {/* Left Col: Audio & Transcript */}
                            <div className="space-y-4">
                              {s.audio_file_path && (
                                <div className="card p-4">
                                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Audio Recording</h4>
                                  <audio controls className="w-full h-10" src={s.audio_file_path}>
                                    Your browser does not support the audio element.
                                  </audio>
                                </div>
                              )}
                              
                              <div className="card p-4">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Transcript</h4>
                                <div className="max-h-48 overflow-y-auto pr-2">
                                  {s.transcript ? (
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{typeof s.transcript === 'string' ? s.transcript : JSON.stringify(s.transcript)}</p>
                                  ) : (
                                    <p className="text-sm text-slate-400 italic">No transcript available.</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Col: SOAP & Notes */}
                            <div className="space-y-4">
                              <div className="card p-4 space-y-3">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">SOAP Notes</h4>
                                <div><strong className="text-sm text-slate-800">S:</strong> <span className="text-sm text-slate-600">{s.soap_subjective || '—'}</span></div>
                                <div><strong className="text-sm text-slate-800">O:</strong> <span className="text-sm text-slate-600">{s.soap_objective || '—'}</span></div>
                                <div><strong className="text-sm text-slate-800">A:</strong> <span className="text-sm text-slate-600">{s.soap_assessment || '—'}</span></div>
                                <div><strong className="text-sm text-slate-800">P:</strong> <span className="text-sm text-slate-600">{s.soap_plan || '—'}</span></div>
                              </div>

                              {s.ai_parent_summary && (
                                <div className="card p-4 bg-teal-50/50 border-teal-100">
                                  <h4 className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2">Parent Summary</h4>
                                  <p className="text-sm text-teal-900">{s.ai_parent_summary}</p>
                                </div>
                              )}
                              
                              <div className="card p-4">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Home Practice Tasks</h4>
                                {s.home_practice_tasks && s.home_practice_tasks.length > 0 ? (
                                  <ul className="list-disc pl-4 space-y-1">
                                    {s.home_practice_tasks.map((task, i) => (
                                      <li key={i} className="text-sm text-slate-700">{task.title} {task.completed ? '✅' : ''}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-slate-400">No task assigned</p>
                                )}
                              </div>
                              
                              {s.miscellaneous_notes && (
                                <div className="card p-4 bg-amber-50/50 border-amber-100">
                                  <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Misc Notes</h4>
                                  <p className="text-sm text-amber-900">{s.miscellaneous_notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )})
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

      {showEditModal && (
        <EditPatientModal patient={patient} onClose={() => setShowEditModal(false)} onSave={updatePatient} />
      )}
      {showScheduleModal && (
        <ScheduleSessionModal patientId={patient.id} onClose={() => setShowScheduleModal(false)} onSchedule={createSession} />
      )}
    </div>
  );
}
