import { useState, useEffect, useCallback } from 'react';
import * as patientsApi from '../api/patients.js';

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientsApi.getPatients();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  async function addPatient(data) {
    const newPatient = await patientsApi.addPatient(data);
    setPatients((prev) => [...prev, newPatient]);
    return newPatient;
  }

  async function updatePatient(id, data) {
    const updated = await patientsApi.updatePatient(id, data);
    setPatients((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }

  async function deletePatient(id) {
    await patientsApi.deletePatient(id);
    setPatients((prev) => prev.filter((p) => p.id !== id));
  }

  return { patients, loading, error, refetch: fetchPatients, addPatient, updatePatient, deletePatient };
}

export function usePatient(id) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    patientsApi.getPatient(id)
      .then((data) => { setPatient(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id]);

  return { patient, loading, error };
}
