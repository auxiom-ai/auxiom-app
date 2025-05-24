import { supabase } from '@/lib/supabase';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
      setLoading(false);
      if (!session && pathname !== '/sign-in' && pathname !== '/sign-up') {
        router.replace('/sign-in' as any);
      }
    });
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      if (!session && pathname !== '/sign-in' && pathname !== '/sign-up') {
        router.replace('/sign-in' as any);
      }
      if (session && (pathname === '/sign-in' || pathname === '/sign-up')) {
        router.replace('/' as any);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [pathname]);

  if (loading) return null; // or a splash screen

  return <>{children}</>;
} 