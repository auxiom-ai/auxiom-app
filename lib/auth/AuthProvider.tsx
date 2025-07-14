import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      
      console.log('Auth state changed:', { _event, hasSession: !!session, emailConfirmed: session?.user?.email_confirmed_at });
      if (_event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully')
      } else if (_event === 'SIGNED_OUT') {
        console.log('User signed out')
      } else if (_event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        console.log('User signed in with confirmed email')
      } else if (_event === 'SIGNED_IN' && !session?.user?.email_confirmed_at) {
        console.log('User signed in but email not confirmed')
      }
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  console.log(`********AuthProvider render*****`);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
