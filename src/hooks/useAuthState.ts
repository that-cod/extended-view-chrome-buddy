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

  // Helper for creating a profile if one doesn't exist
  const createProfileIfMissing = useCallback(async (userId: string, email: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
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

      if (error || !data) return null;

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        hasCompletedQuestionnaire: data.has_completed_questionnaire,
        hasUploadedStatement: data.has_uploaded_statement
      };
    } catch {
      return null;
    }
  }, []);

  // Get profile, fallback to creating if needed
  const fetchProfile = useCallback(
    async (userId: string, email: string): Promise<UserProfile | null> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error || !data) {
          // Try to create profile if missing
          return await createProfileIfMissing(userId, email);
        }

        return {
          id: data.id,
          email: data.email,
          name: data.name,
          hasCompletedQuestionnaire: data.has_completed_questionnaire,
          hasUploadedStatement: data.has_uploaded_statement,
        };
      } catch {
        // Fallback
        return await createProfileIfMissing(userId, email);
      }
    },
    [createProfileIfMissing]
  );

  useEffect(() => {
    let mounted = true;
    let loadingFinished = false;

    // Always ensure isLoading flipped in all cases
    const finishLoading = () => {
      if (!loadingFinished) {
        setIsLoading(false);
        loadingFinished = true;
      }
    };

    // Initialize session and user
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.user.email || '');
          if (mounted) setUser(profile);
        } else {
          if (mounted) setUser(null);
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        finishLoading();
      }
    };

    // Auth state change - never async directly!
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // NEVER do async in this callback (Supabase best practice)
      if (!mounted) return;
      if (session?.user) {
        setIsLoading(true); // new loading for profile fetch on user change
        setTimeout(async () => {
          try {
            const profile = await fetchProfile(session.user.id, session.user.email || '');
            if (mounted) setUser(profile);
          } catch {
            if (mounted) setUser(null);
          } finally {
            finishLoading();
          }
        }, 0);
      } else {
        setUser(null);
        finishLoading();
      }
    });

    initializeAuth();

    // Fallback loading guard: if loading stuck for >8s, release (prevents infinite spinner)
    const failSafe = setTimeout(() => {
      finishLoading();
    }, 8000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(failSafe);
    };
  }, [fetchProfile]);

  // Profile update logic (unchanged)
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

  return { user, setUser, isLoading, setIsLoading, updateUser };
};
