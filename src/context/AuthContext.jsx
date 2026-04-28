import { createContext, useContext, useReducer, useEffect } from 'react';
import * as authApi from '../api/auth.js';

// ── State shape ────────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// ── Reducer ────────────────────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };
    case 'AUTH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...initialState };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState, () => {
    // Rehydrate from localStorage on mount
    try {
      const stored = localStorage.getItem('talkalign_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...initialState, ...parsed, loading: false };
      }
    } catch {
      // ignore parse errors
    }
    return initialState;
  });

  // Persist auth state to localStorage
  useEffect(() => {
    if (state.isAuthenticated) {
      localStorage.setItem(
        'talkalign_auth',
        JSON.stringify({
          user: state.user,
          token: state.token,
          isAuthenticated: true,
        })
      );
    } else {
      localStorage.removeItem('talkalign_auth');
    }
  }, [state.isAuthenticated, state.user, state.token]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  async function login(credentials) {
    dispatch({ type: 'AUTH_START' });
    try {
      const result = await authApi.login(credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: result });
      return result;
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR', payload: err.message });
      throw err;
    }
  }

  async function register(data) {
    dispatch({ type: 'AUTH_START' });
    try {
      const result = await authApi.register(data);
      dispatch({ type: 'AUTH_SUCCESS', payload: result });
      return result;
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR', payload: err.message });
      throw err;
    }
  }

  function logout() {
    dispatch({ type: 'LOGOUT' });
  }

  function clearError() {
    dispatch({ type: 'CLEAR_ERROR' });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
