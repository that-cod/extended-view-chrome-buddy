
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  hasCompletedQuestionnaire: boolean;
  hasUploadedStatement: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual authentication
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        hasCompletedQuestionnaire: Math.random() > 0.5, // Random for demo
        hasUploadedStatement: Math.random() > 0.7, // Random for demo
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      console.log('User logged in:', mockUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual authentication
      const newUser: User = {
        id: Date.now().toString(),
        email,
        hasCompletedQuestionnaire: false,
        hasUploadedStatement: false,
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      console.log('User signed up:', newUser);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Dummy Google OAuth implementation
      const googleUser: User = {
        id: 'google_' + Date.now().toString(),
        email: 'user@gmail.com',
        name: 'Google User',
        hasCompletedQuestionnaire: false,
        hasUploadedStatement: false,
      };
      
      setUser(googleUser);
      localStorage.setItem('user', JSON.stringify(googleUser));
      console.log('User logged in with Google:', googleUser);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    console.log('User logged out');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
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
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
