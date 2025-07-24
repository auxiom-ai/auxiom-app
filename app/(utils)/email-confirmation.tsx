import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { 
  ActivityIndicator, 
  Image, 
  Keyboard, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  View 
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { verifyOtp, syncUserProfile } from '@/lib/auth-utils';

export default function EmailConfirmationScreen() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [userEmail, setUserEmail] = useState('');
  const otpInputRef = useRef<TextInput>(null);
  const { email } = useLocalSearchParams<{ email: string }>();

  // Get user email from URL parameters
  useEffect(() => {
    if (email) {
      setUserEmail(email);
    }
  }, [email]);
  
  // Countdown timer for resend button
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    // Auto-focus the OTP input field
    setTimeout(() => {
      otpInputRef.current?.focus();
    }, 500);
  }, []);

  const onVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (!userEmail) {
      setError('Unable to get user email');
      return;
    }

    setError('');
    setLoading(true);
    Keyboard.dismiss();
    
    try {
      const { success, data, error: verifyError } = await verifyOtp(userEmail, otp);
      
      if (!success) {
        setError(verifyError || 'Invalid verification code');
      } else {
        // Email verified successfully, now sync user profile
        if (data.user) {
          await syncUserProfile(data.user);
        }
        
        // Proceed to dashboard
        router.replace('/onboarding/occupation' as any);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async () => {
    if (!userEmail) {
      setError('Unable to get user email');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail
      });
      
      if (error) {
        setError('Failed to resend confirmation email. Please try again.');
      } else {
        setTimer(60);
        setError('');
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
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          We've sent a verification code to {userEmail}
        </Text>
        
        <TextInput
          ref={otpInputRef}
          style={styles.otpInput}
          placeholder="Enter verification code"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          editable={!loading}
          autoFocus={true}
        />
        
        {error ? <Text style={styles.error}>{error}</Text> : null}
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={onVerifyOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend in {timer}s</Text>
          ) : (
            <TouchableOpacity 
              onPress={resendConfirmation}
              disabled={loading}
            >
              <Text style={styles.resendButtonText}>Resend</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/sign-in' as any)}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Back to Sign In</Text>
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
  otpInput: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#D3D7DF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    fontSize: 18,
    letterSpacing: 2,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#AEB4BE',
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
    color: '#222',
    fontWeight: 'bold',
    fontSize: 18,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    fontSize: 16,
    color: '#444',
  },
  resendButtonText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  timerText: {
    fontSize: 16,
    color: '#666',
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
