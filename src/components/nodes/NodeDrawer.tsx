import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Tabs } from '../ui/Tabs'
import { FavoriteButton } from '../ui/FavoriteButton'
import { Tooltip } from '../ui/Tooltip'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { Skeleton, TableSkeleton, StatCardSkeleton } from '../ui/Skeleton'
import { InfiniteScroll } from '../ui/InfiniteScroll'
import { KeyValueList } from '../ui/KeyValueList'
import { StatCard, StatsGrid } from '../ui/StatCard'
import { formatBytes, formatPercent, formatDurationMs } from '../../lib/format'
import { nodeStatusVariant } from '../../lib/variants'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { useToast } from '../ui/useToast'
import {
  IconNodes,
  IconCopy,
  IconDocker,
  IconCheckCircle,
  IconCommands,
  IconScripts,
  IconXCircle,
} from '../ui/Icons'
import {
  useNodeMetrics,
  useNodeStats,
  useInfiniteNodeStatusHistory,
  useInfiniteNodeCommandHistory,
  useRetryNodeCommand,
  useCheckNode,
} from '../../hooks/useNodes'
import type { Node } from '../../api/types'

type DrawerTab = 'overview' | 'metrics' | 'stats' | 'history'

interface NodeDrawerProps {
  node: Node
  onClose: () => void
  onEdit: (node: Node) => void
  onDelete: (node: Node) => void
  onExec: (node: Node) => void
  onRunScript: (node: Node) => void
  onValidate: (node: Node) => void
}

export function NodeDrawer({ node, onClose: _onClose, onEdit, onDelete, onExec, onRunScript, onValidate }: NodeDrawerProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { copy } = useCopyToClipboard({ onCopied: () => toast('success', t('nodes.addressCopied')) })
  const checkNode = useCheckNode()
  const [active, setActive] = useState<DrawerTab>('overview')

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: 'overview', label: t('nodes.overview', 'Overview') },
    { key: 'metrics', label: t('nodes.metrics', 'Metrics') },
    { key: 'stats', label: t('nodes.stats', 'Stats') },
    { key: 'history', label: t('nodes.statusHistory', 'History') },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          node.status === 'active' ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
          : node.status === 'unreachable' ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
          : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
        }`}>
          <IconNodes className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-surface-900 dark:text-white truncate">{node.name}</p>
          <p className="text-xs font-mono text-surface-500 truncate">{node.host}:{node.port}{node.username ? ` (${node.username})` : ''}</p>
        </div>
        <FavoriteButton targetType="node" targetId={node.id} resourceName={node.name} size="sm" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant={nodeStatusVariant(node.status)}>{node.status}</Badge>
        <Badge variant="default">{node.connection_type}</Badge>
        {node.has_docker && <Badge variant="info">docker</Badge>}
        {node.tags.map((tag) => (
          <Badge key={tag} variant="default">{tag}</Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Tooltip content={t('nodes.copyAddress')}>
          <Button variant="ghost" size="sm" className="px-2" onClick={() => copy(`${node.host}:${node.port}`)} aria-label={t('nodes.copyAddress')}>
            <IconCopy className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content={t('nodes.openDocker')}>
          <Button variant="ghost" size="sm" className="px-2" onClick={() => navigate(`/docker?node=${node.id}`)} aria-label={t('nodes.openDocker')}>
            <IconDocker className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Button variant="secondary" size="sm" disabled={checkNode.isPending} onClick={() => checkNode.mutate(node.id, { onSuccess: () => toast('success', t('nodes.toastNodeChecked')), onError: () => toast('error', t('nodes.toastCheckFailed')) })}>
          <IconCheckCircle className="w-4 h-4 mr-1" />{t('nodes.checkNode')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onValidate(node)}>{t('nodes.validate')}</Button>
        <Button variant="secondary" size="sm" onClick={() => onExec(node)}>
          <IconCommands className="w-4 h-4 mr-1" />{t('nodes.execCommand')}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onRunScript(node)}>
          <IconScripts className="w-4 h-4 mr-1" />{t('nodes.runScript')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(node)}>{t('common.edit')}</Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(node)} className="text-red-500 hover:text-red-600">
          <IconXCircle className="w-4 h-4 mr-1" />{t('common.delete')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate(`/nodes/${node.id}`)} className="ml-auto">
          {t('common.view', 'View full page')} →
        </Button>
      </div>

      <Tabs tabs={tabs} active={active} onChange={setActive} />

      {active === 'overview' && <DrawerOverview node={node} />}
      {active === 'metrics' && <DrawerMetrics nodeId={node.id} />}
      {active === 'stats' && <DrawerStats nodeId={node.id} />}
      {active === 'history' && <DrawerHistory nodeId={node.id} />}
    </div>
  )
}

function DrawerOverview({ node }: { node: Node }) {
  const { t } = useTranslation()
  const { copy } = useCopyToClipboard()
  const navigate = useNavigate()
  const rows: [string, React.ReactNode][] = [
    [t('nodes.host'), (
      <span key="host" className="inline-flex items-center gap-2 font-mono text-xs">
        {node.host}:{node.port}
        <button onClick={() => copy(`${node.host}:${node.port}`)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 cursor-pointer"><IconCopy className="w-3 h-3 text-surface-400" /></button>
      </span>
    )],
    [t('nodes.descriptionLabel', 'Description'), (node as unknown as { description?: string | null }).description ? <span key="desc" className="text-xs">{(node as unknown as { description: string }).description}</span> : '—'],
    [t('nodes.connectionType'), <Badge key="ct" variant="info">{node.connection_type}</Badge>],
    [t('nodes.status'), <Badge key="s" variant={nodeStatusVariant(node.status)}>{node.status}</Badge>],
    [t('nodes.username', 'Username'), node.username ? <span key="u" className="inline-flex items-center gap-1 text-xs">{node.username}<button onClick={() => copy(node.username!)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 cursor-pointer"><IconCopy className="w-3 h-3 text-surface-400" /></button></span> : '—'],
    [t('nodes.dockerHost', 'Docker Host'), node.docker_host ? <span key="d" className="font-mono text-xs truncate max-w-[160px]">{node.docker_host}</span> : '—'],
    [t('nodes.hasDocker', 'Has Docker'), node.has_docker ? <Badge key="hd" variant="success">Yes</Badge> : <Badge key="hd2" variant="default">No</Badge>],
    [t('nodes.tags', 'Tags'), node.tags.length ? (
      <span key="tags" className="flex flex-wrap gap-1">
        {node.tags.map((tag) => <button key={tag} onClick={() => navigate(`/nodes?tag=${encodeURIComponent(tag)}`)} className="cursor-pointer"><Badge variant="default">{tag}</Badge></button>)}
      </span>
    ) : '—'],
    [t('nodes.created', 'Created'), new Date(node.created_at).toLocaleString()],
    [t('nodes.updated', 'Updated'), new Date(node.updated_at).toLocaleString()],
  ]
  return (
    <div className="grid grid-cols-1 gap-3">
      {rows.map(([label, value]) => (
        <div key={label} className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
          <p className="text-[11px] uppercase tracking-wide text-surface-500 dark:text-surface-400">{label}</p>
          <div className="text-sm font-medium text-surface-900 dark:text-white mt-1">{value}</div>
        </div>
      ))}
    </div>
  )
}

function DrawerMetricBar({ label, value, percent }: { label: string; value: string; percent: number }) {
  const pct = Math.min(100, Math.max(0, percent))
  return (
    <div>
      <div className="flex justify-between mb-1"><span className="text-xs text-surface-600 dark:text-surface-400">{label}</span><span className="text-xs font-medium text-surface-900 dark:text-white">{value}</span></div>
      <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-accent-500'}`} style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

function DrawerMetrics({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { data: metrics, isLoading, error, refetch } = useNodeMetrics(nodeId)
  if (isLoading) return <div className="space-y-3"><Skeleton variant="rectangular" className="w-full h-20" /><Skeleton variant="rectangular" className="w-full h-20" /><Skeleton variant="rectangular" className="w-full h-12" /></div>
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!metrics) return <EmptyState title={t('nodes.noMetrics', 'No metrics available')} />
  const cpuPct = metrics.cpu.usage_percent ?? 0
  const memPct = metrics.memory.percent ?? 0
  const diskPct = metrics.disk.percent ?? 0
  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <DrawerMetricBar label={t('nodes.cpu', 'CPU')} value={`${cpuPct.toFixed(1)}% (${metrics.cpu.cores} cores)`} percent={cpuPct} />
        <DrawerMetricBar label={t('nodes.memory', 'Memory')} value={`${formatBytes(metrics.memory.used_bytes)} / ${formatBytes(metrics.memory.total_bytes)} (${memPct.toFixed(1)}%)`} percent={memPct} />
        <DrawerMetricBar label={t('nodes.disk', 'Disk')} value={`${formatBytes(metrics.disk.used_bytes)} / ${formatBytes(metrics.disk.total_bytes)} (${diskPct.toFixed(1)}%)`} percent={diskPct} />
        <KeyValueList rows={[{ label: t('nodes.uptimeSince', 'Uptime Since'), value: metrics.uptime_since ? new Date(metrics.uptime_since).toLocaleString() : '—' }]} />
        <div className="pt-1"><p className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-2">{t('nodes.loadAverage', 'Load Average')}</p><KeyValueList rows={[{ label: '1m', value: metrics.load_average.one_min.toFixed(2) },{ label: '5m', value: metrics.load_average.five_min.toFixed(2) },{ label: '15m', value: metrics.load_average.fifteen_min.toFixed(2) }]} /></div>
      </CardContent>
    </Card>
  )
}

function DrawerStats({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { data: stats, isLoading, error, refetch } = useNodeStats(nodeId, { date_from: dateFrom || undefined, date_to: dateTo || undefined })
  if (isLoading) return <div className="grid grid-cols-2 gap-3"><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></div>
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!stats) return <EmptyState title={t('nodes.noStats', 'No stats available')} />
  return (
    <Card>
      <CardHeader>
        <div className="flex gap-2">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="flex-1 px-2 py-1.5 bg-white border border-surface-300 rounded-lg text-xs dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
          <span className="text-surface-400 self-center">—</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="flex-1 px-2 py-1.5 bg-white border border-surface-300 rounded-lg text-xs dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <StatsGrid>
          <StatCard label={t('nodes.totalExecutions')} value={stats.total} />
          <StatCard label={t('nodes.successRate')} value={formatPercent(stats.success_rate)} tone="success" />
          <StatCard label={t('nodes.avgDuration')} value={formatDurationMs(stats.avg_duration_ms)} />
          <StatCard label={t('nodes.failed')} value={stats.failed} tone="danger" />
        </StatsGrid>
      </CardContent>
    </Card>
  )
}

function DrawerHistory({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { data: statusInfinite, isLoading: sLoading, error: sError, refetch: sRefetch, fetchNextPage: sFetch, hasNextPage: sHas, isFetchingNextPage: sFetching } = useInfiniteNodeStatusHistory(nodeId, { limit: 5 })
  const { data: cmdInfinite, isLoading: cLoading, error: cError, refetch: cRefetch, fetchNextPage: cFetch, hasNextPage: cHas, isFetchingNextPage: cFetching } = useInfiniteNodeCommandHistory(nodeId, { limit: 5 })
  const retry = useRetryNodeCommand()
  const sItems = statusInfinite ? statusInfinite.pages.flatMap((p) => p.items) : []
  const cItems = cmdInfinite ? cmdInfinite.pages.flatMap((p) => p.items) : []
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><h3 className="text-sm font-semibold text-surface-900 dark:text-white">{t('nodes.statusHistory', 'Status History')}</h3></CardHeader>
        <CardContent className="p-0">
          {sLoading ? <TableSkeleton rows={3} cols={2} /> : sError ? <ErrorState error={sError} onRetry={sRefetch} /> : sItems.length === 0 ? <EmptyState title={t('nodes.emptyTitle')} /> : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800 max-h-64 overflow-y-auto">
              {sItems.map((item: { id: string; old_status?: string | null; new_status: string; source: string; changed_at: string }) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {item.old_status && <Badge variant="default">{item.old_status}</Badge>}
                    {item.old_status && <span className="text-surface-400">→</span>}
                    <Badge variant={item.new_status === 'active' ? 'success' : 'danger'}>{item.new_status}</Badge>
                  </div>
                  <div className="text-right"><p className="text-[11px] text-surface-500">{item.source}</p><p className="text-[11px] text-surface-400">{new Date(item.changed_at).toLocaleString()}</p></div>
                </div>
              ))}
            </div>
          )}
          <InfiniteScroll hasMore={!!sHas} isFetchingNextPage={sFetching} onLoadMore={() => sFetch()} />
          <div className="px-4 py-2 border-t border-surface-200 dark:border-surface-800"><Button variant="ghost" size="sm" className="w-full" onClick={() => navigate(`/nodes/${nodeId}?tab=status-history`)}>{t('common.viewAll', 'View all')} →</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><h3 className="text-sm font-semibold text-surface-900 dark:text-white">{t('nodes.cmdHistory', 'Command History')}</h3></CardHeader>
        <CardContent className="p-0">
          {cLoading ? <TableSkeleton rows={3} cols={2} /> : cError ? <ErrorState error={cError} onRetry={cRefetch} /> : cItems.length === 0 ? <EmptyState title={t('nodes.noCmdHistory', 'No command history')} /> : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800 max-h-64 overflow-y-auto">
              {cItems.map((item: { id: string; command_fingerprint: string; created_at: string; exit_code: number }) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0 flex-1"><p className="text-xs font-mono text-surface-900 dark:text-white truncate">{item.command_fingerprint}</p><p className="text-[11px] text-surface-500">{new Date(item.created_at).toLocaleString()}</p><Badge variant={item.exit_code === 0 ? 'success' : 'danger'}>exit {item.exit_code}</Badge></div>
                  <div className="ml-2">
                    {item.exit_code !== 0 && <Button variant="ghost" size="sm" disabled={retry.isPending} onClick={() => retry.mutate({ executionId: item.id }, { onSuccess: () => toast('success', t('nodes.toastRetried')), onError: () => toast('error', t('nodes.toastRetryFailed')) })}>{t('common.retry')}</Button>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <InfiniteScroll hasMore={!!cHas} isFetchingNextPage={cFetching} onLoadMore={() => cFetch()} />
          <div className="px-4 py-2 border-t border-surface-200 dark:border-surface-800"><Button variant="ghost" size="sm" className="w-full" onClick={() => navigate(`/nodes/${nodeId}?tab=command-history`)}>{t('common.viewAll', 'View all')} →</Button></div>
        </CardContent>
      </Card>
    </div>
  )
}
