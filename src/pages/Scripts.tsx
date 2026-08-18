import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { CardListSkeleton } from '../components/ui/Skeleton'
import { Pagination } from '../components/ui/Pagination'
import { PageHeader } from '../components/ui/PageHeader'
import { SearchInput } from '../components/ui/SearchInput'
import { IconScripts } from '../components/ui/Icons'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import {
  useScripts,
  useScriptTags,
  useCreateScript,
  useDeleteScript,
  useRunScript,
  useUpdateScript,
  useCloneScript,
  useSetScriptSchedule,
  useRemoveScriptSchedule,
} from '../hooks/useScripts'
import { useNodes } from '../hooks/useNodes'
import { useToast } from '../components/ui/useToast'
import type { Script } from '../api/types'

type StepInput = { label: string; type: 'inline' | 'command'; command: string; command_id: string; params: Record<string, unknown>; on_failure: 'stop' | 'continue' }

export function Scripts() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20
  const { data, isLoading } = useScripts({ page, size: pageSize, search: search || undefined, tag: tagFilter || undefined })
  const { data: tags } = useScriptTags()
  const { data: nodesData } = useNodes({ size: 100 })
  const nodes = nodesData?.items || []
  const createScript = useCreateScript()
  const deleteScript = useDeleteScript()
  const runScript = useRunScript()
  const updateScript = useUpdateScript()
  const cloneScript = useCloneScript()
  const setSchedule = useSetScriptSchedule()
  const removeSchedule = useRemoveScriptSchedule()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [newScript, setNewScript] = useState({ name: '', description: '', tags: '' })
  const [newScriptSteps, setNewScriptSteps] = useState<StepInput[]>([
    { label: 'Step 1', type: 'inline', command: '', command_id: '', params: {}, on_failure: 'stop' }
  ])

  const [runTarget, setRunTarget] = useState<Script | null>(null)
  const [runNodeId, setRunNodeId] = useState('')
  const [runTags, setRunTags] = useState('')
  const [editScript, setEditScript] = useState<Script | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editSteps, setEditSteps] = useState<StepInput[]>([])
  const [cloneTarget, setCloneTarget] = useState<{ id: string; name: string } | null>(null)
  const [scheduleTarget, setScheduleTarget] = useState<{ id: string; name: string } | null>(null)
  const [scheduleCron, setScheduleCron] = useState('')
  const [scheduleNodeIds, setScheduleNodeIds] = useState<string[]>([])
  const [scheduleTimezone, setScheduleTimezone] = useState('UTC')
  const [scheduleMisfireGrace, setScheduleMisfireGrace] = useState(60)

  const scripts = data?.items || []

  const renderScriptCard = (script: Script) => (
    <Card key={script.id} hover className="stagger-item cursor-pointer" onClick={() => navigate(`/scripts/${script.id}`)}>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-medium text-surface-900 dark:text-white truncate">{script.name}</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{script.description}</p>
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
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setCloneTarget({ id: script.id, name: script.name }) }}>{t('scripts.clone')}</Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setScheduleTarget({ id: script.id, name: script.name }); setScheduleCron(''); setScheduleNodeIds([]); setScheduleTimezone('UTC'); setScheduleMisfireGrace(60) }}>{t('scripts.schedule')}</Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditScript(script); setEditName(script.name); setEditDesc(script.description || ''); setEditTags(script.tags.join(', ')); setEditSteps(script.steps.map((s) => ({ label: s.label, type: s.type, command: s.command || '', command_id: s.command_id || '', params: s.params || {}, on_failure: s.on_failure || 'stop' }))) }}>{t('scripts.edit')}</Button>
            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleRun(script) }} disabled={runScript.isPending}>
              {runScript.isPending ? <Spinner size="sm" /> : t('scripts.run')}
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: script.id, name: script.name }) }}>{t('common.delete')}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const handleCreate = () => {
    createScript.mutate(
      {
        name: newScript.name,
        description: newScript.description || undefined,
        tags: newScript.tags ? newScript.tags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        steps: newScriptSteps.map((s) => ({
          label: s.label,
          type: s.type,
          command: s.type === 'inline' ? s.command || null : null,
          command_id: s.type === 'command' ? s.command_id || null : null,
          params: Object.keys(s.params).length > 0 ? s.params : undefined,
          on_failure: s.on_failure,
        })),
      },
      { onSuccess: () => { toast('success', t('scripts.toastCreated', { name: newScript.name })); setShowCreateModal(false); setNewScript({ name: '', description: '', tags: '' }); setNewScriptSteps([{ label: 'Step 1', type: 'inline', command: '', command_id: '', params: {}, on_failure: 'stop' }]) }, onError: () => toast('error', t('scripts.toastCreateFailed')) },
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteScript.mutate(deleteTarget.id, { onSuccess: () => { toast('success', t('scripts.toastDeleted', { name: deleteTarget.name })); setDeleteTarget(null) }, onError: () => toast('error', t('scripts.toastDeleteFailed')) })
  }

  const handleRun = (script: Script) => {
    setRunTarget(script)
    setRunNodeId('')
    setRunTags('')
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
    updateScript.mutate({
      id: editScript.id,
      data: {
        name: editName,
        description: editDesc,
        tags: editTags ? editTags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        steps: editSteps.map((s) => ({
          label: s.label,
          type: s.type,
          command: s.type === 'inline' ? s.command || null : null,
          command_id: s.type === 'command' ? s.command_id || null : null,
          params: Object.keys(s.params).length > 0 ? s.params : undefined,
          on_failure: s.on_failure,
        })),
      },
    }, {
      onSuccess: () => { toast('success', t('scripts.toastUpdated')); setEditScript(null) },
      onError: () => toast('error', t('scripts.toastUpdateFailed')),
    })
  }

  const handleSetSchedule = () => {
    if (!scheduleTarget) return
    if (!scheduleCron.trim()) {
      removeSchedule.mutate(scheduleTarget.id, {
        onSuccess: () => { toast('success', t('scripts.toastScheduleRemoved')); setScheduleTarget(null) },
        onError: () => toast('error', t('scripts.toastScheduleFailed')),
      })
    } else {
      setSchedule.mutate({ id: scheduleTarget.id, data: { cron: scheduleCron, node_ids: scheduleNodeIds, timezone: scheduleTimezone, misfire_grace_seconds: scheduleMisfireGrace } }, {
        onSuccess: () => { toast('success', t('scripts.toastScheduleSet')); setScheduleTarget(null) },
        onError: () => toast('error', t('scripts.toastScheduleFailed')),
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('scripts.title')}
        description={t('scripts.description')}
        actions={<Button onClick={() => setShowCreateModal(true)}>{t('scripts.createScript')}</Button>}
      />

      <Card className="stagger-item">
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder={t('scripts.searchPlaceholder', 'Search scripts...')} className="flex-1 min-w-[200px] max-w-sm" />
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white"
            >
              <option value="">{t('scripts.allTags', 'All tags')}</option>
              {tags?.map((tag) => (<option key={tag} value={tag}>{tag}</option>))}
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? <CardListSkeleton count={4} /> : scripts.length === 0 ? (
        <EmptyState icon={<IconScripts className="w-10 h-10" />} title={t('scripts.emptyTitle')} description={t('scripts.emptyDesc')} action={<Button onClick={() => setShowCreateModal(true)}>{t('scripts.createScript')}</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scripts.map((script) => renderScriptCard(script))}
        </div>
      )}
      {data && data.total > pageSize && (
        <div className="flex justify-center">
          <Pagination page={page} totalPages={Math.ceil(data.total / pageSize)} onPageChange={setPage} />
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('scripts.createScript')} size="lg">
        <div className="space-y-4">
          <Input label={t('settings.name')} placeholder="backup-db.sh" value={newScript.name} onChange={(e) => setNewScript({ ...newScript, name: e.target.value })} />
          <Input label={t('scripts.description')} placeholder="Backup PostgreSQL database" value={newScript.description} onChange={(e) => setNewScript({ ...newScript, description: e.target.value })} />
          <Input label={t('scripts.tagsLabel', 'Tags')} placeholder="backup, database" value={newScript.tags} onChange={(e) => setNewScript({ ...newScript, tags: e.target.value })} />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">{t('scripts.steps')}</label>
              <Button variant="ghost" size="sm" onClick={() => setNewScriptSteps((prev) => [...prev, { label: `Step ${prev.length + 1}`, type: 'inline', command: '', command_id: '', params: {}, on_failure: 'stop' }])}>{t('scripts.addStep', '+ Add Step')}</Button>
            </div>
            {newScriptSteps.map((step, idx) => (
              <div key={idx} className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Input label="" placeholder={t('scripts.stepLabel', 'Step label')} value={step.label} onChange={(e) => { const updated = [...newScriptSteps]; updated[idx] = { ...updated[idx], label: e.target.value }; setNewScriptSteps(updated) }} className="flex-1" />
                  <select value={step.type} onChange={(e) => { const updated = [...newScriptSteps]; updated[idx] = { ...updated[idx], type: e.target.value as 'inline' | 'command' }; setNewScriptSteps(updated) }} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
                    <option value="inline">{t('scripts.typeInline', 'Inline')}</option>
                    <option value="command">{t('scripts.typeCommand', 'Command')}</option>
                  </select>
                  <select value={step.on_failure} onChange={(e) => { const updated = [...newScriptSteps]; updated[idx] = { ...updated[idx], on_failure: e.target.value as 'stop' | 'continue' }; setNewScriptSteps(updated) }} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
                    <option value="stop">{t('scripts.onFailureStop', 'Stop')}</option>
                    <option value="continue">{t('scripts.onFailureContinue', 'Continue')}</option>
                  </select>
                  {newScriptSteps.length > 1 && <Button variant="ghost" size="sm" onClick={() => setNewScriptSteps((prev) => prev.filter((_, i) => i !== idx))} className="text-red-500">{t('common.delete')}</Button>}
                </div>
                {step.type === 'inline' ? (
                  <textarea placeholder={t('scripts.commandPlaceholder', '#!/bin/bash\necho "Hello"')} value={step.command} onChange={(e) => { const updated = [...newScriptSteps]; updated[idx] = { ...updated[idx], command: e.target.value }; setNewScriptSteps(updated) }} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" rows={3} />
                ) : (
                  <Input label="" placeholder={t('scripts.commandIdPlaceholder', 'Command ID')} value={step.command_id} onChange={(e) => { const updated = [...newScriptSteps]; updated[idx] = { ...updated[idx], command_id: e.target.value }; setNewScriptSteps(updated) }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreate} disabled={createScript.isPending || !newScript.name}>{createScript.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editScript} onClose={() => setEditScript(null)} title={`${t('scripts.edit')}: ${editScript?.name || ''}`} size="lg">
        <div className="space-y-4">
          <Input label={t('settings.name')} value={editName} onChange={(e) => setEditName(e.target.value)} />
          <Input label={t('scripts.description')} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
          <Input label={t('scripts.tagsLabel', 'Tags')} placeholder="backup, database" value={editTags} onChange={(e) => setEditTags(e.target.value)} />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">{t('scripts.steps')}</label>
              <Button variant="ghost" size="sm" onClick={() => setEditSteps((prev) => [...prev, { label: `Step ${prev.length + 1}`, type: 'inline', command: '', command_id: '', params: {}, on_failure: 'stop' }])}>{t('scripts.addStep', '+ Add Step')}</Button>
            </div>
            {editSteps.map((step, idx) => (
              <div key={idx} className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Input label="" placeholder={t('scripts.stepLabel', 'Step label')} value={step.label} onChange={(e) => { const updated = [...editSteps]; updated[idx] = { ...updated[idx], label: e.target.value }; setEditSteps(updated) }} className="flex-1" />
                  <select value={step.type} onChange={(e) => { const updated = [...editSteps]; updated[idx] = { ...updated[idx], type: e.target.value as 'inline' | 'command' }; setEditSteps(updated) }} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
                    <option value="inline">{t('scripts.typeInline', 'Inline')}</option>
                    <option value="command">{t('scripts.typeCommand', 'Command')}</option>
                  </select>
                  <select value={step.on_failure} onChange={(e) => { const updated = [...editSteps]; updated[idx] = { ...updated[idx], on_failure: e.target.value as 'stop' | 'continue' }; setEditSteps(updated) }} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
                    <option value="stop">{t('scripts.onFailureStop', 'Stop')}</option>
                    <option value="continue">{t('scripts.onFailureContinue', 'Continue')}</option>
                  </select>
                  {editSteps.length > 1 && <Button variant="ghost" size="sm" onClick={() => setEditSteps((prev) => prev.filter((_, i) => i !== idx))} className="text-red-500">{t('common.delete')}</Button>}
                </div>
                {step.type === 'inline' ? (
                  <textarea placeholder={t('scripts.commandPlaceholder', '#!/bin/bash\necho "Hello"')} value={step.command} onChange={(e) => { const updated = [...editSteps]; updated[idx] = { ...updated[idx], command: e.target.value }; setEditSteps(updated) }} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" rows={3} />
                ) : (
                  <Input label="" placeholder={t('scripts.commandIdPlaceholder', 'Command ID')} value={step.command_id} onChange={(e) => { const updated = [...editSteps]; updated[idx] = { ...updated[idx], command_id: e.target.value }; setEditSteps(updated) }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditScript(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleSaveEdit} disabled={updateScript.isPending}>{updateScript.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!scheduleTarget} onClose={() => setScheduleTarget(null)} title={`${t('scripts.schedule')}: ${scheduleTarget?.name || ''}`}>
        <div className="space-y-4">
          <Input label={t('scripts.cronExpression')} placeholder="0 2 * * *" value={scheduleCron} onChange={(e) => setScheduleCron(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-600 dark:text-surface-400">{t('scripts.targetNodes', 'Target Nodes')}</label>
            <div className="flex flex-wrap gap-2">
              {nodes.map((n) => (
                <label key={n.id} className="flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={scheduleNodeIds.includes(n.id)} onChange={(e) => {
                    if (e.target.checked) setScheduleNodeIds((prev) => [...prev, n.id])
                    else setScheduleNodeIds((prev) => prev.filter((id) => id !== n.id))
                  }} className="rounded" />
                  {n.name}
                </label>
              ))}
            </div>
          </div>
          <p className="text-xs text-surface-500">{t('scripts.scheduleHint', 'Leave empty to remove schedule')}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setScheduleTarget(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleSetSchedule}>{t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!cloneTarget} onClose={() => setCloneTarget(null)} onConfirm={handleClone} title={t('scripts.cloneTitle')} message={t('scripts.cloneMsg', { name: cloneTarget?.name })} confirmLabel={t('scripts.clone')} />

      <Modal isOpen={!!runTarget} onClose={() => { setRunTarget(null); setRunNodeId(''); setRunTags('') }} title={`${t('scripts.run')}: ${runTarget?.name || ''}`}>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-600 dark:text-surface-400">{t('scripts.targetNode', 'Target Node (optional)')}</label>
            <select value={runNodeId} onChange={(e) => setRunNodeId(e.target.value)} className="w-full px-4 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
              <option value="">{t('scripts.allNodes', 'All nodes')}</option>
              {nodes.map((n) => (<option key={n.id} value={n.id}>{n.name}</option>))}
            </select>
          </div>
          <Input label={t('scripts.targetTags', 'Target Tags (optional, comma separated)')} placeholder="production, linux" value={runTags} onChange={(e) => setRunTags(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setRunTarget(null); setRunNodeId(''); setRunTags('') }}>{t('common.cancel')}</Button>
            <Button onClick={() => {
              if (runTarget) {
                const data: { node_ids?: string[]; node_tags?: string[] } = {}
                if (runNodeId) data.node_ids = [runNodeId]
                if (runTags) data.node_tags = runTags.split(',').map((s) => s.trim()).filter(Boolean)
                runScript.mutate({ id: runTarget.id, data }, { onSuccess: () => { toast('success', t('scripts.toastStarted', { name: runTarget.name })); setRunTarget(null); setRunNodeId(''); setRunTags('') }, onError: () => toast('error', t('scripts.toastRunFailed', { name: runTarget.name })) })
              }
            }} disabled={runScript.isPending}>{runScript.isPending ? <Spinner size="sm" /> : t('scripts.run')}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={t('scripts.deleteTitle')} message={t('scripts.deleteMsg', { name: deleteTarget?.name })} confirmLabel={t('common.delete')} loading={deleteScript.isPending} />
    </div>
  )
}
