import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { Checkbox } from '../components/ui/Checkbox'
import { Tabs } from '../components/ui/Tabs'
import { StatCard, StatsGrid } from '../components/ui/StatCard'
import { Skeleton, StatCardSkeleton, TableSkeleton } from '../components/ui/Skeleton'
import { IconScripts, IconArrowLeft, IconXCircle, IconZap } from '../components/ui/Icons'
import { ExecutionResult } from '../components/commands/ExecutionResult'
import { formatPercent, formatDurationMs } from '../lib/format'
import { ScriptBulkNodeResultItem } from '../components/scripts/ScriptBulkNodeResultItem'
import { useToast } from '../components/ui/useToast'
import { InfiniteScroll } from '../components/ui/InfiniteScroll'
import { useNodes } from '../hooks/useNodes'
import { useCommands } from '../hooks/useCommands'
import { ScriptFormModal, type ScriptFormValues } from '../components/scripts/ScriptFormModal'
import {
  useScript,
  useScriptStats,
  useScriptSchedule,
  useInfiniteScriptScheduleHistory,
  useInfiniteScriptExecutions,
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
import type { ScriptResponse, ScriptExecutionBatchResult, ScriptUpdate } from '../api/types'

type Tab = 'overview' | 'steps' | 'executions' | 'schedule' | 'stats'

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
  const { data: commandsData } = useCommands({ size: 100 })
  const commands = commandsData?.items || []
  const runScript = useRunScript()
  const updateScript = useUpdateScript()
  const cloneScript = useCloneScript()
  const deleteScript = useDeleteScript()
  const setSchedule = useSetScriptSchedule()
  const removeSchedule = useRemoveScriptSchedule()

  const [runNodeIds, setRunNodeIds] = useState<string[]>([])
  const [runTags, setRunTags] = useState('')
  const [runResult, setRunResult] = useState<ScriptExecutionBatchResult | null>(null)
  const [scheduleCron, setScheduleCron] = useState('')
  const [scheduleNodeIds, setScheduleNodeIds] = useState<string[]>([])
  const [scheduleTimezone, setScheduleTimezone] = useState('UTC')
  const [scheduleMisfireGrace, setScheduleMisfireGrace] = useState(60)
  const [confirmRemoveSchedule, setConfirmRemoveSchedule] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <Skeleton variant="text" className="w-64 h-8" />
        <Skeleton variant="rectangular" className="w-full h-32" />
        <Skeleton variant="rectangular" className="w-full h-48" />
      </div>
    )
  }
  if (error || !script) {
    return <ErrorState title={t('scripts.notFound', 'Script not found')} error={error} onRetry={refetch} />
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('scripts.overview', 'Overview') },
    { key: 'steps', label: t('scripts.steps') },
    { key: 'executions', label: t('scripts.executions') },
    { key: 'schedule', label: t('scripts.schedule') },
    { key: 'stats', label: t('scripts.stats', 'Stats') },
  ]

  const handleRun = () => {
    if (!script) return
    runScript.mutate(
      {
        id: script.id,
        data: {
          node_ids: runNodeIds.length > 0 ? runNodeIds : undefined,
          node_tags: runTags ? runTags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        },
      },
      {
        onSuccess: (response) => { toast('success', t('scripts.toastStarted', { name: script.name })); setRunResult(response as unknown as ScriptExecutionBatchResult) },
        onError: () => toast('error', t('scripts.toastRunFailed', { name: script.name })),
      },
    )
  }

  const handleSchedule = () => {
    if (!script || !scheduleCron.trim()) return
    setSchedule.mutate({ id: script.id, data: { cron: scheduleCron, node_ids: scheduleNodeIds, timezone: scheduleTimezone, misfire_grace_seconds: scheduleMisfireGrace } }, {
      onSuccess: () => { toast('success', t('scripts.toastScheduleSet')); setShowScheduleModal(false) },
      onError: () => toast('error', t('scripts.toastScheduleFailed')),
    })
  }

  const handleRemoveSchedule = () => {
    if (!script) return
    removeSchedule.mutate(script.id, {
      onSuccess: () => { toast('success', t('scripts.toastScheduleRemoved')); setShowScheduleModal(false); setConfirmRemoveSchedule(false) },
      onError: () => toast('error', t('scripts.toastScheduleFailed')),
    })
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
          <FavoriteButton targetType="script" targetId={script.id} resourceName={script.name} size="sm" />
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
      {activeTab === 'steps' && <StepsTab script={script} commands={commands} />}
      {activeTab === 'executions' && <ExecutionsTab scriptId={script.id} nodes={nodes} />}
      {activeTab === 'schedule' && <ScheduleTab scriptId={script.id} nodes={nodes} />}
      {activeTab === 'stats' && <StatsTab scriptId={script.id} />}

      <Modal isOpen={showRunModal} onClose={() => { setShowRunModal(false); setRunResult(null) }} title={`${t('scripts.run')}: ${script.name}`}>
        {runResult ? (
          <div className="space-y-4">
            {runResult.results.length === 1 ? (
              runResult.results[0].steps.map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                      {t('scripts.step', 'Step')} {idx + 1}{step.label ? `: ${step.label}` : ''}
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
              ))
            ) : (
              <>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 dark:text-green-400">{t('scripts.succeeded', 'Succeeded')}: {runResult.results.filter((r) => r.status === 'success').length}</span>
                  <span className="text-red-600 dark:text-red-400">{t('scripts.failed', 'Failed')}: {runResult.results.filter((r) => r.status === 'error').length}</span>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {runResult.results.map((r) => (
                    <ScriptBulkNodeResultItem key={r.node_id} result={r} />
                  ))}
                </div>
              </>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setShowRunModal(false); setRunResult(null) }}>{t('common.close')}</Button>
              <Button onClick={() => setRunResult(null)}>{t('scripts.runAgain', 'Run Again')}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{t('scripts.targetNodes', 'Target Nodes')}</p>
                <button
                  type="button"
                  onClick={() => setRunNodeIds(runNodeIds.length === nodes.length ? [] : nodes.map((n) => n.id))}
                  className="text-xs text-accent-600 dark:text-accent-400 hover:underline cursor-pointer"
                >
                  {runNodeIds.length === nodes.length ? t('common.deselectAll', 'Deselect all') : t('common.selectAll', 'Select all')}
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto border border-surface-200 dark:border-surface-700 rounded-lg divide-y divide-surface-200 dark:divide-surface-700">
                {nodes.map((node) => (
                  <label key={node.id} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer">
                    <Checkbox
                      checked={runNodeIds.includes(node.id)}
                      onChange={() => {
                        setRunNodeIds((prev) => prev.includes(node.id) ? prev.filter((id) => id !== node.id) : [...prev, node.id])
                      }}
                    />
                    <span className="text-sm text-surface-900 dark:text-white">{node.name}</span>
                  </label>
                ))}
              </div>
              {runNodeIds.length > 0 && (
                <p className="text-xs text-surface-500">{t('scripts.selectedNodes', { count: runNodeIds.length })}</p>
              )}
            </div>
            <Input label={t('scripts.targetTags', 'Target Tags (optional, comma separated)')} placeholder="production, linux" value={runTags} onChange={(e) => setRunTags(e.target.value)} />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setShowRunModal(false); setRunResult(null) }}>{t('common.cancel')}</Button>
              <Button onClick={handleRun} disabled={runScript.isPending}>{runScript.isPending ? <Spinner size="sm" /> : t('scripts.run')}</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title={`${t('scripts.schedule')}: ${script.name}`}>
        <div className="space-y-4">
          <Input label={t('scripts.cronExpression')} placeholder="0 2 * * *" value={scheduleCron} onChange={(e) => setScheduleCron(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-600 dark:text-surface-400">{t('scripts.targetNodes', 'Target Nodes')}</label>
            <div className="flex flex-wrap gap-2">
              {nodes.map((n) => (
                <label key={n.id} className="flex items-center gap-1 text-sm">
                  <Checkbox checked={scheduleNodeIds.includes(n.id)} onChange={(checked) => {
                    if (checked) setScheduleNodeIds((prev) => [...prev, n.id])
                    else setScheduleNodeIds((prev) => prev.filter((id) => id !== n.id))
                  }} />
                  {n.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="ghost" className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300" onClick={() => setConfirmRemoveSchedule(true)}>
              {t('scripts.removeSchedule', 'Remove Schedule')}
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleSchedule} disabled={scheduleCron.trim() !== '' && scheduleNodeIds.length === 0}>{t('common.save')}</Button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={confirmRemoveSchedule} onClose={() => setConfirmRemoveSchedule(false)} onConfirm={handleRemoveSchedule} title={t('scripts.removeScheduleTitle', 'Remove Schedule')} message={t('scripts.removeScheduleMsg', 'Are you sure you want to remove the schedule?')} confirmLabel={t('common.delete')} loading={removeSchedule.isPending} />

      <ScriptFormModal
        isOpen={showEditModal}
        title={`${t('scripts.edit')}: ${script.name}`}
        pending={updateScript.isPending}
        initial={{ name: script.name, description: script.description || '', tags: script.tags, steps: script.steps }}
        onClose={() => setShowEditModal(false)}
        onSubmit={(values: ScriptFormValues) => {
          if (!id) return
          updateScript.mutate({ id, data: values as unknown as ScriptUpdate }, {
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

function OverviewTab({ script }: { script: ScriptResponse }) {
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

function StepsTab({ script, commands }: { script: ScriptResponse; commands: { id: string; name: string }[] }) {
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
                  <p className="text-xs font-mono text-surface-500 mt-2">{t('scripts.command', 'Command')}: {commands.find(c => c.id === step.command_id)?.name || step.command_id}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ExecutionsTab({ scriptId, nodes }: { scriptId: string; nodes: { id: string; name: string }[] }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: infiniteData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteScriptExecutions(scriptId, { limit: 20 })
  const cancelExec = useCancelScriptExecution()
  const retryExec = useRetryScriptExecution()
  const bulkCancel = useBulkCancelScriptExecutions()
  const bulkRetry = useBulkRetryScriptExecutions()
  const items = infiniteData ? infiniteData.pages.flatMap((p) => p.items) : []
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedExecId, setExpandedExecId] = useState<string | null>(null)

  const allSelected = items.length > 0 && items.every((exec: { id: string }) => selectedIds.has(exec.id))
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(items.map((exec: { id: string }) => exec.id)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  const runningIds = Array.from(selectedIds).filter((id) => (items.find((e: { id: string; status: string }) => e.id === id)?.status) === 'running')
  const failedIds = Array.from(selectedIds).filter((id) => {
    const s = items.find((e: { id: string; status: string }) => e.id === id)?.status as string | undefined
    return s === 'failed' || s === 'error'
  })

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
              <Checkbox checked={!!allSelected} onChange={toggleAll} ariaLabel={t('common.selectAll')} />
              <span className="text-xs text-surface-500">{t('scripts.selectAll')}</span>
            </div>
            {items.map((exec: { id: string; node_id: string | null; status: string; started_at: string; finished_at: string | null; steps: unknown }) => (
              <div key={exec.id}>
                <div
                  className={`flex items-center justify-between px-6 py-3 transition-colors ${(exec.steps as unknown[])?.length ? 'cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50' : ''} ${expandedExecId === exec.id ? 'bg-surface-50 dark:bg-surface-800/50' : ''}`}
                  onClick={() => { if ((exec.steps as unknown[])?.length) setExpandedExecId(expandedExecId === exec.id ? null : exec.id) }}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selectedIds.has(exec.id)} onChange={() => toggleOne(exec.id)} ariaLabel={t('common.selectItem', 'Select {{name}}', { name: exec.id.slice(0, 8) })} />
                    <Badge variant={(exec.status as string) === 'completed' || exec.status === 'success' ? 'success' : (exec.status as string) === 'failed' || exec.status === 'error' ? 'danger' : exec.status === 'running' ? 'warning' : 'default'}>{exec.status}</Badge>
                    <div>
                      <p className="text-sm text-surface-900 dark:text-white">Node: {exec.node_id ? (nodes.find(n => n.id === exec.node_id)?.name || exec.node_id) : 'all'}</p>
                      <p className="text-xs text-surface-500">{new Date(exec.started_at).toLocaleString()}{exec.finished_at ? ` → ${new Date(exec.finished_at).toLocaleString()}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {exec.status === 'running' && <Button variant="ghost" size="sm" onClick={() => cancelExec.mutate(exec.id, { onSuccess: () => toast('success', t('scripts.toastCancelled')), onError: () => toast('error', t('scripts.toastCancelFailed')) })}>{t('scripts.cancel')}</Button>}
                    {(exec.status as string) === 'failed' && <Button variant="ghost" size="sm" onClick={() => retryExec.mutate(exec.id, { onSuccess: () => toast('success', t('scripts.toastRetried')), onError: () => toast('error', t('scripts.toastRetryFailed')) })}>{t('common.retry')}</Button>}
                  </div>
                </div>
                {expandedExecId === exec.id && (exec.steps as unknown[]) && (
                  <div className="px-6 pb-4 space-y-4 border-t border-surface-200 dark:border-surface-800">
                    {(exec.steps as { label?: string | null; stdout: string; stderr: string; exit_code: number; truncated: boolean }[]).map((step: { label?: string | null; stdout: string; stderr: string; exit_code: number; truncated: boolean }, idx: number) => (
                      <div key={idx} className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                            {t('scripts.step', 'Step')} {idx + 1}{step.label ? `: ${step.label}` : ''}
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
            <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatsTab({ scriptId }: { scriptId: string }) {
  const { t } = useTranslation()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { data: stats, isLoading, error, refetch } = useScriptStats(scriptId, { date_from: dateFrom || undefined, date_to: dateTo || undefined })
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('scripts.stats', 'Stats')}</h2>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-1.5 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
            <span className="text-surface-400">—</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-1.5 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-busy="true" aria-live="polite">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : stats ? (
          <StatsGrid>
            <StatCard label={t('scripts.totalExecutions', 'Total Executions')} value={stats.total} />
            <StatCard label={t('scripts.successRate', 'Success Rate')} value={formatPercent(stats.success_rate)} tone="success" />
            <StatCard label={t('scripts.avgDuration', 'Avg Duration')} value={formatDurationMs(stats.avg_duration_ms)} />
            <StatCard label={t('scripts.failed', 'Failed')} value={stats.failed} tone="danger" />
            {stats.cancelled != null && stats.cancelled > 0 && <StatCard label={t('scripts.cancelled', 'Cancelled')} value={stats.cancelled} tone="warning" />}
          </StatsGrid>
        ) : (
          <EmptyState title={t('scripts.noStats', 'No stats available')} />
        )}
      </CardContent>
    </Card>
  )
}

function ScheduleTab({ scriptId, nodes }: { scriptId: string; nodes: { id: string; name: string }[] }) {
  const { t } = useTranslation()
  const { data: schedule } = useScriptSchedule(scriptId)
  const { data: infiniteData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteScriptScheduleHistory(scriptId, { limit: 20 })
  const items = infiniteData ? infiniteData.pages.flatMap((p) => p.items) : []
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
                {items.map((exec: { id: string; node_id: string | null; status: string; started_at: string; finished_at: string | null }) => (
                  <div key={exec.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={(exec.status as string) === 'completed' || exec.status === 'success' ? 'success' : (exec.status as string) === 'failed' || exec.status === 'error' ? 'danger' : exec.status === 'running' ? 'warning' : 'default'}>{exec.status}</Badge>
                      <div>
                      <p className="text-sm text-surface-900 dark:text-white">Node: {exec.node_id ? (nodes.find(n => n.id === exec.node_id)?.name || exec.node_id) : 'all'}</p>
                        <p className="text-xs text-surface-500">{new Date(exec.started_at).toLocaleString()}{exec.finished_at ? ` → ${new Date(exec.finished_at).toLocaleString()}` : ''}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


