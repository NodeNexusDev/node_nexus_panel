import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useScripts, useCreateScript, useDeleteScript, useRunScript } from '../hooks/useScripts'
import { useToast } from '../components/ui/Toast'

export function Scripts() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data, isLoading } = useScripts()
  const createScript = useCreateScript()
  const deleteScript = useDeleteScript()
  const runScript = useRunScript()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [newScript, setNewScript] = useState({ name: '', description: '', content: '' })

  const scripts = data?.data || []

  const handleCreate = () => {
    createScript.mutate(newScript, {
      onSuccess: () => {
        toast('success', `Script "${newScript.name}" created`)
        setShowCreateModal(false)
        setNewScript({ name: '', description: '', content: '' })
      },
      onError: () => toast('error', 'Failed to create script'),
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteScript.mutate(deleteTarget.id, {
      onSuccess: () => { toast('success', `Script "${deleteTarget.name}" deleted`); setDeleteTarget(null) },
      onError: () => toast('error', 'Failed to delete script'),
    })
  }

  const handleRun = (id: string, name: string) => {
    runScript.mutate(
      { id },
      {
        onSuccess: () => toast('success', `Script "${name}" started`),
        onError: () => toast('error', `Failed to run script "${name}"`),
      },
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t('scripts.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400">{t('scripts.description')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>{t('scripts.createScript')}</Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Spinner /></div>
      ) : scripts.length === 0 ? (
        <EmptyState icon="📜" title="No scripts" description="Create your first script to automate tasks" action={<Button onClick={() => setShowCreateModal(true)}>{t('scripts.createScript')}</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scripts.map((script) => (
            <Card key={script.id}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-surface-900 dark:text-white">{script.name}</h3>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{script.description}</p>
                  </div>
                  <Badge variant={script.status === 'success' ? 'success' : script.status === 'manual' ? 'info' : 'default'}>{script.status}</Badge>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200 dark:border-surface-800">
                  <div className="text-xs text-surface-500 dark:text-surface-500">
                    <span>{t('scripts.schedule')}: {script.schedule}</span>
                    <span className="mx-2">·</span>
                    <span>{t('scripts.lastRun')}: {script.lastRun}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">{t('scripts.edit')}</Button>
                    <Button variant="secondary" size="sm" onClick={() => handleRun(script.id, script.name)} disabled={runScript.isPending}>
                      {runScript.isPending ? <Spinner size="sm" /> : t('scripts.run')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: script.id, name: script.name })}>
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('scripts.createScript')} size="lg">
        <div className="space-y-4">
          <Input label={t('scripts.title')} placeholder="backup-db.sh" value={newScript.name} onChange={(e) => setNewScript({ ...newScript, name: e.target.value })} />
          <Input label={t('scripts.description')} placeholder="Backup PostgreSQL database" value={newScript.description} onChange={(e) => setNewScript({ ...newScript, description: e.target.value })} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">Content</label>
            <textarea
              value={newScript.content}
              onChange={(e) => setNewScript({ ...newScript, content: e.target.value })}
              placeholder="#!/bin/bash&#10;echo 'Hello'"
              rows={8}
              className="w-full px-4 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 text-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono resize-none dark:bg-surface-800 dark:border-surface-700 dark:text-white dark:placeholder-surface-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreate} disabled={createScript.isPending || !newScript.name}>
              {createScript.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Script" message={`Are you sure you want to delete "${deleteTarget?.name}"?`} confirmLabel={t('common.delete')} loading={deleteScript.isPending} />
    </div>
  )
}
