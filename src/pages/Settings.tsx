import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Toggle } from '../components/ui/Toggle'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Modal } from '../components/ui/Modal'
import { FormSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/Toast'
import {
  useProfile, useUpdateProfile, useApiKeys, useCreateApiKey, useDeleteApiKey,
  useNotificationSettings, useUpdateNotificationSettings, useResetAllData,
} from '../hooks/useSettings'

export function Settings() {
  const { t } = useTranslation()
  const { toast } = useToast()

  const { isLoading: profileLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const { data: apiKeysData, isLoading: keysLoading } = useApiKeys()
  const createApiKey = useCreateApiKey()
  const deleteApiKey = useDeleteApiKey()
  const { data: notifData } = useNotificationSettings()
  const updateNotifs = useUpdateNotificationSettings()
  const resetAll = useResetAllData()

  const [name, setName] = useState('Admin')
  const [email, setEmail] = useState('admin@example.com')
  const [newKeyName, setNewKeyName] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [deleteKeyTarget, setDeleteKeyTarget] = useState<{ id: string; name: string } | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const apiKeys = apiKeysData?.data || []

  const handleSaveProfile = () => {
    updateProfile.mutate({ name, email }, {
      onSuccess: () => toast('success', t('settings.toastProfileUpdated')),
      onError: () => toast('error', t('settings.toastProfileFailed')),
    })
  }

  const handleCreateKey = () => {
    createApiKey.mutate({ name: newKeyName }, {
      onSuccess: () => { toast('success', t('settings.toastKeyCreated')); setShowKeyModal(false); setNewKeyName('') },
      onError: () => toast('error', t('settings.toastKeyCreateFailed')),
    })
  }

  const handleDeleteKey = () => {
    if (!deleteKeyTarget) return
    deleteApiKey.mutate(deleteKeyTarget.id, {
      onSuccess: () => { toast('success', t('settings.toastKeyDeleted')); setDeleteKeyTarget(null) },
      onError: () => toast('error', t('settings.toastKeyDeleteFailed')),
    })
  }

  const handleReset = () => {
    resetAll.mutate(undefined, {
      onSuccess: () => { toast('success', t('settings.toastResetDone')); setShowResetConfirm(false) },
      onError: () => toast('error', t('settings.toastResetFailed')),
    })
  }

  const toggleNotif = (key: 'nodeOfflineAlerts' | 'commandNotifications') => {
    if (!notifData?.data) return
    updateNotifs.mutate({ ...notifData.data, [key]: !notifData.data[key] })
  }

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold gradient-text">{t('settings.title')}</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">{t('settings.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up stagger-item" style={{ animationDelay: '100ms' }}>
          <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('settings.profile')}</h2></CardHeader>
          <CardContent>
            {profileLoading ? <FormSkeleton fields={3} /> : (
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

        <Card className="stagger-item" style={{ animationDelay: '200ms' }}>
          <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('settings.apiKeys')}</h2></CardHeader>
          <CardContent>
            {keysLoading ? <FormSkeleton fields={2} /> : (
              <div className="space-y-4">
                {apiKeys.length === 0 ? (
                  <p className="text-sm text-surface-500 dark:text-surface-500">{t('settings.noKeys')}</p>
                ) : apiKeys.map((key) => (
                  <div key={key.id} className="p-3 bg-surface-50 rounded-lg dark:bg-surface-800/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{key.name}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-500">{t('settings.created')} {new Date(key.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-surface-500 dark:text-surface-400 font-mono">{key.key.slice(0, 4)}...{key.key.slice(-4)}</code>
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

        <Card className="stagger-item" style={{ animationDelay: '300ms' }}>
          <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('settings.notifications')}</h2></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: 'nodeOfflineAlerts' as const, label: t('settings.nodeOfflineAlerts'), desc: t('settings.nodeOfflineDesc') },
                { key: 'commandNotifications' as const, label: t('settings.commandNotifications'), desc: t('settings.commandNotificationsDesc') },
              ].map((item) => (
                <Toggle
                  key={item.key}
                  checked={notifData?.data?.[item.key] ?? true}
                  onChange={() => toggleNotif(item.key)}
                  label={item.label}
                  description={item.desc}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="stagger-item" style={{ animationDelay: '400ms' }}>
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
          <Input label={t('settings.keyName')} placeholder="my-api-key" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowKeyModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreateKey} disabled={createApiKey.isPending || !newKeyName}>
              {createApiKey.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteKeyTarget} onClose={() => setDeleteKeyTarget(null)} onConfirm={handleDeleteKey} title={t('settings.deleteTitle')} message={t('settings.deleteMsg', { name: deleteKeyTarget?.name })} confirmLabel={t('common.delete')} loading={deleteApiKey.isPending} />
      <ConfirmDialog isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} onConfirm={handleReset} title={t('settings.resetData')} message={t('settings.resetDataDesc')} confirmLabel={t('settings.reset')} loading={resetAll.isPending} />
    </div>
  )
}
