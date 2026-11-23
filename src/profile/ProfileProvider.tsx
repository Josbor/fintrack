import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getProfile, updateReceiptScanner, type Profile, type ReceiptScanner } from '../lib/profile'
import { ProfileContext } from './ProfileContext'

const DEFAULT_PROFILE: Profile = { receiptScanner: 'ocr' }

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    getProfile()
      .then((data) => {
        if (isActive) setProfile(data)
      })
      .catch(() => {
        if (isActive) setProfile(DEFAULT_PROFILE)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const setReceiptScanner = useCallback(async (value: ReceiptScanner) => {
    const previous = profile
    setProfile({ ...profile, receiptScanner: value })

    try {
      await updateReceiptScanner(value)
      return null
    } catch (err) {
      setProfile(previous)
      return err instanceof Error ? err.message : 'No pudimos guardar la preferencia.'
    }
  }, [profile])

  const value = useMemo(
    () => ({ profile, isLoading, setReceiptScanner }),
    [profile, isLoading, setReceiptScanner],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}
