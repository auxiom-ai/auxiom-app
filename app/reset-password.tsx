import { Stack } from 'expo-router';
import React from 'react';
import ResetPassword from '../components/ResetPassword';

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