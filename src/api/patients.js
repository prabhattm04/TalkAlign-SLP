// Patients API stub — replace with real HTTP calls when backend is ready
import { mockPatients } from '../data/mockPatients.js';

const FAKE_DELAY = 600;
const fakeDelay = (ms = FAKE_DELAY) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mutable in-memory store
let patients = [...mockPatients];

/** getPatients() → Patient[] */
export async function getPatients() {
  await fakeDelay();
  return [...patients];
}

/** getPatient(id) → Patient */
export async function getPatient(id) {
  await fakeDelay();
  const p = patients.find((p) => p.id === id);
  if (!p) throw new Error(`Patient ${id} not found.`);
  return { ...p };
}

/** addPatient(data) → Patient */
export async function addPatient(data) {
  await fakeDelay();
  const newPatient = {
    id: `p${Date.now()}`,
    totalSessions: 0,
    status: 'active',
    lastSession: null,
    ...data,
  };
  patients.push(newPatient);
  return { ...newPatient };
}

/** updatePatient(id, data) → Patient */
export async function updatePatient(id, data) {
  await fakeDelay();
  patients = patients.map((p) => (p.id === id ? { ...p, ...data } : p));
  return patients.find((p) => p.id === id);
}

/** deletePatient(id) → void */
export async function deletePatient(id) {
  await fakeDelay();
  patients = patients.filter((p) => p.id !== id);
}
