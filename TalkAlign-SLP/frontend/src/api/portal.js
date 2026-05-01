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

export const getMe = async () => {
  return fetchWithAuth('/portal/me');
};

export const getSessions = async () => {
  return fetchWithAuth('/portal/sessions');
};

export const getGoals = async () => {
  return fetchWithAuth('/portal/goals');
};

export const completeTask = async (taskId, completed) => {
  return fetchWithAuth(`/portal/tasks/${taskId}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
};
