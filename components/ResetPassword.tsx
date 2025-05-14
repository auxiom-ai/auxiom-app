import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})
  const router = useRouter()
  const { token } = useLocalSearchParams<{ token: string }>()

  const validatePassword = (password: string): boolean => {
    // Password must be at least 8 characters long and contain at least one number
    return password.length >= 8 && /\d/.test(password)
  }

  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {}

    if (!newPassword) {
      newErrors.password = 'New password is required'
    } else if (!validatePassword(newPassword)) {
      newErrors.password = 'Password must be at least 8 characters and contain a number'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function sendPasswordResetConfirmationEmail(email: string) {
    try {
      const { error } = await supabase.functions.invoke('send-password-reset-confirmation', {
        body: { email }
      })

      if (error) {
        console.error('Error sending confirmation email:', error)
      }
    } catch (error) {
      console.error('Error invoking confirmation email function:', error)
    }
  }

  async function handlePasswordReset() {
    if (!validateForm()) return
    if (!token) {
      Alert.alert('Error', 'Invalid or missing reset token')
      return
    }

    setLoading(true)
    try {
      // First, get the user's email from the session
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        throw userError
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        throw updateError
      }

      // Send confirmation email
      if (user?.email) {
        await sendPasswordResetConfirmationEmail(user.email)
      }

      Alert.alert(
        'Success',
        'Your password has been reset successfully. A confirmation email has been sent to your email address.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to the auth screen
              router.replace('/')
            }
          }
        ]
      )
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Reset Your Password</Text>
        
        <View style={styles.inputContainer}>
          <Input>
            <InputField
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </Input>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Input>
            <InputField
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </Input>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            size="md"
            variant="solid"
            action="primary"
            disabled={loading}
            onPress={handlePasswordReset}
          >
            <ButtonText>{loading ? 'Resetting...' : 'Reset Password'}</ButtonText>
          </Button>
          <Button
            size="md"
            variant="outline"
            action="secondary"
            onPress={() => router.replace('/')}
          >
            <ButtonText>Back to Sign In</ButtonText>
          </Button>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    gap: 12,
  },
}) 