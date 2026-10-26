import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('hostel_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hostel_user');
    return saved ? JSON.parse(saved) : null;
  });
  // Active UI view mode ('student' or 'warden')
  const [role, setRole] = useState(() => {
    return localStorage.getItem('hostel_role') || (user?.role === 'warden' ? 'warden' : 'student');
  });
  const [loading, setLoading] = useState(true);

  // Sync token and role to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('hostel_token', token);
    } else {
      localStorage.removeItem('hostel_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('hostel_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hostel_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('hostel_role', role);
  }, [role]);

  // Verify token on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.data.user) {
            setUser(res.data.user);
            if (res.data.user.role === 'warden' && !localStorage.getItem('hostel_role')) {
              setRole('warden');
            }
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      setRole(res.data.user.role);
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.auth.register(name, email, password);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      setRole('student');
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole('student');
    localStorage.removeItem('hostel_token');
    localStorage.removeItem('hostel_user');
    localStorage.setItem('hostel_role', 'student');
  };

  const toggleRole = () => {
    const nextRole = role === 'student' ? 'warden' : 'student';
    setRole(nextRole);
    return nextRole;
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      role,
      setRole,
      loading,
      isAuthenticated: !!token && !!user,
      isWarden: (user && user.role === 'warden') || role === 'warden',
      hasWardenPrivileges: user && user.role === 'warden',
      login,
      register,
      logout,
      toggleRole
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
