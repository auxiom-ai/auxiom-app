import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { router, useSegments } from 'expo-router'
import { getUser } from '@/lib/db/queries'
import { UserData } from '@/lib/auth-utils'

interface AuthContextType {
  user: UserData | null
  loading: boolean
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const segments = useSegments()

  const fetchUser = async () => {
    try {
      const userData = await getUser()
      setUser(userData)
      return userData
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
      return null
    }
  }

  const refetchUser = async () => {
    setLoading(true)
    await fetchUser()
    setLoading(false)
  }

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true)
      const userData = await fetchUser()
      
      // Handle redirections based on user state
      if (!userData) {
        // No user data, redirect to sign-in unless already on auth pages or email confirmation
        const inAuthGroup = segments[0] === '(auth)'
        const onEmailConfirmation = segments[0] === '(utils)' && segments[1] === 'email-confirmation'
        const isOnResetPassword = segments[0] === '(utils)' && segments[1] === 'reset-password'
        if (!inAuthGroup && !onEmailConfirmation && !isOnResetPassword) {
          router.replace("/sign-in")
        }
      } else if (!userData.active) {
        // User exists but not active, handle onboarding flow
        const inOnboardingGroup = segments[0] === 'onboarding'
        
        if (!userData.occupation) {
          if (!inOnboardingGroup || segments[1] !== 'occupation') {
            router.replace("/onboarding/occupation")
          }
        } else if (!userData.keywords || userData.keywords.length === 0) {
          // Check for interests/keywords
          if (!inOnboardingGroup || segments[1] !== 'interests') {
            router.replace("/onboarding/interests")
          }
        }
      } else {
        // User is active and verified, redirect to dashboard unless already there
        const inDashboard = segments[0] === 'dashboard'
        const inAuthGroup = segments[0] === '(auth)'
        const inOnboardingGroup = segments[0] === 'onboarding'
        
        if (!inDashboard && (inAuthGroup || inOnboardingGroup)) {
          router.replace("/dashboard/feed")
        }
      }
      
      setLoading(false)
    }

    initializeAuth()
  }, [segments])

  // Monitor auth state changes
  useEffect(() => {
    // Re-fetch user when segments change to key auth/onboarding routes
    if (segments[0] === '(auth)' && segments[1] === 'sign-in') {
      // User might have just signed in, refetch after a brief delay
      const timer = setTimeout(() => {
        refetchUser()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [segments])

  const contextValue: AuthContextType = {
    user,
    loading,
    refetchUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
