import { getUser, getPodcastsByUser, updateUserByAuthId, updateUserEmail, updateUserPassword, resetPasswordForEmail, deleteUserAccount } from '@/lib/db/queries';

// User profile actions
export async function updateUserProfile(name: string, occupation: string, industry: string) {
  const userData = await getUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }
  
  return await updateUserByAuthId(userData.auth_user_id, {
    name,
    occupation,
    industry
  });
}

export async function updateUserInterests(keywords: string[]) {
  const userData = await getUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }
  
  return await updateUserByAuthId(userData.auth_user_id, {
    keywords
  });
}


export async function updateEmail(email: string) {
  return await updateUserEmail(email);
}

export async function updatePassword(password: string) {
  return await updateUserPassword(password);
}

export async function requestPasswordReset(email: string) {
  return await resetPasswordForEmail(email);
}

export async function deleteAccount() {
  return await deleteUserAccount();
}

// Get user's keywords/interests
export async function getUserKeywords(): Promise<string[]> {
  const userData = await getUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }
  
  return userData.keywords || [];
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
