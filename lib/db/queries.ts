import { supabase } from '../supabase'

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

export const queries = {
  // User queries
  async getUserProfile(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) throw error
    return data as UserProfile
  },

  async updateUserPreferences(email: string, preferences: Partial<UserPreferences>) {
    const { data, error } = await supabase
      .from('users')
      .update(preferences)
      .eq('email', email)
      .select()
    
    if (error) throw error
    return data[0] as UserProfile
  },

  async updateUserKeywords(email: string, keywords: string[]) {
    const { data, error } = await supabase
      .from('users')
      .update({ keywords })
      .eq('email', email)
      .select()
    
    if (error) throw error
    return data[0] as UserProfile
  },

  async updateUserOccupation(email: string, occupation: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ occupation })
      .eq('email', email)
      .select()
    
    if (error) throw error
    return data[0] as UserProfile
  },

  async updateUserDays(email: string, days: string[]) {
    const { data, error } = await supabase
      .from('users')
      .update({ days })
      .eq('email', email)
      .select()
    
    if (error) throw error
    return data[0] as UserProfile
  },

  async updateOnboardingStatus(email: string, completed: boolean) {
    const { data, error } = await supabase
      .from('users')
      .update({ onboarding_completed: completed })
      .eq('email', email)
      .select()
    
    if (error) throw error
    return data[0] as UserProfile
  },

  // Session queries
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
} 