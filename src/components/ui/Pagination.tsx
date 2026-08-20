import { useState } from 'react'
import { Button } from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  showPerPage?: boolean
  perPage?: number
  onPerPageChange?: (perPage: number) => void
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  pages.push(total)
  return pages
}

export function Pagination({ page, totalPages, onPageChange, className = '', showPerPage, perPage = 20, onPerPageChange }: PaginationProps) {
  const [jumpValue, setJumpValue] = useState('')

  if (totalPages <= 1) return null

  const pages = getPageNumbers(page, totalPages)

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault()
    const page_num = parseInt(jumpValue, 10)
    if (!isNaN(page_num) && page_num >= 1 && page_num <= totalPages) {
      onPageChange(page_num)
      setJumpValue('')
    }
  }

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {showPerPage && onPerPageChange && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500 dark:text-surface-400">Per page</span>
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="px-2 py-1 text-xs bg-white border border-surface-300 rounded dark:bg-surface-800 dark:border-surface-700 dark:text-white"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-surface-400 dark:text-surface-500">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                p === page
                  ? 'bg-accent-600 text-white dark:bg-accent-500'
                  : 'text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800'
              }`}
            >
              {p}
            </button>
          ),
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {totalPages > 5 && (
        <form onSubmit={handleJump} className="flex items-center gap-1">
          <span className="text-xs text-surface-500 dark:text-surface-400">Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            placeholder="#"
            className="w-12 px-2 py-1 text-xs text-center bg-white border border-surface-300 rounded dark:bg-surface-800 dark:border-surface-700 dark:text-white"
          />
          <Button type="submit" variant="ghost" size="sm" disabled={!jumpValue}>
            Go
          </Button>
        </form>
      )}
    </div>
  )
}
