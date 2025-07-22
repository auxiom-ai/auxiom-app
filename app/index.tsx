import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { getUser } from '@/lib/db/queries'

export default function Index() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const userData = await getUser()
        
        if (!userData) {
          router.replace("/sign-in")
          return
        }

        if (!userData.active) {
          if (!userData.occupation) {
            router.replace("/onboarding/occupation")
          }
          else if (!userData.interests) {
            router.replace("/onboarding/interests")
          } else {
            router.replace("/onboarding/day")
          }
        } else {
          // User is active and verified, redirect to dashboard feed
          router.replace("/dashboard/feed" as any)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        router.replace("/sign-in")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Show a loading state while checking user status
  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    )
  }

  // This shouldn't render since we're redirecting, but just in case
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText>Redirecting...</ThemedText>
    </ThemedView>
  )
}
