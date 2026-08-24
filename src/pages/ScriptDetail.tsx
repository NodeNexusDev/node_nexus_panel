import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { NotesPanel } from '../components/ui/NotesPanel'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { Tabs } from '../components/ui/Tabs'
import { TableSkeleton } from '../components/ui/Skeleton'
import { IconScripts, IconArrowLeft, IconXCircle, IconZap } from '../components/ui/Icons'
import { ExecutionResult } from '../components/commands/ExecutionResult'
import { useToast } from '../components/ui/useToast'
import { useNodes } from '../hooks/useNodes'
import { ScriptFormModal, type ScriptFormValues } from '../components/scripts/ScriptFormModal'
import {
  useScript,
  useScriptSchedule,
  useScriptScheduleHistory,
  useScriptExecutions,
  useRunScript,
  useUpdateScript,
  useCloneScript,
  useDeleteScript,
  useSetScriptSchedule,
  useRemoveScriptSchedule,
  useCancelScriptExecution,
  useRetryScriptExecution,
  useBulkCancelScriptExecutions,
  useBulkRetryScriptExecutions,
} from '../hooks/useScripts'
import type { Script } from '../api/types'

type Tab = 'overview' | 'steps' | 'executions' | 'schedule' | 'notes'

export function ScriptDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [showRunModal, setShowRunModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: script, isLoading, error, refetch } = useScript(id || '')
  const { data: nodesData } = useNodes({ size: 100 })
  const nodes = nodesData?.items || []
  const runScript = useRunScript()
  const updateScript = useUpdateScript()
  const cloneScript = useCloneScript()
  const deleteScript = useDeleteScript()
  const setSchedule = useSetScriptSchedule()
  const removeSchedule = useRemoveScriptSchedule()

  const [runNodeId, setRunNodeId] = useState('')
  const [runTags, setRunTags] = useState('')
  const [scheduleCron, setScheduleCron] = useState('')
  const [scheduleNodeIds, setScheduleNodeIds] = useState<string[]>([])
  const [scheduleTimezone, setScheduleTimezone] = useState('UTC')
  const [scheduleMisfireGrace, setScheduleMisfireGrace] = useState(60)

  if (isLoading) return <Spinner size="lg" className="mx-auto my-16" />
  if (error || !script) {
    return <ErrorState title={t('scripts.notFound', 'Script not found')} error={error} onRetry={refetch} />
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('scripts.overview', 'Overview') },
    { key: 'steps', label: t('scripts.steps') },
    { key: 'executions', label: t('scripts.executions') },
    { key: 'schedule', label: t('scripts.schedule') },
    { key: 'notes', label: t('notes.title') },
  ]

  const handleRun = () => {
    if (!script) return
    runScript.mutate(
      {
        id: script.id,
        data: {
          node_ids: runNodeId ? [runNodeId] : undefined,
          node_tags: runTags ? runTags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        },
      },
      {
        onSuccess: () => { toast('success', t('scripts.toastStarted', { name: script.name })); setShowRunModal(false); setRunNodeId(''); setRunTags('') },
        onError: () => toast('error', t('scripts.toastRunFailed', { name: script.name })),
      },
    )
  }

  const handleSchedule = () => {
    if (!script) return
    if (!scheduleCron.trim()) {
      removeSchedule.mutate(script.id, {
        onSuccess: () => { toast('success', t('scripts.toastScheduleRemoved')); setShowScheduleModal(false) },
        onError: () => toast('error', t('scripts.toastScheduleFailed')),
      })
    } else {
      setSchedule.mutate({ id: script.id, data: { cron: scheduleCron, node_ids: scheduleNodeIds, timezone: scheduleTimezone, misfire_grace_seconds: scheduleMisfireGrace } }, {
        onSuccess: () => { toast('success', t('scripts.toastScheduleSet')); setShowScheduleModal(false) },
        onError: () => toast('error', t('scripts.toastScheduleFailed')),
      })
    }
  }

  const handleClone = () => {
    if (!script) return
    cloneScript.mutate({ id: script.id }, { onSuccess: () => toast('success', t('scripts.toastCloned', { name: script.name })), onError: () => toast('error', t('scripts.toastCloneFailed')) })
  }

  const handleDelete = () => {
    if (!id) return
    deleteScript.mutate(id, {
      onSuccess: () => { toast('success', t('scripts.toastDeleted', { name: script.name })); navigate('/scripts') },
      onError: () => toast('error', t('scripts.toastDeleteFailed')),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/scripts')} className="px-2" aria-label={t('common.back')}>
            <IconArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 flex items-center justify-center">
            <IconScripts className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white truncate">{script.name}</h1>
            {script.description && <p className="text-sm text-surface-500 dark:text-surface-400 truncate">{script.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FavoriteButton targetType="script" targetId={script.id} size="sm" />
          <Button variant="secondary" size="sm" onClick={() => setShowRunModal(true)}>
            <IconZap className="w-4 h-4 mr-1" />
            {t('scripts.run')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setShowScheduleModal(true); setScheduleCron(''); setScheduleNodeIds([]); setScheduleTimezone('UTC'); setScheduleMisfireGrace(60) }}>{t('scripts.schedule')}</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowEditModal(true)}>{t('common.edit')}</Button>
          <Button variant="ghost" size="sm" onClick={handleClone} disabled={cloneScript.isPending}>{t('scripts.clone')}</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowDeleteDialog(true)} className="text-red-500 hover:text-red-600">
            <IconXCircle className="w-4 h-4 mr-1" />
            {t('common.delete')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="info">{script.steps.length} {t('scripts.steps')}</Badge>
        {script.tags.map((tag) => <Badge key={tag} variant="default">{tag}</Badge>)}
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && <OverviewTab script={script} />}
      {activeTab === 'steps' && <StepsTab script={script} />}
      {activeTab === 'executions' && <ExecutionsTab scriptId={script.id} />}
      {activeTab === 'schedule' && <ScheduleTab scriptId={script.id} />}
      {activeTab === 'notes' && <NotesTab scriptId={script.id} />}

      <Modal isOpen={showRunModal} onClose={() => setShowRunModal(false)} title={`${t('scripts.run')}: ${script.name}`}>
        <div className="space-y-4">
          <Select
            label={t('scripts.targetNode', 'Target Node (optional)')}
            value={runNodeId}
            onChange={setRunNodeId}
            placeholder={t('scripts.allNodes', 'All nodes')}
            options={nodes.map((n) => ({ value: n.id, label: n.name }))}
          />
          <Input label={t('scripts.targetTags', 'Target Tags (optional, comma separated)')} placeholder="production, linux" value={runTags} onChange={(e) => setRunTags(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowRunModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleRun} disabled={runScript.isPending}>{runScript.isPending ? <Spinner size="sm" /> : t('scripts.run')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title={`${t('scripts.schedule')}: ${script.name}`}>
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
            <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSchedule} disabled={scheduleCron.trim() !== '' && scheduleNodeIds.length === 0}>{t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <ScriptFormModal
        isOpen={showEditModal}
        title={`${t('scripts.edit')}: ${script.name}`}
        pending={updateScript.isPending}
        initial={{ name: script.name, description: script.description || '', tags: script.tags, steps: script.steps }}
        onClose={() => setShowEditModal(false)}
        onSubmit={(values: ScriptFormValues) => {
          if (!id) return
          updateScript.mutate({ id, data: values }, {
            onSuccess: () => { toast('success', t('scripts.toastUpdated')); setShowEditModal(false) },
            onError: () => toast('error', t('scripts.toastUpdateFailed')),
          })
        }}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={t('scripts.deleteTitle')}
        message={t('scripts.deleteMsg', { name: script.name })}
        confirmLabel={t('common.delete')}
        loading={deleteScript.isPending}
      />
    </div>
  )
}

function OverviewTab({ script }: { script: Script }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('scripts.overview', 'Overview')}</h2></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {script.description && <p className="text-sm text-surface-700 dark:text-surface-300">{script.description}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
              <p className="text-xs text-surface-500 dark:text-surface-400 uppercase">{t('scripts.created', 'Created')}</p>
              <p className="text-sm font-medium text-surface-900 dark:text-white">{new Date(script.created_at).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
              <p className="text-xs text-surface-500 dark:text-surface-400 uppercase">{t('scripts.updated', 'Updated')}</p>
              <p className="text-sm font-medium text-surface-900 dark:text-white">{new Date(script.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StepsTab({ script }: { script: Script }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('scripts.steps')}</h2></CardHeader>
      <CardContent>
        {script.steps.length === 0 ? (
          <EmptyState title={t('scripts.noSteps', 'No steps')} />
        ) : (
          <div className="space-y-2">
            {script.steps.map((step, i) => (
              <div key={i} className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-surface-400">{i + 1}.</span>
                  <Badge variant={step.type === 'inline' ? 'info' : 'warning'}>{step.type}</Badge>
                  <span className="font-medium text-surface-900 dark:text-white">{step.label}</span>
                  {step.on_failure && <span className="text-xs text-surface-400">on_failure: {step.on_failure}</span>}
                </div>
                {step.type === 'inline' && step.command && (
                  <pre className="text-xs font-mono text-surface-600 dark:text-surface-300 mt-2 whitespace-pre-wrap">{step.command}</pre>
                )}
                {step.type === 'command' && step.command_id && (
                  <p className="text-xs font-mono text-surface-500 mt-2">command_id: {step.command_id}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ExecutionsTab({ scriptId }: { scriptId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data, isLoading } = useScriptExecutions(scriptId, { size: 20 })
  const cancelExec = useCancelScriptExecution()
  const retryExec = useRetryScriptExecution()
  const bulkCancel = useBulkCancelScriptExecutions()
  const bulkRetry = useBulkRetryScriptExecutions()
  const items = data?.items || []
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedExecId, setExpandedExecId] = useState<string | null>(null)

  const allSelected = items.length > 0 && items.every((exec) => selectedIds.has(exec.id))
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(items.map((exec) => exec.id)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  const runningIds = Array.from(selectedIds).filter((id) => items.find((e) => e.id === id)?.status === 'running')
  const failedIds = Array.from(selectedIds).filter((id) => items.find((e) => e.id === id)?.status === 'failed')

  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('scripts.executions')}</h2></CardHeader>
      <CardContent className="p-0">
        {isLoading ? <TableSkeleton rows={5} cols={4} /> : items.length === 0 ? (
          <EmptyState title={t('scripts.emptyExecutions')} />
        ) : (
          <div className="divide-y divide-surface-200 dark:divide-surface-800">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 px-6 py-2 bg-accent-50 dark:bg-accent-900/20 border-b border-accent-200 dark:border-accent-800">
                <span className="text-sm text-accent-700 dark:text-accent-300">{t('scripts.selected', { count: selectedIds.size })}</span>
                {runningIds.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => bulkCancel.mutate(runningIds, { onSuccess: () => { toast('success', t('scripts.toastBulkCancelled', 'Executions cancelled')); setSelectedIds(new Set()) }, onError: () => toast('error', t('scripts.toastBulkCancelFailed', 'Failed to cancel executions')) })} disabled={bulkCancel.isPending}>{bulkCancel.isPending ? t('common.loading') : t('scripts.bulkCancel', 'Cancel Running')}</Button>
                )}
                {failedIds.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => bulkRetry.mutate(failedIds, { onSuccess: () => { toast('success', t('scripts.toastBulkRetried', 'Executions retried')); setSelectedIds(new Set()) }, onError: () => toast('error', t('scripts.toastBulkRetryFailed', 'Failed to retry executions')) })} disabled={bulkRetry.isPending}>{bulkRetry.isPending ? t('common.loading') : t('scripts.bulkRetry', 'Retry Failed')}</Button>
                )}
                <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200">{t('scripts.clearSelection', 'Clear')}</button>
              </div>
            )}
            <div className="flex items-center gap-3 px-6 py-2 border-b border-surface-200 dark:border-surface-800">
              <input type="checkbox" checked={!!allSelected} onChange={toggleAll} aria-label={t('common.selectAll')} className="rounded border-surface-300 dark:border-surface-600" />
              <span className="text-xs text-surface-500">{t('scripts.selectAll')}</span>
            </div>
            {items.map((exec) => (
              <div key={exec.id}>
                <div
                  className={`flex items-center justify-between px-6 py-3 transition-colors ${exec.steps?.length ? 'cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50' : ''} ${expandedExecId === exec.id ? 'bg-surface-50 dark:bg-surface-800/50' : ''}`}
                  onClick={() => { if (exec.steps?.length) setExpandedExecId(expandedExecId === exec.id ? null : exec.id) }}
                >
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={selectedIds.has(exec.id)} onChange={() => toggleOne(exec.id)} onClick={(e) => e.stopPropagation()} aria-label={t('common.selectItem', 'Select execution {{id}}', { id: exec.id })} className="rounded border-surface-300 dark:border-surface-600" />
                    <Badge variant={exec.status === 'completed' ? 'success' : exec.status === 'failed' ? 'danger' : exec.status === 'running' ? 'warning' : 'default'}>{exec.status}</Badge>
                    <div>
                      <p className="text-sm text-surface-900 dark:text-white">Node: {exec.node_id || 'all'}</p>
                      <p className="text-xs text-surface-500">{new Date(exec.started_at).toLocaleString()}{exec.finished_at ? ` → ${new Date(exec.finished_at).toLocaleString()}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {exec.status === 'running' && <Button variant="ghost" size="sm" onClick={() => cancelExec.mutate(exec.id, { onSuccess: () => toast('success', t('scripts.toastCancelled')), onError: () => toast('error', t('scripts.toastCancelFailed')) })}>{t('scripts.cancel')}</Button>}
                    {exec.status === 'failed' && <Button variant="ghost" size="sm" onClick={() => retryExec.mutate(exec.id, { onSuccess: () => toast('success', t('scripts.toastRetried')), onError: () => toast('error', t('scripts.toastRetryFailed')) })}>{t('common.retry')}</Button>}
                  </div>
                </div>
                {expandedExecId === exec.id && exec.steps && (
                  <div className="px-6 pb-4 space-y-4 border-t border-surface-200 dark:border-surface-800">
                    {exec.steps.map((step, idx) => (
                      <div key={idx} className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                            {t('scripts.step', 'Step')} {idx + 1}: {step.label}
                          </span>
                          <Badge variant={step.exit_code === 0 ? 'success' : 'danger'}>
                            exit {step.exit_code}
                          </Badge>
                          {step.truncated && (
                            <Badge variant="warning">{t('scripts.truncated', 'Truncated')}</Badge>
                          )}
                        </div>
                        <ExecutionResult stdout={step.stdout} stderr={step.stderr} exitCode={step.exit_code} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ScheduleTab({ scriptId }: { scriptId: string }) {
  const { t } = useTranslation()
  const { data: schedule } = useScriptSchedule(scriptId)
  const { data: historyData, isLoading } = useScriptScheduleHistory(scriptId, { size: 20 })
  const items = historyData?.items || []
  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('scripts.schedule')}</h2></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedule ? (
            <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
              <p className="text-sm font-medium text-surface-900 dark:text-white">{t('scripts.cronExpression')}: <code className="font-mono">{schedule.cron}</code></p>
              {schedule.timezone && <p className="text-xs text-surface-500 mt-1">{t('scripts.timezone', 'Timezone')}: {schedule.timezone}</p>}
            </div>
          ) : (
            <p className="text-sm text-surface-500">{t('scripts.noSchedule', 'No schedule set')}</p>
          )}

          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase mb-2">{t('scripts.scheduleHistory', 'Schedule History')}</p>
            {isLoading ? <TableSkeleton rows={3} cols={3} /> : items.length === 0 ? (
              <p className="text-sm text-surface-500 text-center py-4">{t('scripts.noScheduleHistory', 'No schedule history')}</p>
            ) : (
              <div className="divide-y divide-surface-200 dark:divide-surface-800">
                {items.map((exec) => (
                  <div key={exec.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={exec.status === 'completed' ? 'success' : exec.status === 'failed' ? 'danger' : exec.status === 'running' ? 'warning' : 'default'}>{exec.status}</Badge>
                      <div>
                        <p className="text-sm text-surface-900 dark:text-white">Node: {exec.node_id || 'all'}</p>
                        <p className="text-xs text-surface-500">{new Date(exec.started_at).toLocaleString()}{exec.finished_at ? ` → ${new Date(exec.finished_at).toLocaleString()}` : ''}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NotesTab({ scriptId }: { scriptId: string }) {
  return (
    <Card>
      <CardContent>
        <NotesPanel targetType="script" targetId={scriptId} />
      </CardContent>
    </Card>
  )
}
