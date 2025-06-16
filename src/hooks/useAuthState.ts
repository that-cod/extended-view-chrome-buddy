
import { useState, useEffect } from 'react';
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
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchAndEnsureProfile = async (userId: string, email: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No profile found, creating new profile for user:', userId);
        const { data: created, error: createErr } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email,
            name: null,
            has_completed_questionnaire: false,
            has_uploaded_statement: false
          })
          .select()
          .single();
        
        if (createErr) {
          console.error('Error creating profile:', createErr);
          throw createErr;
        }
        
        console.log('Profile created successfully:', created);
        return {
          id: created.id,
          email: created.email,
          name: created.name,
          hasCompletedQuestionnaire: created.has_completed_questionnaire,
          hasUploadedStatement: created.has_uploaded_statement,
        };
      }
      
      console.log('Profile found:', data);
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        hasCompletedQuestionnaire: data.has_completed_questionnaire,
        hasUploadedStatement: data.has_uploaded_statement,
      };
    } catch (err) {
      console.error('Error in fetchAndEnsureProfile:', err);
      setAuthError("Failed to fetch user profile. Please try again.");
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setIsLoading(true);
        console.log('Initializing auth state...');
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          console.log('Found existing session for user:', session.user.id);
          const profile = await fetchAndEnsureProfile(session.user.id, session.user.email || '');
          if (mounted) {
            setUser(profile);
            setAuthError(null);
          }
        } else if (mounted) {
          console.log('No existing session found');
          setUser(null);
          setAuthError(null);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        if (mounted) {
          setUser(null);
          setAuthError("Authentication failed. Please check your network connection and try again.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        setIsLoading(true);
        setAuthError(null);
        try {
          const profile = await fetchAndEnsureProfile(session.user.id, session.user.email || '');
          if (mounted) {
            setUser(profile);
            console.log('User profile set:', profile);
          }
        } catch (error) {
          console.error('Error during auth state change:', error);
          if (mounted) {
            setUser(null);
            setAuthError("Failed to fetch user profile on auth state change.");
          }
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      } else {
        console.log('User signed out or no session');
        setUser(null);
        setIsLoading(false);
        setAuthError(null);
      }
    });

    initialize();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user to update');
    
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

    if (error || !data) throw error || new Error('Failed to update user profile');

    const updatedUser = {
      id: data.id,
      email: data.email,
      name: data.name,
      hasCompletedQuestionnaire: data.has_completed_questionnaire,
      hasUploadedStatement: data.has_uploaded_statement,
    };

    setUser(updatedUser);
  };

  return { user, setUser, isLoading, setIsLoading, updateUser, authError };
};
