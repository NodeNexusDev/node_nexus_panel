import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Typewriter } from '../components/ui/Typewriter'
import { Skeleton } from '../components/ui/Skeleton'
import { IconCommands } from '../components/ui/Icons'
import { useNodes } from '../hooks/useNodes'
import { useCommands, useExecuteCommand } from '../hooks/useCommands'
import { useToast } from '../components/ui/useToast'

export function Commands() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: nodesData } = useNodes()
  const { data: commandsData, isLoading: commandsLoading } = useCommands()
  const executeCommand = useExecuteCommand()

  const [selectedCommandId, setSelectedCommandId] = useState('')
  const [selectedNode, setSelectedNode] = useState('')

  const nodes = nodesData?.items || []
  const commands = commandsData?.items || []

  const selectedCommand = commands.find((c) => c.id === selectedCommandId)

  const handleExecute = () => {
    if (!selectedCommandId || !selectedNode) return
    executeCommand.mutate(
      { id: selectedCommandId, data: { node_id: selectedNode } },
      {
        onSuccess: () => {
          toast('success', t('commands.toastExecuted', { target: selectedNode }))
          setSelectedCommandId('')
          setSelectedNode('')
        },
        onError: () => toast('error', t('commands.toastFailed')),
      },
    )
  }

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold gradient-text">{t('commands.title')}</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">{t('commands.description')}</p>
      </div>

      <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('commands.executeCommand')}</h2>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <select
              value={selectedCommandId}
              onChange={(e) => setSelectedCommandId(e.target.value)}
              className="px-4 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 min-w-[200px] dark:bg-surface-800 dark:border-surface-700 dark:text-white"
            >
              <option value="">{t('commands.selectCommand')}</option>
              {commands.map((cmd) => (
                <option key={cmd.id} value={cmd.id}>{cmd.name}</option>
              ))}
            </select>
            <select
              value={selectedNode}
              onChange={(e) => setSelectedNode(e.target.value)}
              className="px-4 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 min-w-[160px] dark:bg-surface-800 dark:border-surface-700 dark:text-white"
            >
              <option value="">{t('commands.selectNode')}</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>{node.name}</option>
              ))}
            </select>
            <Button onClick={handleExecute} disabled={executeCommand.isPending || !selectedCommandId || !selectedNode}>
              {executeCommand.isPending ? <Spinner size="sm" /> : t('commands.execute')}
            </Button>
          </div>
          {selectedCommand && (
            <div className="mt-4 p-3 bg-surface-50 rounded-lg dark:bg-surface-800/50">
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300">{selectedCommand.name}</p>
              <pre className="text-sm text-surface-600 dark:text-surface-400 font-mono mt-1">{selectedCommand.command}</pre>
              {selectedCommand.description && (
                <p className="text-xs text-surface-500 dark:text-surface-500 mt-1">{selectedCommand.description}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('commands.commandHistory')}</h2>
        </CardHeader>
        <CardContent className="p-0">
          {commandsLoading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2 stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center gap-3">
                    <Skeleton variant="text" className="w-32" />
                    <Skeleton variant="text" className="w-16" />
                    <Skeleton variant="text" className="w-20 ml-auto" />
                  </div>
                  <Skeleton variant="rectangular" className="w-full h-16" />
                </div>
              ))}
            </div>
          ) : commands.length === 0 ? (
            <EmptyState icon={<IconCommands className="w-10 h-10" />} title={t('commands.emptyTitle')} description={t('commands.emptyDesc')} action={<Button onClick={() => document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()}>{t('commands.execute')}</Button>} />
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800">
              {commands.map((item, index) => (
                <div key={item.id} className="px-6 py-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors stagger-item" style={{ animationDelay: `${300 + index * 50}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <code className="text-sm text-accent-600 dark:text-accent-400 font-mono">{item.name}</code>
                      <span className="text-xs text-surface-500 dark:text-surface-500">{item.command}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-surface-100 dark:bg-surface-800 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <pre className="text-sm text-surface-700 bg-surface-50 rounded p-3 overflow-x-auto font-mono dark:text-surface-300 dark:bg-surface-800/50">
                    <Typewriter text={item.command} speed={10} />
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
