import { useCallback, useEffect, useState } from 'react'
import { listAccounts, type Account } from '../lib/accounts'

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isActive = true

    listAccounts()
      .then((data) => {
        if (!isActive) return
        setAccounts(data)
        setError(null)
      })
      .catch(() => {
        if (isActive) setError('No pudimos cargar tus cuentas. Inténtalo de nuevo.')
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [refreshKey])

  const reload = useCallback(() => {
    setIsLoading(true)
    setRefreshKey((key) => key + 1)
  }, [])

  return { accounts, isLoading, error, reload }
}
