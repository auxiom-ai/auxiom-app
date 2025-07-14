import { eOnboardingState, eStorageKey } from '@/lib/constants';
import { createUserRecord } from '@/lib/supabase';
import { getItem, setItem } from '@/lib/utils/storage';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from './useAuth';

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [onboardState, setOnboardState] = useState(eOnboardingState.Init);
  const router = useRouter();
  const pathname = usePathname(); 

  useEffect(() => {
    console.log(`AuthGate useEffect: pathname: ${pathname}, user: ${user?.aud}, loading: ${loading}`);
    if (loading) return;

    const routeToNextState = async () => {
      try {
        const email = await getItem<string>(eStorageKey.PendingEmail);
        if (email) {
          setEmail(email);
        }
        const onboardState = await getItem<eOnboardingState>(eStorageKey.OnboardingState);
        if (onboardState) {
          setOnboardState(onboardState);
        }
        await determineNextState();
      } catch (error) {
        console.error('Error loading pending email:', error);
      }
    };

    routeToNextState();

  }, [user, loading, pathname]);


  // Helper function to determine next state based on user and onboard state
  const determineNextState = async () => {
    console.log(`determineNextState: onboardState: ${onboardState}`);
    switch(onboardState) {
      case eOnboardingState.Init:
        router.push(pathname == '/sign-up' ? '/sign-up' : '/sign-in');
        return;
        
      case eOnboardingState.PendingEmailVerification:
        if (user && user.email_confirmed_at) {
          console.log('Calling create user record')
          await createUserRecord(user);
          await setItem(eStorageKey.OnboardingState, eOnboardingState.PrefOccupation);
          router.push('/occupation');
        } else {
          if (pathname !== '/sign-in') {
            router.push({
              pathname: '/email-confirmation',
              params: {
                email
              }
            });
          } else {
            router.replace('/sign-in');
          }
        }
        return;

      case eOnboardingState.PrefOccupation:
      case eOnboardingState.PrefInterests:
      case eOnboardingState.PrefDeliveryDay:
        const routeMapping = {
          [eOnboardingState.PrefOccupation]: '/occupation',
          [eOnboardingState.PrefInterests]: '/interests',
          [eOnboardingState.PrefDeliveryDay]: '/day'
        };
        if (user) {
          router.push(routeMapping[onboardState] as any);
        } else {
          router.push('/sign-in');
        }
        return;

      case eOnboardingState.OnboardingCompleted:
        if (user) {
          router.push('/feed');
        } else {
          router.push('/sign-in');
        }
        return;
        
      default:
        console.log('Invalid onboarding state:', onboardState);
        router.push('/sign-in');
        return;
    }
  };

  console.log(`********AuthGate render*****`);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
};
