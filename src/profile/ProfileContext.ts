import { createContext } from 'react'
import type { Profile, ReceiptScanner } from '../lib/profile'

export type ProfileContextValue = {
  profile: Profile
  isLoading: boolean
  setReceiptScanner: (value: ReceiptScanner) => Promise<string | null>
}

export const ProfileContext = createContext<ProfileContextValue | null>(null)
