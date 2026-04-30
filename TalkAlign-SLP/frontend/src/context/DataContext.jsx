import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as patientsApi from '../api/patients.js';
import * as sessionsApi from '../api/sessions.js';
import { useAuth } from './AuthContext.jsx';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const isParent = user?.role === 'parent';

  const fetchPatients = useCallback(async () => {
    if (!isAuthenticated || isParent) {
      setLoadingPatients(false);
      return;
    }
    setLoadingPatients(true);
    try {
      const data = await patientsApi.getPatients();
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPatients(false);
    }
  }, [isAuthenticated]);

  const fetchSessions = useCallback(async () => {
    if (!isAuthenticated || isParent) {
      setLoadingSessions(false);
      return;
    }
    setLoadingSessions(true);
    try {
      const data = await sessionsApi.getSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSessions(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPatients();
      fetchSessions();
    } else {
      setPatients([]);
      setSessions([]);
    }
  }, [isAuthenticated, fetchPatients, fetchSessions]);

  // Patients API wrappers
  const addPatient = async (data) => {
    const newPatient = await patientsApi.addPatient(data);
    setPatients(prev => [newPatient, ...prev]);
    return newPatient;
  };

  const updatePatient = async (id, data) => {
    const updated = await patientsApi.updatePatient(id, data);
    setPatients(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const deletePatient = async (id) => {
    await patientsApi.deletePatient(id);
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  // Sessions API wrappers
  const createSession = async (data) => {
    const newSession = await sessionsApi.createSession(data);
    setSessions(prev => [newSession, ...prev]);
    return newSession;
  };

  const updateSession = async (id, data) => {
    const updated = await sessionsApi.updateSession(id, data);
    setSessions(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  };

  const saveSOAP = async (sessionId, soap) => {
    const updated = await sessionsApi.saveSOAP(sessionId, soap);
    setSessions(prev => prev.map(s => s.id === sessionId ? updated : s));
    return updated;
  };

  const deleteSession = async (id) => {
    await sessionsApi.deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <DataContext.Provider value={{
      patients, loadingPatients, fetchPatients, addPatient, updatePatient, deletePatient,
      sessions, loadingSessions, fetchSessions, createSession, updateSession, saveSOAP, deleteSession
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
