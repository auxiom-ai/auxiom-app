import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uufxuxbilvlzllxgbewh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1Znh1eGJpbHZsemxseGdiZXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4ODkwNzEsImV4cCI6MjA2MjQ2NTA3MX0.tfyQ2ICyLO_Jnlp98KYbj3ynS1sn5nvVTLTOQoAvcl8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: __DEV__,
  }
})

// Set up refresh token handling
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully')
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out')
  }
})