import { getUser, getPodcastsByUser } from '@/lib/db/queries';

// Get user's keywords/interests
export async function getUserKeywords(): Promise<string[]> {
  const userData = await getUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }
  
  return userData.keywords || [];
}

// Get user's delivery day preference
export async function getUserDeliveryDay(): Promise<number> {
  const userData = await getUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }
  
  return userData.delivery_day || 0;
}

// Get user's current subscription plan
export async function getUserPlan(): Promise<string> {
  const userData = await getUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }
  
  return userData.plan || 'free';
}

// Get user's podcasts
export async function getUserPodcasts() {
  const userData = await getUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }

  return await getPodcastsByUser(userData.id);
}
