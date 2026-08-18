import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { StatCardSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { MiniChart } from '../components/ui/MiniChart'
import { IconNodes, IconCheckCircle, IconXCircle, IconZap, IconCommands, IconScripts, IconDashboard, IconStar, IconDocker, IconAudit } from '../components/ui/Icons'
import { useDashboard, useDashboardMetrics } from '../hooks/useDashboard'
import { useNodes } from '../hooks/useNodes'
import { useFavorites } from '../hooks/useFavorites'
import { useSse } from '../hooks/useSse'
import { nodeStatusVariant, activityVariant } from '../lib/variants'

export function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [metricsFrom, setMetricsFrom] = useState('')
  const [metricsTo, setMetricsTo] = useState('')
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day')
  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useDashboard()
  const { data: metrics, refetch: refetchMetrics } = useDashboardMetrics({ date_from: metricsFrom || undefined, date_to: metricsTo || undefined, group_by: groupBy })
  const { data: nodesData, isLoading: nodesLoading, refetch: refetchNodes } = useNodes()
  const { data: favorites } = useFavorites()
  const { isConnected, on: onSseEvent } = useSse()

  useEffect(() => {
    const unsubs = [
      onSseEvent('node:status', () => { refetchDashboard(); refetchNodes() }),
      onSseEvent('node:metrics', () => { refetchDashboard() }),
      onSseEvent('command:complete', () => { refetchDashboard(); refetchMetrics() }),
      onSseEvent('script:complete', () => { refetchDashboard(); refetchMetrics() }),
      onSseEvent('docker:container:started', () => { refetchDashboard() }),
      onSseEvent('docker:container:stopped', () => { refetchDashboard() }),
      onSseEvent('system:alert', () => { refetchDashboard() }),
    ]
    return () => { unsubs.forEach((u) => u()) }
  }, [onSseEvent, refetchDashboard, refetchNodes, refetchMetrics])

  const statsCards = dashboard
    ? [
        { key: 'totalNodes', value: String(dashboard.nodes.total), icon: <IconNodes className="w-5 h-5" /> },
        { key: 'online', value: String(dashboard.nodes.active), icon: <IconCheckCircle className="w-5 h-5" /> },
        { key: 'offline', value: String(dashboard.nodes.unreachable), icon: <IconXCircle className="w-5 h-5" /> },
        { key: 'totalCommands', value: String(dashboard.commands.total), icon: <IconZap className="w-5 h-5" /> },
        { key: 'dockerContainers', value: String(dashboard.docker.total), icon: <IconDocker className="w-5 h-5" />, sub: `${dashboard.docker.running} / ${dashboard.docker.stopped}` },
      ]
    : []

  const recentNodes = nodesData?.items?.slice(0, 4) || []
  const recentActivity = dashboard?.recent_activity?.slice(0, 8) || []

  const commandChartData = metrics?.command_metrics?.slice(-7).map((m) => m.total) || [3, 5, 2, 8, 4, 6, 3]
  const scriptChartData = metrics?.script_metrics?.slice(-7).map((m) => m.total) || [1, 2, 1, 3, 2, 4, 1]

  const quickActions = [
    { key: 'executeCommand', Icon: IconZap, descKey: 'executeCommandDesc', path: '/commands' },
    { key: 'addNode', Icon: IconNodes, descKey: 'addNodeDesc', path: '/nodes' },
    { key: 'runScript', Icon: IconScripts, descKey: 'runScriptDesc', path: '/scripts' },
    { key: 'viewLogs', Icon: IconAudit, descKey: 'viewLogsDesc', path: '/audit' },
  ]

  const favIcon = (type: string) => {
    switch (type) {
      case 'node': return <IconNodes className="w-4 h-4 text-blue-500" />
      case 'script': return <IconScripts className="w-4 h-4 text-green-500" />
      case 'command': return <IconCommands className="w-4 h-4 text-accent-500" />
      default: return <IconStar className="w-4 h-4 text-yellow-500" />
    }
  }

  const favList = favorites?.items || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('dashboard.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{t('dashboard.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${isConnected ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-surface-400'}`} />
            {isConnected ? t('dashboard.liveUpdates') : t('dashboard.offline')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {dashboardLoading
          ? Array.from({ length: 5 }).map((_, i) => (<StatCardSkeleton key={i} />))
          : statsCards.map((stat) => (
              <Card key={stat.key} hover className="overflow-hidden stagger-item">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{t(`dashboard.${stat.key}`)}</p>
                      <p className="text-3xl font-bold text-surface-900 dark:text-white mt-2">{stat.value}</p>
                      {stat.sub && <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">{stat.sub}</p>}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400">{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hover className="stagger-item">
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
                {recentNodes.map((node) => (
                  <div key={node.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50/50 dark:bg-surface-800/30 hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-all duration-200 stagger-item cursor-pointer" onClick={() => navigate(`/nodes/${node.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${node.status === 'active' ? 'bg-green-500 status-online' : 'bg-red-500'}`} />
                      <div><p className="text-sm font-semibold text-surface-900 dark:text-white">{node.name}</p><p className="text-xs text-surface-500 dark:text-surface-500">{node.host}</p></div>
                    </div>
                    <Badge variant={nodeStatusVariant(node.status)}>{node.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card hover className="stagger-item">
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
                {favList.slice(0, 6).map((fav) => (
                  <div key={`${fav.target_type}-${fav.target_id}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50/50 dark:bg-surface-800/30 hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-all duration-200 stagger-item cursor-pointer" onClick={() => { if (fav.target_type === 'node') navigate(`/nodes/${fav.target_id}`); else if (fav.target_type === 'script') navigate(`/scripts/${fav.target_id}`); else if (fav.target_type === 'command') navigate(`/commands/${fav.target_id}`) }}>
                    {favIcon(fav.target_type)}
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

        <Card hover className="stagger-item">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400"><IconDashboard className="w-4 h-4" /></div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('dashboard.quickActions')}</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button key={action.key} onClick={() => navigate(action.path)} className="group p-4 rounded-xl text-left transition-all duration-300 hover:scale-[1.02] bg-surface-50/50 dark:bg-surface-800/30 hover:bg-surface-100 dark:hover:bg-surface-800/50 stagger-item cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400 mb-3 group-hover:scale-110 transition-transform duration-300"><action.Icon className="w-5 h-5" /></div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">{t(`dashboard.${action.key}`)}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-500 mt-1">{t(`dashboard.${action.descKey}`)}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="stagger-item">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('dashboard.metricsTitle')}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <input type="date" value={metricsFrom} onChange={(e) => setMetricsFrom(e.target.value)} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
              <span className="text-surface-400">—</span>
              <input type="date" value={metricsTo} onChange={(e) => setMetricsTo(e.target.value)} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
                <option value="day">{t('dashboard.byDay', 'By Day')}</option>
                <option value="week">{t('dashboard.byWeek', 'By Week')}</option>
                <option value="month">{t('dashboard.byMonth', 'By Month')}</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400"><IconZap className="w-4 h-4" /></div>
                <h3 className="font-semibold text-surface-900 dark:text-white">{t('dashboard.commandMetrics')}</h3>
              </div>
              <MiniChart data={commandChartData} color="bg-accent-500" className="h-16" />
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div><p className="text-2xl font-bold text-surface-900 dark:text-white">{metrics?.command_metrics?.reduce((s, m) => s + m.total, 0) || 0}</p><p className="text-xs text-surface-500">{t('dashboard.total')}</p></div>
                <div><p className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics?.command_metrics?.reduce((s, m) => s + m.successful, 0) || 0}</p><p className="text-xs text-surface-500">{t('dashboard.successful')}</p></div>
                <div><p className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics?.command_metrics?.reduce((s, m) => s + m.failed, 0) || 0}</p><p className="text-xs text-surface-500">{t('dashboard.failed')}</p></div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400"><IconScripts className="w-4 h-4" /></div>
                <h3 className="font-semibold text-surface-900 dark:text-white">{t('dashboard.scriptMetrics')}</h3>
              </div>
              <MiniChart data={scriptChartData} color="bg-green-500" className="h-16" />
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div><p className="text-2xl font-bold text-surface-900 dark:text-white">{metrics?.script_metrics?.reduce((s, m) => s + m.total, 0) || 0}</p><p className="text-xs text-surface-500">{t('dashboard.total')}</p></div>
                <div><p className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics?.script_metrics?.reduce((s, m) => s + m.successful, 0) || 0}</p><p className="text-xs text-surface-500">{t('dashboard.successful')}</p></div>
                <div><p className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics?.script_metrics?.reduce((s, m) => s + m.failed, 0) || 0}</p><p className="text-xs text-surface-500">{t('dashboard.failed')}</p></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {recentActivity.length > 0 && (
        <Card className="stagger-item">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400"><IconAudit className="w-4 h-4" /></div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('dashboard.recentActivity')}</h2>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-surface-200 dark:divide-surface-800">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between px-6 py-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant={activityVariant(activity.action)}>{activity.action}</Badge>
                    <span className="text-sm text-surface-700 dark:text-surface-300 truncate">{activity.details || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {activity.user && <span className="text-xs text-surface-500">{activity.user}</span>}
                    <span className="text-xs text-surface-400">{new Date(activity.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
