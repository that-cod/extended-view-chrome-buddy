
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch profile & set user state
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    const user_id = session?.user?.id;
    if (!user_id) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .maybeSingle();

    if (error || !data) {
      setUser(null);
      setIsLoading(false);
    } else {
      setUser({
        id: data.id,
        email: data.email,
        name: data.name,
        hasCompletedQuestionnaire: data.has_completed_questionnaire,
        hasUploadedStatement: data.has_uploaded_statement,
      });
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Set up Supabase auth event listener
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // 2. Fetch session on initial load
    fetchProfile();

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    await fetchProfile();
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    const redirectUrl = `${window.location.origin}/`; // Required for Supabase signUp
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {}, // You can provide { name } here if wanted
      },
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    // User still needs to verify email before appearing as "logged in"
    await fetchProfile(); // If they are already verified, get profile
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    // The page will redirect on success/failure.
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  // Update profile data in Supabase
  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    setIsLoading(true);
    const toUpdate: Partial<any> = {};
    if ('name' in updates) toUpdate.name = updates.name;
    if ('hasCompletedQuestionnaire' in updates) toUpdate.has_completed_questionnaire = updates.hasCompletedQuestionnaire;
    if ('hasUploadedStatement' in updates) toUpdate.has_uploaded_statement = updates.hasUploadedStatement;

    const { data, error } = await supabase
      .from('profiles')
      .update(toUpdate)
      .eq('id', user.id)
      .select()
      .single();

    if (error || !data) {
      setIsLoading(false);
      throw error || new Error('Failed to update user profile');
    }
    setUser({
      id: data.id,
      email: data.email,
      name: data.name,
      hasCompletedQuestionnaire: data.has_completed_questionnaire,
      hasUploadedStatement: data.has_uploaded_statement,
    });
    setIsLoading(false);
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
