import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
// import { Image } from 'expo-image'; // Commented out for now
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from 'react-native-paper';

// Identity options
const IDENTITY_OPTIONS = [
  "Student",
  "Researcher",
  "Clinician",
  "Educator",
  "Professional",
  "Other"
];

export default function IdentityScreen() {
  const [selectedIdentities, setSelectedIdentities] = useState<string[]>([]);

  const toggleIdentity = (identity: string) => {
    if (selectedIdentities.includes(identity)) {
      setSelectedIdentities(selectedIdentities.filter(item => item !== identity));
    } else {
      setSelectedIdentities([...selectedIdentities, identity]);
    }
  };

  const handleSubmit = () => {
    console.log('Selected identities:', selectedIdentities);
    
    // Fix: Use the correct path to your interests page
    // Option 1: If your interests page is at app/onboarding/interests.tsx
    router.push('/interests');
    
    // Option 2: If your interests page is elsewhere, use the full path
    // For example, if it's at app/interests.tsx:
    // router.push('/interests');
    
    // Debug log
    console.log('Navigating to interests page...');
  };

  return (
    <ThemedView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f5e6" />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Logo and Header - Logo commented out as requested */}
          <View style={styles.logoContainer}>
            {/* Brain logo image commented out
            <Image 
              source={require('@/assets/images/partial-react-logo.png')} 
              style={styles.logo}
              contentFit="contain"
            /> */}
            <ThemedText type="title">Onboarding</ThemedText>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <ThemedText type="title" style={styles.title}>What brings you to Auxiom?</ThemedText>
            <ThemedText style={styles.subtitle}>Select as many as apply.</ThemedText>
            
            {/* Identity Options */}
            <View style={styles.optionsContainer}>
              {IDENTITY_OPTIONS.map((identity) => (
                <TouchableOpacity
                  key={identity}
                  style={[
                    styles.identityButton,
                    selectedIdentities.includes(identity) && styles.selectedButton
                  ]}
                  onPress={() => toggleIdentity(identity)}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.buttonText}>{identity}</ThemedText>
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
                disabled={selectedIdentities.length === 0}
              >
                Submit
              </Button>
            </View>
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
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 16,
  },
  logo: {
    width: 40,
    height: 40,
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
    backgroundColor: '#1f2937', // Dark blue/black
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50, // Pill shape
    marginRight: 12,
    marginBottom: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#374151', // Slightly lighter when selected
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
    backgroundColor: '#1f2937', // Dark blue/black
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '600',
    paddingHorizontal: 8,
  },
});