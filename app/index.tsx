import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function Index() {
  const { user, loading } = useAuth();

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
