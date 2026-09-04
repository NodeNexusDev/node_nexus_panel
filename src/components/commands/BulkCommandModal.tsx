import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Spinner } from '../ui/Spinner'
import { SearchInput } from '../ui/SearchInput'
import { Tabs } from '../ui/Tabs'
import { IconCommands } from '../ui/Icons'
import { useCommands, useBulkExecuteCommand, useBulkExecuteRawCommand } from '../../hooks/useCommands'
import { useToast } from '../ui/useToast'
import { getDefaultParams } from './command-form-utils'
import { CommandParamInputs } from './CommandParamInputs'
import { ExecutionResult } from './ExecutionResult'
import type { CommandResponse, BulkNodeResult } from '../../api/types'

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
  const bulkExecuteCommand = useBulkExecuteCommand()
  const bulkExecuteRaw = useBulkExecuteRawCommand()

  const [tab, setTab] = useState<Tab>('command')
  const [search, setSearch] = useState('')
  const [selectedCommand, setSelectedCommand] = useState<CommandResponse | null>(null)
  const [params, setParams] = useState<Record<string, unknown>>({})
  const [customCommand, setCustomCommand] = useState('')

  const [bulkResult, setBulkResult] = useState<{ command: string; results: BulkNodeResult[] } | null>(null)

  useEffect(() => {
    if (nodeIds.length > 0) {
      setTab('command')
      setSearch('')
      setSelectedCommand(null)
      setParams({})
      setCustomCommand('')
      setBulkResult(null)
    }
  }, [nodeIds])

  const filtered = commands.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  const selectCommand = (cmd: CommandResponse) => {
    setSelectedCommand(cmd)
    setParams(getDefaultParams(cmd.parameters))
    setBulkResult(null)
  }

  const buildParams = () => {
    if (!selectedCommand) return undefined
    const values: Record<string, unknown> = {}
    for (const p of selectedCommand.parameters || []) {
      const raw = params[p.name]
      if (raw === '' || raw === undefined || raw === null) continue
      if (p.type === 'integer') values[p.name] = Number(raw)
      else if (p.type === 'boolean') values[p.name] = !!raw
      else values[p.name] = raw
    }
    return Object.keys(values).length > 0 ? values : undefined
  }

  const handleRunCommand = () => {
    if (!selectedCommand || nodeIds.length === 0) return
    bulkExecuteCommand.mutate(
      {
        commandId: selectedCommand.id,
        data: { node_ids: nodeIds, params: buildParams() },
      },
      {
        onSuccess: (res) => {
          toast('success', t('commands.toastBulkExecuted', { count: nodeIds.length }))
          const batch = res as unknown as { results: Array<{ node_id?: string|null; node_name?: string|null; stdout: string; stderr: string; exit_code?: number|null; status: string }>; total: number; succeeded: number; failed: number }
          setBulkResult({ command: selectedCommand.command, results: batch.results.map((r) => ({ node_id: r.node_id ?? '', node_name: r.node_name ?? '', stdout: r.stdout, stderr: r.stderr, exit_code: r.exit_code ?? (r.status==='success'?0:1) })) })
        },
        onError: () => toast('error', t('commands.toastFailed')),
      },
    )
  }

  const handleRunCustom = () => {
    if (!customCommand || nodeIds.length === 0) return
    bulkExecuteRaw.mutate(
      { command: customCommand, node_ids: nodeIds },
      {
        onSuccess: (res) => {
          toast('success', t('commands.toastBulkExecuted', { count: nodeIds.length }))
          const batch = res as unknown as { results: Array<{ node_id?: string|null; node_name?: string|null; stdout: string; stderr: string; exit_code?: number|null; status: string }> }
          setBulkResult({ command: customCommand, results: batch.results.map((r) => ({ node_id: r.node_id ?? '', node_name: r.node_name ?? '', stdout: r.stdout, stderr: r.stderr, exit_code: r.exit_code ?? (r.status==='success'?0:1) })) })
        },
        onError: () => toast('error', t('commands.toastFailed')),
      },
    )
  }

  const isPending = bulkExecuteCommand.isPending || bulkExecuteRaw.isPending

  return (
    <Modal isOpen={nodeIds.length > 0} onClose={onClose} title={t('nodes.bulkExec', 'Bulk Execute')} size="lg">
      <div className="space-y-4">
        <Tabs
          tabs={[
            { key: 'command', label: t('nodes.commandTab', 'Command') },
            { key: 'custom', label: t('nodes.customTab', 'Custom') },
          ]}
          active={tab}
          onChange={setTab}
        />
        {bulkResult ? (
          <BulkResultView
            command={bulkResult.command}
            results={bulkResult.results}
            onClose={onClose}
            onRetry={() => setBulkResult(null)}
          />
        ) : tab === 'command' ? (
          <div className="space-y-3">
            <SearchInput value={search} onChange={setSearch} placeholder={t('nodes.selectCommand', 'Search commands...')} />
            <div className="max-h-56 overflow-y-auto divide-y divide-surface-200 dark:divide-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg">
              {filtered.length === 0 ? (
                <p className="text-sm text-surface-500 text-center py-4">{t('nodes.noCommands', 'No commands')}</p>
              ) : filtered.map((cmd) => (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => selectCommand(cmd)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                    selectedCommand?.id === cmd.id ? 'bg-accent-50 dark:bg-accent-900/20' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'
                  }`}
                >
                  <IconCommands className="w-4 h-4 text-surface-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-surface-900 dark:text-white truncate">{cmd.name}</p>
                    <p className="text-xs text-surface-500 font-mono truncate">{cmd.command}</p>
                  </div>
                </button>
              ))}
            </div>
            {selectedCommand && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-surface-600 dark:text-surface-400">{t('commands.parameters', 'Parameters')}</p>
                {selectedCommand.parameters && selectedCommand.parameters.length > 0 ? (
                  <CommandParamInputs parameters={selectedCommand.parameters} values={params} onChange={(name, value) => setParams((prev) => ({ ...prev, [name]: value }))} />
                ) : (
                  <p className="text-xs text-surface-400">{t('commands.noParameters', 'No parameters')}</p>
                )}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
              <Button onClick={handleRunCommand} disabled={!selectedCommand || isPending}>
                {isPending ? (
                  <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span>
                ) : t('commands.execute')}
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
