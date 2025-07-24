import { supabase } from '@/lib/supabase';
import { eOnboardingStateValues, eStorageKey, getItem, setItem, StorageDataType } from '@/lib/utils/storage';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  storageData: StorageDataType;
  isPasswordRecovery: boolean;

  signOut: () => Promise<void>;
  updateStore: (key: eStorageKey, value: any) => Promise<void>;      // Centralized place to update store
  resetPasswordRecoveryState: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  storageData: {
    pendingEmail: null,
    onboardingState: eOnboardingStateValues.Init
  },
  isPasswordRecovery: false,
  signOut: () => Promise.resolve(),
  updateStore: () => Promise.resolve(),
  resetPasswordRecoveryState: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [storageData, setStorageData] = useState<StorageDataType>({
    pendingEmail: null,
    onboardingState: eOnboardingStateValues.Init
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      
      console.log('Auth state changed:', { _event, hasSession: !!session, emailConfirmed: session?.user?.email_confirmed_at });
      
      if (_event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery mode activated');
        setIsPasswordRecovery(true);
      } else if (_event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (_event === 'SIGNED_OUT') {
        console.log('User signed out');
        setIsPasswordRecovery(false);
      } else if (_event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        console.log('User signed in with confirmed email');
        setIsPasswordRecovery(false);
      } else if (_event === 'SIGNED_IN' && !session?.user?.email_confirmed_at) {
        console.log('User signed in but email not confirmed');
      }
      
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Load data from storage
    const loadStorage = async () => {
      const pendingEmail: string | null = await getItem(eStorageKey.PendingEmail);
      const onboardingState: eOnboardingStateValues | null = await getItem(eStorageKey.OnboardingState);
      setStorageData({ pendingEmail, onboardingState });
      setLoading(false);
    };
    loadStorage();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateStore = async (key: eStorageKey, value: any) => {
    // Update local cache
    if (key === eStorageKey.PendingEmail) {
      setStorageData({ ...storageData, pendingEmail: value });
    } else if (key === eStorageKey.OnboardingState) {
      setStorageData({ ...storageData, onboardingState: value });
    }
    await setItem(key, value);
    console.log(`Updated store for key: ${key}, value: ${value}`);
  };

  const resetPasswordRecoveryState = () => {
    console.log('Resetting password recovery state');
    setIsPasswordRecovery(false);
  };

  console.log(`********AuthProvider render*****`);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      storageData, 
      isPasswordRecovery,
      signOut, 
      updateStore,
      resetPasswordRecoveryState 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);