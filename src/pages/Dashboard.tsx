import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { useDashboardStats } from '../hooks/useDashboard'
import { useNodes } from '../hooks/useNodes'

export function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: nodesData, isLoading: nodesLoading } = useNodes()

  const statsCards = stats
    ? [
        { key: 'totalNodes', value: String(stats.totalNodes) },
        { key: 'online', value: String(stats.online) },
        { key: 'offline', value: String(stats.offline) },
        { key: 'commandsToday', value: String(stats.commandsToday) },
      ]
    : []

  const recentNodes = nodesData?.data?.slice(0, 4) || []

  const quickActions = [
    { key: 'executeCommand', icon: '⚡', descKey: 'executeCommandDesc', path: '/commands' },
    { key: 'addNode', icon: '🖥️', descKey: 'addNodeDesc', path: '/nodes' },
    { key: 'runScript', icon: '📜', descKey: 'runScriptDesc', path: '/scripts' },
    { key: 'viewLogs', icon: '📊', descKey: 'viewLogsDesc', path: '/commands' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t('dashboard.title')}</h1>
        <p className="text-surface-500 dark:text-surface-400">{t('dashboard.description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center justify-center h-24">
                  <Spinner size="sm" />
                </CardContent>
              </Card>
            ))
          : statsCards.map((stat) => (
              <Card key={stat.key}>
                <CardContent>
                  <p className="text-sm text-surface-500 dark:text-surface-400">{t(`dashboard.${stat.key}`)}</p>
                  <p className="text-3xl font-bold text-surface-900 dark:text-white mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('dashboard.recentNodes')}</h2>
          </CardHeader>
          <CardContent>
            {nodesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : recentNodes.length === 0 ? (
              <EmptyState icon="🖥️" title="No nodes yet" description="Add your first node to get started" />
            ) : (
              <div className="space-y-3">
                {recentNodes.map((node) => (
                  <div key={node.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg dark:bg-surface-800/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{node.name}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-500">{node.ip}</p>
                      </div>
                    </div>
                    <Badge variant={node.status === 'online' ? 'success' : 'danger'}>
                      {node.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('dashboard.quickActions')}</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.key}
                  onClick={() => navigate(action.path)}
                  className="p-4 bg-surface-50 rounded-lg text-left hover:bg-surface-100 transition-colors dark:bg-surface-800/50 dark:hover:bg-surface-800"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <p className="text-sm font-medium text-surface-900 dark:text-white mt-2">{t(`dashboard.${action.key}`)}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-500">{t(`dashboard.${action.descKey}`)}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
