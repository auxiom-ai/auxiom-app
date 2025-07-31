import { sendOtpToEmail, handleMigratingUserAuth } from '@/lib/auth-utils';
import { checkUserEmail } from '@/lib/actions';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { ActivityIndicator, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function SignInOtpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMigratingUser, setIsMigratingUser] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const router = useRouter();
  const { email: paramEmail } = useLocalSearchParams<{ email: string }>();

  // Pre-populate email if passed from previous screen
  useEffect(() => {
    if (paramEmail) {
      setEmail(paramEmail);
      // If email is pre-populated, immediately check if it's a migrating user
      setIsMigratingUser(true);
      setShowPasswordField(true);
    }
  }, [paramEmail]);

  const onSendOtp = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    // If we already know it's a migrating user and password field is shown
    if (showPasswordField) {
      if (!password.trim()) {
        setError('Please enter your password');
        return;
      }
      
      setError('');
      setLoading(true);
      
      try {
        // For migrating users, create auth account with email + password
        const { success, error } = await handleMigratingUserAuth(email.trim(), password.trim());
        
        if (!success) {
          setError(error || 'Failed to create account for migration');
        } else {
          // Navigate to email confirmation screen since signUp sends confirmation email
          router.replace({
            pathname: "/email-confirmation" as any,
            params: { 
              email: email.trim(),
              isMigrating: 'true'
            }
          });
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      // Check if this is a migrating user first
      const userEmailResult = await checkUserEmail(email.trim());

      if (userEmailResult.error) {
        setError('Unable to verify email. Please try again.');
        setLoading(false);
        return;
      }

      if (userEmailResult.isMigratingUser) {
        // User exists in user table but not in auth table - show password field
        setIsMigratingUser(true);
        setShowPasswordField(true);
        setError('');
      } else {
        // Regular OTP flow for existing auth users or new users
        const { success, error } = await sendOtpToEmail(email.trim());
        
        if (!success) {
          setError(error || 'Failed to send verification code');
        } else {
          // Navigate to OTP verification screen
          router.push({
            pathname: "/verify-otp" as any,
            params: { email: email.trim() }
          });
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
      <Image
        source={require('@/assets/auxiom-logo.png')}
        style={{ width: 80, height: 80, marginBottom: 16 }}
        resizeMode="contain"
      />
      <Text style={styles.title}>
        {isMigratingUser ? 'Account Migration' : 'Sign in with one-time code'}
      </Text>
      <Text style={styles.subtitle}>
        {isMigratingUser 
          ? 'We found your existing account from our website. Please enter your password to complete your mobile account.'
          : 'Enter your email and we\'ll send you a one-time verification code'
        }
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading && !showPasswordField}
      />
      
      {showPasswordField && (
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
      )}
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={onSendOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {showPasswordField ? 'Complete Migration' : 'Send verification code'}
          </Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.backButtonText}>Back to sign in</Text>
      </TouchableOpacity>
    </View>
    </TouchableWithoutFeedback>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    marginBottom: 32,
    textAlign: 'center',
    maxWidth: 500,
  },
  input: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#0f172a15',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  button: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    color: '#222',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});
