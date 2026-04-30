import { useData } from '../context/DataContext.jsx';
import { useState, useEffect } from 'react';
import * as sessionsApi from '../api/sessions.js';

export function useSessions() {
  const { 
    sessions, loadingSessions, fetchSessions, 
    createSession, updateSession, saveSOAP, deleteSession 
  } = useData();

  return {
    sessions,
    loading: loadingSessions,
    error: null,
    refetch: fetchSessions,
    createSession,
    updateSession,
    saveSOAP,
    deleteSession,
    assignHomePractice: async (sessionId, tasks) => {
      // Passthrough to API, then refetch if needed or just return
      const res = await sessionsApi.assignHomePractice(sessionId, tasks);
      fetchSessions(); // re-sync after tasks are assigned since they might be joined
      return res;
    },
    endSession: async (sessionId, data) => {
      const res = await sessionsApi.endSession(sessionId, data);
      fetchSessions();
      return res;
    }
  };
}

export function useSession(id) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Always fetch from the detail endpoint so home_practice_tasks are included.
  // The sessions list query omits that join, so the context cache cannot be used here.
  useEffect(() => {
    if (!id) { setLoading(false); return; }

    setLoading(true);
    setError(null);
    sessionsApi.getSession(id)
      .then(data  => { setSession(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  }, [id]);

  return { session, loading, error };
}
