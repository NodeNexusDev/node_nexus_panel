import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { useDashboardStats } from '../hooks/useDashboard'
import { useNodes } from '../hooks/useNodes'

const statGradients = [
  'from-blue-500 to-cyan-400',
  'from-green-500 to-emerald-400',
  'from-red-500 to-rose-400',
  'from-purple-500 to-indigo-400',
]

const statIcons = ['🖥️', '✅', '❌', '⚡']

export function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: nodesData, isLoading: nodesLoading } = useNodes()

  const statsCards = stats
    ? [
        { key: 'totalNodes', value: String(stats.totalNodes), gradient: statGradients[0], icon: statIcons[0] },
        { key: 'online', value: String(stats.online), gradient: statGradients[1], icon: statIcons[1] },
        { key: 'offline', value: String(stats.offline), gradient: statGradients[2], icon: statIcons[2] },
        { key: 'commandsToday', value: String(stats.commandsToday), gradient: statGradients[3], icon: statIcons[3] },
      ]
    : []

  const recentNodes = nodesData?.data?.slice(0, 4) || []

  const quickActions = [
    { key: 'executeCommand', icon: '⚡', descKey: 'executeCommandDesc', path: '/commands', gradient: 'from-amber-500 to-orange-400' },
    { key: 'addNode', icon: '🖥️', descKey: 'addNodeDesc', path: '/nodes', gradient: 'from-blue-500 to-cyan-400' },
    { key: 'runScript', icon: '📜', descKey: 'runScriptDesc', path: '/scripts', gradient: 'from-green-500 to-emerald-400' },
    { key: 'viewLogs', icon: '📊', descKey: 'viewLogsDesc', path: '/commands', gradient: 'from-purple-500 to-indigo-400' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold gradient-text">{t('dashboard.title')}</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">{t('dashboard.description')}</p>
      </div>

      {/* Stat cards with gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center justify-center h-28">
                  <Spinner size="sm" />
                </CardContent>
              </Card>
            ))
          : statsCards.map((stat, index) => (
              <Card key={stat.key} hover className="overflow-hidden stagger-item" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="relative">
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 dark:opacity-10`} />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{t(`dashboard.${stat.key}`)}</p>
                      <p className="text-4xl font-bold text-surface-900 dark:text-white mt-2">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-xl shadow-lg`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent nodes */}
        <Card hover className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-sm">
                🖥️
              </div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('dashboard.recentNodes')}</h2>
            </div>
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
                {recentNodes.map((node, index) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-50/50 dark:bg-surface-800/30 hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-all duration-200 stagger-item"
                    style={{ animationDelay: `${300 + index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${node.status === 'online' ? 'bg-green-500 status-online' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">{node.name}</p>
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

        {/* Quick actions */}
        <Card hover className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-400 flex items-center justify-center text-sm">
                🚀
              </div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('dashboard.quickActions')}</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={action.key}
                  onClick={() => navigate(action.path)}
                  className="group p-4 rounded-xl text-left transition-all duration-300 hover:scale-[1.02] bg-surface-50/50 dark:bg-surface-800/30 hover:bg-surface-100 dark:hover:bg-surface-800/50 stagger-item"
                  style={{ animationDelay: `${400 + index * 50}ms` }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-lg mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">{t(`dashboard.${action.key}`)}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-500 mt-1">{t(`dashboard.${action.descKey}`)}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
