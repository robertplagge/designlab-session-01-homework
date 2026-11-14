import type { Session } from '@supabase/supabase-js'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthState } from '../lib/authContext'
import { friendlyAuthError } from '../lib/logic/auth'
import { authConfigured, supabase } from '../lib/supabase'

const NOT_CONFIGURED = { error: 'Accounts aren’t set up yet. Add your Supabase key to .env.local and restart.' }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(authConfigured)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      configured: authConfigured,
      async signIn(email, password) {
        if (!supabase) return NOT_CONFIGURED
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        return error ? { error: friendlyAuthError(error.message) } : {}
      },
      async signUp(email, password) {
        if (!supabase) return NOT_CONFIGURED
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        })
        if (error) return { error: friendlyAuthError(error.message) }
        // With email confirmation on, an existing address comes back as a user with no identities.
        if (data.user && data.user.identities?.length === 0) return { error: friendlyAuthError('User already registered') }
        return data.session ? {} : { needsConfirmation: true }
      },
      async signOut() {
        await supabase?.auth.signOut()
      },
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
