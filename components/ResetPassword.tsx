import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { supabase } from '../lib/supabase';
import type { AuthError } from '@supabase/supabase-js';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({})
  const router = useRouter()
  const { isPasswordRecovery, resetPasswordRecoveryState } = useAuth()

  const validatePassword = (password: string): boolean => {
    // Enhanced password validation: at least 8 characters, one number, one lowercase, one uppercase
    const minLength = password.length >= 8
    const hasNumber = /\d/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    return minLength && hasNumber && hasLower && hasUpper
  }

  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {}

    if (!newPassword) {
      newErrors.password = 'New password is required'
    } else if (!validatePassword(newPassword)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number'
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
    
    if (!isPasswordRecovery) {
      setErrors({ general: 'Invalid or expired password reset link. Please request a new one.' })
      return
    }

    setLoading(true)
    setErrors({})
    
    try {
      // Update the password using Supabase's updateUser method
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        throw updateError
      }

      // Send confirmation email if function exists
      if (data.user?.email) {
        try {
          await sendPasswordResetConfirmationEmail(data.user.email)
        } catch (emailError) {
          // Don't fail the password reset if email sending fails
          console.warn('Failed to send confirmation email:', emailError)
        }
      }

      Alert.alert(
        'Success',
        'Your password has been reset successfully. You can now sign in with your new password.',
        [
          {
            text: 'Continue to Sign In',
            onPress: () => {
              // Reset the password recovery state and redirect to sign in
              resetPasswordRecoveryState()
              supabase.auth.signOut().then(() => {
                router.replace('/(auth)/sign-in')
              })
            }
          }
        ]
      )
    } catch (error) {
      const authError = error as AuthError
      let errorMessage = 'An unexpected error occurred. Please try again.'
      
      if (authError?.message) {
        if (authError.message.includes('Same password')) {
          errorMessage = 'Please choose a different password than your current one.'
        } else if (authError.message.includes('Password should be')) {
          errorMessage = 'Password does not meet security requirements.'
        } else {
          errorMessage = authError.message
        }
      }
      
      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Reset Your Password</Text>
        
        {!isPasswordRecovery && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              Invalid or expired reset link. Please request a new password reset.
            </Text>
          </View>
        )}
        
        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}
        
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
            disabled={loading || !isPasswordRecovery}
            onPress={handlePasswordReset}
          >
            <ButtonText>{loading ? 'Resetting...' : 'Reset Password'}</ButtonText>
          </Button>
          <Button
            size="md"
            variant="outline"
            action="secondary"
            onPress={() => router.replace('/(auth)/sign-in')}
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
  warningContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#F8D7DA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#DC3545',
  },
}) 