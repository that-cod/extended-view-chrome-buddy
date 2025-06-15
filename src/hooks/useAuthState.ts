
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

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log('Fetching profile for user:', userId);
    
    try {
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
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (session?.user) {
          console.log('Found existing session, fetching profile...');
          const profile = await fetchProfile(session.user.id);
          if (mounted) {
            setUser(profile);
            setIsLoading(false);
          }
        } else {
          console.log('No existing session found');
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;

      try {
        if (session?.user) {
          console.log('User signed in, fetching profile...');
          const profile = await fetchProfile(session.user.id);
          setUser(profile);
        } else {
          console.log('User signed out');
          setUser(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('No user to update');
    }
    
    console.log('Updating user profile:', updates);
    
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
      console.error('Error updating profile:', error);
      throw error || new Error('Failed to update user profile');
    }
    
    const updatedUser = {
      id: data.id,
      email: data.email,
      name: data.name,
      hasCompletedQuestionnaire: data.has_completed_questionnaire,
      hasUploadedStatement: data.has_uploaded_statement,
    };
    
    console.log('Profile updated successfully:', updatedUser);
    setUser(updatedUser);
  };

  return { user, setUser, isLoading, setIsLoading, updateUser };
};
