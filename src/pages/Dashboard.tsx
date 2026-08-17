import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { StatCardSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { MiniChart } from '../components/ui/MiniChart'
import { IconNodes, IconCheckCircle, IconXCircle, IconZap, IconCommands, IconScripts, IconDashboard } from '../components/ui/Icons'
import { useDashboardStats, useRecentActivity } from '../hooks/useDashboard'
import { useNodes } from '../hooks/useNodes'

const statIcons = [
  <IconNodes key="nodes" className="w-5 h-5" />,
  <IconCheckCircle key="online" className="w-5 h-5" />,
  <IconXCircle key="offline" className="w-5 h-5" />,
  <IconZap key="commands" className="w-5 h-5" />,
]

export function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: nodesData, isLoading: nodesLoading } = useNodes()
  const { data: activity } = useRecentActivity(14)

  const statsCards = stats
    ? [
        { key: 'totalNodes', value: String(stats.totalNodes), icon: statIcons[0] },
        { key: 'online', value: String(stats.online), icon: statIcons[1] },
        { key: 'offline', value: String(stats.offline), icon: statIcons[2] },
        { key: 'commandsToday', value: String(stats.commandsToday), icon: statIcons[3] },
      ]
    : []

  const recentNodes = nodesData?.data?.slice(0, 4) || []

  const chartColors = ['bg-surface-400', 'bg-surface-500', 'bg-surface-400', 'bg-surface-500']
  const activityChart = Array.isArray(activity)
    ? activity.slice(0, 7).map((_, i) => 3 + Math.sin(i * 1.2) * 2 + ((i * 7 + 3) % 5) * 0.4)
    : [4, 6, 3, 8, 5, 7, 4]

  const quickActions = [
    { key: 'executeCommand', Icon: IconZap, descKey: 'executeCommandDesc', path: '/commands' },
    { key: 'addNode', Icon: IconNodes, descKey: 'addNodeDesc', path: '/nodes' },
    { key: 'runScript', Icon: IconScripts, descKey: 'runScriptDesc', path: '/scripts' },
    { key: 'viewLogs', Icon: IconCommands, descKey: 'viewLogsDesc', path: '/commands' },
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
              <StatCardSkeleton key={i} />
            ))
          : statsCards.map((stat, index) => (
              <Card key={stat.key} hover className="overflow-hidden stagger-item" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="relative">
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{t(`dashboard.${stat.key}`)}</p>
                      <p className="text-4xl font-bold text-surface-900 dark:text-white mt-2">{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400">
                      {stat.icon}
                    </div>
                  </div>
                  {/* Mini chart sparkline */}
                  <div className="relative mt-3 pt-3 border-t border-surface-200/50 dark:border-surface-700/50">
                    <MiniChart data={activityChart.map((v, j) => v + (index * j * 0.3))} color={chartColors[index]} className="h-8" />
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
              <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400">
                <IconNodes className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('dashboard.recentNodes')}</h2>
            </div>
          </CardHeader>
          <CardContent>
            {nodesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-50/50 dark:bg-surface-800/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shimmer" />
                      <div>
                        <div className="h-4 w-24 shimmer rounded" />
                        <div className="h-3 w-20 shimmer rounded mt-1" />
                      </div>
                    </div>
                    <div className="h-5 w-14 shimmer rounded-full" />
                  </div>
                ))}
              </div>
            ) : recentNodes.length === 0 ? (
              <EmptyState icon={<IconNodes className="w-10 h-10" />} title="No nodes yet" description="Add your first node to get started" />
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
              <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400">
                <IconDashboard className="w-4 h-4" />
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
                  <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400 mb-3 group-hover:scale-110 transition-transform duration-300">
                    <action.Icon className="w-5 h-5" />
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
