import { useState, useEffect, useCallback } from 'react';
import * as portalApi from '../api/portal.js';

export function usePortal() {
  const [data, setData] = useState({ caregiver: null, patients: [] });
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortalData = useCallback(async () => {
    try {
      setLoading(true);
      const [meData, sessionsData, goalsData] = await Promise.all([
        portalApi.getMe(),
        portalApi.getSessions(),
        portalApi.getGoals()
      ]);
      setData(meData);
      setSessions(sessionsData);
      setGoals(goalsData || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load portal data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  const toggleTask = async (taskId, completed) => {
    try {
      await portalApi.completeTask(taskId, completed);
      // Optimistically update sessions with new task status
      setSessions(prev => prev.map(s => {
        if (s.homePractice) {
          const updatedTasks = s.homePractice.map(t => 
            t.id === taskId ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t
          );
          return { ...s, homePractice: updatedTasks };
        }
        return s;
      }));
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  return {
    caregiver: data.caregiver,
    patients: data.patients,
    sessions,
    goals,
    loading,
    error,
    refetch: fetchPortalData,
    toggleTask
  };
}

export function usePortalSession(sessionId) {
  const { sessions, loading, toggleTask } = usePortal();
  
  const session = sessions.find(s => s.id === sessionId);
  
  return {
    session,
    loading,
    toggleTask
  };
}
