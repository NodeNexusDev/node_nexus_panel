// oxlint-disable react/set-state-in-effect, react/exhaustive-effect-dependencies, react/no-array-index-key, react-hooks/exhaustive-deps
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Checkbox } from '../../ui/Checkbox'
import { Spinner } from '../../ui/Spinner'
import { SearchInput } from '../../ui/SearchInput'
import { useToast } from '../../ui/useToast'
import { IconScripts } from '../../ui/Icons'
import { useScripts, useRunScript } from '../../../hooks/useScripts'
import { useMutation } from '@tanstack/react-query'
import { scriptsApi } from '../../../api/scripts'
import { ExecutionResult } from '../../commands/ExecutionResult'
import type { Node, ScriptNodeResult } from '../../../api/types'

export function DrawerScript({ node }: { node: Node }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: scriptsData } = useScripts({ size: 100 })
  const scripts = scriptsData?.items || []
  const runScript = useRunScript()
  const bulkRun = useMutation({ mutationFn: (data: { script_ids: string[]; node_ids: string[] }) => scriptsApi.executions({ script_ids: data.script_ids, node_ids: data.node_ids }) })
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<ScriptNodeResult | null>(null)
  const [bulkResults, setBulkResults] = useState<Array<{ id: string; name: string; result: ScriptNodeResult }> | null>(null)
  useEffect(() => { setSearch(''); setSelectedIds(new Set()); setResult(null); setBulkResults(null) }, [node.id])
  const filtered = scripts.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id))
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
    setResult(null)
    setBulkResults(null)
  }
  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => { const next = new Set(prev); filtered.forEach((s) => next.delete(s.id)); return next })
    } else {
      setSelectedIds((prev) => { const next = new Set(prev); filtered.forEach((s) => next.add(s.id)); return next })
    }
    setResult(null)
    setBulkResults(null)
  }
  const handleRun = () => {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    setResult(null)
    setBulkResults(null)
    if (ids.length === 1) {
      const selectedId = ids[0]
      const selectedName = scripts.find((s) => s.id === selectedId)?.name ?? selectedId
      runScript.mutate({ id: selectedId, data: { node_ids: [node.id] } }, {
        onSuccess: (response) => {
          const batch = response as unknown as { results?: Array<ScriptNodeResult & { steps?: Array<{ exit_code?: number }>; status?: string }>; total?: number; succeeded?: number; failed?: number }
          const first = (batch.results?.[0] ?? response) as ScriptNodeResult & { steps?: Array<{ exit_code?: number }>; status?: string }
          const failed = (batch as { failed?: number }).failed ?? (first?.steps?.some((s) => (s.exit_code ?? 0) !== 0) || (first as { status?: string })?.status === 'error' ? 1 : 0)
          if (failed > 0) toast('warning', t('scripts.toastStarted', { name: selectedName }) + ' — ' + t('common.failed'))
          else toast('success', t('scripts.toastStarted', { name: selectedName }))
          const fallback = response as unknown as { results?: Array<{ node_id: string; status: string; steps?: unknown[] }> }
          const resolved = batch.results?.[0] as ScriptNodeResult | undefined ?? (fallback.results?.[0] as unknown as ScriptNodeResult)
          if (resolved) setResult(resolved)
        },
        onError: () => toast('error', t('scripts.toastRunFailed', { name: selectedName })),
      })
      return
    }
    bulkRun.mutate({ script_ids: ids, node_ids: [node.id] }, {
      onSuccess: (response) => {
        const batch = response as unknown as { results?: Array<{ script_id?: string; steps?: unknown[]; stdout?: string; stderr?: string; error?: string; status?: string } & ScriptNodeResult>; total?: number; succeeded?: number; failed?: number }
        const failed = (batch as { failed?: number }).failed ?? batch.results?.filter((r) => {
          const steps = (r as { steps?: Array<{ exit_code?: number }> }).steps
          if (steps && steps.length > 0) return steps.some((s) => (s.exit_code ?? 0) !== 0)
          return (r as { status?: string }).status === 'error' || !!(r as { error?: string }).error
        }).length ?? 0
        if (failed > 0) toast('warning', t('scripts.toastStarted', { name: `${ids.length} scripts` }) + t('common.failedSuffix', { count: failed }))
        else toast('success', t('scripts.toastStarted', { name: `${ids.length} scripts` }))
        if (batch.results && Array.isArray(batch.results)) {
          const hasScriptId = batch.results.some((r) => !!(r as { script_id?: string }).script_id)
          const byId = new Map<string, unknown>()
          if (hasScriptId) (batch.results as Array<{ script_id?: string }>).forEach((r) => { if (r.script_id) byId.set(r.script_id, r) })
          const mapped = ids.map((id, idx) => {
            const raw = hasScriptId ? (byId.get(id) as ScriptNodeResult & { steps?: unknown[] } | undefined) : (batch.results as unknown as Array<ScriptNodeResult & { steps?: unknown[] }>)[idx] as ScriptNodeResult & { steps?: unknown[] } | undefined
            if (!raw) return null
            // ensure steps exists, fallback to raw stdout/stderr if steps missing
            const ensured = raw && !raw.steps && (raw as unknown as { stdout?: string }).stdout !== undefined
              ? { ...raw, steps: [{ label: raw.steps?.[0] ? (raw.steps[0] as { label?: string }).label : 'Step 1', stdout: (raw as unknown as { stdout?: string }).stdout ?? '', stderr: (raw as unknown as { stderr?: string }).stderr ?? '', exit_code: (raw as unknown as { exit_code?: number }).exit_code ?? 0, truncated: false, step_index: 0, command_fingerprint: '' }] } as unknown as ScriptNodeResult
              : raw
            return { id, name: scripts.find((s) => s.id === id)?.name ?? id, result: ensured as ScriptNodeResult }
          }).filter((m): m is { id: string; name: string; result: ScriptNodeResult } => !!m?.result)
          setBulkResults(mapped.length > 0 ? mapped : null)
        } else {
          setBulkResults(null)
        }
      },
      onError: () => toast('error', t('scripts.toastRunFailed', { name: `${ids.length} scripts` })),
    })
  }
  const isPending = runScript.isPending || bulkRun.isPending
  if (result) {
    return (
      <div className="flex flex-col flex-1 min-h-0 space-y-3 overflow-y-auto">
        <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{t('scripts.result', 'Result')}</p>
        <div className="flex-1 min-h-0 space-y-3 overflow-y-auto">
          {result.steps.map((step, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2"><span className="text-xs font-medium text-surface-700 dark:text-surface-300">{t('scripts.step', 'Step')} {idx + 1}{step.label ? `: ${step.label}` : ''}</span><Badge variant={step.exit_code === 0 ? 'success' : 'danger'}>{t('common.exitCode', 'exit')} {step.exit_code}</Badge>{step.truncated && <Badge variant="warning">{t('scripts.truncated', 'Truncated')}</Badge>}</div>
              <ExecutionResult stdout={step.stdout} stderr={step.stderr} exitCode={step.exit_code} showExitCode={false} />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 shrink-0"><Button variant="ghost" size="sm" onClick={() => setResult(null)}>{t('common.close')}</Button><Button size="sm" onClick={() => setResult(null)}>{t('scripts.runAgain', 'Run Again')}</Button></div>
      </div>
    )
  }
  if (bulkResults) {
    return (
      <div className="flex flex-col flex-1 min-h-0 space-y-3 overflow-y-auto">
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
        <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setBulkResults(null)}>{t('common.close')}</Button><Button size="sm" onClick={() => setBulkResults(null)}>{t('scripts.runAgain', 'Run Again')}</Button></div>
      </div>
    )
  }
  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-3">
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
      <div className="w-full flex-1 min-h-[200px] overflow-y-auto divide-y divide-surface-200 dark:divide-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg">
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
      <div className="flex justify-end"><Button size="sm" onClick={handleRun} disabled={selectedIds.size === 0 || isPending}>{isPending ? <Spinner size="sm" /> : `${t('scripts.run')} ${selectedIds.size > 0 ? `(${selectedIds.size})` : ''}`}</Button></div>
    </div>
  )
}