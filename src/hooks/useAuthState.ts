
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  hasCompletedQuestionnaire: boolean;
  hasUploadedStatement: boolean;
}

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    console.log('Fetching profile for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (!data) {
      console.log('No profile found, user may need to complete setup');
      return null;
    }

    console.log('Profile fetched successfully:', data);
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      hasCompletedQuestionnaire: data.has_completed_questionnaire,
      hasUploadedStatement: data.has_uploaded_statement,
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (session?.user) {
          console.log('Found existing session for user:', session.user.id);
          const profile = await fetchProfile(session.user.id);
          if (mounted) {
            setUser(profile);
          }
        } else {
          console.log('No existing session found');
          if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;

      if (session?.user) {
        if (event === 'SIGNED_IN' && session.user.created_at === session.user.updated_at) {
          setTimeout(async () => {
            const profile = await fetchProfile(session.user.id);
            if (mounted) {
              setUser(profile);
              setIsLoading(false);
            }
          }, 1000);
        } else {
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

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

  return { user, setUser, isLoading, setIsLoading, updateUser };
};
