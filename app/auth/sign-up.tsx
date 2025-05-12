import { supabase } from '@/lib/supabase';
import {
    Button,
    ButtonText,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    HStack,
    Input,
    InputField,
    InputIcon,
    InputSlot,
    Link,
    LinkText,
    Text,
    VStack,
} from '@gluestack-ui/themed';
import { router } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    }
    if (!session) {
      Alert.alert('Success', 'Please check your inbox for email verification!');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <VStack space="md" style={styles.form}>
        <FormControl isRequired>
          <FormControlLabel>
            <FormControlLabelText>Email</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputSlot pl="$3">
              <InputIcon as={Mail} />
            </InputSlot>
            <InputField
              placeholder="email@address.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </Input>
        </FormControl>

        <FormControl isRequired>
          <FormControlLabel>
            <FormControlLabelText>Password</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputSlot pl="$3">
              <InputIcon as={Lock} />
            </InputSlot>
            <InputField
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </Input>
        </FormControl>

        <VStack space="sm" mt="$4">
          <Button
            onPress={signUpWithEmail}
            isDisabled={loading}
            size="lg"
            variant="solid"
            action="primary"
          >
            <ButtonText>Sign Up</ButtonText>
          </Button>
        </VStack>

        <HStack space="sm" justifyContent="center" mt="$4">
          <Text>Already have an account?</Text>
          <Link onPress={() => router.push('/auth/sign-in')}>
            <LinkText>Sign In</LinkText>
          </Link>
        </HStack>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  form: {
    marginTop: 40,
  },
}); 