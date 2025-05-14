import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, InteractionManager } from 'react-native';
import { supabase } from './supabase';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const useSessionTimeout = () => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handleTimeout, INACTIVITY_TIMEOUT);
  };

  const handleTimeout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        handleTimeout();
      } else {
        resetTimer();
      }
    }
  };

  useEffect(() => {
    // Set up app state change listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Set up interaction manager to track user activity
    const interactionSubscription = InteractionManager.createInteractionHandle();
    
    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      subscription.remove();
      InteractionManager.clearInteractionHandle(interactionSubscription);
    };
  }, []);

  return {
    resetTimer,
    lastActivity: lastActivityRef.current
  };
}; 