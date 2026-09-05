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
        <div className="text-xs text-surface-500 dark:text-surface-400 mt-1 max-w-sm font-mono break-all text-left">
          {Array.isArray(error.error.detail) ? (
            <ul className="list-disc list-inside space-y-1">
              {(error.error.detail as Array<{ loc?: (string|number)[]; msg?: string; type?: string }>).map((d, i) => (
                <li key={i}>{d.loc ? `${d.loc.join('.')}: ` : ''}{d.msg ?? JSON.stringify(d)}</li>
              ))}
            </ul>
          ) : typeof error.error.detail === 'string' ? (
            <p>{error.error.detail}</p>
          ) : typeof error.error.detail === 'object' ? (
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(error.error.detail as Record<string, unknown>).map(([k, v]) => (
                <li key={k}>{k}: {Array.isArray(v) ? (v as string[]).join(', ') : String(v)}</li>
              ))}
            </ul>
          ) : (
            <p>{JSON.stringify(error.error.detail)}</p>
          )}
        </div>
      )}
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry}>{retryLabel || t('errorBoundary.retry')}</Button>
        </div>
      )}
    </div>
  )
}
