import { useTranslation } from 'react-i18next'
import { Button } from './Button'

interface ErrorPageProps {
  statusCode?: number
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorPage({ statusCode, title, message, onRetry }: ErrorPageProps) {
  const { t } = useTranslation()

  const defaultTitle = statusCode === 404
    ? t('errorPage.notFound')
    : statusCode === 403
      ? t('errorPage.accessDenied')
      : t('errorPage.generic')

  const defaultMessage = statusCode === 404
    ? t('errorPage.notFoundMsg')
    : statusCode === 403
      ? t('errorPage.accessDeniedMsg')
      : t('errorPage.genericMsg')

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
      <div className="text-center">
        {statusCode && (
          <p className="text-7xl font-bold text-surface-200 dark:text-surface-800">{statusCode}</p>
        )}
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mt-4">{title || defaultTitle}</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-2 max-w-md mx-auto">{message || defaultMessage}</p>
        <div className="flex items-center justify-center gap-3 mt-6">
          {onRetry && (
            <Button onClick={onRetry}>{t('common.retry', 'Try Again')}</Button>
          )}
          <Button variant="secondary" onClick={() => window.location.href = '/'}>
            {t('notFound.backToHome')}
          </Button>
        </div>
      </div>
    </div>
  )
}
