// oxlint-disable
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Tabs } from '../ui/Tabs'
import { FavoriteButton } from '../ui/FavoriteButton'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { StatCardSkeleton, TableSkeleton } from '../ui/Skeleton'
import { StatCard, StatsGrid } from '../ui/StatCard'
import { Checkbox } from '../ui/Checkbox'
import { SearchInput } from '../ui/SearchInput'
import { Spinner } from '../ui/Spinner'
import { InfiniteScroll } from '../ui/InfiniteScroll'
import { KeyValueList } from '../ui/KeyValueList'
import { formatPercent, formatDurationMs } from '../../lib/format'
import { useToast } from '../ui/useToast'
import { IconScripts, IconXCircle } from '../ui/Icons'
import { useScriptStats, useInfiniteScriptExecutions, useScriptSchedule, useInfiniteScriptScheduleHistory, useUpdateScript, useCloneScript, useDeleteScript, useRunScript } from '../../hooks/useScripts'
import { useNodes } from '../../hooks/useNodes'
import { useMutation } from '@tanstack/react-query'
import { scriptsApi } from '../../api/scripts'
import type { ScriptFormValues } from './ScriptFormModal'
import { ExecutionResult } from '../commands/ExecutionResult'
import type { BulkScriptExecutionBatchResponse, BulkScriptExecutionItem, ScriptResponse, ScriptNodeResult } from '../../api/types'

type DrawerTab = 'overview' | 'steps' | 'executions' | 'schedule' | 'stats' | 'edit' | 'run'

interface ScriptDrawerProps {
  script: ScriptResponse
  onClose: () => void
}

export function ScriptDrawer({ script, onClose }: ScriptDrawerProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [active, setActive] = useState<DrawerTab>('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteScript = useDeleteScript()
  const cloneScript = useCloneScript()
  const updateScript = useUpdateScript()

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: 'overview', label: t('scripts.overview', 'Overview') },
    { key: 'steps', label: t('scripts.steps', 'Steps') },
    { key: 'executions', label: t('scripts.executions', 'Executions') },
    { key: 'schedule', label: t('scripts.schedule', 'Schedule') },
    { key: 'stats', label: t('scripts.stats', 'Stats') },
    { key: 'run', label: t('scripts.run', 'Run') },
    { key: 'edit', label: t('common.edit', 'Edit') },
  ]

  useEffect(() => { setActive('overview'); setShowDeleteConfirm(false) }, [script.id])

  const handleClone = () => {
    cloneScript.mutate({ id: script.id }, {
      onSuccess: () => toast('success', t('scripts.toastCloned', { name: script.name })),
      onError: () => toast('error', t('scripts.toastCloneFailed')),
    })
  }
  const handleDelete = () => {
    deleteScript.mutate(script.id, {
      onSuccess: () => { toast('success', t('scripts.toastDeleted', { name: script.name })); onClose() },
      onError: () => toast('error', t('scripts.toastDeleteFailed')),
    })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 flex items-center justify-center shrink-0">
          <IconScripts className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-surface-900 dark:text-white truncate">{script.name}</p>
          {script.description && <p className="text-xs text-surface-500 truncate">{script.description}</p>}
        </div>
        <FavoriteButton targetType="script" targetId={script.id} resourceName={script.name} size="sm" />
        <button onClick={onClose} aria-label={t('common.close')} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="info">{script.steps.length} {t('scripts.steps', 'Steps')}</Badge>
        {script.tags.map((tag) => <Badge key={tag} variant="default">{tag}</Badge>)}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="ghost" size="sm" onClick={handleClone} disabled={cloneScript.isPending}>{t('scripts.clone')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm((v) => !v)} className="text-red-500 hover:text-red-600 ml-auto">
          <IconXCircle className="w-4 h-4 mr-1" />{t('common.delete')}
        </Button>
      </div>
      {showDeleteConfirm && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-between gap-3">
          <p className="text-xs text-red-700 dark:text-red-300">{t('scripts.deleteMsg', { name: script.name })}</p>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" size="sm" disabled={deleteScript.isPending} onClick={handleDelete}>{deleteScript.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      )}

      <Tabs tabs={tabs} active={active} onChange={setActive} />

      {active === 'overview' && <ScriptOverview script={script} />}
      {active === 'steps' && <ScriptSteps script={script} />}
      {active === 'executions' && <ScriptExecutions scriptId={script.id} />}
      {active === 'schedule' && <ScriptSchedule scriptId={script.id} />}
      {active === 'stats' && <ScriptStats scriptId={script.id} />}
      {active === 'run' && <ScriptRunTab script={script} />}
      {active === 'edit' && <ScriptEditTab script={script} onDone={() => setActive('overview')} updateScript={updateScript} />}
    </div>
  )
}

function ScriptOverview({ script }: { script: ScriptResponse }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
          <p className="text-[11px] uppercase tracking-wide text-surface-500">{t('scripts.descriptionLabel', 'Description')}</p>
          <p className="text-sm text-surface-900 dark:text-white mt-1">{script.description || '—'}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg"><p className="text-[11px] uppercase text-surface-500">{t('scripts.created', 'Created')}</p><p className="text-sm text-surface-900 dark:text-white">{new Date(script.created_at).toLocaleString()}</p></div>
          <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg"><p className="text-[11px] uppercase text-surface-500">{t('scripts.updated', 'Updated')}</p><p className="text-sm text-surface-900 dark:text-white">{new Date(script.updated_at).toLocaleString()}</p></div>
        </div>
      </CardContent>
    </Card>
  )
}

function ScriptSteps({ script }: { script: ScriptResponse }) {
  const { t } = useTranslation()
  if (script.steps.length === 0) return <EmptyState title={t('scripts.noSteps', 'No steps')} />
  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        {script.steps.map((step, idx) => (
          <div key={idx} className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-surface-900 dark:text-white">{t('scripts.step', 'Step')} {idx + 1}{step.label ? `: ${step.label}` : ''}</span>
              <Badge variant="default">{step.type}</Badge>
              <Badge variant={step.on_failure === 'stop' ? 'danger' : 'warning'}>{step.on_failure}</Badge>
            </div>
            {step.command && <pre className="text-xs font-mono bg-white dark:bg-surface-900 p-2 rounded border border-surface-200 dark:border-surface-700 whitespace-pre-wrap break-all">{step.command}</pre>}
            {step.command_id && <p className="text-xs font-mono text-surface-500">{step.command_id}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ScriptExecutions({ scriptId }: { scriptId: string }) {
  const { t } = useTranslation()
  const { data: infiniteData, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteScriptExecutions(scriptId, { limit: 10 })
  const items = infiniteData ? infiniteData.pages.flatMap((p) => p.items) : []
  if (isLoading) return <TableSkeleton rows={3} cols={2} />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (items.length === 0) return <EmptyState title={t('scripts.noExecutions', 'No executions')} />
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-surface-200 dark:divide-surface-800 max-h-96 overflow-y-auto">
          {items.map((item: unknown) => {
            const ex = item as { id: string; status: string; created_at: string; batch_id?: string }
            return (
              <div key={ex.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-xs font-mono text-surface-900 dark:text-white">{ex.id.slice(0, 8)}</p>
                  <p className="text-[11px] text-surface-500">{new Date(ex.created_at).toLocaleString()}</p>
                </div>
                <Badge variant={ex.status === 'success' ? 'success' : ex.status === 'running' ? 'warning' : 'danger'}>{ex.status}</Badge>
              </div>
            )
          })}
        </div>
        <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
      </CardContent>
    </Card>
  )
}

function ScriptSchedule({ scriptId }: { scriptId: string }) {
  const { t } = useTranslation()
  const { data: schedule, isLoading, error, refetch } = useScriptSchedule(scriptId)
  const { data: historyData, isLoading: hLoading, error: hError, refetch: hRefetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteScriptScheduleHistory(scriptId, { limit: 5 })
  const historyItems = historyData ? historyData.pages.flatMap((p) => p.items) : []
  if (isLoading) return <StatCardSkeleton />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          {schedule ? (
            <KeyValueList rows={[
              { label: t('scripts.cron', 'Cron'), value: (schedule as { cron: string }).cron },
              { label: t('scripts.timezone', 'Timezone'), value: (schedule as { timezone: string }).timezone ?? 'UTC' },
            ]} />
          ) : <EmptyState title={t('scripts.noSchedule', 'No schedule')} />}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><h3 className="text-sm font-semibold text-surface-900 dark:text-white">{t('scripts.scheduleHistory', 'Schedule History')}</h3></CardHeader>
        <CardContent className="p-0">
          {hLoading ? <TableSkeleton rows={3} cols={2} /> : hError ? <ErrorState error={hError} onRetry={hRefetch} /> : historyItems.length === 0 ? <EmptyState title={t('scripts.noScheduleHistory', 'No history')} /> : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800 max-h-64 overflow-y-auto">
              {historyItems.map((item: unknown) => {
                const h = item as { id: string; status: string; created_at: string }
                return (
                  <div key={h.id} className="flex items-center justify-between px-4 py-2.5">
                    <Badge variant={h.status === 'success' ? 'success' : 'danger'}>{h.status}</Badge>
                    <span className="text-[11px] text-surface-500">{new Date(h.created_at).toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          )}
          <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
        </CardContent>
      </Card>
    </div>
  )
}

function ScriptStats({ scriptId }: { scriptId: string }) {
  const { t } = useTranslation()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { data: stats, isLoading, error, refetch } = useScriptStats(scriptId, { date_from: dateFrom || undefined, date_to: dateTo || undefined })
  if (isLoading) return <div className="grid grid-cols-2 gap-3"><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></div>
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!stats) return <EmptyState title={t('scripts.noStats', 'No stats available')} />
  return (
    <Card>
      <CardHeader><div className="flex gap-2"><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="flex-1 px-2 py-1.5 bg-white border border-surface-300 rounded-lg text-xs dark:bg-surface-800 dark:border-surface-700 dark:text-white" /><span className="text-surface-400 self-center">—</span><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="flex-1 px-2 py-1.5 bg-white border border-surface-300 rounded-lg text-xs dark:bg-surface-800 dark:border-surface-700 dark:text-white" /></div></CardHeader>
      <CardContent><StatsGrid><StatCard label={t('scripts.totalExecutions', 'Total')} value={stats.total} /><StatCard label={t('scripts.successRate', 'Success Rate')} value={formatPercent(stats.success_rate)} tone="success" /><StatCard label={t('scripts.avgDuration', 'Avg Duration')} value={formatDurationMs(stats.avg_duration_ms)} /><StatCard label={t('scripts.failed', 'Failed')} value={stats.failed} tone="danger" /></StatsGrid></CardContent>
    </Card>
  )
}

function ScriptEditTab({ script, onDone, updateScript }: { script: ScriptResponse; onDone: () => void; updateScript: ReturnType<typeof useUpdateScript> }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [formValues, setFormValues] = useState<ScriptFormValues>({ name: script.name, description: script.description || '', tags: script.tags, steps: script.steps as never })
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setFormValues({ name: script.name, description: script.description || '', tags: script.tags, steps: script.steps as never }) }, [script.id])
  const handleSave = () => {
    if (!formValues.name.trim()) { toast('error', t('scripts.toastNameRequired', 'Name required')); return }
    updateScript.mutate({ id: script.id, data: formValues as never }, {
      onSuccess: () => { toast('success', t('scripts.toastUpdated')); onDone() },
      onError: () => toast('error', t('scripts.toastUpdateFailed')),
    })
  }
  return (
    <div className="space-y-4">
      <Input label={t('scripts.name', 'Name')} value={formValues.name} onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))} />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('scripts.description', 'Description')}</label>
        <textarea value={formValues.description} onChange={(e) => setFormValues((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
      </div>
      <Input label={t('scripts.tags', 'Tags')} value={(formValues.tags ?? []).join(', ')} onChange={(e) => setFormValues((p) => ({ ...p, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
      <div className="p-3 bg-surface-50 dark:bg-surface-800/30 rounded-lg border border-surface-200 dark:border-surface-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-surface-700 dark:text-surface-300 mb-2">{t('scripts.steps', 'Steps')} ({formValues.steps.length})</p>
        {formValues.steps.map((step: unknown, idx: number) => {
          const s = step as { label?: string; type: string; command?: string }
          return <div key={idx} className="text-xs font-mono text-surface-600 dark:text-surface-400 p-2 bg-white dark:bg-surface-900 rounded border mb-2">{idx + 1}. {s.label || s.type} — {s.command?.slice(0, 60) || s.type}</div>
        })}
        <p className="text-xs text-surface-500">{t('scripts.editStepsHint', 'Edit steps in full page for full editor')}</p>
      </div>
      <div className="flex justify-end gap-2"><Button variant="ghost" onClick={onDone}>{t('common.cancel')}</Button><Button onClick={handleSave} disabled={updateScript.isPending}>{updateScript.isPending ? t('common.loading') : t('common.save')}</Button></div>
    </div>
  )
}

function ScriptRunTab({ script }: { script: ScriptResponse }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: nodesData } = useNodes({ size: 100 })
  const nodes = nodesData?.items || []
  const runScript = useRunScript()
  const bulkRun = useMutation({ mutationFn: (data: { script_ids: string[]; node_ids: string[] }) => scriptsApi.executions({ script_ids: data.script_ids, node_ids: data.node_ids }) })
  const [searchNode, setSearchNode] = useState('')
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<ScriptNodeResult | null>(null)
  const [bulkResults, setBulkResults] = useState<Array<{ node_id: string; node_name: string; result: ScriptNodeResult }> | null>(null)

  useEffect(() => {
    setResult(null)
    setBulkResults(null)
    setSelectedNodeIds(new Set())
    setSearchNode('')
  }, [script.id])

  const filteredNodes = nodes.filter((n) => n.name.toLowerCase().includes(searchNode.toLowerCase()))
  const allFilteredSelected = filteredNodes.length > 0 && filteredNodes.every((n) => selectedNodeIds.has(n.id))
  const toggleNode = (id: string) => {
    setSelectedNodeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  const toggleAllNodes = () => {
    if (allFilteredSelected) {
      setSelectedNodeIds((prev: Set<string>) => {
        const next = new Set(prev)
        filteredNodes.forEach((n) => next.delete(n.id))
        return next
      })
    } else {
      setSelectedNodeIds((prev: Set<string>) => {
        const next = new Set(prev)
        filteredNodes.forEach((n) => next.add(n.id))
        return next
      })
    }
  }

  const handleRun = () => {
    const nodeIds = [...selectedNodeIds]
    if (nodeIds.length === 0) { toast('error', t('scripts.selectNodes', 'Select nodes')); return }
    setResult(null)
    setBulkResults(null)
    if (nodeIds.length === 1) {
      runScript.mutate({ id: script.id, data: { node_ids: nodeIds } }, {
        onSuccess: (response) => {
          const batch = response as BulkScriptExecutionBatchResponse
          const first = batch.results?.[0] as BulkScriptExecutionItem | undefined
          const failed = (batch as { failed?: number }).failed ?? (first?.steps?.some((s) => (s.exit_code ?? 0) !== 0) || first?.status === 'error' ? 1 : 0)
          if (failed > 0) toast('warning', t('scripts.toastStarted', { name: script.name }) + ' — ' + t('common.failed'))
          else toast('success', t('scripts.toastStarted', { name: script.name }))
          if (first) setResult(first as ScriptNodeResult)
        },
        onError: () => toast('error', t('scripts.toastRunFailed', { name: script.name })),
      })
    } else {
      bulkRun.mutate({ script_ids: [script.id], node_ids: nodeIds }, {
        onSuccess: (response) => {
          const batch = response as BulkScriptExecutionBatchResponse
          const failed = (batch as { failed?: number }).failed ?? batch.results?.filter((r) => r.steps?.some((s) => (s.exit_code ?? 0) !== 0) || r.status === 'error').length ?? 0
          if (failed > 0) toast('warning', t('scripts.toastStarted', { name: script.name }) + ` (${nodeIds.length}) — ${failed} failed`)
          else toast('success', t('scripts.toastStarted', { name: script.name }) + ` (${nodeIds.length})`)
          const mapped = (batch.results || []).map((r: BulkScriptExecutionItem) => ({ node_id: r.node_id ?? '', node_name: r.node_name ?? r.node_id ?? '', result: r as unknown as ScriptNodeResult }))
          setBulkResults(mapped)
        },
        onError: () => toast('error', t('scripts.toastRunFailed', { name: script.name })),
      })
    }
  }

  const isPending = runScript.isPending || bulkRun.isPending

  if (result) {
    return (
      <div className="space-y-3 flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-3">
          {result.steps.map((step, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2"><span className="text-xs font-medium text-surface-700 dark:text-surface-300">{t('scripts.step', 'Step')} {idx + 1}{step.label ? `: ${step.label}` : ''}</span><Badge variant={step.exit_code === 0 ? 'success' : 'danger'}>{t('common.exitCode', 'exit')} {step.exit_code}</Badge>{step.truncated && <Badge variant="warning">{t('scripts.truncated', 'Truncated')}</Badge>}</div>
              <ExecutionResult stdout={step.stdout} stderr={step.stderr} exitCode={step.exit_code} showExitCode={false} />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setResult(null)}>{t('common.close')}</Button><Button size="sm" onClick={() => setResult(null)}>{t('scripts.runAgain', 'Run Again')}</Button></div>
      </div>
    )
  }
  if (bulkResults) {
    return (
      <div className="space-y-3 flex-1 min-h-0 overflow-y-auto">
        {bulkResults.map((item) => (
          <div key={item.node_id} className="space-y-2">
            <p className="text-xs font-medium text-surface-700 dark:text-surface-300">{item.node_name || item.node_id}</p>
            {item.result.steps.map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2"><span className="text-xs font-medium text-surface-700 dark:text-surface-300">{t('scripts.step', 'Step')} {idx + 1}{step.label ? `: ${step.label}` : ''}</span><Badge variant={step.exit_code === 0 ? 'success' : 'danger'}>{t('common.exitCode', 'exit')} {step.exit_code}</Badge></div>
                <ExecutionResult stdout={step.stdout} stderr={step.stderr} exitCode={step.exit_code} showExitCode={false} />
              </div>
            ))}
          </div>
        ))}
        <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setBulkResults(null)}>{t('common.close')}</Button><Button size="sm" onClick={() => setBulkResults(null)}>{t('scripts.runAgain', 'Run Again')}</Button></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-3">
      <SearchInput value={searchNode} onChange={setSearchNode} placeholder={t('nodes.searchPlaceholder', 'Search nodes...')} />
      {filteredNodes.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <Checkbox checked={allFilteredSelected} onChange={toggleAllNodes} ariaLabel={t('common.selectAll')} />
            <span className="text-surface-600 dark:text-surface-400">{allFilteredSelected ? t('common.deselectAll') : t('common.selectAll')} ({filteredNodes.length})</span>
          </label>
          {selectedNodeIds.size > 0 && <span className="text-xs text-accent-600 dark:text-accent-400">{t('common.selected', { count: selectedNodeIds.size })}</span>}
        </div>
      )}
      <div className="w-full flex-1 min-h-[200px] overflow-y-auto divide-y divide-surface-200 dark:divide-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg">
        {filteredNodes.length === 0 ? <p className="text-sm text-surface-500 text-center py-4">{t('nodes.noNodes', 'No nodes')}</p> : filteredNodes.map((n) => {
          const checked = selectedNodeIds.has(n.id)
          return (
            <label key={n.id} className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm cursor-pointer ${checked ? 'bg-accent-50 dark:bg-accent-900/20' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'}`}>
              <Checkbox checked={checked} onChange={() => toggleNode(n.id)} ariaLabel={n.name} />
              <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0"><IconScripts className="w-4 h-4 text-surface-500" /></div>
              <div className="min-w-0 flex-1"><p className="font-medium text-surface-900 dark:text-white truncate">{n.name}</p><p className="text-xs text-surface-500 font-mono truncate">{n.host}:{n.port}</p></div>
            </label>
          )
        })}
      </div>
      <div className="flex justify-end"><Button size="sm" onClick={handleRun} disabled={selectedNodeIds.size === 0 || isPending}>{isPending ? <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span> : `${t('scripts.run')} ${selectedNodeIds.size > 0 ? `(${selectedNodeIds.size})` : ''}`}</Button></div>
    </div>
  )
}
