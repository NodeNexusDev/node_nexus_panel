import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="text-center">
        <span className="text-6xl">🔍</span>
        <h1 className="text-4xl font-bold text-white mt-4">404</h1>
        <p className="text-gray-400 mt-2">{t('notFound.description')}</p>
        <Link to="/" className="inline-block mt-6">
          <Button>{t('notFound.backToHome')}</Button>
        </Link>
      </div>
    </div>
  )
}
