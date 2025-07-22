import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Alert } from 'react-native';

export default function EmailConfirmationScreen() {
  const [loading, setLoading] = useState(false);

  const resendConfirmation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.email) {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });
      
      if (error) {
        Alert.alert('Error', 'Failed to resend confirmation email. Please try again.');
      } else {
        Alert.alert('Success', 'Confirmation email sent! Please check your inbox.');
      }
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>
        We've sent you a confirmation email. Please check your inbox and confirm your email address before signing in.
      </Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.replace('/sign-in' as any)}
      >
        <Text style={styles.buttonText}>Back to Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.secondaryButton} 
        onPress={resendConfirmation}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>
          {loading ? 'Sending...' : 'Resend Confirmation Email'}
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
    marginBottom: 32,
    textAlign: 'center',
    maxWidth: 350,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#222831',
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
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#222831',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#222831',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
