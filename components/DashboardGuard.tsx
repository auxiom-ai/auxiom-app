import { supabase } from '@/lib/supabase';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface DashboardGuardProps {
  children: React.ReactNode;
}

export default function DashboardGuard({ children }: DashboardGuardProps) {
  const [loading, setLoading] = useState(true);
  const [userActive, setUserActive] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    const checkUserStatus = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('User error in DashboardGuard:', userError);
          if (mounted) {
            router.replace('/sign-in');
          }
          return;
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('active, name, occupation, industry, keywords, delivery_day')
          .eq('auth_user_id', user.id)
          .single();

        if (profileError) {
          console.error('Profile error in DashboardGuard:', profileError);
          if (mounted) {
            router.replace('/sign-in');
          }
          return;
        }

        if (mounted) {
          // Check if user has completed onboarding and is active
          const hasCompletedOnboarding = !!(
            profile?.name && 
            profile?.occupation && 
            profile?.industry && 
            Array.isArray(profile?.keywords) && 
            profile?.keywords.length >= 5 &&
            profile?.delivery_day !== null &&
            profile?.delivery_day !== undefined
          );

          if (!hasCompletedOnboarding) {
            // User hasn't completed onboarding
            router.replace('/onboarding/occupation');
            return;
          }

          if (!profile?.active) {
            // User completed onboarding but isn't active (edge case)
            router.replace('/onboarding/day');
            return;
          }

          setUserActive(true);
        }
      } catch (error) {
        console.error('Error in DashboardGuard:', error);
        if (mounted) {
          router.replace('/sign-in');
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

      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/sign-in');
        return;
      }

      if (event === 'SIGNED_IN') {
        checkUserStatus();
      }
    });

    checkUserStatus();

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!userActive) {
    // This should not be reached due to navigation, but just in case
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  return <>{children}</>;
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
});
