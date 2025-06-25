import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Initialize CSRF token and check auth status
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // First, get CSRF token
      await authAPI.getCurrentUser(); // This will trigger CSRF token retrieval
      
      // Then check if user is logged in
      const response = await authAPI.getCurrentUser();
      if (response.data.is_authenticated) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // User is not authenticated, which is fine
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      setUser(response.data.user);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      setUser(response.data.user);
      return { success: true, message: response.data.message };
    } catch (error) {
      // Handle field-specific errors
      const errors = error.response?.data || {};
      return {
        success: false,
        errors
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  const requestPasswordReset = async (data) => {
    return authAPI.requestPasswordReset(data);
  };

  const confirmPasswordReset = async (data) => {
    return authAPI.confirmPasswordReset(data);
  };

  const value = useMemo(() => ({
    user,
    login,
    signup,
    logout,
    loading,
    updateUser,
    setUser,
    isAuthenticated: !!user,
    requestPasswordReset,
    confirmPasswordReset
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
