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
import { useCommandHistory, useExecuteCommand } from '../hooks/useCommands'
import { useToast } from '../components/ui/Toast'

export function Commands() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: nodesData } = useNodes()
  const { data: historyData, isLoading: historyLoading } = useCommandHistory()
  const executeCommand = useExecuteCommand()

  const [command, setCommand] = useState('')
  const [selectedNode, setSelectedNode] = useState('all')

  const nodes = nodesData?.data || []
  const history = historyData?.data || []

  const handleExecute = () => {
    if (!command.trim()) return
    executeCommand.mutate(
      { command, nodeId: selectedNode },
      {
        onSuccess: () => {
          toast('success', t('commands.toastExecuted', { target: selectedNode === 'all' ? t('commands.allNodes') : selectedNode }))
          setCommand('')
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
              value={selectedNode}
              onChange={(e) => setSelectedNode(e.target.value)}
              className="px-4 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[160px] dark:bg-surface-800 dark:border-surface-700 dark:text-white"
            >
              <option value="all">{t('commands.allNodes')}</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>{node.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
              placeholder={t('commands.enterCommand')}
              className="flex-1 px-4 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 text-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white dark:placeholder-surface-500"
            />
            <Button onClick={handleExecute} disabled={executeCommand.isPending || !command.trim()}>
              {executeCommand.isPending ? <Spinner size="sm" /> : t('commands.execute')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('commands.commandHistory')}</h2>
        </CardHeader>
        <CardContent className="p-0">
          {historyLoading ? (
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
          ) : history.length === 0 ? (
            <EmptyState icon={<IconCommands className="w-10 h-10" />} title={t('commands.emptyTitle')} description={t('commands.emptyDesc')} />
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800">
              {history.map((item, index) => (
                <div key={item.id} className="px-6 py-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors stagger-item" style={{ animationDelay: `${300 + index * 50}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <code className="text-sm text-indigo-600 dark:text-indigo-400 font-mono">{item.command}</code>
                      <span className="text-xs text-surface-500 dark:text-surface-500">{t('commands.on')} {item.node}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-surface-500 dark:text-surface-500">{item.timestamp}</span>
                      <span className={`text-xs ${item.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <pre className="text-sm text-surface-700 bg-surface-50 rounded p-3 overflow-x-auto font-mono dark:text-surface-300 dark:bg-surface-800/50">
                    <Typewriter text={item.output} speed={10} />
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
