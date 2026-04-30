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


export async function getGoals(patientId) {
  let url = '/goals';
  if (patientId) {
    url += `?patientId=${patientId}`;
  }
  return fetchWithAuth(url);
}

export async function createGoal(data) {
  return fetchWithAuth('/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateGoal(id, data) {
  return fetchWithAuth(`/goals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteGoal(id) {
  return fetchWithAuth(`/goals/${id}`, {
    method: 'DELETE',
  });
}

export async function suggestGoals(patientId) {
  return fetchWithAuth('/goals/suggest', {
    method: 'POST',
    body: JSON.stringify({ patient_id: patientId }),
  });
}
