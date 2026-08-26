import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Spinner } from '../ui/Spinner'
import { SearchInput } from '../ui/SearchInput'
import { Tabs } from '../ui/Tabs'
import { IconCommands } from '../ui/Icons'
import { useCommands, useExecuteCommand } from '../../hooks/useCommands'
import { useExecuteNode } from '../../hooks/useNodes'
import { useToast } from '../ui/useToast'
import { getDefaultParams } from '../commands/command-form-utils'
import { CommandParamInputs } from '../commands/CommandParamInputs'
import { ExecutionResult } from '../commands/ExecutionResult'
import type { CommandResponse, CommandResult, Node } from '../../api/types'

type Tab = 'command' | 'custom'

interface CustomOutput {
  command: string
  result: CommandResult
}

interface NodeCommandModalProps {
  node: Node | null
  onClose: () => void
}

export function NodeCommandModal({ node, onClose }: NodeCommandModalProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: commandsData } = useCommands({ size: 100 })
  const commands = commandsData?.items || []
  const executeCommand = useExecuteCommand()
  const executeNode = useExecuteNode()

  const [tab, setTab] = useState<Tab>('command')
  const [search, setSearch] = useState('')
  const [selectedCommand, setSelectedCommand] = useState<CommandResponse | null>(null)
  const [params, setParams] = useState<Record<string, unknown>>({})
  const [customCommand, setCustomCommand] = useState('')
  const [customTimeout, setCustomTimeout] = useState('')

  const [commandResult, setCommandResult] = useState<CommandResult | null>(null)
  const [customOutputs, setCustomOutputs] = useState<CustomOutput[]>([])

  useEffect(() => {
    if (node) {
      setTab('command')
      setSearch('')
      setSelectedCommand(null)
      setParams({})
      setCustomCommand('')
      setCustomTimeout('')
      setCommandResult(null)
      setCustomOutputs([])
    }
  }, [node])

  const filtered = commands.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  const selectCommand = (cmd: CommandResponse) => {
    setSelectedCommand(cmd)
    setParams(getDefaultParams(cmd.parameters))
    setCommandResult(null)
  }

  const handleRunCommand = () => {
    if (!node || !selectedCommand) return
    const values: Record<string, unknown> = {}
    for (const p of selectedCommand.parameters || []) {
      const raw = params[p.name]
      if (raw === '' || raw === undefined || raw === null) continue
      if (p.type === 'integer') values[p.name] = Number(raw)
      else if (p.type === 'boolean') values[p.name] = !!raw
      else values[p.name] = raw
    }
    executeCommand.mutate(
      { id: selectedCommand.id, data: { node_id: node.id, params: Object.keys(values).length > 0 ? values : undefined } },
      {
        onSuccess: (res) => {
          toast('success', t('commands.toastExecuted', { target: node.name }))
          setCommandResult(res)
        },
        onError: () => toast('error', t('commands.toastFailed')),
      },
    )
  }

  const handleRunCustom = () => {
    if (!node || !customCommand) return
    executeNode.mutate(
      { id: node.id, command: customCommand, timeout: customTimeout ? Number(customTimeout) : undefined },
      {
        onSuccess: (res) => {
          toast('success', t('nodes.execResult', { code: res.exit_code, output: res.stdout.slice(0, 100) }))
          setCustomOutputs((prev) => [...prev, { command: customCommand, result: res }])
        },
        onError: () => toast('error', t('nodes.toastExecFailed')),
      },
    )
  }

  return (
    <Modal isOpen={!!node} onClose={onClose} title={node ? `${t('nodes.execCommand')}: ${node.name}` : t('nodes.execCommand')} size="lg">
      <div className="space-y-4">
        <Tabs
          tabs={[
            { key: 'command', label: t('nodes.commandTab', 'Command') },
            { key: 'custom', label: t('nodes.customTab', 'Custom') },
          ]}
          active={tab}
          onChange={setTab}
        />
        {tab === 'command' ? (
          <div className="space-y-3">
            {commandResult ? (
              <div className="space-y-4">
                <ExecutionResult stdout={commandResult.stdout} stderr={commandResult.stderr} exitCode={commandResult.exit_code} />
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" onClick={onClose}>{t('common.close')}</Button>
                  <Button onClick={() => setCommandResult(null)}>{t('commands.executeAgain')}</Button>
                </div>
              </div>
            ) : (
              <>
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
                  <Button onClick={handleRunCommand} disabled={!selectedCommand || executeCommand.isPending}>
                    {executeCommand.isPending ? (
                      <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span>
                    ) : t('commands.execute')}
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Input label={t('nodes.command', 'Command')} placeholder="uptime" value={customCommand} onChange={(e) => setCustomCommand(e.target.value)} />
            <Input label={t('nodes.timeout', 'Timeout (seconds)')} placeholder="30" type="number" value={customTimeout} onChange={(e) => setCustomTimeout(e.target.value)} />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
              <Button onClick={handleRunCustom} disabled={!customCommand || executeNode.isPending}>
                {executeNode.isPending ? (
                  <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span>
                ) : t('nodes.execCommand')}
              </Button>
            </div>
            {customOutputs.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-surface-200 dark:border-surface-700">
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
    </Modal>
  )
}
