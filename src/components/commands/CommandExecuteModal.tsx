import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Spinner } from '../ui/Spinner'
import { useNodes } from '../../hooks/useNodes'
import { useExecuteCommand } from '../../hooks/useCommands'
import { useToast } from '../ui/useToast'
import { getDefaultParams } from './command-form-utils'
import { CommandParamInputs } from './CommandParamInputs'
import { ExecutionResult } from './ExecutionResult'
import type { Command, CommandResult } from '../../api/types'

interface CommandExecuteModalProps {
  command: Command | null
  onClose: () => void
}

export function CommandExecuteModal({ command, onClose }: CommandExecuteModalProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: nodesData } = useNodes()
  const nodes = nodesData?.items || []
  const executeCommand = useExecuteCommand()

  const [selectedNode, setSelectedNode] = useState('')
  const [commandParams, setCommandParams] = useState<Record<string, unknown>>({})
  const [result, setResult] = useState<CommandResult | null>(null)

  useEffect(() => {
    if (command) {
      setCommandParams(getDefaultParams(command.parameters))
      setSelectedNode('')
      setResult(null)
    }
  }, [command])

  const handleExecute = () => {
    if (!command || !selectedNode) return
    const params: Record<string, unknown> = {}
    for (const p of command.parameters || []) {
      const raw = commandParams[p.name]
      if (raw === '' || raw === undefined || raw === null) continue
      if (p.type === 'integer') params[p.name] = Number(raw)
      else if (p.type === 'boolean') params[p.name] = !!raw
      else params[p.name] = raw
    }
    executeCommand.mutate(
      { id: command.id, data: { node_id: selectedNode, params: Object.keys(params).length > 0 ? params : undefined } },
      {
        onSuccess: (res) => {
          const target = nodes.find((n) => n.id === selectedNode)?.name ?? selectedNode
          toast('success', t('commands.toastExecuted', { target }))
          setResult(res)
        },
        onError: () => toast('error', t('commands.toastFailed')),
      },
    )
  }

  return (
    <Modal
      isOpen={!!command}
      onClose={onClose}
      title={command ? `${t('commands.execute')}: ${command.name}` : t('commands.execute')}
      size="lg"
    >
      {result ? (
        <div className="space-y-4">
          <ExecutionResult stdout={result.stdout} stderr={result.stderr} exitCode={result.exit_code} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>{t('common.close')}</Button>
            <Button onClick={() => setResult(null)}>{t('commands.executeAgain')}</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Select
            label={t('commands.selectNode')}
            value={selectedNode}
            onChange={setSelectedNode}
            placeholder={t('commands.selectNode')}
            options={nodes.map((node) => ({ value: node.id, label: node.name }))}
          />
          {command && command.parameters && command.parameters.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-surface-600 dark:text-surface-400">{t('commands.parameters', 'Parameters')}</p>
              <CommandParamInputs parameters={command.parameters} values={commandParams} onChange={(name, value) => setCommandParams((prev) => ({ ...prev, [name]: value }))} />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
            <Button onClick={handleExecute} disabled={!selectedNode || executeCommand.isPending}>
              {executeCommand.isPending ? (
                <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span>
              ) : t('commands.execute')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
