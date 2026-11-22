import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type SignUpInput = {
  name: string
  email: string
  password: string
}

export type SignUpResult = {
  error: string | null
  needsConfirmation: boolean
}

export type AuthContextValue = {
  session: Session | null
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (input: SignUpInput) => Promise<SignUpResult>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
