import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Modal } from '../components/ui/Modal'
import { FormSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/useToast'
import { useApiKeys, useCreateApiKey, useUpdateApiKey, useDeleteApiKey, useConfigExport, useConfigImport } from '../hooks/useSettings'
import type { DryRunImportResult } from '../api/types'

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
  const [newKeyScope, setNewKeyScope] = useState<'read-only' | 'read-write'>('read-write')
  const [newKeyExpiresAt, setNewKeyExpiresAt] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [createdKey, setCreatedKey] = useState<{ id: string; name: string; key: string; key_prefix: string; created_at: string } | null>(null)
  const [editKeyTarget, setEditKeyTarget] = useState<{ id: string; name: string; scope: string; is_active: boolean; expires_at: string | null } | null>(null)
  const [editKeyName, setEditKeyName] = useState('')
  const [editKeyScope, setEditKeyScope] = useState<'read-only' | 'read-write'>('read-only')
  const [editKeyActive, setEditKeyActive] = useState(true)
  const [editKeyExpiresAt, setEditKeyExpiresAt] = useState('')
  const [deleteKeyTarget, setDeleteKeyTarget] = useState<{ id: string; name: string } | null>(null)
  const [importPreview, setImportPreview] = useState<{ data: Record<string, unknown>; result: DryRunImportResult } | null>(null)

  const apiKeys = apiKeysData?.items || []

  const handleCreateKey = () => {
    createApiKey.mutate({ name: newKeyName, scope: newKeyScope, expires_at: newKeyExpiresAt || undefined }, {
      onSuccess: (result) => { setCreatedKey(result); setShowKeyModal(false); setNewKeyName(''); setNewKeyScope('read-write'); setNewKeyExpiresAt('') },
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
    updateApiKey.mutate({ id: editKeyTarget.id, data: { name: editKeyName, scope: editKeyScope, is_active: editKeyActive, expires_at: editKeyExpiresAt ? new Date(editKeyExpiresAt).toISOString() : null } }, {
      onSuccess: () => { toast('success', t('settings.toastKeyUpdated')); setEditKeyTarget(null) },
      onError: () => toast('error', t('settings.toastKeyUpdateFailed')),
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
        toast('success', t('settings.toastConfigExported'))
      }
    } catch {
      toast('error', t('settings.toastConfigExportFailed'))
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        configImport.mutate({ ...data, dry_run: true }, {
          onSuccess: (result) => {
            if ('would_create' in result) {
              setImportPreview({ data, result })
            }
          },
          onError: () => toast('error', t('settings.toastConfigImportFailed')),
        })
      } catch {
        toast('error', t('settings.toastInvalidJson'))
      }
    }
    reader.readAsText(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleConfirmImport = () => {
    if (!importPreview) return
    configImport.mutate(importPreview.data, {
      onSuccess: (result) => {
        if ('nodes_created' in result) {
          const summary = [result.nodes_created, result.commands_created, result.scripts_created].filter(Boolean).join(', ')
          toast('success', summary ? t('settings.toastConfigImported', { summary }) : t('settings.toastConfigImportNoop'))
        }
        setImportPreview(null)
      },
      onError: () => toast('error', t('settings.toastConfigImportFailed')),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('settings.title')} description={t('settings.description')} />

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
                        <Badge variant={key.scope === 'read-write' ? 'warning' : 'info'}>{key.scope}</Badge>
                      </div>
                      <p className="text-xs text-surface-500 dark:text-surface-500 mt-1">
                        {t('settings.created')} {new Date(key.created_at).toLocaleDateString()}
                        {key.last_used_at && (
                          <> · {t('settings.lastUsed', 'Last used')} {new Date(key.last_used_at).toLocaleString()}</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditKeyTarget({ id: key.id, name: key.name, scope: key.scope, is_active: key.is_active, expires_at: key.expires_at }); setEditKeyName(key.name); setEditKeyScope(key.scope); setEditKeyActive(key.is_active); setEditKeyExpiresAt(key.expires_at ? new Date(key.expires_at).toISOString().slice(0, 16) : '') }}>{t('common.edit')}</Button>
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
        <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('settings.config')}</h2></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleExport} disabled={configExport.isFetching}>{t('settings.exportConfig')}</Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={configImport.isPending}>{t('settings.importConfig')}</Button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
          {configImport.isPending && <p className="text-sm text-surface-500 mt-2">{t('settings.importing')}</p>}
        </CardContent>
      </Card>

      <Modal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} title={t('settings.createApiKey')} size="sm">
        <div className="space-y-4">
          <Input label={t('settings.keyName')} placeholder="my-api-key" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.scope')}</label>
            <select value={newKeyScope} onChange={(e) => setNewKeyScope(e.target.value as 'read-only' | 'read-write')} className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
              <option value="read-only">{t('settings.readOnly')}</option>
              <option value="read-write">{t('settings.readWrite')}</option>
            </select>
          </div>
          <Input label={t('settings.expiresAt', 'Expires At (optional)')} type="datetime-local" value={newKeyExpiresAt} onChange={(e) => setNewKeyExpiresAt(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowKeyModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreateKey} disabled={createApiKey.isPending || !newKeyName}>
              {createApiKey.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!createdKey} onClose={() => setCreatedKey(null)} title={t('settings.apiKeyCreated', 'API Key Created')} size="sm">
        <div className="space-y-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-300 mb-2">{t('settings.apiKeyWarning', 'Copy this key now. You won\'t be able to see it again.')}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono bg-white dark:bg-surface-800 p-2 rounded border border-surface-200 dark:border-surface-700 break-all">{createdKey?.key}</code>
              <Button variant="secondary" size="sm" onClick={() => { navigator.clipboard.writeText(createdKey?.key || ''); toast('success', t('settings.keyCopied', 'Key copied to clipboard')) }}>{t('common.copy', 'Copy')}</Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setCreatedKey(null)}>{t('common.done', 'Done')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editKeyTarget} onClose={() => setEditKeyTarget(null)} title={`${t('common.edit')} API Key: ${editKeyTarget?.name || ''}`} size="sm">
        <div className="space-y-4">
          <Input label={t('settings.name')} value={editKeyName} onChange={(e) => setEditKeyName(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.scope')}</label>
            <select value={editKeyScope} onChange={(e) => setEditKeyScope(e.target.value as 'read-only' | 'read-write')} className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
              <option value="read-only">{t('settings.readOnly')}</option>
              <option value="read-write">{t('settings.readWrite')}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={editKeyActive} onChange={(e) => setEditKeyActive(e.target.checked)} className="rounded border-surface-300 dark:border-surface-600" />
            <span className="text-sm text-surface-700 dark:text-surface-300">{t('settings.active')}</span>
          </div>
          <Input label={t('settings.expiresAt', 'Expires At (optional)')} type="datetime-local" value={editKeyExpiresAt} onChange={(e) => setEditKeyExpiresAt(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditKeyTarget(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleSaveEditKey} disabled={updateApiKey.isPending}>{updateApiKey.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!importPreview} onClose={() => setImportPreview(null)} title={t('settings.importPreview', 'Import Preview')} size="md">
        <div className="space-y-4">
          {importPreview?.result.would_create.nodes && importPreview.result.would_create.nodes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">{t('settings.nodesToCreate', 'Nodes to create')}: {importPreview.result.would_create.nodes.length}</h4>
              <div className="space-y-1">
                {(importPreview.result.would_create.nodes as { name: string; host: string }[]).map((n, i) => (
                  <div key={i} className="text-xs text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800/50 p-2 rounded">{n.name} ({n.host})</div>
                ))}
              </div>
            </div>
          )}
          {importPreview?.result.would_create.commands && importPreview.result.would_create.commands.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">{t('settings.commandsToCreate', 'Commands to create')}: {importPreview.result.would_create.commands.length}</h4>
              <div className="space-y-1">
                {(importPreview.result.would_create.commands as { name: string }[]).map((c, i) => (
                  <div key={i} className="text-xs text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800/50 p-2 rounded">{c.name}</div>
                ))}
              </div>
            </div>
          )}
          {importPreview?.result.would_create.scripts && importPreview.result.would_create.scripts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">{t('settings.scriptsToCreate', 'Scripts to create')}: {importPreview.result.would_create.scripts.length}</h4>
              <div className="space-y-1">
                {(importPreview.result.would_create.scripts as { name: string }[]).map((s, i) => (
                  <div key={i} className="text-xs text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800/50 p-2 rounded">{s.name}</div>
                ))}
              </div>
            </div>
          )}
          {importPreview?.result.duplicates && importPreview.result.duplicates.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">{t('settings.duplicates', 'Duplicates')}: {importPreview.result.duplicates.length}</h4>
              <div className="space-y-1">
                {importPreview.result.duplicates.map((d, i) => (
                  <div key={i} className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">{d}</div>
                ))}
              </div>
            </div>
          )}
          {importPreview?.result.errors && importPreview.result.errors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">{t('settings.errors', 'Errors')}: {importPreview.result.errors.length}</h4>
              <div className="space-y-1">
                {importPreview.result.errors.map((e, i) => (
                  <div key={i} className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">{e}</div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setImportPreview(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleConfirmImport} disabled={configImport.isPending}>{configImport.isPending ? t('common.loading') : t('settings.confirmImport', 'Confirm Import')}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteKeyTarget} onClose={() => setDeleteKeyTarget(null)} onConfirm={handleDeleteKey} title={t('settings.deleteTitle')} message={t('settings.deleteMsg', { name: deleteKeyTarget?.name })} confirmLabel={t('common.delete')} loading={deleteApiKey.isPending} />
    </div>
  )
}
