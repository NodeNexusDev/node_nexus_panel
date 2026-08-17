import type { Column } from './table-types'

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  emptyMessage?: string
  className?: string
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No data',
  className = '',
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-surface-500 dark:text-surface-400">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full table-zebra">
        <thead className="table-sticky">
          <tr className="border-b border-surface-200 dark:border-surface-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item)}
              className="table-row-hover stagger-item"
              style={{ animationDelay: `${index * 30}ms` }}
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
  )
}
