// oxlint-disable react/set-state-in-effect, react/exhaustive-effect-dependencies, react/no-array-index-key, react-hooks/exhaustive-deps
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '../../ui/Card'
import { EmptyState } from '../../ui/EmptyState'
import { ErrorState } from '../../ui/ErrorState'
import { TableSkeleton } from '../../ui/Skeleton'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { InfiniteScroll } from '../../ui/InfiniteScroll'
import { useInfiniteNodeStatusHistory, useInfiniteNodeCommandHistory, useRetryNodeCommand } from '../../../hooks/useNodes'
import { useToast } from '../../ui/useToast'

export function DrawerHistory({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
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
        </CardContent>
      </Card>
    </div>
  )
}