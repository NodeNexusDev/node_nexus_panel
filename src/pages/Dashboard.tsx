import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

const stats = [
  { key: 'totalNodes', value: '12', change: '+2', trend: 'up' },
  { key: 'online', value: '10', change: '+1', trend: 'up' },
  { key: 'offline', value: '2', change: '-1', trend: 'down' },
  { key: 'commandsToday', value: '48', change: '+12', trend: 'up' },
]

const recentNodes = [
  { id: '1', name: 'prod-server-01', status: 'online', ip: '192.168.1.100' },
  { id: '2', name: 'prod-server-02', status: 'online', ip: '192.168.1.101' },
  { id: '3', name: 'dev-server-01', status: 'offline', ip: '192.168.1.200' },
  { id: '4', name: 'staging-server-01', status: 'online', ip: '192.168.1.150' },
]

const quickActions = [
  { key: 'executeCommand', icon: '⚡', descKey: 'executeCommandDesc' },
  { key: 'addNode', icon: '🖥️', descKey: 'addNodeDesc' },
  { key: 'runScript', icon: '📜', descKey: 'runScriptDesc' },
  { key: 'viewLogs', icon: '📊', descKey: 'viewLogsDesc' },
]

export function Dashboard() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
        <p className="text-gray-400">{t('dashboard.description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.key}>
            <CardContent>
              <p className="text-sm text-gray-400">{t(`dashboard.${stat.key}`)}</p>
              <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              <p className={`text-sm mt-1 ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">{t('dashboard.recentNodes')}</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentNodes.map((node) => (
                <div key={node.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{node.name}</p>
                      <p className="text-xs text-gray-500">{node.ip}</p>
                    </div>
                  </div>
                  <Badge variant={node.status === 'online' ? 'success' : 'danger'}>
                    {node.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">{t('dashboard.quickActions')}</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button key={action.key} className="p-4 bg-gray-800/50 rounded-lg text-left hover:bg-gray-800 transition-colors">
                  <span className="text-2xl">{action.icon}</span>
                  <p className="text-sm font-medium text-white mt-2">{t(`dashboard.${action.key}`)}</p>
                  <p className="text-xs text-gray-500">{t(`dashboard.${action.descKey}`)}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
