
import { supabase } from '@/integrations/supabase/client';

export const useAuthActions = (setIsLoading: (loading: boolean) => void) => {
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('Attempting login for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      throw error;
    }
    
    console.log('Login successful:', data.user?.id);
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('Attempting signup for:', email);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          email: email
        }
      }
    });
    
    if (error) {
      setIsLoading(false);
      console.error('Signup error:', error);
      throw error;
    }
    
    console.log('Signup successful:', data);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    console.log('Attempting Google login...');
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) {
      setIsLoading(false);
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    console.log('Logging out...');
    
    await supabase.auth.signOut();
    setIsLoading(false);
  };

  return { login, signup, loginWithGoogle, logout };
};
