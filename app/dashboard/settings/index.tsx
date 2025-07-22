import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getUser } from '@/lib/db/queries';
import { updateEmail, requestPasswordReset, deleteAccount } from '@/lib/actions';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const user = await getUser();
        
        if (!user) {
          router.replace("/sign-in");
          return;
        }
        
        setUserData(user);
        setEmail(user.email);

        if (!user.active) {
          if (!user.occupation) {
            router.replace("/onboarding/occupation");
          }
          else if (!user.interests || !user.keywords || user.keywords.length === 0) {
            router.replace("/onboarding/interests");
          } else {
            router.replace("/onboarding/day");
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.replace("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleUpdateEmail = async () => {
    try {
      setLoading(true);
      setError('');
      await updateEmail(email);
      Alert.alert('Success', 'Email updated! Please check your inbox to confirm.');
    } catch (error: any) {
      setError(error.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      setError('');
      await requestPasswordReset(email);
      Alert.alert('Success', 'Check your email for a password reset link.');
    } catch (error: any) {
      setError(error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              setError('');
              await deleteAccount();
              router.replace('/sign-in');
            } catch (error: any) {
              setError(error.message || 'Failed to delete account');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/sign-in');
    } catch (error: any) {
      setError(error.message || 'Failed to sign out');
    }
  };

  const navigateToEditProfile = () => {
    router.push('/dashboard/settings/edit-profile' as any);
  };

  const navigateToEditInterests = () => {
    router.push('/dashboard/settings/edit-interests' as any);
  };

  const navigateToEditDeliveryDay = () => {
    router.push('/dashboard/settings/edit-delivery-day' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF7E6' }}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.header}>Profile</Text>
        <Text style={styles.subheader}>Manage your personal information and preferences.</Text>
        <View style={styles.divider} />

        {/* Profile Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <Text style={styles.cardDesc}>Update your professional details.</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoDetail}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{userData?.name || 'Not set'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoDetail}>
              <Text style={styles.infoLabel}>Occupation</Text>
              <Text style={styles.infoValue}>{userData?.occupation || 'Not set'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoDetail}>
              <Text style={styles.infoLabel}>Industry</Text>
              <Text style={styles.infoValue}>{userData?.industry || 'Not set'}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={navigateToEditProfile}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Interests */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Interests</Text>
          <Text style={styles.cardDesc}>Manage your topics of interest.</Text>
          
          <View style={styles.interestsContainer}>
            {userData?.keywords && userData.keywords.length > 0 ? (
              userData.keywords.slice(0, 3).map((keyword: string, index: number) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestTagText}>{keyword}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noInterests}>No interests set</Text>
            )}
            
            {userData?.keywords && userData.keywords.length > 3 && (
              <View style={styles.interestTag}>
                <Text style={styles.interestTagText}>+{userData.keywords.length - 3} more</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={navigateToEditInterests}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Edit Interests</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Preferences */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Preferences</Text>
          <Text style={styles.cardDesc}>Choose when to receive your podcasts.</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoDetail}>
              <Text style={styles.infoLabel}>Delivery Day</Text>
              <Text style={styles.infoValue}>
                {userData?.delivery_day !== undefined && userData?.delivery_day !== null
                  ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][userData.delivery_day]
                  : 'Not set'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={navigateToEditDeliveryDay}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Edit Delivery Day</Text>
          </TouchableOpacity>
        </View>

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
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleUpdateEmail} 
            disabled={loading}
          >
            <Text style={styles.buttonText}>Update Email</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <Text style={styles.cardSubtitle}>Password</Text>
          <Text style={styles.cardDesc}>Change your account password.</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleResetPassword} 
            disabled={loading}
          >
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Actions</Text>
          <Text style={styles.cardDesc}>Manage your account status.</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount} disabled={loading}>
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSignOut} disabled={loading}>
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
    shadowColor: '#000', 
    shadowOpacity: 0.03, 
    shadowRadius: 4, 
    shadowOffset: { width: 0, height: 2 }
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 2, color: '#222' },
  cardSubtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 2, color: '#222' },
  cardDesc: { fontSize: 14, color: '#888', marginBottom: 12 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D8D4C5',
  },
  infoDetail: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  interestTag: {
    backgroundColor: '#4A6FA5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  interestTagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  noInterests: {
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 12,
  },
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
