import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const history = [
  { id: '1', command: 'uptime', node: 'prod-server-01', status: 'success', output: '14:32:07 up 45 days, 3:21, 1 user, load average: 0.15, 0.10, 0.05', timestamp: '2 min ago' },
  { id: '2', command: 'df -h', node: 'prod-server-02', status: 'success', output: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       100G   45G   55G  45% /', timestamp: '5 min ago' },
  { id: '3', command: 'systemctl status nginx', node: 'staging-server-01', status: 'error', output: 'Unit nginx.service could not be found.', timestamp: '10 min ago' },
]

export function Commands() {
  const { t } = useTranslation()
  const [command, setCommand] = useState('')
  const [selectedNode, setSelectedNode] = useState('all')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('commands.title')}</h1>
        <p className="text-gray-400">{t('commands.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">{t('commands.executeCommand')}</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <select
                value={selectedNode}
                onChange={(e) => setSelectedNode(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{t('commands.allNodes')}</option>
                <option value="prod-server-01">prod-server-01</option>
                <option value="prod-server-02">prod-server-02</option>
                <option value="staging-server-01">staging-server-01</option>
              </select>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={t('commands.enterCommand')}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button>{t('commands.execute')}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">{t('commands.commandHistory')}</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-800">
            {history.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <code className="text-sm text-indigo-400 font-mono">{item.command}</code>
                    <span className="text-xs text-gray-500">{t('commands.on')} {item.node}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{item.timestamp}</span>
                    <span className={`text-xs ${item.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <pre className="text-sm text-gray-300 bg-gray-800/50 rounded p-3 overflow-x-auto font-mono">
                  {item.output}
                </pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
