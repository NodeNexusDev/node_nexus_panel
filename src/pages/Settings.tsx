import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Modal } from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import { useAuthStore } from '../stores/auth-store'
import {
  useProfile, useUpdateProfile, useApiKeys, useCreateApiKey, useDeleteApiKey,
  useNotificationSettings, useUpdateNotificationSettings, useResetAllData,
} from '../hooks/useSettings'

export function Settings() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const user = useAuthStore((s) => s.user)

  const { isLoading: profileLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const { data: apiKeysData, isLoading: keysLoading } = useApiKeys()
  const createApiKey = useCreateApiKey()
  const deleteApiKey = useDeleteApiKey()
  const { data: notifData } = useNotificationSettings()
  const updateNotifs = useUpdateNotificationSettings()
  const resetAll = useResetAllData()

  const [name, setName] = useState(user?.name || 'Admin')
  const [email, setEmail] = useState(user?.email || 'admin@example.com')
  const [newKeyName, setNewKeyName] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [deleteKeyTarget, setDeleteKeyTarget] = useState<{ id: string; name: string } | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const apiKeys = apiKeysData?.data || []

  const handleSaveProfile = () => {
    updateProfile.mutate({ name, email }, {
      onSuccess: () => toast('success', 'Profile updated'),
      onError: () => toast('error', 'Failed to update profile'),
    })
  }

  const handleCreateKey = () => {
    createApiKey.mutate({ name: newKeyName }, {
      onSuccess: () => { toast('success', 'API key created'); setShowKeyModal(false); setNewKeyName('') },
      onError: () => toast('error', 'Failed to create API key'),
    })
  }

  const handleDeleteKey = () => {
    if (!deleteKeyTarget) return
    deleteApiKey.mutate(deleteKeyTarget.id, {
      onSuccess: () => { toast('success', 'API key deleted'); setDeleteKeyTarget(null) },
      onError: () => toast('error', 'Failed to delete API key'),
    })
  }

  const handleReset = () => {
    resetAll.mutate(undefined, {
      onSuccess: () => { toast('success', 'All data has been reset'); setShowResetConfirm(false) },
      onError: () => toast('error', 'Failed to reset data'),
    })
  }

  const toggleNotif = (key: 'nodeOfflineAlerts' | 'commandNotifications') => {
    if (!notifData?.data) return
    updateNotifs.mutate({ ...notifData.data, [key]: !notifData.data[key] })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t('settings.title')}</h1>
        <p className="text-surface-500 dark:text-surface-400">{t('settings.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('settings.profile')}</h2></CardHeader>
          <CardContent>
            {profileLoading ? <div className="flex justify-center py-8"><Spinner /></div> : (
              <div className="space-y-4">
                <Input label={t('settings.name')} value={name} onChange={(e) => setName(e.target.value)} />
                <Input label={t('settings.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? t('common.loading') : t('settings.saveChanges')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('settings.apiKeys')}</h2></CardHeader>
          <CardContent>
            {keysLoading ? <div className="flex justify-center py-8"><Spinner /></div> : (
              <div className="space-y-4">
                {apiKeys.length === 0 ? (
                  <p className="text-sm text-surface-500 dark:text-surface-500">No API keys yet</p>
                ) : apiKeys.map((key) => (
                  <div key={key.id} className="p-3 bg-surface-50 rounded-lg dark:bg-surface-800/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{key.name}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-500">Created {new Date(key.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-surface-500 dark:text-surface-400 font-mono">{key.key}</code>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteKeyTarget({ id: key.id, name: key.name })}>{t('common.delete')}</Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => setShowKeyModal(true)}>{t('settings.createApiKey')}</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('settings.notifications')}</h2></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: 'nodeOfflineAlerts' as const, label: t('settings.nodeOfflineAlerts'), desc: t('settings.nodeOfflineDesc') },
                { key: 'commandNotifications' as const, label: t('settings.commandNotifications'), desc: t('settings.commandNotificationsDesc') },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg cursor-pointer dark:bg-surface-800/50">
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-500">{item.desc}</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" checked={notifData?.data?.[item.key] ?? true} onChange={() => toggleNotif(item.key)} className="sr-only" />
                    <div className={`w-10 h-6 rounded-full shadow-inner transition-colors ${notifData?.data?.[item.key] ? 'bg-indigo-600' : 'bg-surface-300 dark:bg-surface-600'}`} />
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifData?.data?.[item.key] ? 'translate-x-4' : ''}`} />
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('settings.dangerZone')}</h2></CardHeader>
          <CardContent>
            <div className="p-4 border border-red-200 rounded-lg dark:border-red-500/20">
              <p className="text-sm text-surface-900 dark:text-white">{t('settings.resetData')}</p>
              <p className="text-xs text-surface-500 dark:text-surface-500 mt-1">{t('settings.resetDataDesc')}</p>
              <Button variant="danger" size="sm" className="mt-3" onClick={() => setShowResetConfirm(true)}>{t('settings.reset')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} title={t('settings.createApiKey')} size="sm">
        <div className="space-y-4">
          <Input label="Key name" placeholder="my-api-key" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowKeyModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreateKey} disabled={createApiKey.isPending || !newKeyName}>
              {createApiKey.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteKeyTarget} onClose={() => setDeleteKeyTarget(null)} onConfirm={handleDeleteKey} title="Delete API Key" message={`Delete "${deleteKeyTarget?.name}"? This cannot be undone.`} confirmLabel={t('common.delete')} loading={deleteApiKey.isPending} />
      <ConfirmDialog isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} onConfirm={handleReset} title={t('settings.resetData')} message={t('settings.resetDataDesc')} confirmLabel={t('settings.reset')} loading={resetAll.isPending} />
    </div>
  )
}
