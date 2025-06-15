import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  hasCompletedQuestionnaire: boolean;
  hasUploadedStatement: boolean;
}

/**
 * - Ensures single profile fetching on mount.
 * - Avoids function recreation or infinite loop triggers.
 * - All side-effects (including auth state change) are in one effect, empty array to assure one-time run.
 */
export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch the user's profile, create if missing
  const fetchAndEnsureProfile = async (userId: string, email: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (!data || error) {
        // Create if doesn't exist
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
        if (!created || createErr) return null;
        return {
          id: created.id,
          email: created.email,
          name: created.name,
          hasCompletedQuestionnaire: created.has_completed_questionnaire,
          hasUploadedStatement: created.has_uploaded_statement,
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
      setAuthError("Failed to fetch user profile. Please try again.");
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let loadingFinished = false;
    let timeoutHandle: any;

    const finishLoading = () => {
      if (!loadingFinished) {
        setIsLoading(false);
        loadingFinished = true;
      }
    };

    // Boot: get session and auth state
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchAndEnsureProfile(session.user.id, session.user.email || '');
          if (mounted) setUser(profile);
        } else if (mounted) {
          setUser(null);
        }
      } catch (error) {
        if (mounted) setUser(null);
        setAuthError("Authentication failed. Please check your network connection and try again.");
      } finally {
        finishLoading();
      }
    };

    // Sync on auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setIsLoading(true);
        setTimeout(async () => {
          try {
            const profile = await fetchAndEnsureProfile(session.user.id, session.user.email || '');
            if (mounted) setUser(profile);
          } catch {
            if (mounted) setUser(null);
            setAuthError("Failed to fetch user profile on auth state change.");
          } finally {
            finishLoading();
          }
        }, 0);
      } else {
        setUser(null);
        finishLoading();
      }
    });

    initialize();

    // Reduce timeout to 5 seconds, show error and allow retry if needed
    timeoutHandle = setTimeout(() => {
      if (isLoading) {
        setAuthError("Authentication is taking longer than expected. Please refresh or try again.");
        finishLoading();
      }
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutHandle);
    };
  }, []); // <- Ensures the effect runs ONCE ONLY

  // Profile update (unchanged)
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
