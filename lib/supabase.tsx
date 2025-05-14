import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'

const supabaseUrl = 'https://uufxuxbilvlzllxgbewh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1Znh1eGJpbHZsemxseGdiZXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4ODkwNzEsImV4cCI6MjA2MjQ2NTA3MX0.tfyQ2ICyLO_Jnlp98KYbj3ynS1sn5nvVTLTOQoAvcl8'

// Create a custom storage adapter that properly handles AsyncStorage
const storageAdapter = {
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      console.log('Storage getItem:', { key, value: value ? 'exists' : 'null' });
      return value;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      console.log('Storage setItem:', { key, valueLength: value.length });
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      console.log('Storage removeItem:', { key });
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: __DEV__,
  }
})

// Set up refresh token handling
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state changed:', { event, hasSession: !!session });
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully')
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out')
  }
})