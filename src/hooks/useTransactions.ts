import { useCallback, useEffect, useState } from 'react'
import { listTransactions, type Transaction } from '../lib/transactions'

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isActive = true

    listTransactions()
      .then((data) => {
        if (!isActive) return
        setTransactions(data)
        setError(null)
      })
      .catch(() => {
        if (isActive) setError('No pudimos cargar tus movimientos. Inténtalo de nuevo.')
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

  return { transactions, isLoading, error, reload }
}
