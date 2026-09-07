// oxlint-disable react/set-state-in-effect, react/exhaustive-effect-dependencies, react/no-array-index-key, react-hooks/exhaustive-deps
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '../../ui/Card'
import { ErrorState } from '../../ui/ErrorState'
import { StatCardSkeleton } from '../../ui/Skeleton'
import { EmptyState } from '../../ui/EmptyState'
import { StatCard, StatsGrid } from '../../ui/StatCard'
import { formatPercent, formatDurationMs } from '../../../lib/format'
import { useNodeStats } from '../../../hooks/useNodes'

export function DrawerStats({ nodeId }: { nodeId: string }) {
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