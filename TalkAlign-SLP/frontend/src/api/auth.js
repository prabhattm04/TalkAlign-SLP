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

/**
 * login({ email, password }) → { user, token }
 */
export async function login({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Login failed');
  }
  
  return {
    user: json.data.user,
    token: json.data.accessToken
  };
}

/**
 * register({ name, email, password, role }) → { user, token }
 */
export async function register({ name, email, password, role }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Registration failed');
  }
  
  return {
    user: json.data.user,
    token: json.data.accessToken
  };
}

/**
 * logout() → void
 */
export async function logout() {
  const token = getToken();
  if (!token) return true;
  
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (err) {
    console.error('Logout request failed', err);
  }
  
  return true;
}
