import { supabase } from '@/lib/supabase';

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();
    
  return data;
}

export async function getUserByEmail(email: string) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
    
  return data;
}

export async function createUser(userData: any) {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateUser(userId: number, data: any) {
  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return updatedUser;
}

export async function updateUserByAuthId(authUserId: string, data: any) {
  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(data)
    .eq('auth_user_id', authUserId)
    .select()
    .single();
    
  if (error) throw error;
  return updatedUser;
}

export async function updateUserPlan(plan: string) {
  const userData = await getUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }
  return await updateUserByAuthId(userData.auth_user_id, { plan });
}

export async function updateUserEmail(email: string) {
  // Get user data first to validate user exists
  const userData = await getUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }

  // Store original email for potential rollback
  const originalEmail = userData.email;
  
  let authUpdateSuccessful = false;
  
  try {
    // Step 1: Update auth table
    const { data, error } = await supabase.auth.updateUser({ email });
    if (error) throw error;
    
    authUpdateSuccessful = true;

    // Step 2: Update user table
    await updateUserByAuthId(userData.auth_user_id, { email });
    
    return data;
  } catch (error) {
    // If user table update fails but auth update succeeded, rollback auth change
    if (authUpdateSuccessful) {
      try {
        await supabase.auth.updateUser({ email: originalEmail });
      } catch (rollbackError) {
        console.error('Failed to rollback auth email change:', rollbackError);
        // Log the inconsistent state for manual resolution
        console.error(`Data inconsistency detected: Auth email updated to ${email} but user table update failed. Manual intervention required for user ${userData.auth_user_id}`);
      }
    }
    
    throw error;
  }
}

export async function updateUserPassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

export async function deleteUserAccount() {
  // delete user from database
  const userData = await getUser();
  if (!userData) {
    throw new Error('User not authenticated');
  }
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('auth_user_id', userData.auth_user_id);

  if (error) {
    console.error('Error deleting user from database:', error);
  }
  return { success: true };
}

export async function resetPasswordForEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://auxiomai.com/reset-password',
  });
  if (error) throw error;
  return data;
}

export async function getPodcastsByUser(userId: number) {

  const { data } = await supabase
    .from('podcasts')
    .select('*')
    .eq('user_id', userId);

  return data || [];
}

export async function getArticles() {
  console.log('Fetching articles from database...');
  const { data, error } = await supabase
    .from('articles')
    .select('*');

  if (error) throw error;
  return data;
}

// Update user's listened status for a podcast
export async function updatePodcastCompletedStatus(podcastId: number) {
  const { data, error } = await supabase
    .from('podcasts')
    .update({ completed: true })
    .eq('id', podcastId)
    .select()
    .single();

  if (error) {
    return { error: 'Podcast not found.' };
  } else {
    return { success: 'Podcast marked as listened.' };
  }
}

export async function getSimilarArticles(currentEmbedding: number[]) {
  const { data, error } = await supabase
    .rpc('sim_search', {
      query_embedding: currentEmbedding,
      match_count: 2,
      offset_count: 1,
    });

  if (error) throw error;
  return data;
}

export async function getRecommendedArticles(userEmbedding: number[]) {
  const { data, error } = await supabase
    .rpc('sim_search', {
      query_embedding: userEmbedding,
      match_count: 200, 
    });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
}

export async function getToken() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error;
  return data.session?.access_token || null;
}
