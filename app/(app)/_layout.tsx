import { useAuth } from '@/contexts/AuthContext';
import { Redirect, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function AppLayout() {
  const { session, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Redirect to auth if not authenticated
  if (!session) {
    return <Redirect href="/auth/sign-in" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
    </Stack>
  );
} 