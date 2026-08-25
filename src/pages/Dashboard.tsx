import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { StatCard } from '../components/ui/StatCard'
import { Select } from '../components/ui/Select'
import { StatCardSkeleton, MetricsChartSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { MetricsChart } from '../components/ui/MetricsChart'
import { IconNodes, IconCheckCircle, IconXCircle, IconZap, IconCommands, IconScripts, IconDashboard, IconStar, IconDocker, IconAudit } from '../components/ui/Icons'
import { useDashboard, useDashboardMetrics } from '../hooks/useDashboard'
import { useNodes } from '../hooks/useNodes'
import { useFavorites } from '../hooks/useFavorites'
import { useSse } from '../hooks/useSse'
import { nodeStatusVariant, activityVariant } from '../lib/variants'
import type { MetricsBucket } from '../components/ui/MetricsChart'

type DatePreset = '7d' | '30d' | '90d' | 'all'

function getDateRange(preset: DatePreset): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString()
  if (preset === 'all') return { from: '', to: '' }
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90
  const from = new Date(now)
  from.setDate(from.getDate() - days)
  return { from: from.toISOString(), to }
}

function computeTrend(data: MetricsBucket[] | undefined): { value: number; direction: 'up' | 'down' | 'flat' } | undefined {
  if (!data || data.length < 2) return undefined
  const half = Math.floor(data.length / 2)
  const recentTotal = data.slice(half).reduce((s, m) => s + m.total, 0)
  const prevTotal = data.slice(0, half).reduce((s, m) => s + m.total, 0)
  if (prevTotal === 0) return { value: 0, direction: 'flat' }
  const pct = Math.round(((recentTotal - prevTotal) / prevTotal) * 100)
  if (pct > 0) return { value: pct, direction: 'up' }
  if (pct < 0) return { value: Math.abs(pct), direction: 'down' }
  return { value: 0, direction: 'flat' }
}

export function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [datePreset, setDatePreset] = useState<DatePreset>('7d')
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day')
  const { from: metricsFrom, to: metricsTo } = useMemo(() => getDateRange(datePreset), [datePreset])
  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useDashboard()
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useDashboardMetrics({ date_from: metricsFrom || undefined, date_to: metricsTo || undefined, group_by: groupBy })
  const { data: nodesData, isLoading: nodesLoading, refetch: refetchNodes } = useNodes()
  const { data: favorites } = useFavorites()
  const { on: onSseEvent } = useSse()

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

  const cmdTrend = useMemo(() => computeTrend(metrics?.command_metrics), [metrics])
  const scrTrend = useMemo(() => computeTrend(metrics?.script_metrics), [metrics])

  const cmdTotal = metrics?.command_metrics?.reduce((s, m) => s + m.total, 0) || 0
  const cmdOk = metrics?.command_metrics?.reduce((s, m) => s + m.successful, 0) || 0
  const cmdFail = metrics?.command_metrics?.reduce((s, m) => s + m.failed, 0) || 0

  const scrTotal = metrics?.script_metrics?.reduce((s, m) => s + m.total, 0) || 0
  const scrOk = metrics?.script_metrics?.reduce((s, m) => s + m.successful, 0) || 0
  const scrFail = metrics?.script_metrics?.reduce((s, m) => s + m.failed, 0) || 0

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
  const recentNodes = nodesData?.items?.slice(0, 4) || []
  const recentActivity = dashboard?.recent_activity?.slice(0, 8) || []

  const datePresetOptions: { key: DatePreset; label: string }[] = [
    { key: '7d', label: t('dashboard.last7Days') },
    { key: '30d', label: t('dashboard.last30Days') },
    { key: '90d', label: t('dashboard.last90Days') },
    { key: 'all', label: t('dashboard.allTime') },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('dashboard.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{t('dashboard.description')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {dashboardLoading
          ? Array.from({ length: 5 }).map((_, i) => (<StatCardSkeleton key={i} />))
          : (
            <>
              <Card hover className="stagger-item"><CardContent><StatCard label={t('dashboard.totalNodes')} value={dashboard?.nodes.total ?? 0} icon={<IconNodes className="w-5 h-5" />} /></CardContent></Card>
              <Card hover className="stagger-item"><CardContent><StatCard label={t('dashboard.online')} value={dashboard?.nodes.active ?? 0} icon={<IconCheckCircle className="w-5 h-5" />} tone="success" /></CardContent></Card>
              <Card hover className="stagger-item"><CardContent><StatCard label={t('dashboard.offline')} value={dashboard?.nodes.unreachable ?? 0} icon={<IconXCircle className="w-5 h-5" />} tone="danger" /></CardContent></Card>
              <Card hover className="stagger-item"><CardContent><StatCard label={t('dashboard.totalCommands')} value={dashboard?.commands.total ?? 0} icon={<IconZap className="w-5 h-5" />} /></CardContent></Card>
              <Card hover className="stagger-item"><CardContent><StatCard label={t('dashboard.dockerContainers')} value={dashboard?.docker.total ?? 0} icon={<IconDocker className="w-5 h-5" />} sub={`${dashboard?.docker.running ?? 0} / ${dashboard?.docker.stopped ?? 0}`} /></CardContent></Card>
            </>
            )}
      </div>

      {/* 3-column: Recent Nodes / Favorites / Quick Actions */}
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
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{fav.name || fav.note || fav.target_id}</p>
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

      {/* Metrics */}
      <Card hover className="stagger-item">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('dashboard.metricsTitle')}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
                {datePresetOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setDatePreset(opt.key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${datePreset === opt.key ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="w-32">
                <Select
                  value={groupBy}
                  onChange={(val) => setGroupBy(val as 'day' | 'week' | 'month')}
                  options={[
                    { value: 'day', label: t('dashboard.byDay') },
                    { value: 'week', label: t('dashboard.byWeek') },
                    { value: 'month', label: t('dashboard.byMonth') },
                  ]}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Command Metrics */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-accent-500/10 dark:bg-accent-500/20 flex items-center justify-center text-accent-600 dark:text-accent-400"><IconZap className="w-4 h-4" /></div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">{t('dashboard.commandMetrics')}</h3>
                  {cmdTrend && <p className={`text-xs font-medium ${cmdTrend.direction === 'up' ? 'text-green-600 dark:text-green-400' : cmdTrend.direction === 'down' ? 'text-red-500 dark:text-red-400' : 'text-surface-400'}`}>{cmdTrend.direction === 'up' ? '\u2191' : cmdTrend.direction === 'down' ? '\u2193' : '\u2014'} {cmdTrend.value > 0 ? `${cmdTrend.value}% ` : ''}{t('dashboard.vsPrevious')}</p>}
                </div>
              </div>
              {metricsLoading ? (
                <MetricsChartSkeleton />
              ) : (
                <MetricsChart data={metrics?.command_metrics || []} height={180} />
              )}
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                  <p className="text-xl font-bold text-surface-900 dark:text-white">{cmdTotal}</p>
                  <p className="text-xs text-surface-500">{t('dashboard.total')}</p>
                </div>
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-500/10">
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{cmdOk}</p>
                  <p className="text-xs text-surface-500">{t('dashboard.successful')}</p>
                </div>
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10">
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">{cmdFail}</p>
                  <p className="text-xs text-surface-500">{t('dashboard.failed')}</p>
                </div>
              </div>
            </div>

            {/* Script Metrics */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400"><IconScripts className="w-4 h-4" /></div>
                <div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">{t('dashboard.scriptMetrics')}</h3>
                  {scrTrend && <p className={`text-xs font-medium ${scrTrend.direction === 'up' ? 'text-green-600 dark:text-green-400' : scrTrend.direction === 'down' ? 'text-red-500 dark:text-red-400' : 'text-surface-400'}`}>{scrTrend.direction === 'up' ? '\u2191' : scrTrend.direction === 'down' ? '\u2193' : '\u2014'} {scrTrend.value > 0 ? `${scrTrend.value}% ` : ''}{t('dashboard.vsPrevious')}</p>}
                </div>
              </div>
              {metricsLoading ? (
                <MetricsChartSkeleton />
              ) : (
                <MetricsChart data={metrics?.script_metrics || []} height={180} />
              )}
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                  <p className="text-xl font-bold text-surface-900 dark:text-white">{scrTotal}</p>
                  <p className="text-xs text-surface-500">{t('dashboard.total')}</p>
                </div>
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-500/10">
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{scrOk}</p>
                  <p className="text-xs text-surface-500">{t('dashboard.successful')}</p>
                </div>
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10">
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">{scrFail}</p>
                  <p className="text-xs text-surface-500">{t('dashboard.failed')}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card hover className="stagger-item">
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
                    <span className="text-sm text-surface-700 dark:text-surface-300 truncate">{activity.details || '\u2014'}</span>
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
