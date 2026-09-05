// oxlint-disable react-hooks/exhaustive-deps
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
import { StatCardSkeleton } from '../ui/Skeleton'
import { StatCard, StatsGrid } from '../ui/StatCard'
import { Checkbox } from '../ui/Checkbox'
import { SearchInput } from '../ui/SearchInput'
import { Spinner } from '../ui/Spinner'
import { formatPercent, formatDurationMs } from '../../lib/format'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { useToast } from '../ui/useToast'
import { IconCommands, IconCopy, IconXCircle } from '../ui/Icons'
import { useCommandStats, useUpdateCommand, useCloneCommand, useDeleteCommand, useExecuteCommand } from '../../hooks/useCommands'
import { useNodes } from '../../hooks/useNodes'
import { useMutation } from '@tanstack/react-query'
import { commandsApi } from '../../api/commands'
import { getDefaultParams } from './command-form-utils'
import { CommandParamInputs } from './CommandParamInputs'
import { ExecutionResult } from './ExecutionResult'
import { ParameterEditor } from './CommandFormEditor'
import { useForm, Controller, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { commandUpdateSchema, type CommandUpdateFormValues } from '../../lib/validators/command-schema'
import { normalizeParameters } from './command-form-utils'
import type { CommandResponse, CommandResult } from '../../api/types'

type DrawerTab = 'overview' | 'params' | 'stats' | 'edit' | 'exec'

interface CommandDrawerProps {
  command: CommandResponse
  onClose: () => void
}

export function CommandDrawer({ command, onClose }: CommandDrawerProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { copy } = useCopyToClipboard({ onCopied: () => toast('success', t('common.copied')) })
  const [active, setActive] = useState<DrawerTab>('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteCommand = useDeleteCommand()
  const cloneCommand = useCloneCommand()

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: 'overview', label: t('commands.overview', 'Overview') },
    { key: 'params', label: t('commands.parameters', 'Parameters') },
    { key: 'stats', label: t('commands.stats', 'Stats') },
    { key: 'exec', label: t('commands.execute', 'Execute') },
    { key: 'edit', label: t('common.edit', 'Edit') },
  ]

  useEffect(() => { setActive('overview'); setShowDeleteConfirm(false) }, [command.id])

  const handleClone = () => {
    cloneCommand.mutate({ id: command.id, newName: `${command.name} (copy)` }, {
      onSuccess: () => toast('success', t('commands.toastCloned')),
      onError: () => toast('error', t('commands.toastCloneFailed')),
    })
  }
  const handleDeleteConfirm = () => {
    deleteCommand.mutate(command.id, {
      onSuccess: () => { toast('success', t('commands.toastDeleted')); onClose() },
      onError: () => toast('error', t('commands.toastDeleteFailed')),
    })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent-500/10 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400 flex items-center justify-center shrink-0">
          <IconCommands className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-surface-900 dark:text-white truncate">{command.name}</p>
          <p className="text-xs font-mono text-surface-500 truncate">{command.command}</p>
        </div>
        <FavoriteButton targetType="command" targetId={command.id} resourceName={command.name} size="sm" />
        <button onClick={onClose} aria-label={t('common.close')} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {command.tags.map((tag) => <Badge key={tag} variant="default">{tag}</Badge>)}
        {!command.tags.length && <span className="text-surface-400 text-xs">—</span>}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="ghost" size="sm" onClick={handleClone} disabled={cloneCommand.isPending}>{t('commands.clone')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm((v) => !v)} className="text-red-500 hover:text-red-600 ml-auto">
          <IconXCircle className="w-4 h-4 mr-1" />{t('common.delete')}
        </Button>
      </div>
      {showDeleteConfirm && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-between gap-3">
          <p className="text-xs text-red-700 dark:text-red-300">{t('commands.deleteMsg', { name: command.name })}</p>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" size="sm" disabled={deleteCommand.isPending} onClick={handleDeleteConfirm}>{deleteCommand.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      )}

      <Tabs tabs={tabs} active={active} onChange={setActive} />

      {active === 'overview' && <CommandOverview command={command} copy={copy} />}
      {active === 'params' && <CommandParamsTab command={command} />}
      {active === 'stats' && <CommandStatsTab commandId={command.id} />}
      {active === 'exec' && <CommandExecTab command={command} />}
      {active === 'edit' && <CommandEditTab command={command} onDone={() => setActive('overview')} />}
    </div>
  )
}

function CommandOverview({ command, copy }: { command: CommandResponse; copy: (t: string) => void }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
          <p className="text-[11px] uppercase tracking-wide text-surface-500">Command</p>
          <div className="flex items-center gap-2 mt-1">
            <pre className="text-sm font-mono text-surface-900 dark:text-white whitespace-pre-wrap break-all flex-1">{command.command}</pre>
            <button onClick={() => copy(command.command)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 cursor-pointer"><IconCopy className="w-3.5 h-3.5 text-surface-400" /></button>
          </div>
          {command.description && <p className="text-xs text-surface-500 mt-2">{command.description}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg"><p className="text-[11px] uppercase text-surface-500">{t('commands.created')}</p><p className="text-sm text-surface-900 dark:text-white">{new Date(command.created_at).toLocaleString()}</p></div>
          <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg"><p className="text-[11px] uppercase text-surface-500">{t('commands.updated', 'Updated')}</p><p className="text-sm text-surface-900 dark:text-white">{new Date(command.updated_at).toLocaleString()}</p></div>
        </div>
      </CardContent>
    </Card>
  )
}

function CommandParamsTab({ command }: { command: CommandResponse }) {
  const { t } = useTranslation()
  if (!command.parameters || command.parameters.length === 0) return <EmptyState title={t('commands.noParameters', 'No parameters')} />
  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        {command.parameters.map((p) => (
          <div key={p.name} className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-white font-mono">{p.name} <span className="text-xs text-surface-500">{p.type}</span></p>
              {p.description && <p className="text-xs text-surface-500">{p.description}</p>}
            </div>
            <div className="flex gap-1">
              {p.required && <Badge variant="warning">required</Badge>}
              <Badge variant="default">{p.type}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function CommandStatsTab({ commandId }: { commandId: string }) {
  const { t } = useTranslation()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { data: stats, isLoading, error, refetch } = useCommandStats(commandId, { date_from: dateFrom || undefined, date_to: dateTo || undefined })
  if (isLoading) return <div className="grid grid-cols-2 gap-3"><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></div>
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!stats) return <EmptyState title={t('commands.noStats', 'No stats available')} />
  return (
    <Card>
      <CardHeader><div className="flex gap-2"><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="flex-1 px-2 py-1.5 bg-white border border-surface-300 rounded-lg text-xs dark:bg-surface-800 dark:border-surface-700 dark:text-white" /><span className="text-surface-400 self-center">—</span><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="flex-1 px-2 py-1.5 bg-white border border-surface-300 rounded-lg text-xs dark:bg-surface-800 dark:border-surface-700 dark:text-white" /></div></CardHeader>
      <CardContent><StatsGrid><StatCard label={t('commands.totalExecutions', 'Total')} value={stats.total} /><StatCard label={t('commands.successRate', 'Success Rate')} value={formatPercent(stats.success_rate)} tone="success" /><StatCard label={t('commands.avgDuration', 'Avg Duration')} value={formatDurationMs(stats.avg_duration_ms)} /><StatCard label={t('commands.failed', 'Failed')} value={stats.failed} tone="danger" /></StatsGrid></CardContent>
    </Card>
  )
}

function CommandEditTab({ command, onDone }: { command: CommandResponse; onDone: () => void }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const updateCommand = useUpdateCommand()
  const form = useForm<CommandUpdateFormValues>({
    resolver: zodResolver(commandUpdateSchema) as never,
    defaultValues: {
      name: command.name,
      command: command.command,
      description: command.description ?? '',
      tags: command.tags,
      parameters: command.parameters?.map((p) => ({ name: p.name, type: p.type, required: p.required, default: typeof p.default === 'string' || typeof p.default === 'number' || typeof p.default === 'boolean' ? p.default : '', description: p.description ?? '' })) ?? [],
    },
  })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    form.reset({
      name: command.name,
      command: command.command,
      description: command.description ?? '',
      tags: command.tags,
      parameters: command.parameters?.map((p) => ({ name: p.name, type: p.type, required: p.required, default: typeof p.default === 'string' || typeof p.default === 'number' || typeof p.default === 'boolean' ? p.default : '', description: p.description ?? '' })) ?? [],
    })
  }, [command.id])
  const onSubmit = (values: CommandUpdateFormValues) => {
    const data = {
      name: values.name,
      command: values.command,
      description: values.description || undefined,
      parameters: normalizeParameters(values.parameters) as unknown as CommandResponse['parameters'],
      tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
    }
    updateCommand.mutate({ id: command.id, data: data as never }, {
      onSuccess: () => { toast('success', t('commands.toastUpdated')); onDone() },
      onError: () => toast('error', t('commands.toastUpdateFailed')),
    })
  }
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Input label={t('commands.name')} {...form.register('name')} error={form.formState.errors.name?.message} />
        <Input label={t('commands.command')} {...form.register('command')} error={form.formState.errors.command?.message} />
        <Controller name="description" control={form.control} render={({ field }) => <Input label={t('commands.descriptionField', 'Description')} {...field} value={field.value ?? ''} />} />
        <Controller name="tags" control={form.control} render={({ field }) => (
          <Input label={t('commands.tagsLabel')} value={Array.isArray(field.value) ? field.value.join(', ') : ''} onChange={(e) => field.onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
        )} />
        <ParameterEditor />
        <div className="flex justify-end gap-2"><Button variant="ghost" type="button" onClick={onDone}>{t('common.cancel')}</Button><Button type="submit" disabled={updateCommand.isPending}>{updateCommand.isPending ? t('common.loading') : t('common.save')}</Button></div>
      </form>
    </FormProvider>
  )
}

function CommandExecTab({ command }: { command: CommandResponse }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: nodesData } = useNodes({ size: 100 })
  const nodes = nodesData?.items || []
  const executeCommand = useExecuteCommand()
  const bulkExec = useMutation({ mutationFn: (data: { command_ids: string[]; node_ids: string[]; params?: Record<string, Record<string, unknown>> }) => commandsApi.executions({ command_ids: data.command_ids, node_ids: data.node_ids, params: data.params as never }) })
  const [searchNode, setSearchNode] = useState('')
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())
  const [params, setParams] = useState<Record<string, unknown>>({})
  const [result, setResult] = useState<CommandResult | null>(null)
  const [bulkResults, setBulkResults] = useState<Array<{ node_id: string; node_name: string; result: CommandResult }> | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setParams(getDefaultParams(command.parameters))
    setResult(null)
    setBulkResults(null)
    setSelectedNodeIds(new Set())
    setSearchNode('')
  }, [command.id])

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
    if (nodeIds.length === 0) { toast('error', t('commands.selectNodes', 'Select nodes')); return }
    setResult(null)
    setBulkResults(null)
    const values: Record<string, unknown> = {}
    for (const p of command.parameters || []) {
      const raw = params[p.name]
      if (raw === '' || raw === undefined || raw === null) continue
      if (p.type === 'integer') values[p.name] = Number(raw)
      else if (p.type === 'boolean') values[p.name] = !!raw
      else values[p.name] = raw
    }
    const paramsMap = Object.keys(values).length > 0 ? { [command.id]: values } : undefined
    if (nodeIds.length === 1) {
      executeCommand.mutate({ id: command.id, data: { node_ids: nodeIds, params: values } }, {
        onSuccess: (res) => {
          const batch = res as unknown as { results?: Array<{ stdout: string; stderr: string; exit_code?: number | null; status?: string }>; failed?: number }
          const first = batch.results?.[0] as unknown as { exit_code?: number | null; status?: string; stdout?: string; stderr?: string } | undefined
          const isFail = (first?.exit_code ?? (first?.status === 'success' ? 0 : first ? 1 : 0)) !== 0 || (batch as { failed?: number }).failed! > 0
          if (isFail) toast('warning', t('commands.toastExecuted', { target: nodes.find((n) => n.id === nodeIds[0])?.name ?? nodeIds[0] }) + ' — failed')
          else toast('success', t('commands.toastExecuted', { target: nodes.find((n) => n.id === nodeIds[0])?.name ?? nodeIds[0] }))
          if (first) setResult({ stdout: first.stdout ?? '', stderr: first.stderr ?? '', exit_code: first.exit_code ?? (first.status === 'success' ? 0 : 1) } as CommandResult)
          else setResult(res as unknown as CommandResult)
        },
        onError: () => toast('error', t('commands.toastFailed')),
      })
    } else {
      bulkExec.mutate({ command_ids: [command.id], node_ids: nodeIds, params: paramsMap as never }, {
        onSuccess: (res) => {
          const batch = res as unknown as { results: Array<{ node_id?: string; node_name?: string; stdout: string; stderr: string; exit_code?: number | null; status: string }>; failed?: number }
          const failed = batch.failed ?? batch.results.filter((r) => (r.exit_code ?? (r.status === 'success' ? 0 : 1)) !== 0).length
          if (failed > 0) toast('warning', t('commands.toastBulkExecuted', { count: nodeIds.length }) + ` — ${failed} failed`)
          else toast('success', t('commands.toastBulkExecuted', { count: nodeIds.length }))
          const mapped = (batch.results || []).map((r) => ({ node_id: r.node_id ?? '', node_name: r.node_name ?? r.node_id ?? '', result: { stdout: r.stdout, stderr: r.stderr, exit_code: r.exit_code ?? (r.status === 'success' ? 0 : 1) } as CommandResult }))
          setBulkResults(mapped)
        },
        onError: () => toast('error', t('commands.toastFailed')),
      })
    }
  }

  const isPending = executeCommand.isPending || bulkExec.isPending

  if (result) {
    return (
      <div className="space-y-3 flex-1 min-h-0 overflow-y-auto">
        <ExecutionResult stdout={result.stdout} stderr={result.stderr} exitCode={result.exit_code} />
        <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setResult(null)}>{t('commands.executeAgain')}</Button></div>
      </div>
    )
  }
  if (bulkResults) {
    return (
      <div className="space-y-3 flex-1 min-h-0 overflow-y-auto">
        {bulkResults.map((item) => (
          <div key={item.node_id} className="space-y-1">
            <p className="text-xs font-medium text-surface-700 dark:text-surface-300">{item.node_name}</p>
            <ExecutionResult stdout={item.result.stdout} stderr={item.result.stderr} exitCode={item.result.exit_code} />
          </div>
        ))}
        <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setBulkResults(null)}>{t('common.close')}</Button><Button size="sm" onClick={() => setBulkResults(null)}>{t('commands.executeAgain')}</Button></div>
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
              <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0"><IconCommands className="w-4 h-4 text-surface-500" /></div>
              <div className="min-w-0 flex-1"><p className="font-medium text-surface-900 dark:text-white truncate">{n.name}</p><p className="text-xs text-surface-500 font-mono truncate">{n.host}:{n.port}</p></div>
            </label>
          )
        })}
      </div>
      {command.parameters && command.parameters.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-surface-600 dark:text-surface-400">{t('commands.parameters', 'Parameters')}</p>
          <CommandParamInputs parameters={command.parameters} values={params} onChange={(name, value) => setParams((prev) => ({ ...prev, [name]: value }))} />
        </div>
      )}
      <div className="flex justify-end"><Button size="sm" onClick={handleRun} disabled={selectedNodeIds.size === 0 || isPending}>{isPending ? <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span> : `${t('commands.execute')} ${selectedNodeIds.size > 0 ? `(${selectedNodeIds.size})` : ''}`}</Button></div>
    </div>
  )
}
