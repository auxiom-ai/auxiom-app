<<<<<<< HEAD
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
=======
import Account from '@/components/Account'
import Auth from '@/components/Auth'
import { supabase } from '@/lib/supabase'
import { useRefreshToken } from '@/lib/useRefreshToken'
import { useSessionTimeout } from '@/lib/useSessionTimeout'
import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
>>>>>>> d9ea666f91ca7bc47a6efcaa48dc95728af8b521

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  
  // Initialize session timeout
  useSessionTimeout()
  
  // Initialize refresh token handling
  useRefreshToken()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
<<<<<<< HEAD
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      
      {/* Add this section for onboarding */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Start Onboarding</ThemedText>
        <ThemedText>
          Begin the onboarding process to customize your experience.
        </ThemedText>
        <Link href="/occupation" asChild>
          <Button mode="contained" style={styles.onboardingButton}>
            Start Onboarding
          </Button>
        </Link>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      
      {/* Rest of your existing content */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  onboardingButton: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#1f2937',
  },
});
=======
    <View>
      {session && session.user ? <Account key={session.user.id} session={session} /> : <Auth />}
    </View>
  )
}
>>>>>>> d9ea666f91ca7bc47a6efcaa48dc95728af8b521
