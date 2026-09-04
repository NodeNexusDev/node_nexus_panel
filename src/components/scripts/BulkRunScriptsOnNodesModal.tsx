import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Checkbox } from '../ui/Checkbox'
import { SearchInput } from '../ui/SearchInput'
import { Spinner } from '../ui/Spinner'
import { useNodes } from '../../hooks/useNodes'
import { useMutation } from '@tanstack/react-query'
import { scriptsApi } from '../../api/scripts'
import { useToast } from '../ui/useToast'
import { ExecutionResult } from '../commands/ExecutionResult'
import { Badge } from '../ui/Badge'
import type { ScriptNodeResult } from '../../api/types'

interface BulkRunScriptsOnNodesModalProps {
  scriptIds: string[]
  onClose: () => void
}

export function BulkRunScriptsOnNodesModal({ scriptIds, onClose }: BulkRunScriptsOnNodesModalProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: nodesData } = useNodes({ size: 100 })
  const nodes = nodesData?.items || []
  const [search, setSearch] = useState('')
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())
  const [bulkResults, setBulkResults] = useState<Array<{ id: string; name: string; result: ScriptNodeResult }> | null>(null)
  const [singleResult, setSingleResult] = useState<ScriptNodeResult | null>(null)
  const bulkRun = useMutation({ mutationFn: (data: { script_ids: string[]; node_ids: string[] }) => scriptsApi.executions({ script_ids: data.script_ids, node_ids: data.node_ids }) })

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
    if (scriptIds.length === 0 || nodeIds.length === 0) return
    setSingleResult(null)
    setBulkResults(null)
    bulkRun.mutate({ script_ids: scriptIds, node_ids: nodeIds }, {
      onSuccess: (response) => {
        toast('success', t('scripts.toastStarted', { name: `${scriptIds.length} scripts` }))
        const batch = response as unknown as { results?: ScriptNodeResult[] & Array<{ script_id?: string; node_id?: string; node_name?: string }> }
        const results = batch.results ?? []
        if (results.length === 1) {
          setSingleResult(results[0] as unknown as ScriptNodeResult)
        } else if (results.length > 1) {
          const mapped = (results as Array<ScriptNodeResult & { script_id?: string; node_id?: string; node_name?: string }>).map((r, idx) => ({
            id: `${(r as { execution_id?: string }).execution_id ?? idx}`,
            name: `${(r as { script_id?: string }).script_id ?? scriptIds[0]} — ${(r as { node_name?: string }).node_name ?? (r as { node_id?: string }).node_id ?? ''}`,
            result: r as unknown as ScriptNodeResult,
          }))
          setBulkResults(mapped)
        }
      },
      onError: () => toast('error', t('scripts.toastRunFailed', { name: `${scriptIds.length} scripts` })),
    })
  }

  const isPending = bulkRun.isPending

  if (singleResult) {
    return (
      <Modal isOpen={scriptIds.length > 0} onClose={onClose} title={t('scripts.run', 'Run')} size="lg">
        <div className="space-y-3">
          {singleResult.steps.map((step, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2"><span className="text-xs font-medium text-surface-700 dark:text-surface-300">{t('scripts.step', 'Step')} {idx + 1}{step.label ? `: ${step.label}` : ''}</span><Badge variant={step.exit_code === 0 ? 'success' : 'danger'}>{t('common.exitCode', 'exit')} {step.exit_code}</Badge>{step.truncated && <Badge variant="warning">{t('scripts.truncated', 'Truncated')}</Badge>}</div>
              <ExecutionResult stdout={step.stdout} stderr={step.stderr} exitCode={step.exit_code} showExitCode={false} />
            </div>
          ))}
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>{t('common.close')}</Button><Button onClick={() => { setSingleResult(null); setBulkResults(null) }}>{t('scripts.runAgain', 'Run Again')}</Button></div>
        </div>
      </Modal>
    )
  }
  if (bulkResults) {
    return (
      <Modal isOpen={scriptIds.length > 0} onClose={onClose} title={t('scripts.run', 'Run')} size="lg">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {bulkResults.map((item) => (
            <div key={item.id} className="space-y-2">
              <p className="text-xs font-medium text-surface-700 dark:text-surface-300">{item.name}</p>
              {item.result.steps.map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2"><span className="text-xs font-medium text-surface-700 dark:text-surface-300">{t('scripts.step', 'Step')} {idx + 1}{step.label ? `: ${step.label}` : ''}</span><Badge variant={step.exit_code === 0 ? 'success' : 'danger'}>{t('common.exitCode', 'exit')} {step.exit_code}</Badge>{step.truncated && <Badge variant="warning">{t('scripts.truncated', 'Truncated')}</Badge>}</div>
                  <ExecutionResult stdout={step.stdout} stderr={step.stderr} exitCode={step.exit_code} showExitCode={false} />
                </div>
              ))}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={onClose}>{t('common.close')}</Button><Button onClick={() => { setBulkResults(null); setSingleResult(null) }}>{t('scripts.runAgain', 'Run Again')}</Button></div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={scriptIds.length > 0} onClose={onClose} title={`${t('scripts.run', 'Run')} (${scriptIds.length})`} size="lg">
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
          <Button onClick={handleRun} disabled={selectedNodeIds.size === 0 || isPending}>{isPending ? <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span> : `${t('scripts.run')} (${scriptIds.length}×${selectedNodeIds.size})`}</Button>
        </div>
      </div>
    </Modal>
  )
}
