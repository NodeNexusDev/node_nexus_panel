import { IconSort } from './Icons'

export type SortDir = 'asc' | 'desc'

export interface SortState<K extends string = string> {
  key: K
  dir: SortDir
}

interface SortableHeaderProps<K extends string> {
  label: string
  sortKey: K
  sort: SortState<K> | null
  onSort: (key: K) => void
}

export function SortableHeader<K extends string>({ label, sortKey, sort, onSort }: SortableHeaderProps<K>) {
  const active = sort?.key === sortKey
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 uppercase tracking-wider text-xs font-medium text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-500 rounded"
      aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {label}
      {active ? (
        <span className="text-accent-500">{sort!.dir === 'asc' ? '↑' : '↓'}</span>
      ) : (
        <IconSort className="w-3 h-3 opacity-40" />
      )}
    </button>
  )
}
