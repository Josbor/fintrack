import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { translateAuthError } from '../lib/authErrors'
import { supabase } from '../lib/supabase'
import {
  AuthContext,
  type AuthContextValue,
  type SignUpInput,
  type SignUpResult,
} from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      setIsLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      async signIn(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error ? translateAuthError(error.message) : null }
      },
      async signUp({ name, email, password }: SignUpInput): Promise<SignUpResult> {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        })

        if (error) {
          return { error: translateAuthError(error.message), needsConfirmation: false }
        }

        return { error: null, needsConfirmation: !data.session }
      },
      async signOut() {
        await supabase.auth.signOut()
      },
    }),
    [session, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
