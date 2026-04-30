import { useState, useEffect, useCallback } from 'react';
import * as goalsApi from '../api/goals.js';
import { useAuth } from '../context/AuthContext.jsx';

export function useGoals(patientId) {
  const { isAuthenticated } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await goalsApi.getGoals(patientId);
      setGoals(data);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId, isAuthenticated]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (data) => {
    const newGoal = await goalsApi.createGoal(data);
    setGoals(prev => [newGoal, ...prev]);
    return newGoal;
  };

  const editGoal = async (id, data) => {
    const updated = await goalsApi.updateGoal(id, data);
    setGoals(prev => prev.map(g => g.id === id ? updated : g));
    return updated;
  };

  const removeGoal = async (id) => {
    await goalsApi.deleteGoal(id);
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const suggestGoals = async () => {
    return goalsApi.suggestGoals(patientId);
  };

  return { goals, loading, refetch: fetchGoals, addGoal, editGoal, removeGoal, suggestGoals };
}
