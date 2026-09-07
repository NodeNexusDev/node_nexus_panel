// oxlint-disable react/set-state-in-effect, react/exhaustive-effect-dependencies, react/no-array-index-key, react-hooks/exhaustive-deps
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../ui/Button'
import { Checkbox } from '../../ui/Checkbox'
import { Spinner } from '../../ui/Spinner'
import { SearchInput } from '../../ui/SearchInput'
import { Tabs } from '../../ui/Tabs'
import { Input } from '../../ui/Input'
import { useToast } from '../../ui/useToast'
import { IconCommands } from '../../ui/Icons'
import { useCommands, useExecuteCommand } from '../../../hooks/useCommands'
import { useExecuteNode } from '../../../hooks/useNodes'
import { useMutation } from '@tanstack/react-query'
import { commandsApi } from '../../../api/commands'
import { getDefaultParams } from '../../commands/command-form-utils'
import { CommandParamInputs } from '../../commands/CommandParamInputs'
import { ExecutionResult } from '../../commands/ExecutionResult'
import type { CommandResult, CommandResponse, Node } from '../../../api/types'

export function DrawerExec({ node }: { node: Node }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: commandsData } = useCommands({ size: 100 })
  const commands = commandsData?.items || []
  const executeCommand = useExecuteCommand()
  const executeNode = useExecuteNode()
  const bulkExec = useMutation({ mutationFn: (data: { command_ids: string[]; node_ids: string[]; params?: Record<string, Record<string, unknown>> }) => commandsApi.executions({ command_ids: data.command_ids, node_ids: data.node_ids, params: data.params as never }) })
  const [tab, setTab] = useState<'command' | 'custom'>('command')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [params, setParams] = useState<Record<string, unknown>>({})
  const [customCommand, setCustomCommand] = useState('')
  const [customTimeout, setCustomTimeout] = useState('')
  const [commandResult, setCommandResult] = useState<CommandResult | null>(null)
  const [bulkResults, setBulkResults] = useState<Array<{ id: string; name: string; result: CommandResult }> | null>(null)
  const [customOutputs, setCustomOutputs] = useState<Array<{ command: string; result: CommandResult }>>([])

  useEffect(() => {
    setSearch('')
    setSelectedIds(new Set())
    setParams({})
    setCustomCommand('')
    setCustomTimeout('')
    setCommandResult(null)
    setBulkResults(null)
    setCustomOutputs([])
    setTab('command')
  }, [node.id])

  const filtered = useMemo(() => commands.filter((c: CommandResponse) => c.name.toLowerCase().includes(search.toLowerCase())), [commands, search])
  const selectedCommands = useMemo(() => filtered.filter((c: CommandResponse) => selectedIds.has(c.id)), [filtered, selectedIds])
  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id))
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
    setCommandResult(null)
    setBulkResults(null)
  }
  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((c: CommandResponse) => next.delete(c.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filtered.forEach((c: CommandResponse) => next.add(c.id))
        return next
      })
    }
    setCommandResult(null)
    setBulkResults(null)
  }
  const singleSelected = selectedCommands.length === 1 ? commands.find((c) => c.id === [...selectedIds][0]) ?? null : null
  useEffect(() => {
    if (singleSelected) setParams(getDefaultParams(singleSelected.parameters))
    else setParams({})
  }, [singleSelected])

  const handleRunCommand = () => {
    if (selectedIds.size === 0) return
    setCommandResult(null)
    setBulkResults(null)
    if (selectedIds.size === 1 && singleSelected) {
      const values: Record<string, unknown> = {}
      for (const p of singleSelected.parameters || []) {
        const raw = params[p.name]
        if (raw === '' || raw === undefined || raw === null) continue
        if (p.type === 'integer') values[p.name] = Number(raw)
        else if (p.type === 'boolean') values[p.name] = !!raw
        else values[p.name] = raw
      }
      executeCommand.mutate({ id: singleSelected.id, data: { node_id: node.id, params: Object.keys(values).length > 0 ? values : undefined } }, {
        onSuccess: (res) => {
          const batch = res as unknown as { results?: Array<{ stdout: string; stderr: string; exit_code?: number | null; status?: string }>; total?: number; succeeded?: number; failed?: number }
          const first = batch.results?.[0] as unknown as CommandResult | undefined
          const exitCode = (first as unknown as { exit_code?: number | null })?.exit_code ?? (res as unknown as { exit_code?: number })?.exit_code ?? 0
          const status = (first as unknown as { status?: string })?.status
          const isFail = exitCode !== 0 || status === 'error' || (batch as { failed?: number }).failed! > 0
          if (isFail) toast('warning', t('commands.toastExecuted', { target: node.name }) + ' — ' + t('common.failed'))
          else toast('success', t('commands.toastExecuted', { target: node.name }))
          if (first) setCommandResult({ stdout: first.stdout ?? '', stderr: first.stderr ?? '', exit_code: first.exit_code ?? 0 } as CommandResult)
          else setCommandResult(res as unknown as CommandResult)
        },
        onError: () => toast('error', t('commands.toastFailed')),
      })
      return
    }
    // bulk: use defaults per command
    const ids = [...selectedIds]
    const paramsMap: Record<string, Record<string, unknown>> = {}
    ids.forEach((cid) => {
      const cmd = commands.find((c) => c.id === cid)
      if (cmd) {
        const def = getDefaultParams(cmd.parameters)
        if (Object.keys(def).length > 0) paramsMap[cid] = def
      }
    })
    bulkExec.mutate({ command_ids: ids, node_ids: [node.id], params: Object.keys(paramsMap).length > 0 ? paramsMap : undefined }, {
      onSuccess: (res) => {
        const batch = res as unknown as { results?: Array<{ command_id?: string; stdout: string; stderr: string; exit_code?: number | null; status?: string }>; total?: number; succeeded?: number; failed?: number }
        const failed = (batch as { failed?: number }).failed ?? batch.results?.filter((r) => (r.exit_code ?? (r.status === 'success' ? 0 : 1)) !== 0).length ?? 0
        if (failed > 0) toast('warning', t('commands.toastExecuted', { target: node.name }) + ` (${ids.length}) — ${failed} failed`)
        else toast('success', t('commands.toastExecuted', { target: node.name }) + ` (${ids.length})`)
        if (batch.results && Array.isArray(batch.results)) {
          const hasCommandId = batch.results.some((r) => !!(r as { command_id?: string }).command_id)
          const byId = new Map<string, { stdout?: string; stderr?: string; exit_code?: number | null; command_id?: string; status?: string }>()
          if (hasCommandId) (batch.results as Array<{ command_id?: string; stdout?: string; stderr?: string; exit_code?: number | null; status?: string }>).forEach((r) => { if (r.command_id) byId.set(r.command_id, r) })
          const mapped = ids.map((id, i) => {
            const r = hasCommandId ? byId.get(id) : (batch.results as Array<{ stdout?: string; stderr?: string; exit_code?: number | null; status?: string }>)[i]
            return { id, name: commands.find((c) => c.id === id)?.name ?? id, result: { stdout: r?.stdout ?? '', stderr: r?.stderr ?? '', exit_code: r?.exit_code ?? (r?.status === 'success' ? 0 : r ? 1 : 0) } as CommandResult }
          })
          setBulkResults(mapped)
        } else {
          setBulkResults(ids.map((id) => ({ id, name: commands.find((c) => c.id === id)?.name ?? id, result: { stdout: '', stderr: '', exit_code: 0 } as CommandResult })))
        }
      },
      onError: () => toast('error', t('commands.toastFailed')),
    })
  }
  const handleRunCustom = () => {
    if (!customCommand) return
    executeNode.mutate({ id: node.id, command: customCommand, timeout: customTimeout ? Number(customTimeout) : undefined }, {
      onSuccess: (res) => {
        const batch = res as unknown as { results?: Array<{ stdout: string; stderr: string; exit_code?: number | null }> }
        const first = batch.results?.[0] ?? (res as unknown as { stdout: string; stderr: string; exit_code?: number | null })
        const result = { stdout: first.stdout ?? '', stderr: first.stderr ?? '', exit_code: first.exit_code ?? 0 } as CommandResult
        toast('success', t('nodes.execResult', { code: result.exit_code, output: result.stdout.slice(0, 100) }))
        setCustomOutputs((prev) => [...prev, { command: customCommand, result }])
      },
      onError: () => toast('error', t('nodes.toastExecFailed')),
    })
  }
  const isPending = executeCommand.isPending || bulkExec.isPending
  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      <Tabs tabs={[{ key: 'command', label: t('nodes.commandTab', 'Command') }, { key: 'custom', label: t('nodes.customTab', 'Custom') }]} active={tab} onChange={setTab} />
      {tab === 'command' ? (
        bulkResults ? (
          <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
            {bulkResults.map((item) => (
              <div key={item.id} className="space-y-1">
                <p className="text-xs font-medium text-surface-700 dark:text-surface-300">{item.name}</p>
                <ExecutionResult stdout={item.result.stdout} stderr={item.result.stderr} exitCode={item.result.exit_code} />
              </div>
            ))}
            <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setBulkResults(null)}>{t('common.close')}</Button><Button variant="ghost" size="sm" onClick={() => setBulkResults(null)}>{t('commands.executeAgain')}</Button></div>
          </div>
        ) : commandResult ? (
          <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
            <ExecutionResult stdout={commandResult.stdout} stderr={commandResult.stderr} exitCode={commandResult.exit_code} />
            <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setCommandResult(null)}>{t('commands.executeAgain')}</Button></div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 space-y-3">
            <SearchInput value={search} onChange={setSearch} placeholder={t('nodes.selectCommand', 'Search commands...')} />
            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={allFilteredSelected} onChange={toggleAllFiltered} ariaLabel={t('common.selectAll')} />
                  <span className="text-surface-600 dark:text-surface-400">{allFilteredSelected ? t('common.deselectAll') : t('common.selectAll')} ({filtered.length})</span>
                </label>
                {selectedIds.size > 0 && <span className="text-xs text-accent-600 dark:text-accent-400">{t('common.selected', { count: selectedIds.size }) ?? `${selectedIds.size} selected`}</span>}
              </div>
            )}
            <div className="w-full flex-1 min-h-[200px] overflow-y-auto divide-y divide-surface-200 dark:divide-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg">
              {filtered.length === 0 ? <p className="text-sm text-surface-500 text-center py-4">{t('nodes.noCommands', 'No commands')}</p> : filtered.map((cmd: CommandResponse) => {
                const checked = selectedIds.has(cmd.id)
                return (
                  <label key={cmd.id} className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm cursor-pointer ${checked ? 'bg-accent-50 dark:bg-accent-900/20' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'}`}>
                    <Checkbox checked={checked} onChange={() => toggleSelect(cmd.id)} ariaLabel={cmd.name} />
                    <IconCommands className="w-4 h-4 text-surface-400 shrink-0" />
                    <div className="min-w-0 flex-1"><p className="font-medium text-surface-900 dark:text-white truncate">{cmd.name}</p><p className="text-xs text-surface-500 font-mono truncate">{cmd.command}</p></div>
                  </label>
                )
              })}
            </div>
            {singleSelected && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-surface-600 dark:text-surface-400">{t('commands.parameters', 'Parameters')} — {singleSelected.name}</p>
                {singleSelected.parameters && singleSelected.parameters.length > 0 ? <CommandParamInputs parameters={singleSelected.parameters} values={params} onChange={(name, value) => setParams((prev) => ({ ...prev, [name]: value }))} /> : <p className="text-xs text-surface-400">{t('commands.noParameters', 'No parameters')}</p>}
              </div>
            )}
            {selectedIds.size > 1 && <p className="text-xs text-surface-500">{t('commands.bulkExecuteHint', 'Bulk execution uses default parameters for each command')}</p>}
            <div className="flex justify-end"><Button size="sm" onClick={handleRunCommand} disabled={selectedIds.size === 0 || isPending}>{isPending ? <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span> : `${t('commands.execute')} ${selectedIds.size > 0 ? `(${selectedIds.size})` : ''}`}</Button></div>
          </div>
        )
      ) : (
        <div className="flex flex-col flex-1 min-h-0 space-y-3 overflow-y-auto">
          <Input label={t('nodes.command', 'Command')} placeholder="uptime" value={customCommand} onChange={(e) => setCustomCommand(e.target.value)} />
          <Input label={t('nodes.timeout', 'Timeout (seconds)')} placeholder="30" type="number" value={customTimeout} onChange={(e) => setCustomTimeout(e.target.value)} />
          <div className="flex justify-end"><Button size="sm" onClick={handleRunCustom} disabled={!customCommand || executeNode.isPending}>{executeNode.isPending ? <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span> : t('nodes.execCommand')}</Button></div>
          {customOutputs.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-surface-200 dark:border-surface-700 flex-1 overflow-y-auto min-h-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-surface-500">{t('nodes.execHistory', 'History')} ({customOutputs.length})</p>
                <Button variant="ghost" size="sm" onClick={() => setCustomOutputs([])} className="h-6 px-2 text-xs">{t('common.clear')}</Button>
              </div>
              {customOutputs.map((item, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-xs font-mono text-surface-500">$ {item.command}</p>
                  <ExecutionResult stdout={item.result.stdout} stderr={item.result.stderr} exitCode={item.result.exit_code} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}