import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'

const supabaseUrl = 'https://uufxuxbilvlzllxgbewh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1Znh1eGJpbHZsemxseGdiZXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4ODkwNzEsImV4cCI6MjA2MjQ2NTA3MX0.tfyQ2ICyLO_Jnlp98KYbj3ynS1sn5nvVTLTOQoAvcl8'

// // Create a custom storage adapter that properly handles AsyncStorage
// const storageAdapter = {
//   getItem: async (key: string) => {
//     try {
//       const value = await AsyncStorage.getItem(key);
//       console.log('Storage getItem:', { key, value: value ? 'exists' : 'null' });
//       return value;
//     } catch (error) {
//       console.error('Error reading from storage:', error);
//       return null;
//     }
//   },
//   setItem: async (key: string, value: string) => {
//     try {
//       console.log('Storage setItem:', { key, valueLength: value.length });
//       await AsyncStorage.setItem(key, value);
//     } catch (error) {
//       console.error('Error writing to storage:', error);
//     }
//   },
//   removeItem: async (key: string) => {
//     try {
//       console.log('Storage removeItem:', { key });
//       await AsyncStorage.removeItem(key);
//     } catch (error) {
//       console.error('Error removing from storage:', error);
//     }
//   },
// };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // debug: __DEV__,
  }
})

// // Enhanced auth state handling for email verification
// supabase.auth.onAuthStateChange(async (event, session) => {
//   console.log('Auth state changed:', { event, hasSession: !!session, emailConfirmed: !!session?.user?.email_confirmed_at });
  
//   if (event === 'TOKEN_REFRESHED') {
//     console.log('Token refreshed successfully')
//   } else if (event === 'SIGNED_OUT') {
//     console.log('User signed out')
//   } else if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
//     console.log('User signed in with confirmed email')
//   } else if (event === 'SIGNED_IN' && !session?.user?.email_confirmed_at) {
//     console.log('User signed in but email not confirmed')
//   }
// })


// Helper function to create user record after email verification
export const createUserRecord = async (userData: any) => {
  // If user record already exists, do not create a new one
  try {
    const { data, error: existsError } = await supabase.from('users').select().eq('email', userData.email);
    if (data && data.length > 0) {
      console.log('User record already exists - Skipping Creation');
      return { success: true };
    }
    const { error: insertError } = await supabase.from('users').insert([{
        email: userData.email,
        name: null,
        delivery_day: 1,
        delivered: '1970-01-01 00:00:00',
        active: false,
        keywords: '{}',
        role: 'Other',
        occupation: null,
        industry: null,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        stripe_product_id: null,
        plan: 'free',
        episode: 1,
        verified: true,
        password_hash: "",  // TODO - remove after changing Schema in Supabase
    }]);

    if (insertError) {
      console.error('Error creating user record:', insertError);
      return { success: false, error: insertError };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in createUserRecord:', error);
    return { success: false, error };
  }
}
