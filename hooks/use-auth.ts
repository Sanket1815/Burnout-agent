'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authHelpers, AuthError } from '@/lib/auth';
import { sessionHelpers } from '@/lib/session';
import { User, AuthContextType } from '@/lib/types';

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
      const session = await sessionHelpers.validateSession();
      if (session) {
        setUser(session.user);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user, token } = await authHelpers.signIn(email, password);
      
      // Store session
      sessionHelpers.setSession({ user, token });
      setUser(user);
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Login failed');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const { user, token } = await authHelpers.signUp(name, email, password);
      
      // Store session
      sessionHelpers.setSession({ user, token });
      setUser(user);
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Signup failed');
    }
  };

  const loginWithGoogle = async () => {
    // Placeholder for Google OAuth implementation
    throw new Error('Google login not implemented yet');
  };

  const logout = async () => {
    try {
      sessionHelpers.clearSession();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshAuth = async () => {
    try {
      const session = await sessionHelpers.validateSession();
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
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