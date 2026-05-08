import { createContext, useContext, useEffect, useState } from 'react';
import api, { clearAuthSession, getStoredUser, setAuthSession } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(localStorage.getItem('ai_interview_token'));
  const [loading, setLoading] = useState(Boolean(token) && !user);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
        setAuthSession(token, response.data.user);
      } catch (_error) {
        clearAuthSession();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    setAuthSession(response.data.token, response.data.user);
    setToken(response.data.token);
    setUser(response.data.user);
  }

  async function register(payload) {
    const response = await api.post('/auth/register', payload);
    setAuthSession(response.data.token, response.data.user);
    setToken(response.data.token);
    setUser(response.data.user);
  }

  function logout() {
    clearAuthSession();
    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
