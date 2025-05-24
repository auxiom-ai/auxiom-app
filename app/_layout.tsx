import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/globals.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import 'react-native-reanimated';
//import { useColorScheme } from '@/hooks/useColorScheme.web';

export default function RootLayout() {
  const colorSchemeObj = useColorScheme();
  const colorScheme = colorSchemeObj?.colorScheme;
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GluestackUIProvider mode="light">
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Main tab navigation */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          
          
          {/* Error screen */}
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}