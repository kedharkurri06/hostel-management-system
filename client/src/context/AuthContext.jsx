import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('hostel_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hostel_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('hostel_token', token);
    } else {
      localStorage.removeItem('hostel_token');
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('hostel_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hostel_user');
    }
  }, [user]);

  // Authenticate and verify user profile from backend on mount or when token changes
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('hostel_token');
      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.data && res.data.user) {
            setUser(res.data.user);
          } else {
            // Invalid session
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.warn('Session verification failed, clearing auth:', err.message);
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.auth.login(identifier, password);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('hostel_token', res.data.token);
      localStorage.setItem('hostel_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const register = async (name, email, password, studentId) => {
    const res = await api.auth.register(name, email, password, studentId);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('hostel_token', res.data.token);
      localStorage.setItem('hostel_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hostel_token');
    localStorage.removeItem('hostel_user');
    localStorage.removeItem('hostel_role');
  };

  // Role strictly derived from the authenticated database user record
  const role = user ? user.role : null;
  const isAuthenticated = !!token && !!user;
  const isWarden = isAuthenticated && role === 'warden';
  const isStudent = isAuthenticated && role === 'student';

  return (
    <AuthContext.Provider value={{
      token,
      user,
      role,
      loading,
      isAuthenticated,
      isWarden,
      isStudent,
      hasWardenPrivileges: isWarden,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
