'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, AuthContextType } from '@/lib/types';
import { apiService } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (typeof window !== 'undefined') {
        const session = localStorage.getItem('auth_session');
        if (session) {
          const parsedSession = JSON.parse(session);
          if (parsedSession.user && parsedSession.token) {
            setUser(parsedSession.user);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store session
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_session', JSON.stringify({ user, token }));
        }
        setUser(user);
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await apiService.signup({ name, email, password });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store session
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_session', JSON.stringify({ user, token }));
        }
        setUser(user);
      } else {
        throw new Error('Signup failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  };

  const loginWithGoogle = async () => {
    // Placeholder for Google OAuth implementation
    throw new Error('Google login not implemented yet');
  };

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_session');
      }
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshAuth = async () => {
    try {
      if (typeof window !== 'undefined') {
        const session = localStorage.getItem('auth_session');
        if (session) {
          const parsedSession = JSON.parse(session);
          if (parsedSession.user) {
            setUser(parsedSession.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}