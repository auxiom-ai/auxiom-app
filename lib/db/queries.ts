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

export async function updateUserEmail(email: string) {
  const { data, error } = await supabase.auth.updateUser({ email });
  if (error) throw error;
  return data;
}

export async function updateUserPassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

export async function deleteUserAccount() {
  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) throw signOutError;
  return { success: true };
}

export async function resetPasswordForEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://placeholder-url.com/reset-password',
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
    });

  if (error) throw error;
  return data;
}
