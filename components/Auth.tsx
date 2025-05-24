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
  const [isResetMode, setIsResetMode] = useState(false)
  const [isSignUpMode, setIsSignUpMode] = useState(false)

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

  async function handlePasswordReset() {
    if (!email.trim()) {
      setErrors({ email: 'Email is required' })
      return
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'auxiom://reset-password',
      })

      if (error) {
        Alert.alert('Error', error.message)
      } else {
        Alert.alert(
          'Password Reset Email Sent',
          'Please check your email for the password reset link.',
          [{ text: 'OK', onPress: () => setIsResetMode(false) }]
        )
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Reset modes when switching
  function handleSwitchToSignUp() {
    setIsSignUpMode(true);
    setIsResetMode(false);
    setErrors({});
    setPassword('');
  }
  function handleSwitchToSignIn() {
    setIsSignUpMode(false);
    setIsResetMode(false);
    setErrors({});
    setPassword('');
  }

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>
          {isResetMode
            ? 'Reset Password'
            : isSignUpMode
              ? 'Create Account'
              : 'Welcome Back'}
        </Text>
        <Text style={styles.subtitle}>
          {isResetMode
            ? 'Enter your email to receive a password reset link'
            : isSignUpMode
              ? 'Sign up to get started'
              : 'Sign in to your account to continue'}
        </Text>

        <View style={styles.inputContainer}>
          <Input>
            <InputField
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </Input>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {!isResetMode && (
          <>
            <View style={styles.inputContainer}>
              <Input>
                <InputField
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </Input>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {!isSignUpMode && (
              <View style={styles.checkboxContainer}>
                <Checkbox
                  value={rememberMe}
                  onValueChange={setRememberMe}
                />
                <Text style={styles.checkboxLabel}>Remember me</Text>
              </View>
            )}
          </>
        )}

        <View style={styles.buttonContainer}>
          {isResetMode ? (
            <>
              <Button
                size="md"
                variant="solid"
                action="primary"
                disabled={loading}
                onPress={handlePasswordReset}
                style={styles.button}
              >
                <ButtonText>{loading ? 'Sending...' : 'Reset Password'}</ButtonText>
              </Button>
              <Button
                size="md"
                variant="outline"
                action="secondary"
                onPress={handleSwitchToSignIn}
                style={styles.button}
              >
                <ButtonText>Back to Sign In</ButtonText>
              </Button>
            </>
          ) : isSignUpMode ? (
            <>
              <Button
                size="md"
                variant="solid"
                action="primary"
                disabled={loading}
                onPress={signUpWithEmail}
                style={styles.button}
              >
                <ButtonText>{loading ? 'Creating...' : 'Create Account'}</ButtonText>
              </Button>
              <Button
                size="md"
                variant="outline"
                action="secondary"
                onPress={handleSwitchToSignIn}
                style={styles.button}
              >
                <ButtonText>Back to Sign In</ButtonText>
              </Button>
            </>
          ) : (
            <>
              <Button
                size="md"
                variant="solid"
                action="primary"
                disabled={loading}
                onPress={signInWithEmail}
                style={styles.button}
              >
                <ButtonText>{loading ? 'Signing in...' : 'Sign In'}</ButtonText>
              </Button>
              <Button
                size="md"
                variant="outline"
                action="secondary"
                onPress={() => setIsResetMode(true)}
                style={styles.button}
              >
                <ButtonText>Forgot Password?</ButtonText>
              </Button>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>
              <Button
                size="md"
                variant="outline"
                action="secondary"
                onPress={handleSwitchToSignUp}
                style={styles.button}
              >
                <ButtonText>Create Account</ButtonText>
              </Button>
            </>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    padding: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 15,
    color: '#4b5563',
  },
  buttonContainer: {
    gap: 18,
    marginTop: 8,
  },
  button: {
    marginVertical: 4,
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
    marginHorizontal: 12,
    color: '#6b7280',
    fontSize: 15,
  },
})