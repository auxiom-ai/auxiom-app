import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button, Text, View } from 'react-native';

export default function Home() {
  const { session } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Welcome, {session?.user?.email}
      </Text>
      <Text style={{ marginBottom: 20 }}>User ID: {session?.user?.id}</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
} 