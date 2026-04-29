import { useData } from '../context/DataContext.jsx';
import { useState, useEffect } from 'react';
import * as patientsApi from '../api/patients.js';

export function usePatients() {
  const { 
    patients, loadingPatients, fetchPatients, 
    addPatient, updatePatient, deletePatient 
  } = useData();

  return {
    patients,
    loading: loadingPatients,
    error: null,
    refetch: fetchPatients,
    addPatient,
    updatePatient,
    deletePatient
  };
}

export function usePatient(id) {
  const { patients, loadingPatients } = useData();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    // First try to find in context to avoid unnecessary fetch
    const found = patients.find(p => p.id === id);
    if (found) {
      setPatient(found);
      setLoading(false);
      return;
    }

    // Fallback to fetch if not in context
    setLoading(true);
    patientsApi.getPatient(id)
      .then((data) => { setPatient(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id, patients]);

  return { patient, loading: loading || loadingPatients, error };
}
