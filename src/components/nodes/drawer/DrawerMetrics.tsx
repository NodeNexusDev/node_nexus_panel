// oxlint-disable react/set-state-in-effect, react/exhaustive-effect-dependencies, react/no-array-index-key, react-hooks/exhaustive-deps
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../../ui/Card'
import { EmptyState } from '../../ui/EmptyState'
import { ErrorState } from '../../ui/ErrorState'
import { Skeleton } from '../../ui/Skeleton'
import { KeyValueList } from '../../ui/KeyValueList'
import { formatBytes } from '../../../lib/format'
import { useNodeMetrics } from '../../../hooks/useNodes'
import { DrawerMetricBar } from './DrawerMetricBar'

export function DrawerMetrics({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { data: metrics, isLoading, error, refetch } = useNodeMetrics(nodeId)
  if (isLoading) return <div className="space-y-3"><Skeleton variant="rectangular" className="w-full h-20" /><Skeleton variant="rectangular" className="w-full h-20" /><Skeleton variant="rectangular" className="w-full h-12" /></div>
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!metrics) return <EmptyState title={t('nodes.noMetrics', 'No metrics available')} />
  const cpuPct = metrics.cpu?.usage_percent ?? 0
  const memPct = metrics.memory?.percent ?? 0
  const diskPct = metrics.disk?.percent ?? 0
  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <DrawerMetricBar label={t('nodes.cpu', 'CPU')} value={`${cpuPct.toFixed(1)}% (${metrics.cpu?.cores ?? 0} cores)`} percent={cpuPct} />
        <DrawerMetricBar label={t('nodes.memory', 'Memory')} value={`${formatBytes(metrics.memory?.used_bytes)} / ${formatBytes(metrics.memory?.total_bytes)} (${memPct.toFixed(1)}%)`} percent={memPct} />
        <DrawerMetricBar label={t('nodes.disk', 'Disk')} value={`${formatBytes(metrics.disk?.used_bytes)} / ${formatBytes(metrics.disk?.total_bytes)} (${diskPct.toFixed(1)}%)`} percent={diskPct} />
        <KeyValueList rows={[{ label: t('nodes.uptimeSince', 'Uptime Since'), value: metrics.uptime_since ? new Date(metrics.uptime_since).toLocaleString() : '—' }]} />
        <div className="pt-1"><p className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-2">{t('nodes.loadAverage', 'Load Average')}</p><KeyValueList rows={[{ label: t('nodes.load1m'), value: (metrics.load_average?.one_min ?? 0).toFixed(2) },{ label: t('nodes.load5m'), value: (metrics.load_average?.five_min ?? 0).toFixed(2) },{ label: t('nodes.load15m'), value: (metrics.load_average?.fifteen_min ?? 0).toFixed(2) }]} /></div>
      </CardContent>
    </Card>
  )
}