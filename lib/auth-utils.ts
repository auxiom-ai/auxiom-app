import { supabase } from './supabase';

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export interface UserData {
  id: number;
  email: string;
  password_hash?: string;
  name?: string;
  delivery_day: number;
  delivered: Date;
  active: boolean;
  keywords: string[];
  role: string;
  occupation?: string;
  industry?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_product_id?: string;
  plan: string;
  episode: number;
  verified: boolean;
  embedding?: number[];
  auth_user_id?: string; // UUID linking to Supabase auth
}

// Handle authentication with email verification support
export async function handleSignIn(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Handle sign up with email verification
export async function handleSignUp(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Create or update user profile
export async function syncUserProfile(authUser: any): Promise<UserData | null> {
  try {
    // Check if user profile exists by auth_user_id
    const { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', fetchError);
      return null;
    }

    if (!existingProfile) {
      // Create new profile with correct schema fields
      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert({
          email: authUser.email,
          password_hash: 'managed_by_supabase_auth', // Placeholder since schema requires it
          name: null,
          delivery_day: 1,
          delivered: new Date(0),
          active: false,
          keywords: [],
          role: 'Other',
          occupation: null,
          industry: null,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          stripe_product_id: null,
          plan: 'free',
          episode: 1,
          verified: !!authUser.email_confirmed_at,
          auth_user_id: authUser.id,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return null;
      }
      
      return newProfile as UserData;
    } else {
      // Update existing profile if needed
      const needsUpdate = existingProfile.verified !== !!authUser.email_confirmed_at;

      if (needsUpdate) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('users')
          .update({
            verified: !!authUser.email_confirmed_at,
          })
          .eq('id', existingProfile.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user profile:', updateError);
          return existingProfile as UserData;
        }
        
        return updatedProfile as UserData;
      }
      
      return existingProfile as UserData;
    }
  } catch (error) {
    console.error('Error in syncUserProfile:', error);
    return null;
  }
}

// Check onboarding completion by auth_user_id
export async function checkOnboardingStatus(authUserId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('name, occupation, industry, keywords, delivery_day, active')
      .eq('auth_user_id', authUserId)
      .single();

    if (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }

    return !!(data?.name && 
              data?.occupation && 
              data?.industry && 
              Array.isArray(data?.keywords) && 
              data?.keywords.length >= 5 &&
              data?.delivery_day !== null &&
              data?.delivery_day !== undefined &&
              data?.active === true);
  } catch (error) {
    console.error('Error in checkOnboardingStatus:', error);
    return false;
  }
}

// Check if user profile has all required fields (but not necessarily active)
export function checkOnboardingComplete(profile: UserData): boolean {
  return !!(profile.name && 
            profile.occupation && 
            profile.industry && 
            Array.isArray(profile.keywords) && 
            profile.keywords.length >= 5 &&
            profile.delivery_day !== null &&
            profile.delivery_day !== undefined);
}

// Activate user after completing onboarding
export async function activateUser(authUserId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ active: true })
      .eq('auth_user_id', authUserId);

    if (error) {
      console.error('Error activating user:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in activateUser:', error);
    return { success: false, error: 'Failed to activate user' };
  }
}

// Sign out user
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to sign out' };
  }
}

// Password reset
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'auxiom://reset-password',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to send reset email' };
  }
}

// Update password
export async function updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update password' };
  }
}

// Get current user session
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Session error:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Refresh session
export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Refresh session error:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
}
