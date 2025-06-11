import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { View } from 'react-native'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (!session) {
        router.replace('/sign-in')
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        router.replace('/sign-in')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <View />
  }

  return session ? <>{children}</> : null
}