import { Button, ButtonText } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Google } from 'lucide-react-native';
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

  async function signInWithGoogle() {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'auxiom://auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        Alert.alert('Error', error.message)
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuthCallback(url: string) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error

      if (user) {
        // Check if user already has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        if (!profile) {
          // Create profile with provider metadata
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name,
                avatar_url: user.user_metadata?.avatar_url,
                provider: user.app_metadata?.provider,
                provider_id: user.app_metadata?.provider_id,
                updated_at: new Date(),
              },
            ])

          if (insertError) throw insertError
        } else {
          // Update existing profile with provider metadata
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              full_name: user.user_metadata?.full_name,
              avatar_url: user.user_metadata?.avatar_url,
              provider: user.app_metadata?.provider,
              provider_id: user.app_metadata?.provider_id,
              updated_at: new Date(),
            })
            .eq('id', user.id)

          if (updateError) throw updateError
        }
      }
    } catch (error) {
      console.error('Error handling OAuth callback:', error)
      Alert.alert('Error', 'Failed to process authentication. Please try again.')
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
      <View style={[styles.verticallySpaced, styles.divider]}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          size="md"
          variant="outline"
          action="secondary"
          disabled={loading}
          onPress={() => signInWithGoogle()}
        >
          <Google size={20} color="#000" style={styles.googleIcon} />
          <ButtonText>Continue with Google</ButtonText>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#6b7280',
  },
  googleIcon: {
    marginRight: 8,
  },
})