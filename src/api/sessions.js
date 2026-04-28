// Sessions API stub — replace with real HTTP calls when backend is ready
import { mockSessions } from '../data/mockSessions.js';

const FAKE_DELAY = 600;
const fakeDelay = (ms = FAKE_DELAY) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mutable in-memory store
let sessions = [...mockSessions];

/** getSessions() → Session[] */
export async function getSessions() {
  await fakeDelay();
  return [...sessions];
}

/** getSessionsByPatient(patientId) → Session[] */
export async function getSessionsByPatient(patientId) {
  await fakeDelay();
  return sessions.filter((s) => s.patientId === patientId);
}

/** getSession(id) → Session */
export async function getSession(id) {
  await fakeDelay();
  const s = sessions.find((s) => s.id === id);
  if (!s) throw new Error(`Session ${id} not found.`);
  return { ...s };
}

/** createSession(data) → Session */
export async function createSession(data) {
  await fakeDelay();
  const newSession = {
    id: `s${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    status: 'in-progress',
    soap: { subjective: '', objective: '', assessment: '', plan: '' },
    ...data,
  };
  sessions.push(newSession);
  return { ...newSession };
}

/** updateSession(id, data) → Session */
export async function updateSession(id, data) {
  await fakeDelay();
  sessions = sessions.map((s) => (s.id === id ? { ...s, ...data } : s));
  return sessions.find((s) => s.id === id);
}

/** saveSOAP(sessionId, soap) → Session */
export async function saveSOAP(sessionId, soap) {
  await fakeDelay();
  return updateSession(sessionId, { soap, status: 'completed' });
}
