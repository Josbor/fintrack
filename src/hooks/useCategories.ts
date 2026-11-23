import { useEffect, useState } from 'react'
import { listCategories, type Category } from '../lib/categories'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    listCategories()
      .then((data) => {
        if (isActive) setCategories(data)
      })
      .catch(() => {
        if (isActive) setCategories([])
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  return { categories, setCategories, isLoading }
}
