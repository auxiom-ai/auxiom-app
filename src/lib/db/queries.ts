import { supabase } from './drizzle';

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
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
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return updatedUser;
}

export async function addEmailToNewsletter(email: string) {
  const { data, error } = await supabase
    .from('emails')
    .insert({ email })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateListened(podcastId: number) {
  const { data, error } = await supabase
    .from('podcasts')
    .update({ listened: true })
    .eq('id', podcastId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export interface UserPreferences {
  keywords: string[]
  occupation: string
  days: string[]
  onboarding_completed: boolean
}

export interface UserProfile {
  id: string
  email: string
  preferences: UserPreferences
}

export interface CreateUserProfileParams {
  id: string | undefined
  email: string
  preferences: UserPreferences
}

export const queries = {
  // User queries
  async createUserProfile({ id, email, preferences }: CreateUserProfileParams) {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id,
          email,
          preferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
    
    if (error) throw error
    return data[0] as UserProfile
  },
} 