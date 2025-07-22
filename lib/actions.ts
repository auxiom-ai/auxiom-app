import { supabase } from '@/lib/supabase';

// Get user profile information
export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  return data;
}

// Get user's keywords/interests
export async function getUserKeywords(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data } = await supabase
    .from('users')
    .select('keywords')
    .eq('auth_user_id', user.id)
    .single();

  return data?.keywords || [];
}

// Get user's delivery day preference
export async function getUserDeliveryDay(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data } = await supabase
    .from('users')
    .select('delivery_day')
    .eq('auth_user_id', user.id)
    .single();

  return data?.delivery_day || 0;
}

// Get user's delivery status
export async function getUserDeliveryStatus(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data } = await supabase
    .from('users')
    .select('delivered')
    .eq('auth_user_id', user.id)
    .single();

  const now = new Date();
  const lastSunday = new Date();
  lastSunday.setDate(now.getDate() - (now.getDay() + 1));

  return data?.delivered >= lastSunday;
}

// Get user's account status
export async function getUserAccountStatus(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data } = await supabase
    .from('users')
    .select('active')
    .eq('auth_user_id', user.id)
    .single();

  return data?.active || false;
}

// Get user's current subscription plan
export async function getUserPlan(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data } = await supabase
    .from('users')
    .select('plan')
    .eq('auth_user_id', user.id)
    .single();

  return data?.plan || 'free';
}

// Get user's podcasts
export async function getUserPodcasts() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // First get user profile to get the database user id
  const { data: userProfile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!userProfile) {
    throw new Error('User profile not found');
  }

  const { data } = await supabase
    .from('podcasts')
    .select('*')
    .eq('user_id', userProfile.id);

  return data || [];
}

// Update user's listened status for a podcast
export async function updatePodcastListenedStatus(podcastId: number) {
  const { data, error } = await supabase
    .from('podcasts')
    .update({ listened: true })
    .eq('id', podcastId)
    .select()
    .single();

  if (error) {
    return { error: 'Podcast not found.' };
  } else {
    return { success: 'Podcast marked as listened.' };
  }
}

// Get user's newsletter subscription status
export async function getNewsletterStatus(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data } = await supabase
    .from('emails')
    .select('*')
    .eq('email', user.email)
    .single();

  return !!data;
}

// Add user to newsletter
export async function subscribeToNewsletter() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const { error } = await supabase
      .from('emails')
      .insert({ email: user.email });

    if (error) throw error;
    return { success: 'Successfully subscribed to newsletter.' };
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return { error: 'Failed to subscribe to newsletter.' };
  }
}

// Get user's verification status
export async function getVerificationStatus(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data } = await supabase
    .from('users')
    .select('verified')
    .eq('auth_user_id', user.id)
    .single();

  return data?.verified || false;
}

// Get user's onboarding completion status
export async function getOnboardingStatus(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data } = await supabase
    .from('users')
    .select('name, occupation, keywords')
    .eq('auth_user_id', user.id)
    .single();

  return !!(data?.name && data?.occupation && Array.isArray(data?.keywords) && data?.keywords.length >= 5);
}
