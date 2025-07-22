import { useAuth } from "@/lib/auth/AuthProvider";
import { supabase } from '@/lib/supabase';
import { eOnboardingStateValues, eStorageKey } from "@/lib/utils/storage";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { updateStore } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Sign up with Supabase - this will send confirmation email
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: undefined // Ensure email confirmation is required - TODO - is this correct?
        }
      });

      if (error) {
        setError(error.message);
      } else {
        console.log(`AV: Singup ${JSON.stringify(data)}`);
        try {
          await updateStore(eStorageKey.PendingEmail, email);    // save email for later
          await updateStore(eStorageKey.OnboardingState, eOnboardingStateValues.PendingEmailVerification);
        } catch (err) {
          console.error('Error saving to storage:', err);
        }
        // Navigate to email confirmation screen
        router.replace('/email-confirmation');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/auxiom-logo.png')}
        style={{ width: 80, height: 80, marginBottom: 16 }}
        resizeMode="contain"
      />
      <Text style={styles.title}>Create your account</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating account...' : 'Sign up'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.linkText}>Already have an account?</Text>
      <TouchableOpacity 
        style={styles.secondaryButton} 
        onPress={() => router.push('/sign-in' as any)}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>Sign in to existing account</Text>
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
    backgroundColor: '#D3D7DF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
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
  buttonDisabled: {
    backgroundColor: '#E5E5E5',
    opacity: 0.6,
  },
  buttonText: {
    color: '#222',
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
  error: {
    color: 'red',
    marginBottom: 8,
  },
});
