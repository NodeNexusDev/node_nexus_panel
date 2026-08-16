import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function Settings() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('settings.title')}</h1>
        <p className="text-gray-400">{t('settings.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">{t('settings.profile')}</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t('settings.name')}</label>
                <input
                  type="text"
                  defaultValue="Admin"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t('settings.email')}</label>
                <input
                  type="email"
                  defaultValue="admin@example.com"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <Button>{t('settings.saveChanges')}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">{t('settings.apiKeys')}</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Default API Key</p>
                    <p className="text-xs text-gray-500">Created 2 days ago</p>
                  </div>
                  <code className="text-xs text-gray-400 font-mono">nk_****_****_****</code>
                </div>
              </div>
              <Button variant="secondary">{t('settings.createApiKey')}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">{t('settings.notifications')}</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-white">{t('settings.nodeOfflineAlerts')}</p>
                  <p className="text-xs text-gray-500">{t('settings.nodeOfflineDesc')}</p>
                </div>
                <div className="relative">
                  <input type="checkbox" defaultChecked className="sr-only" />
                  <div className="w-10 h-6 bg-gray-700 rounded-full shadow-inner"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                </div>
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-white">{t('settings.commandNotifications')}</p>
                  <p className="text-xs text-gray-500">{t('settings.commandNotificationsDesc')}</p>
                </div>
                <div className="relative">
                  <input type="checkbox" defaultChecked className="sr-only" />
                  <div className="w-10 h-6 bg-gray-700 rounded-full shadow-inner"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">{t('settings.dangerZone')}</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-red-500/20 rounded-lg">
                <p className="text-sm text-white">{t('settings.resetData')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('settings.resetDataDesc')}</p>
                <Button variant="danger" size="sm" className="mt-3">{t('settings.reset')}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
