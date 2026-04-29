import { useData } from '../context/DataContext.jsx';
import { useState, useEffect } from 'react';
import * as sessionsApi from '../api/sessions.js';

export function useSessions() {
  const { 
    sessions, loadingSessions, fetchSessions, 
    createSession, updateSession, saveSOAP 
  } = useData();

  return {
    sessions,
    loading: loadingSessions,
    error: null,
    refetch: fetchSessions,
    createSession,
    updateSession,
    saveSOAP,
    assignHomePractice: async (sessionId, tasks) => {
      // Passthrough to API, then refetch if needed or just return
      const res = await sessionsApi.assignHomePractice(sessionId, tasks);
      fetchSessions(); // re-sync after tasks are assigned since they might be joined
      return res;
    }
  };
}

export function useSession(id) {
  const { sessions, loadingSessions } = useData();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    // First try to find in context
    const found = sessions.find(s => s.id === id);
    if (found) {
      setSession(found);
      setLoading(false);
      return;
    }

    setLoading(true);
    sessionsApi.getSession(id)
      .then((data) => { setSession(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id, sessions]);

  return { session, loading: loading || loadingSessions, error };
}
