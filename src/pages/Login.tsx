import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useAuthStore } from '../stores/auth-store'
import { env } from '../lib/env'

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [panelLogin, setPanelLogin] = useState('')
  const [panelPassword, setPanelPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    setTimeout(() => {
      const envLogin = env.VITE_PANEL_LOGIN
      const envPassword = env.VITE_PANEL_PASSWORD

      if (panelLogin === envLogin && panelPassword === envPassword) {
        login()
        navigate('/')
      } else {
        setError(t('login.error'))
        setSubmitting(false)
      }
    }, 400)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-500 via-purple-500 to-pink-500 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-md mx-4 animate-scale-in">
        <div key={error} className={`glass rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 p-8 border border-white/20 dark:border-surface-700/50 ${error ? 'animate-shake' : ''}`}>
          <div className="text-center mb-8">
            <img src="/logo.png" alt="NodeNexus" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold gradient-text">NodeNexus</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 animate-slide-up">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label={t('login.login')}
                placeholder="admin"
                value={panelLogin}
                onChange={(e) => { setPanelLogin(e.target.value); setError('') }}
                disabled={submitting}
              />
              <Input
                label={t('login.password')}
                type="password"
                placeholder="••••••"
                value={panelPassword}
                onChange={(e) => { setPanelPassword(e.target.value); setError('') }}
                disabled={submitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting || !panelLogin || !panelPassword}>
              {submitting ? <Spinner size="sm" /> : t('login.submit')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
