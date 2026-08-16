import { Button } from './Button'

interface ErrorCardProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorCard({ title = 'Error', message, onRetry, retryLabel = 'Retry', className = '' }: ErrorCardProps) {
  return (
    <div className={`rounded-xl bg-white border border-red-200 dark:bg-surface-900 dark:border-red-500/20 p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{title}</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{message}</p>
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry} className="mt-3">
              {retryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
