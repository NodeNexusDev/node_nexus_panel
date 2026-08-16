import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useLoginForm } from '../hooks/useLoginForm'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register, onSubmit, isLoading, error } = useLoginForm()

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">NodeNexus</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">{t('login.subtitle')}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit().then(() => navigate('/')).catch(() => {})
        }}
        className="space-y-4"
      >
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
            {error.message || t('login.error')}
          </div>
        )}

        <Input label={t('login.email')} type="email" placeholder="admin@example.com" {...register('email')} />
        <Input label={t('login.password')} type="password" placeholder="••••••" {...register('password')} />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('common.loading') : t('login.submit')}
        </Button>
      </form>
    </div>
  )
}
