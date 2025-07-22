import { checkOnboardingComplete, syncUserProfile, UserData } from '@/lib/auth-utils';
import { supabase } from '@/lib/supabase';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface User {
  id: string;
  email?: string;
  email_confirmed_at?: string;
}

export default function EnhancedAuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ['/sign-in', '/sign-up', '/reset-password', '/forgot-password', '/email-confirmation'];
  const isPublicPath = publicPaths.includes(pathname);

  // Navigate based on user state
  const navigateUser = async (authUser: User, profile: UserData | null) => {
    // If not email verified, go to email confirmation
    if (!authUser.email_confirmed_at && pathname !== '/email-confirmation') {
      router.replace('/email-confirmation');
      return;
    }

    // If no profile or profile creation failed, something is wrong
    if (!profile) {
      setError('Failed to load user profile');
      return;
    }

    // Check if user has completed all onboarding steps
    const hasCompletedOnboarding = checkOnboardingComplete(profile);
    const isUserActive = profile.active;

    // If user is on a public path, redirect based on their status
    if (isPublicPath) {
      if (isUserActive) {
        // User is fully onboarded and active, go to main app
        router.replace('/dashboard/feed');
      } else {
        // User needs to complete onboarding
        router.replace('/onboarding/occupation');
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Authentication error occurred');
          if (!isPublicPath) {
            router.replace('/sign-in');
          }
          return;
        }

        if (session?.user) {
          if (mounted) {
            setUser(session.user);
            setAuthenticated(true);
            
            // Sync user profile
            const profile = await syncUserProfile(session.user);
            if (mounted) {
              setUserProfile(profile);
              await navigateUser(session.user, profile);
            }
          }
        } else {
          if (mounted) {
            setUser(null);
            setAuthenticated(false);
            setUserProfile(null);
            
            if (!isPublicPath) {
              router.replace('/sign-in');
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setError('Failed to initialize authentication');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, !!session);

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setAuthenticated(true);
        
        const profile = await syncUserProfile(session.user);
        setUserProfile(profile);
        await navigateUser(session.user, profile);
        
      } else if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setAuthenticated(false);
        setUserProfile(null);
        
        if (!isPublicPath) {
          router.replace('/sign-in');
        }
      }
      
      setLoading(false);
    });

    // Initialize authentication
    initAuth();

    // Cleanup function
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Loading screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Error screen
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Render children for public paths or authenticated users
  if (isPublicPath || authenticated) {
    return <>{children}</>;
  }

  // This should not be reached due to navigation, but just in case
  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
});
