import { createUserRecord } from '@/lib/supabase';
import { eOnboardingStateValues, eStorageKey } from '@/lib/utils/storage';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from './AuthProvider';

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, storageData, updateStore } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); 
  const publicRoutes = ['/sign-in', '/sign-up', '/email-confirmation', '/forgot-password', '/reset-password'];

  useEffect(() => {
    console.log(`AuthGate useEffect: pathname: ${pathname}, user: ${user?.aud}, loading: ${loading}, storageData: ${JSON.stringify(storageData)}`);
    if (loading) return;

    if (!user) {
      if (publicRoutes.includes(pathname)) {
        return router.replace(pathname as any); // navigate where we were requested to go
      } else {
        return router.replace('/sign-in' as any);
      }
    }

    if (user) {
      if (storageData.onboardingState === eOnboardingStateValues.PendingEmailVerification) {
        if (user.email_confirmed_at) {
          console.log('Calling create user record')
          createUserRecord(user);
          updateStore(eStorageKey.OnboardingState, eOnboardingStateValues.PrefOccupation);
          router.replace('/occupation');
        } else {
          if (pathname !== '/sign-in') {
            router.replace('/email-confirmation');
          } else {
            router.replace('/sign-in');
          }
        }
      } else if (storageData.onboardingState === eOnboardingStateValues.PrefOccupation) {
        return router.replace('/occupation' as any);
      } else if (storageData.onboardingState === eOnboardingStateValues.PrefInterests) {
        return router.replace('/interests' as any);
      } else if (storageData.onboardingState === eOnboardingStateValues.PrefDeliveryDay) {
        return router.replace('/day' as any);
      } else {
        return router.replace('/(dashboard)' as any);
      }
    }
  }, [loading, pathname]);

  console.log(`********AuthGate render*****Loading = ${loading}`);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
};
