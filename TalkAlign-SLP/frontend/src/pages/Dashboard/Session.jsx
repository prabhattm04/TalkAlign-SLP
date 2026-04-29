import { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mic, Square, Save, CheckCircle2,
  Loader2, Wand2, FileText, Lock, UploadCloud, MessageSquare, PlayCircle, Target
} from 'lucide-react';
import { useSession } from '../../hooks/useSessions.js';
import { usePatient } from '../../hooks/usePatients.js';
import { useGoals } from '../../hooks/useGoals.js';
import { createSession } from '../../api/sessions.js';
import { formatDate } from '../../utils/helpers.js';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

const SOAP_FIELDS = [
  { key: 'subjective', label: 'S — Subjective', placeholder: "Patient's and caregiver's report...", color: 'border-brand-300 focus:ring-brand-400' },
  { key: 'objective', label: 'O — Objective', placeholder: 'Measurable, observable data...', color: 'border-teal-300 focus:ring-teal-400' },
  { key: 'assessment', label: 'A — Assessment', placeholder: 'Clinical interpretation...', color: 'border-violet-300 focus:ring-violet-400' },
  { key: 'plan', label: 'P — Plan', placeholder: 'Goals for next session...', color: 'border-rose-300 focus:ring-rose-400' },
];

function StatusStepper({ status }) {
  const steps = [
    { key: 'recording', label: 'Recording', icon: Mic },
    { key: 'uploading', label: 'Uploading', icon: UploadCloud },
    { key: 'transcribing', label: 'Transcribing', icon: MessageSquare },
    { key: 'generating', label: 'Generating SOAP', icon: Wand2 },
  ];
  
  const currentIndex = steps.findIndex(s => s.key === status);
  if (currentIndex === -1 && status !== 'draft' && status !== 'finalized') return null;

  return (
    <div className="flex items-center gap-4 py-8 px-4 justify-center bg-slate-50/50 rounded-2xl border border-slate-100">
      {steps.map((step, idx) => {
        const active = idx === currentIndex;
        const passed = idx < currentIndex || status === 'draft' || status === 'finalized';
        const Icon = step.icon;
        
        return (
          <div key={step.key} className="flex items-center gap-4">
            <div className={`flex flex-col items-center gap-2 ${active ? 'opacity-100' : passed ? 'opacity-50 text-emerald-600' : 'opacity-30'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${active ? 'bg-brand-500 text-white shadow-soft animate-pulse' : passed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                {passed && !active ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-semibold ${active ? 'text-brand-700' : passed ? 'text-emerald-700' : 'text-slate-500'}`}>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-12 h-0.5 ${passed ? 'bg-emerald-200' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Session() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const isNew = id === 'new';

  const { session, loading: sLoad, saving, saveSOAP } = useSession(isNew ? null : id);
  const { patient: sessionPatient } = usePatient(isNew ? patientId : session?.patient_id);
  const { goals } = useGoals(sessionPatient?.id);

  // STATE MACHINE
  // idle -> recording -> uploading -> transcribing -> generating -> draft -> finalized
  const [status, setStatus] = useState(isNew ? 'idle' : 'draft');
  const [elapsed, setElapsed] = useState(0);
  const [soap, setSoap] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [transcript, setTranscript] = useState([]);
  const [saved, setSaved] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (session) {
      setSoap(session.soap || { subjective: '', objective: '', assessment: '', plan: '' });
      setTranscript(session.transcript || [
        { speaker: 'Therapist', text: "Let's review our minimal pairs. Ready?", time: "0:01" },
        { speaker: 'Patient', text: "Yes.", time: "0:05" },
        { speaker: 'Therapist', text: "Say 'Ring'.", time: "0:08" },
        { speaker: 'Patient', text: "Wing.", time: "0:10" }
      ]);
      setStatus(session.status === 'completed' ? 'finalized' : 'draft');
    }
  }, [session]);

  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  async function handleStartSession() {
    if (isNew && patientId) {
      const s = await createSession({ patientId, therapist: 'Dr. Aisha Nair' });
      setActiveSession(s);
    }
    setStatus('recording');
  }

  function handleStopRecording() {
    setStatus('uploading');
    
    setTimeout(() => {
      setStatus('transcribing');
      setTimeout(() => {
        setStatus('generating');
        setTimeout(() => {
          setSoap({
            subjective: "Patient arrived on time and appeared cooperative. Caregiver reports practicing /r/ words at home daily for 10 minutes. Patient expressed feeling 'better at saying words'.",
            objective: 'Administered 20-item articulation probe for /r/ in initial, medial, and final word positions. Accuracy: initial 80%, medial 70%, final 65%. Fluency maintained throughout session.',
            assessment: 'Patient is showing consistent progress in /r/ production across all word positions. Stimulability for /r/ blends has increased from 40% to 60% over last 3 sessions.',
            plan: 'Continue targeting /r/ in blends at word level. Introduce phrase-level practice in next session. Home program: 10 minutes daily reading aloud using provided word list.',
          });
          setTranscript([
            { speaker: 'Therapist', text: "Let's start our session. Can you say the 'R' words we practiced?", time: "0:01" },
            { speaker: 'Patient', text: "Rabbit. Red. Ring.", time: "0:05" },
            { speaker: 'Therapist', text: "Great job! Very clear. How did practice at home go?", time: "0:10" },
            { speaker: 'Caregiver', text: "We practiced 10 minutes every day. He's sounding much better.", time: "0:15" }
          ]);
          setStatus('draft');
        }, 2000);
      }, 2000);
    }, 1500);
  }

  async function handleSave() {
    const target = isNew ? activeSession : session;
    if (!target) return;
    await saveSOAP.call(null, soap); 
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleFinalize() {
    setStatus('finalized');
    handleSave();
  }

  const displayPatient = sessionPatient;
  const isProcessing = ['uploading', 'transcribing', 'generating'].includes(status);
  const isEditing = status === 'draft';
  const isFinalized = status === 'finalized';

  return (
    <div className="space-y-6 page-enter pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to={displayPatient ? `/dashboard/patients/${displayPatient.id}` : '/dashboard/patients'} className="text-slate-500 hover:text-brand-600 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {displayPatient?.name ?? 'Patients'}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Session Workspace</span>
      </div>

      {/* Header */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-slate-900">{isNew ? 'New Session' : `Session — ${formatDate(session?.date)}`}</h2>
            <Badge status={status}>{status}</Badge>
          </div>
          {displayPatient && (
            <p className="text-slate-500 text-sm">Patient: <span className="font-semibold text-slate-900">{displayPatient.name}</span></p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {status === 'idle' && (
            <Button variant="primary" size="md" onClick={handleStartSession}>
              <Mic className="w-4 h-4" /> Start Session
            </Button>
          )}
          {status === 'recording' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-bold animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                {formatTime(elapsed)}
              </div>
              <Button variant="danger" size="md" onClick={handleStopRecording}>
                <Square className="w-4 h-4 fill-current" /> Stop Recording
              </Button>
            </div>
          )}
          {isEditing && (
            <>
              {saved && <span className="text-sm font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved</span>}
              <Button variant="secondary" size="md" onClick={handleSave} loading={saving}>Save Draft</Button>
              <Button variant="primary" size="md" onClick={handleFinalize}><Lock className="w-4 h-4" /> Finalize Notes</Button>
            </>
          )}
          {isFinalized && (
            <Button variant="secondary" size="md"><FileText className="w-4 h-4" /> Export PDF</Button>
          )}
        </div>
      </div>

      {/* Target Goals Bar */}
      {status === 'idle' && goals && goals.length > 0 && (
        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-900">Targeted Goals for Today</h4>
            <div className="flex gap-2 mt-1">
              {goals.map((g, i) => (
                <span key={i} className="text-xs bg-white px-2 py-1 rounded-md border border-indigo-100 text-indigo-700 font-medium">
                  {g.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="card p-12 text-center animate-fade-in">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Processing Session</h3>
          <StatusStepper status={status} />
        </div>
      )}

      {/* Split Pane: Transcript & SOAP */}
      {(isEditing || isFinalized) && (
        <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
          
          {/* LEFT: Transcript */}
          <div className="card flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 rounded-t-3xl">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              <h3 className="font-semibold text-slate-900">Audio & Transcript</h3>
            </div>
            
            {/* Audio Player Stub */}
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <button className="text-brand-600 hover:text-brand-700 transition-colors"><PlayCircle className="w-8 h-8" /></button>
                <div className="flex-1">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-brand-500" />
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500">0:15 / 45:00</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {transcript.map((t, i) => (
                <div key={i} className={`flex flex-col ${t.speaker === 'Therapist' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-500">{t.speaker}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{t.time}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] ${t.speaker === 'Therapist' ? 'bg-brand-500 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                    {t.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: SOAP Editor */}
          <div className="card flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-3xl">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <h3 className="font-semibold text-slate-900">SOAP Notes</h3>
              </div>
              {isEditing && <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded-full">AI Generated Draft</span>}
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {SOAP_FIELDS.map(({ key, label, placeholder, color }) => (
                <div key={key}>
                  <label className="form-label flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                    <span className="font-semibold text-slate-800">{label}</span>
                  </label>
                  {isFinalized ? (
                    <div className="p-4 bg-slate-50 rounded-2xl text-sm text-slate-700 leading-relaxed border border-slate-100">
                      {soap[key]}
                    </div>
                  ) : (
                    <textarea
                      className={`w-full px-4 py-3 rounded-2xl border bg-white/50 text-slate-900 text-sm leading-relaxed transition-all focus:outline-none focus:ring-2 focus:border-transparent ${color}`}
                      placeholder={placeholder}
                      value={soap[key]}
                      onChange={(e) => setSoap((s) => ({ ...s, [key]: e.target.value }))}
                      rows={4}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Not started state */}
      {status === 'idle' && (
        <div className="card p-16 text-center mt-10">
          <div className="w-20 h-20 rounded-3xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <Mic className="w-10 h-10 text-brand-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Workspace Ready</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Click "Start Session" to begin recording. TalkAlign will transcribe the audio and automatically generate SOAP notes.
          </p>
          <Button variant="primary" size="lg" onClick={handleStartSession}>
            <Mic className="w-5 h-5" /> Start Recording
          </Button>
        </div>
      )}
    </div>
  );
}
