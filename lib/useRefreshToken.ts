import { useCallback, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from './supabase';

export const useRefreshToken = () => {
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          throw refreshError;
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }, []);

  useEffect(() => {
    // Set up app state change listener for background/foreground transitions
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Refresh session when app comes to foreground
        await refreshSession();
      }
    });

    // Initial session refresh
    refreshSession();

    // Set up periodic refresh (every 10 minutes)
    const refreshInterval = setInterval(refreshSession, 10 * 60 * 1000);

    return () => {
      subscription.remove();
      clearInterval(refreshInterval);
    };
  }, [refreshSession]);

  return {
    refreshSession
  };
}; 