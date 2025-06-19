
import React, { createContext, useContext } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';

interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  hasCompletedQuestionnaire: boolean;
  hasUploadedStatement: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, isLoading, setIsLoading, updateUser, authError, setAuthError } = useAuthState();
  const { login: authLogin, signup: authSignup, loginWithGoogle: authLoginWithGoogle, logout: authLogout } = useAuthActions(setIsLoading);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await authLogin(email, password);
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthError(errorMessage);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await authSignup(email, password);
    } catch (error) {
      console.error('Signup error in AuthContext:', error);
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setAuthError(errorMessage);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      await authLoginWithGoogle();
    } catch (error) {
      console.error('Google login error in AuthContext:', error);
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      setAuthError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await authLogout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw here, just log the error
      // User should still be logged out from the auth service
      setUser(null);
    }
  };

  const wrappedUpdateUser = async (updates: Partial<UserProfile>) => {
    setAuthError(null);
    try {
      await updateUser(updates);
    } catch (error) {
      console.error('Update user error in AuthContext:', error);
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      setAuthError(errorMessage);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUser: wrappedUpdateUser,
        isLoading,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
