import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('fp_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('fp_token'));
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authService.login(credentials);
      localStorage.setItem('fp_token', data.token);
      localStorage.setItem('fp_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Erro ao fazer login.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data } = await authService.register(userData);
      localStorage.setItem('fp_token', data.token);
      localStorage.setItem('fp_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Erro ao registrar.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
