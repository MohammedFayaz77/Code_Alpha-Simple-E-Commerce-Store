import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fayaz_eventflow_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyUser() {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    }

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data.success) {
      localStorage.setItem('fayaz_eventflow_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.data.success) {
      localStorage.setItem('fayaz_eventflow_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('fayaz_eventflow_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    if (res.data.success) {
      setUser(res.data.user);
      return res.data.user;
    }
  };

  // Demo accounts helper for effortless evaluation
  const fastDemoLogin = async (demoEmail) => {
    const passwords = {
      'fayaz@eventflow.io': 'Fayaz@123',
      'sarah.chen@eventflow.io': 'Password@123',
      'alex.morgan@eventflow.io': 'Password@123',
      'priya.sharma@eventflow.io': 'Password@123',
      'david.miller@eventflow.io': 'Password@123'
    };
    const password = passwords[demoEmail] || 'Password@123';
    return await login(demoEmail, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        fastDemoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
