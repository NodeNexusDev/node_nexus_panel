import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
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
          toast('success', `Command executed on ${selectedNode === 'all' ? 'all nodes' : selectedNode}`)
          setCommand('')
        },
        onError: () => toast('error', 'Failed to execute command'),
      },
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t('commands.title')}</h1>
        <p className="text-surface-500 dark:text-surface-400">{t('commands.description')}</p>
      </div>

      <Card>
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

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('commands.commandHistory')}</h2>
        </CardHeader>
        <CardContent className="p-0">
          {historyLoading ? (
            <div className="flex items-center justify-center py-16"><Spinner /></div>
          ) : history.length === 0 ? (
            <EmptyState icon="⚡" title="No commands yet" description="Execute your first command above" />
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800">
              {history.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-surface-50 dark:hover:bg-surface-800/50">
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
                    {item.output}
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
