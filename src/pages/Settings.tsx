import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Modal } from '../components/ui/Modal'
import { FormSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/useToast'
import { useApiKeys, useCreateApiKey, useUpdateApiKey, useDeleteApiKey, useConfigExport, useConfigImport } from '../hooks/useSettings'

export function Settings() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: apiKeysData, isLoading: keysLoading } = useApiKeys()
  const createApiKey = useCreateApiKey()
  const updateApiKey = useUpdateApiKey()
  const deleteApiKey = useDeleteApiKey()
  const configImport = useConfigImport()
  const configExport = useConfigExport()

  const [newKeyName, setNewKeyName] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [editKeyTarget, setEditKeyTarget] = useState<{ id: string; name: string; scope: string; is_active: boolean } | null>(null)
  const [editKeyName, setEditKeyName] = useState('')
  const [editKeyScope, setEditKeyScope] = useState<'read-only' | 'read-write'>('read-only')
  const [editKeyActive, setEditKeyActive] = useState(true)
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

  const handleSaveEditKey = () => {
    if (!editKeyTarget) return
    updateApiKey.mutate({ id: editKeyTarget.id, data: { name: editKeyName, scope: editKeyScope, is_active: editKeyActive } }, {
      onSuccess: () => { toast('success', 'API key updated'); setEditKeyTarget(null) },
      onError: () => toast('error', 'Failed to update API key'),
    })
  }

  const handleExport = async () => {
    try {
      const data = await configExport.refetch()
      if (data.data) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `node-nexus-config-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast('success', 'Config exported')
      }
    } catch {
      toast('error', 'Failed to export config')
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        configImport.mutate(data, {
          onSuccess: () => toast('success', 'Config imported'),
          onError: () => toast('error', 'Failed to import config'),
        })
      } catch {
        toast('error', 'Invalid JSON file')
      }
    }
    reader.readAsText(file)
    if (fileRef.current) fileRef.current.value = ''
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
                    <div className="flex-1">
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
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditKeyTarget({ id: key.id, name: key.name, scope: key.scope, is_active: key.is_active }); setEditKeyName(key.name); setEditKeyScope(key.scope); setEditKeyActive(key.is_active) }}>Edit</Button>
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

      <Card className="stagger-item" style={{ animationDelay: '200ms' }}>
        <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">Config</h2></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleExport} disabled={configExport.isFetching}>Export Config</Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={configImport.isPending}>Import Config</Button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
          {configImport.isPending && <p className="text-sm text-surface-500 mt-2">Importing...</p>}
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

      <Modal isOpen={!!editKeyTarget} onClose={() => setEditKeyTarget(null)} title={`Edit API Key: ${editKeyTarget?.name || ''}`} size="sm">
        <div className="space-y-4">
          <Input label="Name" value={editKeyName} onChange={(e) => setEditKeyName(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Scope</label>
            <select value={editKeyScope} onChange={(e) => setEditKeyScope(e.target.value as 'read-only' | 'read-write')} className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
              <option value="read-only">Read Only</option>
              <option value="read-write">Read Write</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={editKeyActive} onChange={(e) => setEditKeyActive(e.target.checked)} className="rounded border-surface-300 dark:border-surface-600" />
            <span className="text-sm text-surface-700 dark:text-surface-300">Active</span>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditKeyTarget(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleSaveEditKey} disabled={updateApiKey.isPending}>{updateApiKey.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteKeyTarget} onClose={() => setDeleteKeyTarget(null)} onConfirm={handleDeleteKey} title={t('settings.deleteTitle')} message={t('settings.deleteMsg', { name: deleteKeyTarget?.name })} confirmLabel={t('common.delete')} loading={deleteApiKey.isPending} />
    </div>
  )
}
