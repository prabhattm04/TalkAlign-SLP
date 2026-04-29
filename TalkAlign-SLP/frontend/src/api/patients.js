const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

function getToken() {
  try {
    const stored = localStorage.getItem('talkalign_auth');
    if (stored) {
      return JSON.parse(stored).token;
    }
  } catch (e) {
    return null;
  }
  return null;
}

async function fetchWithAuth(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Request failed');
  }

  return json.data;
}

export async function getPatients() {
  return fetchWithAuth('/patients');
}

export async function getPatient(id) {
  return fetchWithAuth(`/patients/${id}`);
}

export async function addPatient(data) {
  return fetchWithAuth('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePatient(id, data) {
  return fetchWithAuth(`/patients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deletePatient(id) {
  return fetchWithAuth(`/patients/${id}`, {
    method: 'DELETE',
  });
}
