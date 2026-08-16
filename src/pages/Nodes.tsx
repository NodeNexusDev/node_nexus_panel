import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

const nodes = [
  { id: '1', name: 'prod-server-01', status: 'online', ip: '192.168.1.100', os: 'Ubuntu 22.04', cpu: '45%', memory: '62%', lastSeen: '2 min ago' },
  { id: '2', name: 'prod-server-02', status: 'online', ip: '192.168.1.101', os: 'Ubuntu 22.04', cpu: '32%', memory: '58%', lastSeen: '1 min ago' },
  { id: '3', name: 'dev-server-01', status: 'offline', ip: '192.168.1.200', os: 'Debian 12', cpu: '—', memory: '—', lastSeen: '2 hours ago' },
  { id: '4', name: 'staging-server-01', status: 'online', ip: '192.168.1.150', os: 'Ubuntu 24.04', cpu: '28%', memory: '45%', lastSeen: '30 sec ago' },
  { id: '5', name: 'prod-server-03', status: 'online', ip: '192.168.1.102', os: 'CentOS 9', cpu: '67%', memory: '78%', lastSeen: '5 sec ago' },
]

export function Nodes() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('nodes.title')}</h1>
          <p className="text-gray-400">{t('nodes.description')}</p>
        </div>
        <Button>{t('nodes.addNode')}</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('nodes.node')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('nodes.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('nodes.os')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('nodes.cpu')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('nodes.memory')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('nodes.lastSeen')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('nodes.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {nodes.map((node) => (
                  <tr key={node.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">{node.name}</p>
                        <p className="text-xs text-gray-500">{node.ip}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={node.status === 'online' ? 'success' : 'danger'}>
                        {node.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{node.os}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{node.cpu}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{node.memory}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{node.lastSeen}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">{t('nodes.terminal')}</Button>
                        <Button variant="ghost" size="sm">{t('nodes.logs')}</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
