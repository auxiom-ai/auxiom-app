import { getUser, getPodcastsByUser, updateUserByAuthId, updateUserEmail, updateUserPassword, resetPasswordForEmail, deleteUserAccount, signOut, getToken } from '@/lib/db/queries';
import Purchases from 'react-native-purchases';

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

export async function sendKeywordsToSQS(id: number, interests: string[]) {

  const accessToken = await getToken();
  if (!accessToken) {
    throw new Error('No access token available');
  }

  try {
    const response = await fetch('https://uufxuxbilvlzllxgbewh.supabase.co/functions/v1/send-keywords-to-sqs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: id,
        keywords: interests
      }),
    });

    if (!response.ok) {
      console.error('Failed to send keywords to SQS:', response.status);
      const errorText = await response.text();
      console.error('Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending keywords to SQS:', error);
    throw error;
  }
}

export async function updateUserInterests(keywords: string[]) {
  const userData = await getUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }
  
  // Update the database
  const result = await updateUserByAuthId(userData.auth_user_id, {
    keywords
  });

  // Send keywords to SQS
  try {
    const id = userData.id;
    await sendKeywordsToSQS(id, keywords);
  } catch (error) {
    console.error('Failed to send keywords to SQS, but database update succeeded:', error);
    // Don't throw here - we don't want to fail the entire operation if SQS fails
  }

  // Activate user if onboarding is complete
  if (userData.occupation) {
    await updateUserByAuthId(userData.auth_user_id, {
      active: true
    });
  }

  return result;
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

export async function checkUserEmail(email: string): Promise<{ isMigratingUser: boolean; error?: string }> {
  try {
    const response = await fetch('https://uufxuxbilvlzllxgbewh.supabase.co/functions/v1/check-custom-user-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      console.log('User email check failed-------------');
      console.log('HTTP error:', response.status);
      console.log('Response:', await response.text());
      return { isMigratingUser: false, error: `HTTP error! status: ${response.status}` };
    }

    const result = await response.json();
    return { isMigratingUser: result.isMigratingUser || false };
  } catch (error) {
    return { isMigratingUser: false, error: 'Failed to check user email' };
  }
}

export async function migrateUser(email: string, auth_user_id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://uufxuxbilvlzllxgbewh.supabase.co/functions/v1/migrate-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, auth_user_id }),
    });

    if (!response.ok) {
      console.log('Migrating user failed-------------');
      console.log('HTTP error:', response.status);
      console.log('Response:', await response.text());
      return { success: false, error: `HTTP error! status: ${response.status}` };
    }

    const result = await response.json();

    return { success: result.success || false, error: result.error || undefined };
  } catch (error) {
    console.error('Error migrating user:', error);
    return { success: false, error: 'Failed to migrate user' };
  }
}

export async function deleteAccount() {
  const userData = await getUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }

  await Purchases.logOut();

  // Delete from users table
  await deleteUserAccount();

  const accessToken = await getToken();

  // Call Supabase function to delete user from auth
  const response = await fetch('https://uufxuxbilvlzllxgbewh.supabase.co/functions/v1/delete-user', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to delete user from auth: ${response.status}`);
  }

  await signOut();
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
export async function getUserPodcasts(id: number) {
  return await getPodcastsByUser(id);
}

export async function logIntoRevenueCat() {
  const userData = await getUser();
  if (!userData) {
    return { success: false, error: 'User not authenticated' };
  }

  const id = String(userData.id);
  if (!id) {
    return { success: false, error: 'User ID not found, cannot integrate with react-native-purchases' };
  }

  try {
    const { customerInfo, created } = await Purchases.logIn(id.toString());
    console.log('RevenueCat logIn successful:', customerInfo);
    return { success: true, data: customerInfo, isNewUser: created };
  } catch (error) {
    console.error('Error logging into RevenueCat:', error);
    return { success: false, error: 'Failed to log into RevenueCat' };
  }
}

export async function logOutRevenueCat() {
  try {
    await Purchases.logOut();
    return { success: true };
  } catch (error) {
    console.error('Error logging out of RevenueCat:', error);
    return { success: false, error: 'Failed to log out of RevenueCat' };
  }
}
