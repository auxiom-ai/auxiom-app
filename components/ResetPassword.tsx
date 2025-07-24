import { requestPasswordReset } from '@/lib/actions';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const onSendResetEmail = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      await requestPasswordReset(email.trim());
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  if (success) {
    return (
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          <Image
            source={require('@/assets/auxiom-logo.png')}
            style={{ width: 80, height: 80, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            Check your email for a link to reset your password
          </Text>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <Image
          source={require('@/assets/auxiom-logo.png')}
          style={{ width: 80, height: 80, marginBottom: 16 }}
          resizeMode="contain"
        />
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a link to reset your password
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
        
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={onSendResetEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send reset link</Text>
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
