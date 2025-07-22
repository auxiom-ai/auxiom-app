import ResetPassword from '@/components/ResetPassword';
import { Stack } from 'expo-router';
import React from 'react';

export default function ResetPasswordScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Reset Password',
          headerShown: false,
        }}
      />
      <ResetPassword />
    </>
  );
} 