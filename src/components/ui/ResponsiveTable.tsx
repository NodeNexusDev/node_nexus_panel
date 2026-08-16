import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  className?: string
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  renderMobileItem: (item: T) => ReactNode
  keyExtractor: (item: T) => string
  emptyMessage?: string
  className?: string
}

export function ResponsiveTable<T>({
  data,
  columns,
  renderMobileItem,
  keyExtractor,
  emptyMessage = 'No data',
  className = '',
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-surface-500 dark:text-surface-400">
        {emptyMessage}
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
              <tr key={keyExtractor(item)} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
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
          <div key={keyExtractor(item)} className="p-4">
            {renderMobileItem(item)}
          </div>
        ))}
      </div>
    </>
  )
}
