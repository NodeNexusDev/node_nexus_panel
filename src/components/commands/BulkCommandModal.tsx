import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Spinner } from '../ui/Spinner'
import { SearchInput } from '../ui/SearchInput'
import { Tabs } from '../ui/Tabs'
import { Checkbox } from '../ui/Checkbox'
import { IconCommands } from '../ui/Icons'
import { useCommands } from '../../hooks/useCommands'
import { useMutation } from '@tanstack/react-query'
import { commandsApi } from '../../api/commands'
import { useToast } from '../ui/useToast'
import { getDefaultParams } from './command-form-utils'
import { CommandParamInputs } from './CommandParamInputs'
import { ExecutionResult } from './ExecutionResult'
import type { BulkNodeResult } from '../../api/types'

type Tab = 'command' | 'custom'

interface BulkCommandModalProps {
  nodeIds: string[]
  onClose: () => void
}

export function BulkCommandModal({ nodeIds, onClose }: BulkCommandModalProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: commandsData } = useCommands({ size: 100 })
  const commands = commandsData?.items || []
  const bulkExec = useMutation({ mutationFn: (data: { command_ids: string[]; node_ids: string[]; params?: Record<string, Record<string, unknown>> }) => commandsApi.executions({ command_ids: data.command_ids, node_ids: data.node_ids, params: data.params as never }) })
  const bulkRaw = useMutation({ mutationFn: (data: { commands: string[]; node_ids: string[] }) => commandsApi.rawExecutions({ commands: data.commands, node_ids: data.node_ids } as never) })

  const [tab, setTab] = useState<Tab>('command')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [params, setParams] = useState<Record<string, unknown>>({})
  const [customCommand, setCustomCommand] = useState('')

  const [bulkResult, setBulkResult] = useState<{ command: string; results: BulkNodeResult[] } | null>(null)
  const [bulkMultiResults, setBulkMultiResults] = useState<Array<{ name: string; results: BulkNodeResult[] }> | null>(null)

  useEffect(() => {
    if (nodeIds.length > 0) {
      setTab('command')
      setSearch('')
      setSelectedIds(new Set())
      setParams({})
      setCustomCommand('')
      setBulkResult(null)
      setBulkMultiResults(null)
    }
  }, [nodeIds])

  const filtered = commands.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id))
  const selectedCommands = commands.filter((c) => selectedIds.has(c.id))
  const singleSelected = selectedCommands.length === 1 ? selectedCommands[0] : null

  useEffect(() => {
    if (singleSelected) setParams(getDefaultParams(singleSelected.parameters))
    else setParams({})
  }, [singleSelected])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
    setBulkResult(null)
    setBulkMultiResults(null)
  }
  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((c) => next.delete(c.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((c) => next.add(c.id))
        return next
      })
    }
    setBulkResult(null)
    setBulkMultiResults(null)
  }

  const handleRunCommand = () => {
    if (selectedIds.size === 0 || nodeIds.length === 0) return
    setBulkResult(null)
    setBulkMultiResults(null)
    const ids = [...selectedIds]
    if (ids.length === 1 && singleSelected) {
      const values: Record<string, unknown> = {}
      for (const p of singleSelected.parameters || []) {
        const raw = params[p.name]
        if (raw === '' || raw === undefined || raw === null) continue
        if (p.type === 'integer') values[p.name] = Number(raw)
        else if (p.type === 'boolean') values[p.name] = !!raw
        else values[p.name] = raw
      }
      const paramsMap = Object.keys(values).length > 0 ? { [singleSelected.id]: values } : undefined
      bulkExec.mutate({ command_ids: ids, node_ids: nodeIds, params: paramsMap as never }, {
        onSuccess: (res) => {
          toast('success', t('commands.toastBulkExecuted', { count: nodeIds.length }))
          const batch = res as unknown as { results: Array<{ node_id?: string|null; node_name?: string|null; stdout: string; stderr: string; exit_code?: number|null; status: string }>; total: number; succeeded: number; failed: number }
          setBulkResult({ command: singleSelected.command, results: batch.results.map((r) => ({ node_id: r.node_id ?? '', node_name: r.node_name ?? '', stdout: r.stdout, stderr: r.stderr, exit_code: r.exit_code ?? (r.status==='success'?0:1) })) })
        },
        onError: () => toast('error', t('commands.toastFailed')),
      })
      return
    }
    const paramsMap: Record<string, Record<string, unknown>> = {}
    ids.forEach((cid) => {
      const cmd = commands.find((c) => c.id === cid)
      if (cmd) {
        const def = getDefaultParams(cmd.parameters)
        if (Object.keys(def).length > 0) paramsMap[cid] = def
      }
    })
    bulkExec.mutate({ command_ids: ids, node_ids: nodeIds, params: Object.keys(paramsMap).length > 0 ? paramsMap as never : undefined }, {
      onSuccess: (res) => {
        toast('success', t('commands.toastExecuted', { target: `${ids.length} commands` }))
        const batch = res as unknown as { results: Array<{ stdout: string; stderr: string; exit_code?: number|null; status: string; command_id?: string; node_id?: string; node_name?: string }> }
        // group by command for display
        const grouped = ids.map((id) => {
          const cmd = commands.find((c) => c.id === id)
          const related = (batch.results || []).filter((r: unknown) => (r as { command_id?: string }).command_id === id) as Array<{ node_name?: string; node_id?: string; stdout: string; stderr: string; exit_code?: number|null; status: string }>
          const results = (related.length > 0 ? related : batch.results as unknown as Array<{ node_name?: string; node_id?: string; stdout: string; stderr: string; exit_code?: number|null; status: string }>).map((r) => ({ node_id: r.node_id ?? '', node_name: r.node_name ?? '', stdout: r.stdout, stderr: r.stderr, exit_code: r.exit_code ?? (r.status==='success'?0:1) }))
          return { name: cmd?.name ?? id, results: results.slice(0, nodeIds.length) }
        })
        // if grouping failed (no command_id in results), fallback to single list per command
        if (grouped[0]?.results.length === 0) {
          setBulkMultiResults(null)
          setBulkResult({ command: ids.map((id) => commands.find((c) => c.id === id)?.name ?? id).join(', '), results: (batch.results as unknown as Array<{ node_id?: string; node_name?: string; stdout: string; stderr: string; exit_code?: number|null; status: string }>).map((r) => ({ node_id: r.node_id ?? '', node_name: r.node_name ?? '', stdout: r.stdout, stderr: r.stderr, exit_code: r.exit_code ?? (r.status==='success'?0:1) })) })
        } else {
          setBulkMultiResults(grouped)
        }
      },
      onError: () => toast('error', t('commands.toastFailed')),
    })
  }

  const handleRunCustom = () => {
    if (!customCommand || nodeIds.length === 0) return
    setBulkResult(null)
    setBulkMultiResults(null)
    bulkRaw.mutate({ commands: [customCommand], node_ids: nodeIds }, {
      onSuccess: (res) => {
        toast('success', t('commands.toastBulkExecuted', { count: nodeIds.length }))
        const batch = res as unknown as { results: Array<{ node_id?: string|null; node_name?: string|null; stdout: string; stderr: string; exit_code?: number|null; status: string }> }
        setBulkResult({ command: customCommand, results: batch.results.map((r) => ({ node_id: r.node_id ?? '', node_name: r.node_name ?? '', stdout: r.stdout, stderr: r.stderr, exit_code: r.exit_code ?? (r.status==='success'?0:1) })) })
      },
      onError: () => toast('error', t('commands.toastFailed')),
    })
  }

  const isPending = bulkExec.isPending || bulkRaw.isPending

  return (
    <Modal isOpen={nodeIds.length > 0} onClose={onClose} title={t('nodes.bulkExec', 'Run Commands')} size="lg">
      <div className="space-y-4">
        <Tabs
          tabs={[
            { key: 'command', label: t('nodes.commandTab', 'Command') },
            { key: 'custom', label: t('nodes.customTab', 'Custom') },
          ]}
          active={tab}
          onChange={setTab}
        />
        {bulkMultiResults ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {bulkMultiResults.map((group) => (
              <div key={group.name} className="space-y-2">
                <p className="text-xs font-medium text-surface-700 dark:text-surface-300">{group.name} — {group.results.filter((r) => r.exit_code === 0).length}/{group.results.length} ok</p>
                <div className="space-y-2">
                  {group.results.map((r) => (
                    <BulkResultItem key={`${group.name}-${r.node_id}`} result={r} />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={onClose}>{t('common.close')}</Button>
              <Button onClick={() => setBulkMultiResults(null)}>{t('commands.executeAgain')}</Button>
            </div>
          </div>
        ) : bulkResult ? (
          <BulkResultView
            command={bulkResult.command}
            results={bulkResult.results}
            onClose={onClose}
            onRetry={() => setBulkResult(null)}
          />
        ) : tab === 'command' ? (
          <div className="space-y-3">
            <SearchInput value={search} onChange={setSearch} placeholder={t('nodes.selectCommand', 'Search commands...')} />
            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={allFilteredSelected} onChange={toggleAllFiltered} ariaLabel={t('common.selectAll')} />
                  <span className="text-surface-600 dark:text-surface-400">{allFilteredSelected ? t('common.deselectAll') : t('common.selectAll')} ({filtered.length})</span>
                </label>
                {selectedIds.size > 0 && <span className="text-xs text-accent-600 dark:text-accent-400">{t('common.selected', { count: selectedIds.size })}</span>}
              </div>
            )}
            <div className="max-h-56 overflow-y-auto divide-y divide-surface-200 dark:divide-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg">
              {filtered.length === 0 ? (
                <p className="text-sm text-surface-500 text-center py-4">{t('nodes.noCommands', 'No commands')}</p>
              ) : filtered.map((cmd) => {
                const checked = selectedIds.has(cmd.id)
                return (
                  <label key={cmd.id} className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm cursor-pointer ${checked ? 'bg-accent-50 dark:bg-accent-900/20' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'}`}>
                    <Checkbox checked={checked} onChange={() => toggleSelect(cmd.id)} ariaLabel={cmd.name} />
                    <IconCommands className="w-4 h-4 text-surface-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-surface-900 dark:text-white truncate">{cmd.name}</p>
                      <p className="text-xs text-surface-500 font-mono truncate">{cmd.command}</p>
                    </div>
                  </label>
                )
              })}
            </div>
            {singleSelected && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-surface-600 dark:text-surface-400">{t('commands.parameters', 'Parameters')} — {singleSelected.name}</p>
                {singleSelected.parameters && singleSelected.parameters.length > 0 ? (
                  <CommandParamInputs parameters={singleSelected.parameters} values={params} onChange={(name, value) => setParams((prev) => ({ ...prev, [name]: value }))} />
                ) : (
                  <p className="text-xs text-surface-400">{t('commands.noParameters', 'No parameters')}</p>
                )}
              </div>
            )}
            {selectedIds.size > 1 && <p className="text-xs text-surface-500">{t('commands.bulkExecuteHint', 'Bulk execution uses default parameters for each command')}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
              <Button onClick={handleRunCommand} disabled={selectedIds.size === 0 || isPending}>
                {isPending ? (
                  <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span>
                ) : `${t('commands.execute')} ${selectedIds.size > 0 ? `(${selectedIds.size})` : ''}`}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Input label={t('nodes.command', 'Command')} placeholder="uptime" value={customCommand} onChange={(e) => setCustomCommand(e.target.value)} />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
              <Button onClick={handleRunCustom} disabled={!customCommand || isPending}>
                {isPending ? (
                  <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span>
                ) : t('nodes.execCommand')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

function BulkResultView({ command, results, onClose, onRetry }: { command: string; results: BulkNodeResult[]; onClose: () => void; onRetry: () => void }) {
  const { t } = useTranslation()
  const succeeded = results.filter((r) => r.exit_code === 0).length
  const failed = results.length - succeeded

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-surface-500">$ {command}</p>
      <div className="flex gap-4 text-sm">
        <span className="text-green-600 dark:text-green-400">{t('commands.succeeded', 'Succeeded')}: {succeeded}</span>
        <span className="text-red-600 dark:text-red-400">{t('commands.failed', 'Failed')}: {failed}</span>
      </div>
      <div className="max-h-96 overflow-y-auto space-y-3">
        {results.map((r) => (
          <BulkResultItem key={r.node_id} result={r} />
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onClose}>{t('common.close')}</Button>
        <Button onClick={onRetry}>{t('commands.executeAgain')}</Button>
      </div>
    </div>
  )
}

function BulkResultItem({ result }: { result: BulkNodeResult }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${result.exit_code === 0 ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium text-surface-900 dark:text-white">{result.node_name}</span>
          <span className="text-xs text-surface-500">{t('common.exitCode', 'exit')} {result.exit_code}</span>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-surface-200 dark:border-surface-700">
          <ExecutionResult stdout={result.stdout} stderr={result.stderr} exitCode={result.exit_code} />
        </div>
      )}
    </div>
  )
}
