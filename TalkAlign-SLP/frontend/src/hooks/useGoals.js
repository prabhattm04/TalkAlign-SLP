import { useState, useEffect } from 'react';
import { mockGoals } from '../data/mockGoals.js';

export function useGoals(patientId) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      if (patientId) {
        setGoals(mockGoals.filter(g => g.patientId === patientId));
      } else {
        setGoals(mockGoals);
      }
      setLoading(false);
    }, 400); // Small delay for realism

    return () => clearTimeout(timer);
  }, [patientId]);

  return { goals, loading };
}
