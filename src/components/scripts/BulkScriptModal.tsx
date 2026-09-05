import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { SearchInput } from '../ui/SearchInput'
import { Checkbox } from '../ui/Checkbox'
import { Spinner } from '../ui/Spinner'
import { IconScripts } from '../ui/Icons'
import { Badge } from '../ui/Badge'
import { useScripts } from '../../hooks/useScripts'
import { useMutation } from '@tanstack/react-query'
import { scriptsApi } from '../../api/scripts'
import { useToast } from '../ui/useToast'
import { ExecutionResult } from '../commands/ExecutionResult'
import type { ScriptNodeResult } from '../../api/types'

interface BulkScriptModalProps {
  nodeIds: string[]
  onClose: () => void
}

export function BulkScriptModal({ nodeIds, onClose }: BulkScriptModalProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: scriptsData } = useScripts({ size: 100 })
  const scripts = scriptsData?.items || []
  const bulkRun = useMutation({ mutationFn: (data: { script_ids: string[]; node_ids: string[] }) => scriptsApi.executions({ script_ids: data.script_ids, node_ids: data.node_ids }) })
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkResults, setBulkResults] = useState<Array<{ id: string; name: string; result: ScriptNodeResult }> | null>(null)
  const [singleResult, setSingleResult] = useState<ScriptNodeResult | null>(null)

  useEffect(() => {
    if (nodeIds.length > 0) {
      setSearch('')
      setSelectedIds(new Set())
      setBulkResults(null)
      setSingleResult(null)
    }
  }, [nodeIds])

  const filtered = scripts.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id))

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
    setBulkResults(null)
    setSingleResult(null)
  }
  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((s) => next.delete(s.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((s) => next.add(s.id))
        return next
      })
    }
    setBulkResults(null)
    setSingleResult(null)
  }

  const handleRun = () => {
    const ids = [...selectedIds]
    if (ids.length === 0 || nodeIds.length === 0) return
    setSingleResult(null)
    setBulkResults(null)
    bulkRun.mutate({ script_ids: ids, node_ids: nodeIds }, {
      onSuccess: (response) => {
        const batch = response as unknown as { results?: Array<ScriptNodeResult & { script_id?: string; node_id?: string; node_name?: string; error?: string; status?: string }>; batch_id?: string; total?: number; succeeded?: number; failed?: number }
        const results = batch.results ?? []
        const failed = batch.failed ?? results.filter((r) => {
          const steps = (r as unknown as { steps?: Array<{ exit_code?: number }> }).steps
          if (steps && steps.length > 0) return steps.some((s) => (s.exit_code ?? 0) !== 0)
          return (r as { status?: string }).status === 'error'
        }).length
        const countLabel = ids.length === 1 ? scripts.find((s) => s.id === ids[0])?.name ?? ids[0] : `${ids.length} scripts`
        if (failed > 0) toast('warning', t('scripts.toastStarted', { name: countLabel }) + t('common.failedSuffix', { count: failed }))
        else toast('success', t('scripts.toastStarted', { name: countLabel }))
        if (results.length === 0) {
          setBulkResults(null)
          setSingleResult(null)
          return
        }
        if (results.length === 1) {
          setSingleResult(results[0] as ScriptNodeResult)
          setBulkResults(null)
        } else {
          // M×N: map each result by script_id + node correctly (no modulo)
          const hasScriptId = results.some((r) => !!(r as { script_id?: string }).script_id)
          const mapped = results.map((r, idx) => {
            let scriptName: string
            if ((r as { script_id?: string }).script_id) scriptName = scripts.find((s) => s.id === (r as { script_id?: string }).script_id)?.name ?? (r as { script_id?: string }).script_id!
            else if (hasScriptId) scriptName = `exec-${idx}`
            else {
              const chunkSize = nodeIds.length
              const scriptIdx = Math.floor(idx / chunkSize)
              scriptName = scripts.find((s) => s.id === ids[scriptIdx])?.name ?? ids[scriptIdx] ?? `exec-${idx}`
            }
            const nodeLabel = (r as { node_name?: string; node_id?: string }).node_name ?? (r as { node_id?: string }).node_id ?? (hasScriptId ? '' : nodeIds[idx % nodeIds.length] ?? '')
            const name = scriptName && nodeLabel ? `${scriptName} — ${nodeLabel}` : scriptName || nodeLabel || `Result ${idx + 1}`
            const execId = (r as { execution_id?: string }).execution_id ?? `${(r as { script_id?: string }).script_id ?? ids[Math.floor(idx / nodeIds.length)] ?? idx}:${(r as { node_id?: string }).node_id ?? nodeIds[idx % nodeIds.length] ?? idx}:${idx}`
            return { id: execId, name, result: r as unknown as ScriptNodeResult }
          })
          setBulkResults(mapped)
          setSingleResult(null)
        }
      },
      onError: () => toast('error', t('scripts.toastRunFailed', { name: ids.length === 1 ? scripts.find((s) => s.id === ids[0])?.name ?? ids[0] : `${ids.length} scripts` })),
    })
  }

  const isPending = bulkRun.isPending

  if (singleResult) {
    return (
      <Modal isOpen={nodeIds.length > 0} onClose={onClose} title={t('nodes.bulkScript', 'Run Scripts')} size="lg">
        <div className="space-y-3">
          <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{t('scripts.result', 'Result')}</p>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {singleResult.steps.map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2"><span className="text-xs font-medium text-surface-700 dark:text-surface-300">{t('scripts.step', 'Step')} {idx + 1}{step.label ? `: ${step.label}` : ''}</span><Badge variant={step.exit_code === 0 ? 'success' : 'danger'}>{t('common.exitCode', 'exit')} {step.exit_code}</Badge>{step.truncated && <Badge variant="warning">{t('scripts.truncated', 'Truncated')}</Badge>}</div>
                <ExecutionResult stdout={step.stdout} stderr={step.stderr} exitCode={step.exit_code} showExitCode={false} />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>{t('common.close')}</Button><Button onClick={() => { setSingleResult(null); setBulkResults(null) }}>{t('scripts.runAgain', 'Run Again')}</Button></div>
        </div>
      </Modal>
    )
  }

  if (bulkResults) {
    return (
      <Modal isOpen={nodeIds.length > 0} onClose={onClose} title={t('nodes.bulkScript', 'Run Scripts')} size="lg">
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
    <Modal isOpen={nodeIds.length > 0} onClose={onClose} title={t('nodes.bulkScript', 'Run Scripts')} size="lg">
      <div className="space-y-3">
        <SearchInput value={search} onChange={setSearch} placeholder={t('nodes.selectScript', 'Search scripts...')} />
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <Checkbox checked={allFilteredSelected} onChange={toggleAllFiltered} ariaLabel={t('common.selectAll')} />
              <span className="text-surface-600 dark:text-surface-400">{allFilteredSelected ? t('common.deselectAll') : t('common.selectAll')} ({filtered.length})</span>
            </label>
            {selectedIds.size > 0 && <span className="text-xs text-accent-600 dark:text-accent-400">{t('common.selected', { count: selectedIds.size })}</span>}
          </div>
        )}
        <div className="max-h-64 overflow-y-auto divide-y divide-surface-200 dark:divide-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg">
          {filtered.length === 0 ? <p className="text-sm text-surface-500 text-center py-4">{t('nodes.noScripts', 'No scripts')}</p> : filtered.map((script) => {
            const checked = selectedIds.has(script.id)
            return (
              <label key={script.id} className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm cursor-pointer ${checked ? 'bg-accent-50 dark:bg-accent-900/20' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'}`}>
                <Checkbox checked={checked} onChange={() => toggleSelect(script.id)} ariaLabel={script.name} />
                <IconScripts className="w-4 h-4 text-surface-400 shrink-0" />
                <div className="min-w-0 flex-1"><p className="font-medium text-surface-900 dark:text-white truncate">{script.name}</p>{script.description && <p className="text-xs text-surface-500 truncate">{script.description}</p>}</div>
              </label>
            )
          })}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={handleRun} disabled={selectedIds.size === 0 || isPending}>{isPending ? <Spinner size="sm" /> : `${t('scripts.run')} ${selectedIds.size > 0 ? `(${selectedIds.size})` : ''}`}</Button>
        </div>
      </div>
    </Modal>
  )
}
