import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { AuthGate } from '@/lib/auth/AuthGate';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
// import { useRefreshToken } from '@/lib/useRefreshToken';
// import { useSessionTimeout } from '@/lib/useSessionTimeout';
import { eOnboardingStateValues, eStorageKey, setItem } from '@/lib/utils/storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppState } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // TODO - This is for debugging - comment/uncomment for testing various scenarios
  (async () => {
    // await removeItem(eStorageKey.PendingEmail);
    await setItem(eStorageKey.OnboardingState, eOnboardingStateValues.OnboardingCompleted);
    // await clearAll();
    // await supabase.auth.signOut();
    // console.log('Signed out')
  })();
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  // const [session, setSession] = useState<Session | null>(null)

  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
  // Initialize session timeout
  // useSessionTimeout()
  
  // // Initialize refresh token handling
  // useRefreshToken()

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setSession(session)
  //   })

  //   supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session)
  //   })
  // }, [])

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GluestackUIProvider mode="light"><ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AuthGate>
          <Stack initialRouteName='(dashboard)'>
            <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/email-confirmation" options={{ headerShown: false }} />
            <Stack.Screen name="reset-password" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </AuthGate>
      </AuthProvider>
      <StatusBar style="auto" />
      </ThemeProvider></GluestackUIProvider>
  );
}
