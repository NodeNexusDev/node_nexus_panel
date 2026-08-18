import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: ReactNode
  render: (item: T) => ReactNode
  className?: string
}
