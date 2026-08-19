import { useState, useCallback } from 'react'

interface SortState<T extends string> {
  key: T
  dir: 'asc' | 'desc'
}

export function useSort<T extends string>() {
  const [sort, setSort] = useState<SortState<T> | null>(null)

  const toggle = useCallback((key: T) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }, [])

  return { sort, toggle }
}
