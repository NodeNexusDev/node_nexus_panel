import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { IconSearch } from '../components/ui/Icons'

export function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
      <div className="text-center">
        <IconSearch className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto" />
        <h1 className="text-4xl font-bold text-surface-900 dark:text-white mt-4">404</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-2">{t('notFound.description')}</p>
        <Link to="/" className="inline-block mt-6">
          <Button>{t('notFound.backToHome')}</Button>
        </Link>
      </div>
    </div>
  )
}
