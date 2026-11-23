import { useContext } from 'react'
import { ProfileContext } from './ProfileContext'

export function useProfile() {
  const context = useContext(ProfileContext)

  if (!context) {
    throw new Error('useProfile debe usarse dentro de ProfileProvider.')
  }

  return context
}
