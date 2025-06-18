
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
  const { user, setUser, isLoading, setIsLoading, updateUser, authError } = useAuthState();
  const { login, signup, loginWithGoogle, logout: authLogout } = useAuthActions(setIsLoading);

  const logout = async () => {
    try {
      setIsLoading(true);
      await authLogout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw here, just log the error
      // User should still be logged out from the auth service
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Wrap auth actions with proper error handling
  const wrappedLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error; // Re-throw so UI can handle it
    }
  };

  const wrappedSignup = async (email: string, password: string) => {
    try {
      await signup(email, password);
    } catch (error) {
      console.error('Signup error in AuthContext:', error);
      throw error; // Re-throw so UI can handle it
    }
  };

  const wrappedLoginWithGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login error in AuthContext:', error);
      throw error; // Re-throw so UI can handle it
    }
  };

  const wrappedUpdateUser = async (updates: Partial<UserProfile>) => {
    try {
      await updateUser(updates);
    } catch (error) {
      console.error('Update user error in AuthContext:', error);
      throw error; // Re-throw so UI can handle it
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: wrappedLogin,
        signup: wrappedSignup,
        loginWithGoogle: wrappedLoginWithGoogle,
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
