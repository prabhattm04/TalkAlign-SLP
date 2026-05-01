export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export function getToken() {
  return localStorage.getItem('supabaseToken');
}

export async function fetchWithAuth(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    ...options.headers,
  };

  // Only add Content-Type if it's not a FormData request
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Dispatch a custom event to let the app know the token expired
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    
    // Try to parse structured error from backend
    try {
      const errData = await response.json();
      throw new Error(errData.error?.message || errData.message || 'API request failed');
    } catch (e) {
      if (e.message !== 'API request failed' && !e.message.includes('Unexpected end of JSON input') && !e.message.includes('Unexpected token')) {
          throw e; // It was a properly formatted API error
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
  }

  return response.json();
}
