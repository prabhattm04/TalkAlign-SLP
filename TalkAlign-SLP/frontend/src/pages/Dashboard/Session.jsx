import { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mic, Square, CheckCircle2,
  Wand2, FileText, Lock, UploadCloud, MessageSquare, PlayCircle, Target,
  Plus, Trash2, ClipboardList, Pause, Play, AlertCircle,
} from 'lucide-react';
import { useSession, useSessions } from '../../hooks/useSessions.js';
import { usePatient } from '../../hooks/usePatients.js';
import { useGoals } from '../../hooks/useGoals.js';
import { formatDate } from '../../utils/helpers.js';
import * as sessionsApi from '../../api/sessions.js';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

const SOAP_FIELDS = [
  { key: 'subjective', label: 'S — Subjective', placeholder: "Patient's and caregiver's report...", color: 'border-brand-300 focus:ring-brand-400' },
  { key: 'objective',  label: 'O — Objective',  placeholder: 'Measurable, observable data...',    color: 'border-teal-300 focus:ring-teal-400'  },
  { key: 'assessment', label: 'A — Assessment',  placeholder: 'Clinical interpretation...',        color: 'border-violet-300 focus:ring-violet-400' },
  { key: 'plan',       label: 'P — Plan',        placeholder: 'Goals for next session...',         color: 'border-rose-300 focus:ring-rose-400'   },
];

function StatusStepper({ status }) {
  const steps = [
    { key: 'recording',    label: 'Recording',       icon: Mic         },
    { key: 'uploading',    label: 'Uploading',        icon: UploadCloud },
    { key: 'transcribing', label: 'Transcribing',     icon: MessageSquare },
    { key: 'generating',   label: 'Generating SOAP',  icon: Wand2       },
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
  const navigate = useNavigate();

  const { session } = useSession(isNew ? null : id);
  const { saveSOAP, createSession: createNewSession, assignHomePractice, endSession: endSessionApi, deleteSession, refetch: refetchSessions } = useSessions();
  const { patient: sessionPatient } = usePatient(isNew ? patientId : session?.patient_id);
  const { goals } = useGoals(sessionPatient?.id);

  // ── UI state machine ──────────────────────────────────────────────────────
  // idle → choose → recording → uploading → transcribing → draft → finalized
  const [status, setStatus]           = useState(isNew ? 'idle' : 'loading');
  const [elapsed, setElapsed]         = useState(0);
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const [isPaused, setIsPaused]       = useState(false);
  const [soap, setSoap]               = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [rawTranscript, setRawTranscript] = useState('');
  const [transcript]                  = useState([]);  // legacy chat-bubble format (populated for old sessions)
  const [parentSummary, setParentSummary] = useState('');
  const [saved, setSaved]             = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [uploadError, setUploadError] = useState('');
  // Home practice
  const [tasks, setTasks]             = useState(['']);
  const [tasksSaving, setTasksSaving] = useState(false);
  const [tasksSaved, setTasksSaved]   = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const timerRef        = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef  = useRef([]);
  const recordingMimeRef = useRef('audio/webm');
  const streamRef       = useRef(null);
  const pollingRef      = useRef(null);
  const fileInputRef    = useRef(null);

  // ── Populate from existing session ───────────────────────────────────────
  useEffect(() => {
    if (!session) return;

    const dbStatus = session.status;

    if (dbStatus === 'completed') {
      setStatus('finalized');
      applySessionData(session);
    } else if (dbStatus === 'draft') {
      setStatus('draft');
      applySessionData(session);
    } else if (dbStatus === 'processing') {
      // Pipeline is still running — resume polling
      setStatus('transcribing');
      startPolling(session.id);
    } else {
      // in_progress, scheduled → ready for a new recording
      setStatus('idle');
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  function applySessionData(s) {
    setSoap({
      subjective: s.soap_subjective || '',
      objective:  s.soap_objective  || '',
      assessment: s.soap_assessment || '',
      plan:       s.soap_plan       || '',
    });
    setRawTranscript(typeof s.transcript === 'string' ? s.transcript : '');
    setParentSummary(s.ai_parent_summary || '');
  }

  // ── Session timer (runs while session is active) ────────────────────────────────
  useEffect(() => {
    // Run timer if session is active and not completed/draft
    const isActive = ['choose', 'recording', 'uploading', 'transcribing', 'generating'].includes(status);
    if (isActive && !isSessionPaused) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status, isSessionPaused]);

  // ── Cleanup polling on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ── Polling ───────────────────────────────────────────────────────────────
  function startPolling(sessionId) {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const data = await sessionsApi.getSession(sessionId);

        if (data.status === 'draft' || data.status === 'completed') {
          clearInterval(pollingRef.current);
          pollingRef.current = null;

          setSoap({
            subjective: data.soap_subjective || '',
            objective:  data.soap_objective  || '',
            assessment: data.soap_assessment || '',
            plan:       data.soap_plan       || '',
          });
          setRawTranscript(typeof data.transcript === 'string' ? data.transcript : '');
          setParentSummary(data.ai_parent_summary || '');
          setStatus(data.status === 'completed' ? 'finalized' : 'draft');
          refetchSessions();
        } else if (data.status === 'error') {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setUploadError('AI processing failed. Please try uploading the audio again.');
          setStatus('idle');
        }
      } catch (err) {
        console.error('[Polling] Error:', err.message);
      }
    }, 2000);
  }

  // ── Audio recording ───────────────────────────────────────────────────────
  async function handleStartRecording() {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setUploadError('Audio recording is not supported in this browser. Please upload a file instead.');
      return;
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? 'Microphone permission denied. Please allow microphone access and try again.'
        : 'Could not access the microphone. Check your device settings.';
      setUploadError(msg);
      return;
    }

    streamRef.current = stream;
    audioChunksRef.current = [];

    // Pick the best supported audio format
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : 'audio/ogg;codecs=opus';

    recordingMimeRef.current = mimeType;

    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000); // collect chunks every second
    setIsPaused(false);
    setElapsed(0);
    setStatus('recording');
    setUploadError('');
  }

  function handlePauseRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }

  function handleResumeRecording() {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  }

  async function handleStopRecording() {
    if (!mediaRecorderRef.current) return;

    const blob = await new Promise((resolve) => {
      mediaRecorderRef.current.onstop = () => {
        resolve(new Blob(audioChunksRef.current, { type: recordingMimeRef.current }));
      };
      mediaRecorderRef.current.stop();
    });

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;

    await submitAudio(blob, recordingMimeRef.current);
  }

  // ── File upload ───────────────────────────────────────────────────────────
  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset so the same file can be re-selected

    await submitAudio(file, file.type);
  }

  // ── Submit audio to backend ───────────────────────────────────────────────
  async function submitAudio(blob, mimetype) {
    const sessionId = isNew ? activeSession?.id : session?.id;
    if (!sessionId) {
      setUploadError('Session not ready. Please refresh and try again.');
      return;
    }

    setStatus('uploading');
    setUploadError('');

    try {
      const formData = new FormData();
      const ext = mimetype.startsWith('audio/webm') ? 'webm'
                : mimetype.startsWith('audio/wav')  ? 'wav'
                : mimetype.startsWith('audio/mpeg') ? 'mp3'
                : 'audio';
      formData.append('audio', blob, `session-${sessionId}.${ext}`);

      await sessionsApi.uploadAudio(sessionId, formData);

      setStatus('transcribing');
      startPolling(sessionId);
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
      setStatus('choose');
    }
  }

  // ── Session start ─────────────────────────────────────────────────────────
  async function handleStartSession() {
    if (isNew && patientId) {
      const newSession = await createNewSession({ patient_id: patientId });
      setActiveSession(newSession);
    }
    setStatus('choose');
    setUploadError('');
  }

  // ── Mode selection ────────────────────────────────────────────────────────
  async function handleChooseMode(mode) {
    if (mode === 'record') {
      await handleStartRecording();
    } else {
      fileInputRef.current?.click();
    }
  }

  // ── SOAP save / finalize ──────────────────────────────────────────────────
  async function handleSave() {
    const sessionId = isNew ? activeSession?.id : session?.id;
    if (!sessionId) return;
    await saveSOAP(sessionId, soap);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleFinalize() {
    setStatus('finalized');
    await handleSave();
  }

  async function handleEndSession() {
    const sessionId = isNew ? activeSession?.id : session?.id;
    if (!sessionId) return;
    setIsSessionPaused(true); // Stop timer
    try {
      await endSessionApi(sessionId, {
        end_time: new Date().toISOString(),
        duration: Math.ceil(elapsed / 60) || 1
      });
      setStatus('finalized');
      handleSave();
    } catch (err) {
      setIsSessionPaused(false);
      setUploadError(err.message || 'Failed to end session');
    }
  }

  function handlePauseSession() {
    setIsSessionPaused(true);
    if (status === 'recording' && !isPaused) {
      handlePauseRecording();
    }
  }

  function handleResumeSession() {
    setIsSessionPaused(false);
    if (status === 'recording' && isPaused) {
      handleResumeRecording();
    }
  }

  async function handleCancelSession() {
    if (window.confirm("Are you sure you want to cancel this session? It will be deleted permanently.")) {
      const sessionId = isNew ? activeSession?.id : session?.id;
      if (sessionId) {
        try {
          await deleteSession(sessionId);
        } catch (err) {
          console.error(err);
          setUploadError(err.message || 'Failed to cancel session');
          return;
        }
      }
      navigate(displayPatient ? `/dashboard/patients/${displayPatient.id}` : '/dashboard/sessions');
    }
  }

  // ── Home practice ─────────────────────────────────────────────────────────
  async function handleAssignTasks() {
    const sessionId = isNew ? activeSession?.id : session?.id;
    if (!sessionId) return;
    const validTasks = tasks.filter(t => t.trim()).map(t => ({ title: t.trim() }));
    if (validTasks.length === 0) return;
    setTasksSaving(true);
    try {
      await assignHomePractice(sessionId, validTasks);
      setTasksSaved(true);
      setTasks(['']);
      setTimeout(() => setTasksSaved(false), 3000);
    } finally {
      setTasksSaving(false);
    }
  }

  function addTaskField()            { setTasks(t => [...t, '']); }
  function updateTask(idx, value)    { setTasks(t => t.map((task, i) => i === idx ? value : task)); }
  function removeTask(idx)           { setTasks(t => t.length > 1 ? t.filter((_, i) => i !== idx) : ['']); }

  function formatTime(s) {
    const m   = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const displayPatient = sessionPatient;
  const isProcessing   = ['uploading', 'transcribing', 'generating'].includes(status);
  const isEditing      = status === 'draft';
  const isFinalized    = status === 'finalized';
  const existingTasks  = session?.home_practice_tasks ?? [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 page-enter pb-10">

      {/* Hidden file input for audio upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/webm,audio/wav,audio/wave,audio/mpeg,audio/mp3"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          to={displayPatient ? `/dashboard/patients/${displayPatient.id}` : '/dashboard/sessions'}
          className="text-slate-500 hover:text-brand-600 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {displayPatient?.name ?? 'Sessions'}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Session Workspace</span>
      </div>

      {/* Header card */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-slate-900">
              {isNew ? 'New Session' : `Session — ${formatDate(session?.date)}`}
            </h2>
            <Badge status={status}>{status}</Badge>
          </div>
          {displayPatient && (
            <p className="text-slate-500 text-sm">
              Patient: <span className="font-semibold text-slate-900">{displayPatient.name}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Display Session Timer if active */}
          {['choose', 'recording', 'uploading', 'transcribing', 'generating', 'draft'].includes(status) && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border ${isSessionPaused ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'} mr-2`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isSessionPaused ? 'bg-amber-500' : 'bg-green-500'}`} />
              {isSessionPaused ? 'Paused' : formatTime(elapsed)}
            </div>
          )}

          {['choose', 'recording'].includes(status) && (
            <>
              {isSessionPaused ? (
                <Button variant="secondary" size="md" onClick={handleResumeSession}>
                  <Play className="w-4 h-4" /> Resume
                </Button>
              ) : (
                <Button variant="ghost" size="md" onClick={handlePauseSession}>
                  <Pause className="w-4 h-4" /> Pause
                </Button>
              )}
              <Button variant="ghost" size="md" onClick={handleCancelSession} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                Cancel
              </Button>
            </>
          )}

          {status === 'choose' && (
            <Button variant="danger" size="md" onClick={handleEndSession}>
              <Square className="w-4 h-4" /> End Session
            </Button>
          )}

          {status === 'recording' && (
            <Button variant="danger" size="md" onClick={handleStopRecording}>
              <Square className="w-4 h-4 fill-current" /> Stop & Process
            </Button>
          )}

          {isEditing && (
            <>
              {saved && (
                <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Saved
                </span>
              )}
              <Button variant="secondary" size="md" onClick={handleSave}>Save Draft</Button>
              <Button variant="primary" size="md" onClick={handleEndSession}>
                <Lock className="w-4 h-4" /> End Session & Finalize
              </Button>
            </>
          )}

          {isFinalized && (
            <Button variant="secondary" size="md">
              <FileText className="w-4 h-4" /> Export PDF
            </Button>
          )}
        </div>
      </div>

      {/* Error banner */}
      {uploadError && (
        <div className="flex items-start gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{uploadError}</span>
          <button
            onClick={() => setUploadError('')}
            className="text-red-400 hover:text-red-600 flex-shrink-0 font-bold leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* Target Goals (idle / choose) */}
      {(status === 'idle' || status === 'choose') && goals && goals.length > 0 && (
        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-900">Targeted Goals for Today</h4>
            <div className="flex gap-2 mt-1 flex-wrap">
              {goals.map((g, i) => (
                <span key={i} className="text-xs bg-white px-2 py-1 rounded-md border border-indigo-100 text-indigo-700 font-medium">
                  {g.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Idle card — workspace not started */}
      {status === 'idle' && (
        <div className="card p-16 text-center mt-10">
          <div className="w-20 h-20 rounded-3xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <Mic className="w-10 h-10 text-brand-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Workspace Ready</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Click "Start Session" to begin. TalkAlign will transcribe the audio and automatically generate SOAP notes.
          </p>
          <Button variant="primary" size="lg" onClick={handleStartSession}>
            <Mic className="w-5 h-5" /> Start Session
          </Button>
        </div>
      )}

      {/* Choose mode — record or upload */}
      {status === 'choose' && (
        <div className="card p-10 mt-10 animate-fade-in">
          <h3 className="text-xl font-bold text-slate-900 text-center mb-2">How would you like to capture this session?</h3>
          <p className="text-slate-500 text-sm text-center mb-8 max-w-sm mx-auto">
            Record live with your microphone, or upload a pre-recorded audio file.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <button
              onClick={() => handleChooseMode('record')}
              className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-brand-200 hover:border-brand-400 hover:bg-brand-50/50 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                <Mic className="w-8 h-8 text-brand-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900">Record Audio</p>
                <p className="text-xs text-slate-500 mt-1">Use your microphone</p>
              </div>
            </button>
            <button
              onClick={() => handleChooseMode('upload')}
              className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-brand-600 transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900">Upload Audio File</p>
                <p className="text-xs text-slate-500 mt-1">WebM · WAV · MP3 — max 25 MB</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Processing stepper */}
      {isProcessing && (
        <div className="card p-12 text-center animate-fade-in">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Processing Session</h3>
          <StatusStepper status={status} />
          <p className="text-slate-400 text-sm mt-6">This may take a minute. You can leave this page — the session will be ready when you return.</p>
        </div>
      )}

      {/* Transcript + SOAP split pane */}
      {(isEditing || isFinalized) && (
        <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">

          {/* LEFT: Transcript */}
          <div className="card flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 rounded-t-3xl">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              <h3 className="font-semibold text-slate-900">Audio & Transcript</h3>
            </div>

            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <button className="text-brand-600 hover:text-brand-700 transition-colors">
                  <PlayCircle className="w-8 h-8" />
                </button>
                <div className="flex-1">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-brand-500" />
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500">— / —</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {rawTranscript ? (
                /* Whisper plain-text transcript */
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{rawTranscript}</p>
              ) : transcript.length > 0 ? (
                /* Legacy chat-bubble format */
                <div className="space-y-4">
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
              ) : (
                <p className="text-sm text-slate-400 italic">Transcript will appear here after processing.</p>
              )}
            </div>
          </div>

          {/* RIGHT: SOAP Editor */}
          <div className="card flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-3xl">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <h3 className="font-semibold text-slate-900">SOAP Notes</h3>
              </div>
              {isEditing && (
                <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded-full">
                  AI Generated Draft
                </span>
              )}
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
                      {soap[key] || <span className="text-slate-400 italic">Not recorded</span>}
                    </div>
                  ) : (
                    <textarea
                      className={`w-full px-4 py-3 rounded-2xl border bg-white/50 text-slate-900 text-sm leading-relaxed transition-all focus:outline-none focus:ring-2 focus:border-transparent ${color}`}
                      placeholder={placeholder}
                      value={soap[key]}
                      onChange={e => setSoap(s => ({ ...s, [key]: e.target.value }))}
                      rows={4}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Parent Summary */}
      {(isEditing || isFinalized) && parentSummary && (
        <div className="card animate-fade-in">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-slate-900">Parent / Caregiver Summary</h3>
            <span className="ml-auto text-xs font-medium text-teal-700 bg-teal-50 px-2 py-1 rounded-full">AI Generated</span>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-700 leading-relaxed">{parentSummary}</p>
          </div>
        </div>
      )}

      {/* Home Practice Tasks */}
      {(isEditing || isFinalized) && (
        <div className="card animate-fade-in">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-slate-900">Home Practice Tasks</h3>
          </div>
          <div className="p-6 space-y-4">

            {existingTasks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Tasks</p>
                {existingTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${task.completed ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <span className="text-sm text-slate-800 flex-1">{task.title}</span>
                    {task.completed && (
                      <span className="text-xs text-emerald-600 font-medium">Completed</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isEditing && (
              <div className="space-y-3">
                {existingTasks.length > 0 && (
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">Add More Tasks</p>
                )}
                {tasks.map((task, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                      placeholder={`Task ${idx + 1} — e.g. Practice /r/ words for 10 minutes`}
                      value={task}
                      onChange={e => updateTask(idx, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeTask(idx)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-1">
                  <Button type="button" variant="ghost" size="sm" onClick={addTaskField}>
                    <Plus className="w-4 h-4" /> Add Task
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    loading={tasksSaving}
                    disabled={tasks.every(t => !t.trim())}
                    onClick={handleAssignTasks}
                  >
                    {tasksSaved
                      ? <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Assigned!</>
                      : 'Assign Tasks'
                    }
                  </Button>
                </div>
              </div>
            )}

            {isFinalized && existingTasks.length === 0 && (
              <p className="text-sm text-slate-400">No home practice tasks were assigned for this session.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
