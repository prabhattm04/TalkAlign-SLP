import { createContext, useContext, useReducer } from 'react';
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
  let nextState;
  switch (action.type) {
    case 'AUTH_START':
      nextState = { ...state, loading: true, error: null };
      break;
    case 'AUTH_SUCCESS':
      nextState = {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };
      // Persist SYNCHRONOUSLY so the token is available before any effects fire
      localStorage.setItem(
        'talkalign_auth',
        JSON.stringify({
          user: nextState.user,
          token: nextState.token,
          isAuthenticated: true,
        })
      );
      break;
    case 'AUTH_ERROR':
      nextState = { ...state, loading: false, error: action.payload };
      break;
    case 'LOGOUT':
      nextState = { ...initialState };
      localStorage.removeItem('talkalign_auth');
      break;
    case 'CLEAR_ERROR':
      nextState = { ...state, error: null };
      break;
    default:
      nextState = state;
  }
  return nextState;
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
