import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { StatCardSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { MiniChart } from '../components/ui/MiniChart'
import { IconNodes, IconCheckCircle, IconXCircle, IconZap, IconCommands, IconScripts, IconDashboard, IconStar } from '../components/ui/Icons'
import { useDashboard, useDashboardMetrics } from '../hooks/useDashboard'
import { useNodes } from '../hooks/useNodes'
import { useFavorites } from '../hooks/useFavorites'

export function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard()
  const { data: metrics } = useDashboardMetrics()
  const { data: nodesData, isLoading: nodesLoading } = useNodes()
  const { data: favorites } = useFavorites()

  const statsCards = dashboard
    ? [
        { key: 'totalNodes', value: String(dashboard.nodes.total), icon: <IconNodes className="w-5 h-5" /> },
        { key: 'online', value: String(dashboard.nodes.active), icon: <IconCheckCircle className="w-5 h-5" /> },
        { key: 'offline', value: String(dashboard.nodes.unreachable), icon: <IconXCircle className="w-5 h-5" /> },
        { key: 'commandsToday', value: String(dashboard.commands.total), icon: <IconZap className="w-5 h-5" /> },
      ]
    : []

  const recentNodes = nodesData?.items?.slice(0, 4) || []
  const recentActivity = dashboard?.recent_activity?.slice(0, 5) || []

  const chartColors = ['bg-surface-400', 'bg-surface-500', 'bg-surface-400', 'bg-surface-500']
  const activityChart = recentActivity.length > 0
    ? recentActivity.slice(0, 7).map((_, i) => 3 + Math.sin(i * 1.2) * 2 + ((i * 7 + 3) % 5) * 0.4)
    : [4, 6, 3, 8, 5, 7, 4]

  const commandChartData = metrics?.command_metrics?.slice(-7).map((m) => m.total) || [3, 5, 2, 8, 4, 6, 3]
  const scriptChartData = metrics?.script_metrics?.slice(-7).map((m) => m.total) || [1, 2, 1, 3, 2, 4, 1]

  const quickActions = [
    { key: 'executeCommand', Icon: IconZap, descKey: 'executeCommandDesc', path: '/commands' },
    { key: 'addNode', Icon: IconNodes, descKey: 'addNodeDesc', path: '/nodes' },
    { key: 'runScript', Icon: IconScripts, descKey: 'runScriptDesc', path: '/scripts' },
    { key: 'viewLogs', Icon: IconCommands, descKey: 'viewLogsDesc', path: '/commands' },
  ]

  const statusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'unreachable': return 'warning'
      case 'error': return 'danger'
      default: return 'default'
    }
  }

  const favList = favorites?.items || []

  return (
    <div className="space-y-8">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold gradient-text">{t('dashboard.title')}</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">{t('dashboard.description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardLoading
          ? Array.from({ length: 4 }).map((_, i) => (<StatCardSkeleton key={i} />))
          : statsCards.map((stat, index) => (
              <Card key={stat.key} hover className="overflow-hidden stagger-item" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="relative">
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{t(`dashboard.${stat.key}`)}</p>
                      <p className="text-4xl font-bold text-surface-900 dark:text-white mt-2">{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400">{stat.icon}</div>
                  </div>
                  <div className="relative mt-3 pt-3 border-t border-surface-200/50 dark:border-surface-700/50">
                    <MiniChart data={activityChart.map((v, j) => v + (index * j * 0.3))} color={chartColors[index]} className="h-8" />
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hover className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400"><IconNodes className="w-4 h-4" /></div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('dashboard.recentNodes')}</h2>
            </div>
          </CardHeader>
          <CardContent>
            {nodesLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-50/50 dark:bg-surface-800/30"><div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full shimmer" /><div><div className="h-4 w-24 shimmer rounded" /><div className="h-3 w-20 shimmer rounded mt-1" /></div></div><div className="h-5 w-14 shimmer rounded-full" /></div>))}</div>
            ) : recentNodes.length === 0 ? (
              <EmptyState icon={<IconNodes className="w-10 h-10" />} title={t('dashboard.emptyTitle')} description={t('dashboard.emptyDesc')} action={<Button onClick={() => navigate('/nodes')}>{t('nodes.addNode')}</Button>} />
            ) : (
              <div className="space-y-3">
                {recentNodes.map((node, index) => (
                  <div key={node.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50/50 dark:bg-surface-800/30 hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-all duration-200 stagger-item cursor-pointer" style={{ animationDelay: `${300 + index * 50}ms` }} onClick={() => navigate(`/nodes/${node.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${node.status === 'active' ? 'bg-green-500 status-online' : 'bg-red-500'}`} />
                      <div><p className="text-sm font-semibold text-surface-900 dark:text-white">{node.name}</p><p className="text-xs text-surface-500 dark:text-surface-500">{node.host}</p></div>
                    </div>
                    <Badge variant={statusVariant(node.status)}>{node.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card hover className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400"><IconStar className="w-4 h-4" /></div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('dashboard.favorites')}</h2>
            </div>
          </CardHeader>
          <CardContent>
            {favList.length === 0 ? (
              <EmptyState icon={<IconStar className="w-10 h-10" />} title={t('dashboard.favoritesEmpty')} description={t('dashboard.favoritesDesc')} action={<Button onClick={() => navigate('/nodes')}>{t('dashboard.browseNodes')}</Button>} />
            ) : (
              <div className="space-y-3">
                {favList.slice(0, 6).map((fav, index) => (
                  <div key={`${fav.target_type}-${fav.target_id}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50/50 dark:bg-surface-800/30 hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-all duration-200 stagger-item cursor-pointer" style={{ animationDelay: `${index * 50}ms` }} onClick={() => { if (fav.target_type === 'node') navigate(`/nodes/${fav.target_id}`); else if (fav.target_type === 'script') navigate('/scripts'); else if (fav.target_type === 'command') navigate('/commands') }}>
                    <IconStar className="w-4 h-4 text-yellow-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{fav.note || fav.target_id}</p>
                      <p className="text-xs text-surface-500 capitalize">{fav.target_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card hover className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400"><IconDashboard className="w-4 h-4" /></div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('dashboard.quickActions')}</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button key={action.key} onClick={() => navigate(action.path)} className="group p-4 rounded-xl text-left transition-all duration-300 hover:scale-[1.02] bg-surface-50/50 dark:bg-surface-800/30 hover:bg-surface-100 dark:hover:bg-surface-800/50 stagger-item cursor-pointer" style={{ animationDelay: `${500 + index * 50}ms` }}>
                  <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400 mb-3 group-hover:scale-110 transition-transform duration-300"><action.Icon className="w-5 h-5" /></div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">{t(`dashboard.${action.key}`)}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-500 mt-1">{t(`dashboard.${action.descKey}`)}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400"><IconZap className="w-4 h-4" /></div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('dashboard.commandMetrics')}</h2>
            </div>
          </CardHeader>
          <CardContent>
            <MiniChart data={commandChartData} color="bg-accent-500" className="h-16" />
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div><p className="text-2xl font-bold text-surface-900 dark:text-white">{metrics?.command_metrics?.reduce((s, m) => s + m.total, 0) || 0}</p><p className="text-xs text-surface-500">{t('dashboard.total')}</p></div>
              <div><p className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics?.command_metrics?.reduce((s, m) => s + m.successful, 0) || 0}</p><p className="text-xs text-surface-500">{t('dashboard.successful')}</p></div>
              <div><p className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics?.command_metrics?.reduce((s, m) => s + m.failed, 0) || 0}</p><p className="text-xs text-surface-500">{t('dashboard.failed')}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400"><IconScripts className="w-4 h-4" /></div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('dashboard.scriptMetrics')}</h2>
            </div>
          </CardHeader>
          <CardContent>
            <MiniChart data={scriptChartData} color="bg-green-500" className="h-16" />
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div><p className="text-2xl font-bold text-surface-900 dark:text-white">{metrics?.script_metrics?.reduce((s, m) => s + m.total, 0) || 0}</p><p className="text-xs text-surface-500">{t('dashboard.total')}</p></div>
              <div><p className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics?.script_metrics?.reduce((s, m) => s + m.successful, 0) || 0}</p><p className="text-xs text-surface-500">{t('dashboard.successful')}</p></div>
              <div><p className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics?.script_metrics?.reduce((s, m) => s + m.failed, 0) || 0}</p><p className="text-xs text-surface-500">{t('dashboard.failed')}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
