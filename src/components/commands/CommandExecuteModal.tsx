import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { useNodes } from '../../hooks/useNodes'
import { useExecuteCommand, useBulkExecuteCommand } from '../../hooks/useCommands'
import { useToast } from '../ui/useToast'
import { getDefaultParams } from './command-form-utils'
import { CommandParamInputs } from './CommandParamInputs'
import { ExecutionResult } from './ExecutionResult'
import type { Command, CommandResult, BulkCommandResult, BulkNodeResult } from '../../api/types'

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
  const bulkExecuteCommand = useBulkExecuteCommand()

  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set())
  const [commandParams, setCommandParams] = useState<Record<string, unknown>>({})
  const [result, setResult] = useState<CommandResult | null>(null)
  const [bulkResult, setBulkResult] = useState<BulkCommandResult | null>(null)

  useEffect(() => {
    if (command) {
      setCommandParams(getDefaultParams(command.parameters))
      setSelectedNodes(new Set())
      setResult(null)
      setBulkResult(null)
    }
  }, [command])

  const toggleNode = (id: string) => {
    setSelectedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedNodes.size === nodes.length) setSelectedNodes(new Set())
    else setSelectedNodes(new Set(nodes.map((n) => n.id)))
  }

  const buildParams = () => {
    if (!command) return undefined
    const params: Record<string, unknown> = {}
    for (const p of command.parameters || []) {
      const raw = commandParams[p.name]
      if (raw === '' || raw === undefined || raw === null) continue
      if (p.type === 'integer') params[p.name] = Number(raw)
      else if (p.type === 'boolean') params[p.name] = !!raw
      else params[p.name] = raw
    }
    return Object.keys(params).length > 0 ? params : undefined
  }

  const handleExecute = () => {
    if (!command || selectedNodes.size === 0) return
    const params = buildParams()

    if (selectedNodes.size === 1) {
      const nodeId = Array.from(selectedNodes)[0]
      executeCommand.mutate(
        { id: command.id, data: { node_id: nodeId, params } },
        {
          onSuccess: (res) => {
            const target = nodes.find((n) => n.id === nodeId)?.name ?? nodeId
            toast('success', t('commands.toastExecuted', { target }))
            setResult(res)
          },
          onError: () => toast('error', t('commands.toastFailed')),
        },
      )
    } else {
      bulkExecuteCommand.mutate(
        { commandId: command.id, data: { command: command.command, node_ids: Array.from(selectedNodes), params } },
        {
          onSuccess: (res) => {
            toast('success', t('commands.toastBulkExecuted', { count: selectedNodes.size }))
            setBulkResult(res)
          },
          onError: () => toast('error', t('commands.toastFailed')),
        },
      )
    }
  }

  const allSelected = nodes.length > 0 && selectedNodes.size === nodes.length
  const isPending = executeCommand.isPending || bulkExecuteCommand.isPending

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
      ) : bulkResult ? (
        <div className="space-y-4">
          <div className="flex gap-4 text-sm">
            <span className="text-green-600 dark:text-green-400">{t('commands.succeeded', 'Succeeded')}: {bulkResult.results.filter((r) => r.exit_code === 0).length}</span>
            <span className="text-red-600 dark:text-red-400">{t('commands.failed', 'Failed')}: {bulkResult.results.filter((r) => r.exit_code !== 0).length}</span>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {bulkResult.results.map((r) => (
              <BulkNodeResultItem key={r.node_id} result={r} nodes={nodes} />
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>{t('common.close')}</Button>
            <Button onClick={() => setBulkResult(null)}>{t('commands.executeAgain')}</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{t('commands.selectNodes', 'Select nodes')}</p>
              <button onClick={toggleAll} className="text-xs text-accent-600 dark:text-accent-400 hover:underline cursor-pointer">
                {allSelected ? t('common.deselectAll', 'Deselect all') : t('common.selectAll', 'Select all')}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto border border-surface-200 dark:border-surface-700 rounded-lg divide-y divide-surface-200 dark:divide-surface-700">
              {nodes.map((node) => (
                <label key={node.id} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNodes.has(node.id)}
                    onChange={() => toggleNode(node.id)}
                    className="rounded border-surface-300 dark:border-surface-600"
                  />
                  <span className="text-sm text-surface-900 dark:text-white">{node.name}</span>
                  <span className="text-xs text-surface-500 font-mono">{node.host}</span>
                </label>
              ))}
            </div>
            {selectedNodes.size > 0 && (
              <p className="text-xs text-surface-500">{t('commands.selectedCount', { count: selectedNodes.size })}</p>
            )}
          </div>
          {command && command.parameters && command.parameters.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-surface-600 dark:text-surface-400">{t('commands.parameters', 'Parameters')}</p>
              <CommandParamInputs parameters={command.parameters} values={commandParams} onChange={(name, value) => setCommandParams((prev) => ({ ...prev, [name]: value }))} />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
            <Button onClick={handleExecute} disabled={selectedNodes.size === 0 || isPending}>
              {isPending ? (
                <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span>
              ) : t('commands.execute')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function BulkNodeResultItem({ result, nodes }: { result: BulkNodeResult; nodes: { id: string; name: string }[] }) {
  const [expanded, setExpanded] = useState(false)
  const nodeName = nodes.find((n) => n.id === result.node_id)?.name ?? result.node_id

  return (
    <div className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${result.exit_code === 0 ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium text-surface-900 dark:text-white">{nodeName}</span>
          <span className="text-xs text-surface-500">exit {result.exit_code}</span>
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
