import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Modal } from '../components/ui/Modal'
import { FormSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/useToast'
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from '../hooks/useSettings'

export function Settings() {
  const { t } = useTranslation()
  const { toast } = useToast()

  const { data: apiKeysData, isLoading: keysLoading } = useApiKeys()
  const createApiKey = useCreateApiKey()
  const deleteApiKey = useDeleteApiKey()

  const [newKeyName, setNewKeyName] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [deleteKeyTarget, setDeleteKeyTarget] = useState<{ id: string; name: string } | null>(null)

  const apiKeys = apiKeysData?.items || []

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

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold gradient-text">{t('settings.title')}</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">{t('settings.description')}</p>
      </div>

      <Card className="stagger-item" style={{ animationDelay: '100ms' }}>
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
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs text-surface-500 dark:text-surface-400 font-mono">{key.key_prefix}...</code>
                        <span className={`text-xs px-2 py-0.5 rounded ${key.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-400'}`}>
                          {key.is_active ? t('settings.active') : t('settings.inactive')}
                        </span>
                        <span className="text-xs text-surface-500 dark:text-surface-500">{key.scope}</span>
                      </div>
                      <p className="text-xs text-surface-500 dark:text-surface-500 mt-1">{t('settings.created')} {new Date(key.created_at).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteKeyTarget({ id: key.id, name: key.name })}>{t('common.delete')}</Button>
                  </div>
                </div>
              ))}
              <Button variant="secondary" onClick={() => setShowKeyModal(true)}>{t('settings.createApiKey')}</Button>
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  )
}
