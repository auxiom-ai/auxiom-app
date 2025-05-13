import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, ButtonText } from "@/components/ui/button"
import { Input, InputField } from "@/components/ui/input";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input variant="outline" size="md">
          <InputField
            placeholder="email@address.com"
            value={email}
            onChangeText={(text) => setEmail(text)}
            autoCapitalize="none"
          />
        </Input>
      </View>
      <View style={styles.verticallySpaced}>
        <Input variant="outline" size="md">
          <InputField
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
            autoCapitalize="none"
          />
        </Input>
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          size="md" 
          variant="solid" 
          action="primary"
          disabled={loading}
          onPress={() => signInWithEmail()}
        >
          <ButtonText>Sign in</ButtonText>
        </Button>
      </View>
      <View style={styles.verticallySpaced}>
        <Button 
          size="md" 
          variant="solid" 
          action="primary"
          disabled={loading}
          onPress={() => signUpWithEmail()}
        >
          <ButtonText>Sign up</ButtonText>
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})