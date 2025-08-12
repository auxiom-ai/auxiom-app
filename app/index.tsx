import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { View, StyleSheet, ActivityIndicator, Image, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useEffect } from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'ios') {
        Purchases.configure({apiKey: process.env.EXPO_PUBLIC_REVENUECAT_PROJECT_APPLE_API_KEY!});
    } else if (Platform.OS === 'android') {
        Purchases.configure({apiKey: process.env.EXPO_PUBLIC_REVENUECAT_PROJECT_ANDROID_API_KEY!});
    }

  }, []);

  useEffect(() => {
    const checkPaywall = async () => {
      try {
        const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
          requiredEntitlementIdentifier: "pro"
        });

        if (paywallResult === PAYWALL_RESULT.PURCHASED || 
            paywallResult === PAYWALL_RESULT.RESTORED) {
          console.log("User has access to pro features");
          // Handle successful purchase or restore here
        }
      } catch (error) {
        console.error("Error presenting paywall:", error);
      }
    };

    checkPaywall();
  }, []);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Image 
            source={require("@/assets/auxiom-logo.png")} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <ActivityIndicator 
            size="large" 
            color="#0f172a" 
            style={styles.spinner}
          />
          <ThemedText style={styles.loadingText}>
            Loading your personalized feed...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (user) {
    return <Redirect href="/dashboard/feed" />;
  }

  return <Redirect href="/sign-in" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAF8EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 32,
  },
  spinner: {
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
    textAlign: 'center',
  },
});
