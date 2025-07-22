import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { AuthGate } from '@/lib/auth/AuthGate';
import { AuthProvider } from '@/lib/auth/AuthProvider';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GluestackUIProvider mode="light"><ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <AuthGate>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />
            <Stack.Screen name="(utils)/reset-password" options={{ headerShown: false }} />
            <Stack.Screen name="(utils)/forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="(utils)/email-confirmation" options={{ headerShown: false }} />
            <Stack.Screen name="(utils)/article-detail" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          </AuthGate>
        </AuthProvider>
        <StatusBar style="auto" />
      </ThemeProvider></GluestackUIProvider>
  );
}
