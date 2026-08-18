import type { ReactNode } from 'react'
import { Button } from './Button'
import { IconWarning } from './Icons'

interface ErrorStateProps {
  icon?: ReactNode
  title?: string
  description?: string
  error?: Error | null
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorState({
  icon,
  title,
  description,
  error,
  onRetry,
  retryLabel = 'Retry',
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <span className="text-red-300 dark:text-red-700 mb-4">{icon || <IconWarning className="w-10 h-10" />}</span>
      <h3 className="text-lg font-medium text-surface-900 dark:text-white">{title || 'Something went wrong'}</h3>
      {description && <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 max-w-sm">{description}</p>}
      {error?.message && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-2 max-w-sm font-mono">{error.message}</p>
      )}
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry}>{retryLabel}</Button>
        </div>
      )}
    </div>
  )
}
