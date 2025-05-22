import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
// import { Image } from 'expo-image'; // Commented out for now
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from 'react-native-paper';
import { supabase } from '../lib/supabaseClient';  // <-- Import your Supabase client

// Role options (previously identities)
type Role = string;
const ROLE_OPTIONS: Role[] = [
  'Student',
  'Researcher',
  'Clinician',
  'Educator',
  'Professional',
  'Other',
];

export default function IdentityScreen() {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const toggleRole = (role: Role) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(item => item !== role)
        : [...prev, role]
    );
  };

  const handleSubmit = async (): Promise<void> => {
    if (selectedRoles.length === 0) {
      Alert.alert('Please select at least one role.');
      return;
    }

    setLoading(true);
    try {
      const userId = 30; // hardcoded for testing
      const { data, error } = await supabase
        .from('users')
        .update({ role: selectedRoles.join(', ') })  // `role` is a varchar column
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Error updating role:', error);
        Alert.alert('Error saving role', error.message);
      } else {
        Alert.alert('Success', 'Your role has been saved.');
        console.log('Updated role:', data);
        // Navigate to the next onboarding screen
        router.push('/interests');
      }
    } catch (err) {
      console.error('Unexpected error in handleSubmit:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f5e6" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Logo and Header - Logo commented out */}
        <View style={styles.logoContainer} />

        {/* Main Content */}
        <View style={styles.mainContent}>
          <ThemedText type="title" style={[styles.title, { color: '#000' }]}>What brings you to Auxiom?</ThemedText>
          <ThemedText style={[styles.subtitle, { color: '#000' }]}>Select as many as apply.</ThemedText>

          {/* Role Options */}
          <View style={styles.optionsContainer}>
            {ROLE_OPTIONS.map(role => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.identityButton,
                  selectedRoles.includes(role) && styles.selectedButton,
                ]}
                onPress={() => toggleRole(role)}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.buttonText}>{role}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              labelStyle={styles.buttonLabel}
              loading={loading}
              disabled={loading || selectedRoles.length === 0}
            >
              Submit
            </Button>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f5e6', // Cream/beige background
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 16,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 40,
  },
  identityButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    marginRight: 12,
    marginBottom: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#374151',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  buttonContainer: {
    alignItems: 'flex-end',
    marginTop: 'auto',
    paddingVertical: 24,
  },
  submitButton: {
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: '#1f2937',
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '600',
    paddingHorizontal: 8,
  },
});