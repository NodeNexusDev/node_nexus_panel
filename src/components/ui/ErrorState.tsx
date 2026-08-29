import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import { IconWarning } from './Icons'
import { ApiRequestError } from '../../api/client'

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
  retryLabel,
}: ErrorStateProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <span className="text-red-300 dark:text-red-700 mb-4">{icon || <IconWarning className="w-10 h-10" />}</span>
      <h3 className="text-lg font-medium text-surface-900 dark:text-white">{title || t('errorBoundary.title')}</h3>
      {description && <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 max-w-sm">{description}</p>}
      {error?.message && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-2 max-w-sm font-mono break-all">{error.message}</p>
      )}
      {error instanceof ApiRequestError && error.error.request_id && (
        <p className="text-xs text-surface-400 dark:text-surface-500 mt-1 max-w-sm font-mono">request_id: {error.error.request_id}</p>
      )}
      {error instanceof ApiRequestError && error.error.detail != null && (
        <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 max-w-sm font-mono break-all">{typeof error.error.detail === 'string' ? error.error.detail : JSON.stringify(error.error.detail)}</p>
      )}
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry}>{retryLabel || t('errorBoundary.retry')}</Button>
        </div>
      )}
    </div>
  )
}
