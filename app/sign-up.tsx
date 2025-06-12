import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    setError('');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      // Set the session explicitly
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setError(sessionError.message);
      } else {
        // Insert user data into the users table
        const { error: dbError } = await supabase.from('users').insert([
          {
            email,
            password_hash: password, // Note: In production, use a proper hash
            name: null,
            delivery_day: 1,
            delivered: '1970-01-01 00:00:00',
            active: false,
            keywords: '{}',
            role: 'Other',
            occupation: null,
            industry: null,
            stripe_customer_id: null,
            stripe_subscription_id: null,
            stripe_product_id: null,
            plan: 'free',
            episode: 1,
            verified: false,
          },
        ]);
        if (dbError) {
          setError(dbError.message);
        } else {
          // Check if the user is already confirmed
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError) {
            setError(userError.message);
          } else if (userData?.user?.email_confirmed_at) {
            router.replace('/onboarding' as any);
          } else {
            router.replace('/email-confirmation');
          }
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/auxiom-logo.png')}
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
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>
      <Text style={styles.linkText}>Already have an account?</Text>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/occupation' as any)}>
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