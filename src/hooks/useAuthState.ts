
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

  const fetchUserProfile = async (userId: string, email: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
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
          
          if (createError) {
            console.error('Error creating profile:', createError);
            throw createError;
          }
          
          return {
            id: newProfile.id,
            email: newProfile.email,
            name: newProfile.name,
            hasCompletedQuestionnaire: newProfile.has_completed_questionnaire,
            hasUploadedStatement: newProfile.has_uploaded_statement,
          };
        }
        throw error;
      }
      
      if (!data) {
        // Profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
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
        
        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }
        
        return {
          id: newProfile.id,
          email: newProfile.email,
          name: newProfile.name,
          hasCompletedQuestionnaire: newProfile.has_completed_questionnaire,
          hasUploadedStatement: newProfile.has_uploaded_statement,
        };
      }
      
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        hasCompletedQuestionnaire: data.has_completed_questionnaire,
        hasUploadedStatement: data.has_uploaded_statement,
      };
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      throw err;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }
        
        if (session?.user && mounted) {
          console.log('Found existing session for user:', session.user.id);
          const profile = await fetchUserProfile(session.user.id, session.user.email || '');
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
        console.error('Error during auth initialization:', error);
        if (mounted) {
          setUser(null);
          setAuthError('Failed to initialize authentication. Please refresh the page.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        setIsLoading(true);
        setAuthError(null);
        try {
          const profile = await fetchUserProfile(session.user.id, session.user.email || '');
          if (mounted) {
            setUser(profile);
            console.log('User profile set:', profile);
          }
        } catch (error) {
          console.error('Error during auth state change:', error);
          if (mounted) {
            setUser(null);
            setAuthError('Failed to fetch user profile. Please try again.');
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

    // Initialize auth
    initializeAuth();

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

    if (error) throw error;
    if (!data) throw new Error('Failed to update user profile');

    const updatedUser = {
      id: data.id,
      email: data.email,
      name: data.name,
      hasCompletedQuestionnaire: data.has_completed_questionnaire,
      hasUploadedStatement: data.has_uploaded_statement,
    };

    setUser(updatedUser);
  };

  return { user, setUser, isLoading, setIsLoading, updateUser, authError, setAuthError };
};
