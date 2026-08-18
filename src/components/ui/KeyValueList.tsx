import type { ReactNode } from 'react'

export interface DetailRow {
  label: string
  value: ReactNode
}

interface KeyValueListProps {
  rows: DetailRow[]
  className?: string
}

export function KeyValueList({ rows, className = '' }: KeyValueListProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800 last:border-0">
          <span className="text-sm text-surface-600 dark:text-surface-400">{row.label}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white text-right">{row.value}</span>
        </div>
      ))}
    </div>
  )
}
