import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export interface AuthResult {
  error?: string
  /** Sign-up succeeded but the user must confirm their email before logging in. */
  needsConfirmation?: boolean
}

export interface AuthState {
  user: User | null
  session: Session | null
  /** True while the stored session is being restored on first load. */
  loading: boolean
  configured: boolean
  signIn(email: string, password: string): Promise<AuthResult>
  signUp(email: string, password: string): Promise<AuthResult>
  signOut(): Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
