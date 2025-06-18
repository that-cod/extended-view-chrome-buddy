
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
        // If it's an RLS error, the profile might still be created by the trigger
        if (error.message.includes('row-level security') || error.code === 'PGRST116') {
          console.log('RLS error, but profile might exist. Retrying...');
          // Wait a moment and try again in case the trigger is still processing
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          
          if (retryError) {
            console.error('Retry failed:', retryError);
            throw retryError;
          }
          
          if (retryData) {
            console.log('Profile found on retry:', retryData);
            return {
              id: retryData.id,
              email: retryData.email,
              name: retryData.name,
              hasCompletedQuestionnaire: retryData.has_completed_questionnaire,
              hasUploadedStatement: retryData.has_uploaded_statement,
            };
          }
        }
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
          // If profile creation fails due to trigger already creating it, try to fetch again
          if (createErr.code === '23505') { // Unique violation - profile already exists
            console.log('Profile already exists, fetching...');
            const { data: existingData, error: fetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            
            if (fetchError) {
              throw fetchError;
            }
            
            return {
              id: existingData.id,
              email: existingData.email,
              name: existingData.name,
              hasCompletedQuestionnaire: existingData.has_completed_questionnaire,
              hasUploadedStatement: existingData.has_uploaded_statement,
            };
          }
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
      setAuthError("Failed to fetch user profile. Please try refreshing the page.");
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initialize = async () => {
      try {
        setIsLoading(true);
        console.log('Initializing auth state...');
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.error('Auth initialization timeout');
            setIsLoading(false);
            setAuthError("Authentication timeout. Please refresh the page and try again.");
          }
        }, 10000); // 10 second timeout
        
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
        
        if (timeoutId) {
          clearTimeout(timeoutId);
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
        if (timeoutId) {
          clearTimeout(timeoutId);
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
            setAuthError("Failed to fetch user profile after sign-in. Please try refreshing the page.");
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
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
