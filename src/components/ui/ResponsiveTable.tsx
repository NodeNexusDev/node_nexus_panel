import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Column } from './table-types'

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  renderMobileItem: (item: T) => ReactNode
  keyExtractor: (item: T) => string
  emptyMessage?: string
  className?: string
  onRowClick?: (item: T) => void
}

export function ResponsiveTable<T>({
  data,
  columns,
  renderMobileItem,
  keyExtractor,
  emptyMessage,
  className = '',
  onRowClick,
}: ResponsiveTableProps<T>) {
  const { t } = useTranslation()
  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-surface-500 dark:text-surface-400">
        {emptyMessage || t('dashboard.noData', 'No data')}
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className={`hidden md:block overflow-x-auto ${className}`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={`hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-6 py-4 ${col.className || ''}`}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-surface-200 dark:divide-surface-800">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            className={`p-4 ${onRowClick ? 'cursor-pointer' : ''}`}
          >
            {renderMobileItem(item)}
          </div>
        ))}
      </div>
    </>
  )
}
