// oxlint-disable
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Checkbox } from '../ui/Checkbox'
import { SearchInput } from '../ui/SearchInput'
import { Spinner } from '../ui/Spinner'
import { useNodes } from '../../hooks/useNodes'
import { useCommands } from '../../hooks/useCommands'
import { useMutation } from '@tanstack/react-query'
import { commandsApi } from '../../api/commands'
import { useToast } from '../ui/useToast'
import { ExecutionResult } from './ExecutionResult'
import type { BulkExecutionBatchResponse, BulkNodeResult } from '../../api/types'

interface BulkRunCommandsModalProps {
  commandIds: string[]
  onClose: () => void
}

export function BulkRunCommandsModal({ commandIds, onClose }: BulkRunCommandsModalProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: nodesData } = useNodes({ size: 100 })
  const nodes = nodesData?.items || []
  const { data: commandsData } = useCommands({ size: 100 })
  const commands = commandsData?.items || []
  const [search, setSearch] = useState('')
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())
  const [results, setResults] = useState<{ command: string; results: Array<BulkNodeResult & { command_id?: string }> } | null>(null)
  const bulkExec = useMutation({ mutationFn: (data: { command_ids: string[]; node_ids: string[] }) => commandsApi.executions({ command_ids: data.command_ids, node_ids: data.node_ids } as never) })

  const commandIdsKey = commandIds.join(',')
  useEffect(() => {
    setSelectedNodeIds(new Set())
    setSearch('')
    setResults(null)
  }, [commandIdsKey])

  const filtered = nodes.filter((n) => n.name.toLowerCase().includes(search.toLowerCase()))
  const allSelected = filtered.length > 0 && filtered.every((n) => selectedNodeIds.has(n.id))
  const toggleNode = (id: string) => {
    setSelectedNodeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  const toggleAll = () => {
    if (allSelected) {
      setSelectedNodeIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((n) => next.delete(n.id))
        return next
      })
    } else {
      setSelectedNodeIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((n) => next.add(n.id))
        return next
      })
    }
  }

  const handleRun = () => {
    const nodeIds = [...selectedNodeIds]
    if (commandIds.length === 0 || nodeIds.length === 0) return
    setResults(null)
    bulkExec.mutate({ command_ids: commandIds, node_ids: nodeIds }, {
      onSuccess: (res) => {
        const batch = res as BulkExecutionBatchResponse
        const failed = batch.failed ?? batch.results.filter((r) => (r.exit_code ?? 1) !== 0).length
        if (failed > 0) toast('warning', t('commands.toastBulkExecuted', { count: nodeIds.length }) + t('common.failedSuffix', { count: failed }))
        else toast('success', t('commands.toastBulkExecuted', { count: nodeIds.length }))
        setResults({ command: commandIds.map((id) => commands.find((c) => c.id === id)?.name ?? id).join(', '), results: batch.results as unknown as Array<BulkNodeResult & { command_id?: string }> })
      },
      onError: () => toast('error', t('commands.toastFailed')),
    })
  }

  const isPending = bulkExec.isPending

  if (results) {
    return (
      <Modal isOpen={commandIds.length > 0} onClose={onClose} title={t('commands.execute', 'Execute')} size="lg">
        <div className="space-y-4">
          <p className="text-xs font-mono text-surface-500">$ {results.command}</p>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600 dark:text-green-400">{t('commands.succeeded', 'Succeeded')}: {results.results.filter((r) => r.exit_code === 0).length}</span>
            <span className="text-red-600 dark:text-red-400">{t('commands.failed', 'Failed')}: {results.results.filter((r) => r.exit_code !== 0).length}</span>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {results.results.map((r, idx) => {
              const cmdName = (r as { command_id?: string }).command_id ? commands.find((c) => c.id === (r as { command_id?: string }).command_id)?.name ?? (r as { command_id?: string }).command_id : undefined
              const label = cmdName ? `${cmdName} — ${r.node_name ?? r.node_id}` : (r.node_name ?? r.node_id)
              return (
                <div key={`${(r as { command_id?: string }).command_id ?? 'cmd'}:${r.node_id}:${idx}`} className="border border-surface-200 dark:border-surface-700 rounded-lg p-3">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{label}</p>
                  <ExecutionResult stdout={r.stdout} stderr={r.stderr} exitCode={r.exit_code} />
                </div>
              )
            })}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>{t('common.close')}</Button>
            <Button onClick={() => setResults(null)}>{t('commands.executeAgain')}</Button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={commandIds.length > 0} onClose={onClose} title={`${t('commands.execute', 'Execute')} (${commandIds.length})`} size="lg">
      <div className="space-y-3">
        <SearchInput value={search} onChange={setSearch} placeholder={t('nodes.searchPlaceholder', 'Search nodes...')} />
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <Checkbox checked={allSelected} onChange={toggleAll} ariaLabel={t('common.selectAll')} />
              <span className="text-surface-600 dark:text-surface-400">{allSelected ? t('common.deselectAll') : t('common.selectAll')} ({filtered.length})</span>
            </label>
            {selectedNodeIds.size > 0 && <span className="text-xs text-accent-600 dark:text-accent-400">{t('common.selected', { count: selectedNodeIds.size })}</span>}
          </div>
        )}
        <div className="max-h-64 overflow-y-auto divide-y divide-surface-200 dark:divide-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg">
          {filtered.length === 0 ? <p className="text-sm text-surface-500 text-center py-4">{t('nodes.noNodes', 'No nodes')}</p> : filtered.map((n) => {
            const checked = selectedNodeIds.has(n.id)
            return (
              <label key={n.id} className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm cursor-pointer ${checked ? 'bg-accent-50 dark:bg-accent-900/20' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'}`}>
                <Checkbox checked={checked} onChange={() => toggleNode(n.id)} ariaLabel={n.name} />
                <div className="min-w-0 flex-1"><p className="font-medium text-surface-900 dark:text-white truncate">{n.name}</p><p className="text-xs text-surface-500 font-mono truncate">{n.host}:{n.port}</p></div>
              </label>
            )
          })}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={handleRun} disabled={selectedNodeIds.size === 0 || isPending}>{isPending ? <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span> : `${t('commands.execute')} (${commandIds.length}×${selectedNodeIds.size})`}</Button>
        </div>
      </div>
    </Modal>
  )
}
