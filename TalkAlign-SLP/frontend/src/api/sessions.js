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

export async function getSessions() {
  return fetchWithAuth('/sessions');
}

export async function getSessionsByPatient(patientId) {
  return fetchWithAuth(`/sessions?patientId=${patientId}`);
}

export async function getSession(id) {
  return fetchWithAuth(`/sessions/${id}`);
}

export async function createSession(data) {
  return fetchWithAuth('/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSession(id, data) {
  return fetchWithAuth(`/sessions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function saveSOAP(sessionId, soap) {
  return fetchWithAuth(`/sessions/${sessionId}/soap`, {
    method: 'POST',
    body: JSON.stringify({ soap }),
  });
}

export async function assignHomePractice(sessionId, tasks) {
  return fetchWithAuth(`/sessions/${sessionId}/home-practice`, {
    method: 'POST',
    body: JSON.stringify({ tasks }),
  });
}

export async function endSession(sessionId, data) {
  return fetchWithAuth(`/sessions/${sessionId}/end`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteSession(sessionId) {
  return fetchWithAuth(`/sessions/${sessionId}`, {
    method: 'DELETE'
  });
}

// Multipart upload — do NOT use fetchWithAuth (it adds Content-Type: application/json)
export async function uploadAudio(sessionId, formData) {
  const token = getToken();
  const res = await fetch(`${API_URL}/sessions/${sessionId}/audio`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Audio upload failed');
  }
  return json.data;
}
