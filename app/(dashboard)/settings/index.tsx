import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? '');
    });
  }, []);

  const handleUpdateEmail = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ email });
    setLoading(false);
    if (error) setError(error.message);
    else Alert.alert('Success', 'Email updated!');
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) setError(error.message);
    else Alert.alert('Success', 'Password updated!');
  };

  const handleCancelSubscription = async () => {
    Alert.alert('Subscription', 'Subscription cancelled (demo)');
  };

  const handleReinitializePreferences = async () => {
    Alert.alert(
      'Reinitialize Preferences',
      'This will take you through the onboarding flow again to update your preferences. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => {
            router.replace('/day' as any);
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');
    await supabase.auth.signOut();
    setLoading(false);
    router.replace('/sign-in' as any);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/sign-in' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7E6' }}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.header}>Settings</Text>
        <Text style={styles.subheader}>Manage your account settings and preferences.</Text>
        <View style={styles.divider} />

        {/* Account */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <Text style={styles.cardDesc}>Update your account information.</Text>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.inputDesc}>This is the email your Auxiom podcasts are sent to.</Text>
          <TouchableOpacity style={styles.button} onPress={handleUpdateEmail} disabled={loading}>
            <Text style={styles.buttonText}>Update account</Text>
          </TouchableOpacity>
        </View>

        {/* Password */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Password</Text>
          <Text style={styles.cardDesc}>Update your password.</Text>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleUpdatePassword} disabled={loading}>
            <Text style={styles.buttonText}>Update password</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>
          <Text style={styles.cardDesc}>Manage your preferences and onboarding settings.</Text>
          <TouchableOpacity style={styles.button} onPress={handleReinitializePreferences}>
            <Text style={styles.buttonText}>Reinitialize Preferences</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Subscription</Text>
          <Text style={styles.cardDesc}>Manage your subscription plan.</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleCancelSubscription}>
            <Text style={styles.dangerButtonText}>Cancel Subscription</Text>
          </TouchableOpacity>
        </View>

        {/* Delete Account & Sign Out */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delete Account</Text>
          <Text style={styles.cardDesc}>Permanently delete your account.</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#FAF7E6' },
  container: { padding: 16, paddingBottom: 32 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 4, color: '#222' },
  subheader: { fontSize: 16, color: '#888', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#e5e5e5', marginBottom: 16 },
  card: {
    backgroundColor: '#E3E0D3',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 2, color: '#222' },
  cardDesc: { fontSize: 14, color: '#888', marginBottom: 12 },
  label: { fontWeight: 'bold', marginTop: 8, marginBottom: 2, color: '#222' },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e5e5e5'
  },
  inputDesc: { fontSize: 12, color: '#888', marginBottom: 10 },
  button: {
    backgroundColor: '#222831',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  dangerButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  dangerButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  error: { color: 'red', marginTop: 10, textAlign: 'center' },
});