import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { handleSignIn, handleMigratingUserAuth } from '@/lib/auth-utils';
import { checkUserEmail } from '@/lib/actions';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const OnSignIn = async () => {
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    // First, try regular sign in
    const { success, data, error: signInError } = await handleSignIn(email, password);
    
    if (success) {
      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        // Email not verified, redirect to confirmation screen
        router.replace({
          pathname: '/email-confirmation',
          params: {
            email
          }
        });
      } else {
        // Email verified, proceed to dashboard
        router.replace('/dashboard/feed' as any);   // TODO - should check onboarding state and direct accordingly 
      }
      return;
    }

    // Sign in failed, check if this is a migrating user
    try {
      const userEmailResult = await checkUserEmail(email.trim());

      if (userEmailResult.error) {
        setError('Unable to verify email. Please try again.');
        return;
      }

      if (userEmailResult.isMigratingUser) {
        // User exists in user table but not in auth table - redirect to OTP page for migration
        router.push({
          pathname: "/sign-in-otp" as any,
          params: { 
            email: email.trim() 
          }
        });
      } else {
        // Either account doesn't exist or it's a regular auth error
        setError(signInError || 'Account not found. Please create a new account or check your credentials.');
      }
    } catch (err) {
      console.error('Error checking email existence:', err);
      setError('An unexpected error occurred. Please try again.');
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
      <Text style={styles.title}>Sign in to your account</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={OnSignIn}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/sign-in-otp' as any)}>
        <Text style={styles.secondaryButtonText}>Sign in with one-time code</Text>
      </TouchableOpacity>
      <Text style={styles.linkText}>New to our platform?</Text>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/sign-up')}>
        <Text style={styles.secondaryButtonText}>Create an account</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/reset-password')}>
        <Text style={styles.forgotText}>Forgot your password?</Text>
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
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
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
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
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
  secondaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  linkText: {
    marginBottom: 8,
    color: '#222',
    fontSize: 16,
  },
  forgotText: {
    color: '#222',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});
