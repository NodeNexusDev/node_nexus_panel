import { Button } from './Button'

interface NetworkErrorProps {
  onRetry?: () => void
  className?: string
}

export function NetworkError({ onRetry, className = '' }: NetworkErrorProps) {
  return (
    <div className={`rounded-xl bg-white border border-yellow-200 dark:bg-surface-900 dark:border-yellow-500/20 p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">No Connection</h3>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            Unable to connect to the server. Please check your network connection.
          </p>
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry} className="mt-3">
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
