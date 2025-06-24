import { CreateUserProfileParams, queries, UserPreferences, UserProfile } from './queries'

export const actions = {
  // User actions
  async getUserProfile() {
    const user = await queries.getCurrentUser()
    if (!user?.email) throw new Error('No authenticated user found')
    return queries.getUserProfile(user.email)
  },

  async updateUserPreferences(preferences: Partial<UserPreferences>) {
    const user = await queries.getCurrentUser()
    if (!user?.email) throw new Error('No authenticated user found')
    return queries.updateUserPreferences(user.email, preferences)
  },

  async updateUserKeywords(keywords: string[]) {
    const user = await queries.getCurrentUser()
    if (!user?.email) throw new Error('No authenticated user found')
    return queries.updateUserKeywords(user.email, keywords)
  },

  async updateUserOccupation(occupation: string) {
    const user = await queries.getCurrentUser()
    if (!user?.email) throw new Error('No authenticated user found')
    return queries.updateUserOccupation(user.email, occupation)
  },

  async updateUserDays(days: string[]) {
    const user = await queries.getCurrentUser()
    if (!user?.email) throw new Error('No authenticated user found')
    return queries.updateUserDays(user.email, days)
  },

  async updateOnboardingStatus(completed: boolean) {
    const user = await queries.getCurrentUser()
    if (!user?.email) throw new Error('No authenticated user found')
    return queries.updateOnboardingStatus(user.email, completed)
  },

  async reinitializePreferences() {
    const user = await queries.getCurrentUser()
    if (!user?.email) throw new Error('No authenticated user found')
    
    // Reset all preferences to default values
    const defaultPreferences: UserPreferences = {
      keywords: [],
      occupation: '',
      days: [],
      onboarding_completed: false
    }
    
    return queries.updateUserPreferences(user.email, defaultPreferences)  },

  // Session actions
  async getCurrentUser() {
    return queries.getCurrentUser()
  },

  async signOut() {
    return queries.signOut()
  },

  async createUserProfile(params: CreateUserProfileParams): Promise<UserProfile> {
    return queries.createUserProfile(params)
  }
} 