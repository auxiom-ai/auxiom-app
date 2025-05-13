import { Button, ButtonText } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import React, { useEffect, useState } from 'react';
import { Alert, AppState, StyleSheet, View } from 'react-native';
import { supabase } from '../lib/supabase';

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
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    // Password must be at least 8 characters long and contain at least one number
    return password.length >= 8 && /\d/.test(password)
  }

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters and contain a number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    // Configure session persistence based on remember me preference
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        if (rememberMe) {
          // Enable auto refresh for persistent sessions
          supabase.auth.startAutoRefresh()
        } else {
          // Disable auto refresh for non-persistent sessions
          supabase.auth.stopAutoRefresh()
        }
      }
    })
  }, [rememberMe])

  async function signInWithEmail() {
    if (!validateForm()) return

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert('Authentication Error', 'Invalid email or password. Please try again.')
        } else {
          Alert.alert('Error', error.message)
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function signUpWithEmail() {
    if (!validateForm()) return

    setLoading(true)
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      })

      if (error) {
        if (error.message.includes('already registered')) {
          Alert.alert('Registration Error', 'This email is already registered. Please sign in instead.')
        } else {
          Alert.alert('Error', error.message)
        }
      } else if (!session) {
        Alert.alert('Verification Required', 'Please check your inbox for email verification!')
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input variant="outline" size="md">
          <InputField
            placeholder="email@address.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              if (errors.email) {
                setErrors(prev => ({ ...prev, email: undefined }))
              }
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </Input>
        {errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}
      </View>
      <View style={styles.verticallySpaced}>
        <Input variant="outline" size="md">
          <InputField
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text)
              if (errors.password) {
                setErrors(prev => ({ ...prev, password: undefined }))
              }
            }}
            secureTextEntry={true}
            autoCapitalize="none"
            autoComplete="password"
          />
        </Input>
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>
      <View style={[styles.verticallySpaced, styles.rememberMeContainer]}>
        <Checkbox
          value={rememberMe}
          onValueChange={setRememberMe}
          aria-label="Remember me"
        />
        <Text style={styles.rememberMeText}>Remember me</Text>
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
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rememberMeText: {
    marginLeft: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 4,
  },
})