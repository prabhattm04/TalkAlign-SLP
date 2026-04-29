import { useState, useEffect, useCallback } from 'react';
import * as sessionsApi from '../api/sessions.js';

export function useSessions(patientId = null) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = patientId
        ? await sessionsApi.getSessionsByPatient(patientId)
        : await sessionsApi.getSessions();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  return { sessions, loading, error, refetch: fetchSessions };
}

export function useSession(id) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    sessionsApi.getSession(id)
      .then((data) => { setSession(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id]);

  async function saveSOAP(soap) {
    setSaving(true);
    try {
      const updated = await sessionsApi.saveSOAP(id, soap);
      setSession(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  }

  async function updateSession(data) {
    const updated = await sessionsApi.updateSession(id, data);
    setSession(updated);
    return updated;
  }

  return { session, loading, error, saving, saveSOAP, updateSession };
}
