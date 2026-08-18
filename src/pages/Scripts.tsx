import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Tooltip } from '../components/ui/Tooltip'
import { DragDropList } from '../components/ui/DragDropList'
import { TableSkeleton, CardListSkeleton } from '../components/ui/Skeleton'
import { IconScripts, IconGrip } from '../components/ui/Icons'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import {
  useScripts,
  useCreateScript,
  useDeleteScript,
  useRunScript,
  useUpdateScript,
  useCloneScript,
  useSetScriptSchedule,
  useScriptExecutions,
  useCancelScriptExecution,
  useRetryScriptExecution,
} from '../hooks/useScripts'
import { useToast } from '../components/ui/useToast'
import type { Script } from '../api/types'

export function Scripts() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data, isLoading } = useScripts()
  const createScript = useCreateScript()
  const deleteScript = useDeleteScript()
  const runScript = useRunScript()
  const cancelExec = useCancelScriptExecution()
  const retryExec = useRetryScriptExecution()
  const updateScript = useUpdateScript()
  const cloneScript = useCloneScript()
  const setSchedule = useSetScriptSchedule()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [newScript, setNewScript] = useState({ name: '', description: '' })

  const [executionsScriptId, setExecutionsScriptId] = useState<string | null>(null)
  const [editScript, setEditScript] = useState<Script | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [cloneTarget, setCloneTarget] = useState<{ id: string; name: string } | null>(null)
  const [scheduleTarget, setScheduleTarget] = useState<{ id: string; name: string } | null>(null)
  const [scheduleCron, setScheduleCron] = useState('')

  const scripts = data?.items || []
  const [orderedScripts, setOrderedScripts] = useState<Script[]>([])
  const displayScripts = orderedScripts.length > 0 ? orderedScripts : scripts
  const [dragMode, setDragMode] = useState(false)

  useEffect(() => {
    if (orderedScripts.length > 0 && scripts.length > 0) {
      const scriptIds = new Set(scripts.map((s) => s.id))
      const validOrdered = orderedScripts.filter((s) => scriptIds.has(s.id))
      if (validOrdered.length !== orderedScripts.length) {
        setOrderedScripts(validOrdered)
      }
    }
  }, [scripts, orderedScripts])

  const handleReorder = useCallback((reordered: Script[]) => { setOrderedScripts(reordered) }, [])

  const renderScriptCard = (script: Script, index: number = 0) => (
    <Card key={script.id} className="stagger-item" style={{ animationDelay: `${index * 80}ms` }}>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {dragMode && <div className="mt-1 text-surface-400 dark:text-surface-500"><IconGrip className="w-4 h-4" /></div>}
            <div>
              <h3 className="text-lg font-medium text-surface-900 dark:text-white">{script.name}</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{script.description}</p>
            </div>
          </div>
          <Badge variant="info">{script.steps.length} {t('scripts.steps')}</Badge>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {script.tags.map((tag) => (<Badge key={tag} variant="default">{tag}</Badge>))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200 dark:border-surface-800">
          <div className="text-xs text-surface-500 dark:text-surface-500">
            <span>{t('scripts.steps')}: {script.steps.length}</span>
            <span className="mx-2">·</span>
            <span>{t('scripts.updated')}: {new Date(script.updated_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <FavoriteButton targetType="script" targetId={script.id} size="sm" />
            <Button variant="ghost" size="sm" onClick={() => { setExecutionsScriptId(script.id) }}>{t('scripts.executions')}</Button>
            <Button variant="ghost" size="sm" onClick={() => { setCloneTarget({ id: script.id, name: script.name }) }}>{t('scripts.clone')}</Button>
            <Button variant="ghost" size="sm" onClick={() => { setScheduleTarget({ id: script.id, name: script.name }); setScheduleCron('') }}>{t('scripts.schedule')}</Button>
            <Button variant="ghost" size="sm" onClick={() => { setEditScript(script); setEditName(script.name); setEditDesc(script.description || '') }}>{t('scripts.edit')}</Button>
            <Button variant="secondary" size="sm" onClick={() => handleRun(script.id, script.name)} disabled={runScript.isPending}>
              {runScript.isPending ? <Spinner size="sm" /> : t('scripts.run')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: script.id, name: script.name })}>{t('common.delete')}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const handleCreate = () => {
    createScript.mutate(
      { name: newScript.name, description: newScript.description, steps: [{ label: 'Step 1', type: 'inline', command: '#!/bin/bash\necho "Hello"', command_id: null, params: {}, on_failure: 'stop' }] },
      { onSuccess: () => { toast('success', t('scripts.toastCreated', { name: newScript.name })); setShowCreateModal(false); setNewScript({ name: '', description: '' }) }, onError: () => toast('error', t('scripts.toastCreateFailed')) },
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteScript.mutate(deleteTarget.id, { onSuccess: () => { toast('success', t('scripts.toastDeleted', { name: deleteTarget.name })); setDeleteTarget(null) }, onError: () => toast('error', t('scripts.toastDeleteFailed')) })
  }

  const handleRun = (id: string, name: string) => {
    runScript.mutate({ id, data: {} }, { onSuccess: () => toast('success', t('scripts.toastStarted', { name })), onError: () => toast('error', t('scripts.toastRunFailed', { name })) })
  }

  const handleClone = () => {
    if (!cloneTarget) return
    cloneScript.mutate({ id: cloneTarget.id }, {
      onSuccess: () => { toast('success', t('scripts.toastCloned', { name: cloneTarget.name })); setCloneTarget(null) },
      onError: () => toast('error', t('scripts.toastCloneFailed')),
    })
  }

  const handleSaveEdit = () => {
    if (!editScript) return
    updateScript.mutate({ id: editScript.id, data: { name: editName, description: editDesc } }, {
      onSuccess: () => { toast('success', t('scripts.toastUpdated')); setEditScript(null) },
      onError: () => toast('error', t('scripts.toastUpdateFailed')),
    })
  }

  const handleSetSchedule = () => {
    if (!scheduleTarget) return
    setSchedule.mutate({ id: scheduleTarget.id, data: { cron: scheduleCron } }, {
      onSuccess: () => { toast('success', t('scripts.toastScheduleSet')); setScheduleTarget(null) },
      onError: () => toast('error', t('scripts.toastScheduleFailed')),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('scripts.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{t('scripts.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          {scripts.length > 1 && (
            <Tooltip content={dragMode ? t('scripts.exitReorder') : t('scripts.reorder')}>
              <Button variant={dragMode ? 'secondary' : 'ghost'} size="sm" onClick={() => { setDragMode(!dragMode); if (dragMode) setOrderedScripts([]) }}><IconGrip className="w-4 h-4" /></Button>
            </Tooltip>
          )}
          <Button onClick={() => setShowCreateModal(true)}>{t('scripts.createScript')}</Button>
        </div>
      </div>

      {isLoading ? <CardListSkeleton count={4} /> : scripts.length === 0 ? (
        <EmptyState icon={<IconScripts className="w-10 h-10" />} title={t('scripts.emptyTitle')} description={t('scripts.emptyDesc')} action={<Button onClick={() => setShowCreateModal(true)}>{t('scripts.createScript')}</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dragMode ? (
            <DragDropList items={displayScripts} onReorder={handleReorder} keyExtractor={(s) => s.id} renderItem={(script, index) => renderScriptCard(script, index)} />
          ) : displayScripts.map((script, index) => renderScriptCard(script, index))}
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('scripts.createScript')} size="lg">
        <div className="space-y-4">
          <Input label={t('settings.name')} placeholder="backup-db.sh" value={newScript.name} onChange={(e) => setNewScript({ ...newScript, name: e.target.value })} />
          <Input label={t('scripts.description')} placeholder="Backup PostgreSQL database" value={newScript.description} onChange={(e) => setNewScript({ ...newScript, description: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreate} disabled={createScript.isPending || !newScript.name}>{createScript.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editScript} onClose={() => setEditScript(null)} title={`${t('scripts.edit')}: ${editScript?.name || ''}`}>
        <div className="space-y-4">
          <Input label={t('settings.name')} value={editName} onChange={(e) => setEditName(e.target.value)} />
          <Input label={t('scripts.description')} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditScript(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleSaveEdit}>{t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!executionsScriptId} onClose={() => setExecutionsScriptId(null)} title={t('scripts.executions')} size="lg">
        <ScriptExecutionsContent scriptId={executionsScriptId || ''} onCancel={(eid) => cancelExec.mutate(eid, { onSuccess: () => toast('success', t('scripts.toastCancelled')) })} onRetry={(eid) => retryExec.mutate(eid, { onSuccess: () => toast('success', t('scripts.toastRetried')) })} />
      </Modal>

      <Modal isOpen={!!scheduleTarget} onClose={() => setScheduleTarget(null)} title={`${t('scripts.schedule')}: ${scheduleTarget?.name || ''}`}>
        <div className="space-y-4">
          <Input label={t('scripts.cronExpression')} placeholder="0 2 * * *" value={scheduleCron} onChange={(e) => setScheduleCron(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setScheduleTarget(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleSetSchedule}>{t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!cloneTarget} onClose={() => setCloneTarget(null)} onConfirm={handleClone} title={t('scripts.cloneTitle')} message={t('scripts.cloneMsg', { name: cloneTarget?.name })} confirmLabel={t('scripts.clone')} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={t('scripts.deleteTitle')} message={t('scripts.deleteMsg', { name: deleteTarget?.name })} confirmLabel={t('common.delete')} loading={deleteScript.isPending} />
    </div>
  )
}

function ScriptExecutionsContent({ scriptId, onCancel, onRetry }: { scriptId: string; onCancel: (id: string) => void; onRetry: (id: string) => void }) {
  const { t } = useTranslation()
  const { data, isLoading } = useScriptExecutions(scriptId, { size: 20 })
  const items = data?.items || []
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {isLoading ? <TableSkeleton rows={5} cols={4} /> : items.length === 0 ? (
        <p className="text-sm text-surface-500 text-center py-4">{t('scripts.emptyExecutions')}</p>
      ) : items.map((exec) => (
        <div key={exec.id} className="flex items-center justify-between py-3 border-b border-surface-200 dark:border-surface-800 last:border-0">
          <div className="flex items-center gap-3">
            <Badge variant={exec.status === 'completed' ? 'success' : exec.status === 'failed' ? 'danger' : exec.status === 'running' ? 'warning' : 'default'}>{exec.status}</Badge>
            <div>
              <p className="text-sm text-surface-900 dark:text-white">Node: {exec.node_id || 'all'}</p>
              <p className="text-xs text-surface-500">{new Date(exec.started_at).toLocaleString()}{exec.finished_at ? ` → ${new Date(exec.finished_at).toLocaleString()}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {exec.status === 'running' && <Button variant="ghost" size="sm" onClick={() => onCancel(exec.id)}>{t('scripts.cancel')}</Button>}
            {exec.status === 'failed' && <Button variant="ghost" size="sm" onClick={() => onRetry(exec.id)}>{t('common.retry')}</Button>}
          </div>
        </div>
      ))}
    </div>
  )
}
