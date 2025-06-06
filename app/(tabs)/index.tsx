import Account from '@/components/Account'
import Auth from '@/components/Auth'
import { supabase } from '@/lib/supabase'
import { useRefreshToken } from '@/lib/useRefreshToken'
import { useSessionTimeout } from '@/lib/useSessionTimeout'
import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { View } from 'react-native'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  
  // Initialize session timeout
  useSessionTimeout()
  
  // Initialize refresh token handling
  useRefreshToken()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <View>
      {session && session.user ? <Account key={session.user.id} session={session} /> : <Auth />}
    </View>
  )
}