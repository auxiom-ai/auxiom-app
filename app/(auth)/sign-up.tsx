import { handleSignUp } from '@/lib/auth-utils';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const OnSignUp = async () => {
    setLoading(true);
    const { success, data, error } = await handleSignUp(email, password);
    if (!success) {
      setError(error || 'Failed to create account');
    } else if (data.user) {
      // Check if the user needs email confirmation
      if (data.user.email_confirmed_at) {
        // User is already verified, redirect to onboarding
        router.replace('/onboarding/occupation');
      } else {
        // User needs to verify email first
        router.replace(`/email-confirmation?email=${encodeURIComponent(email)}`);
      }
    }
    setLoading(false);
  }

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
        onPress={OnSignUp}
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
  buttonDisabled: {
    opacity: 0.7,
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
  error: {
    color: 'red',
    marginBottom: 8,
  },
});
