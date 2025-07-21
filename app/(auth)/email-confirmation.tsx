import { useAuth } from "@/lib/auth/AuthProvider";
import { supabase } from '@/lib/supabase';
import { eOnboardingStateValues, eStorageKey } from "@/lib/utils/storage";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EmailConfirmationScreen() {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [lastResendTime, setLastResendTime] = useState(0);
  const [error, setError] = useState('');
  const { storageData, updateStore } = useAuth();

  const handleResendEmail = async () => {
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;
    const cooldownPeriod = 60000; // 1 minute

    if (timeSinceLastResend < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastResend) / 1000);
      setError(`Please wait ${remainingTime} seconds before resending`);
      return;
    }

    if (!storageData.pendingEmail) {
      setError('No email address found');
      return;
    }

    setIsResending(true);
    setError('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: storageData.pendingEmail as string,
      });

      if (error) {
        setError(error.message);
      } else {
        setLastResendTime(now);
        Alert.alert('Email Sent', 'A new confirmation email has been sent to your inbox.');
      }
    } catch (error) {
      console.error('Error resending email:', error);
      setError('Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCancelSignup = async () => {
    if (!storageData.pendingEmail) {
      setError('No email address found');
      return;
    }

    setIsCanceling(true);
    setError('');

    try {
      await updateStore(eStorageKey.PendingEmail, null);
      await updateStore(eStorageKey.OnboardingState, eOnboardingStateValues.Init);
    } catch (error) {
      console.error('Error Removing from storage:', error);
      setError('Failed to cancel signup. Please try again.');
    } finally {
      setIsCanceling(false);
    }
    router.replace('/sign-up' as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>
        We've sent a confirmation email to:
      </Text>
      <Text style={styles.email}>{storageData.pendingEmail}</Text>
      <Text style={styles.instructions}>
        Please check your inbox and click the confirmation link to activate your account.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity 
        style={[styles.secondaryButton, isResending && styles.buttonDisabled]} 
        onPress={handleResendEmail}
        disabled={isResending}
      >
        <Text style={styles.secondaryButtonText}>
          {isResending ? 'Sending...' : 'Resend confirmation email'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.secondaryButton, isResending && styles.buttonDisabled]} 
        onPress={() => router.replace('/sign-in' as any)}
      >
        <Text style={styles.secondaryButtonText}>
          Sign in
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.secondaryButton, isCanceling && styles.buttonDisabled]} 
        onPress={() => {
          Alert.alert(
            'Cancel Signup',
            'Are you sure you want to cancel your signup process? This action cannot be undone.',
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'Confirm',
                onPress: handleCancelSignup
              }
            ]
          );
        }}
        disabled={isCanceling}
      >
        <Text style={styles.secondaryButtonText}>
          {isCanceling ? 'Canceling...' : 'Cancel signup'}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7E6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222831',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    maxWidth: 350,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#AEB4BE',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#222831',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 18,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  linkButton: {
    padding: 8,
  },
  linkText: {
    color: '#666',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});
