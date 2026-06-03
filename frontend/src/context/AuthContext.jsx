import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true while we verify token on startup

  /* ── On mount: verify stored token with backend ── */
  useEffect(() => {
    const token = localStorage.getItem('driveease-token');
    if (!token) { setLoading(false); return; }

    api.auth.me()
      .then(res => setUser(res.user))
      .catch(() => {
        // Token invalid / expired — clear it
        localStorage.removeItem('driveease-token');
        localStorage.removeItem('driveease-user');
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Login ── */
  const login = useCallback(async (email, password) => {
    try {
      const res = await api.auth.login({ email, password });
      localStorage.setItem('driveease-token', res.token);
      localStorage.setItem('driveease-user',  JSON.stringify(res.user));
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  /* ── Register ── */
  const register = useCallback(async (data) => {
    try {
      const res = await api.auth.register(data);
      localStorage.setItem('driveease-token', res.token);
      localStorage.setItem('driveease-user',  JSON.stringify(res.user));
      setUser(res.user);
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  /* ── Logout ── */
  const logout = useCallback(() => {
    localStorage.removeItem('driveease-token');
    localStorage.removeItem('driveease-user');
    setUser(null);
  }, []);

  /* ── Update User (Profile/Avatar) ── */
  const updateUser = useCallback((updatedUser) => {
    localStorage.setItem('driveease-user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      updateUser,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
