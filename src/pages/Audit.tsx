import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { TableSkeleton } from '../components/ui/Skeleton'
import { IconAudit } from '../components/ui/Icons'
import { useAuditLogs, useClearAudit, useExportAudit } from '../hooks/useAudit'
import { useNodes } from '../hooks/useNodes'
import { useToast } from '../components/ui/useToast'

function actionVariant(action: string) {
  if (action.includes('create') || action.includes('add')) return 'success'
  if (action.includes('delete') || action.includes('remove')) return 'danger'
  if (action.includes('update') || action.includes('edit')) return 'warning'
  return 'default'
}

export function Audit() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: nodesData } = useNodes({ size: 100 })
  const nodes = nodesData?.items || []

  const [nodeFilter, setNodeFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data, isLoading } = useAuditLogs({
    size: 50,
    node_id: nodeFilter || undefined,
    action: actionFilter || undefined,
    user: userFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  })

  const clearAudit = useClearAudit()
  const exportAudit = useExportAudit()
  const logs = data?.items || []

  const hasFilters = nodeFilter || actionFilter || userFilter || dateFrom || dateTo

  const clearFilters = () => {
    setNodeFilter('')
    setActionFilter('')
    setUserFilter('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('audit.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{t('audit.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              exportAudit.mutate({
                from_date: dateFrom || undefined,
                to_date: dateTo || undefined,
                action: actionFilter || undefined,
                node_id: nodeFilter || undefined,
              }, {
                onSuccess: () => toast('success', t('audit.toastExported')),
                onError: () => toast('error', t('audit.toastExportFailed')),
              })
            }}
            disabled={exportAudit.isPending}
          >
            {t('audit.export')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              clearAudit.mutate(undefined, {
                onSuccess: () => toast('success', t('audit.toastCleared')),
                onError: () => toast('error', t('audit.toastClearFailed')),
              })
            }}
            disabled={clearAudit.isPending}
            className="text-red-500 hover:text-red-600"
          >
            {t('audit.clear')}
          </Button>
        </div>
      </div>

      <Card className="stagger-item">
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={nodeFilter} onChange={(e) => setNodeFilter(e.target.value)} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
              <option value="">{t('audit.allNodes', 'All nodes')}</option>
              {nodes.map((n) => (<option key={n.id} value={n.id}>{n.name}</option>))}
            </select>
            <input type="text" placeholder={t('audit.actionPlaceholder', 'Filter by action')} value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500" />
            <input type="text" placeholder={t('audit.userPlaceholder', 'Filter by user')} value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500" />
            <div className="flex items-center gap-2">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="flex-1 px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
              <span className="text-surface-400">—</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="flex-1 px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>{t('audit.clearFilters', 'Clear filters')}</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="stagger-item">
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={10} cols={5} />
          ) : logs.length === 0 ? (
            <EmptyState
              icon={<IconAudit className="w-10 h-10" />}
              title={hasFilters ? t('audit.noResults', 'No results found') : t('audit.emptyTitle')}
              description={hasFilters ? t('audit.noResultsDesc', 'Try adjusting your filters') : t('audit.emptyDesc')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-zebra">
                <thead className="table-sticky">
                  <tr className="border-b border-surface-200 dark:border-surface-800">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('audit.action')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('audit.resource')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('audit.user')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('audit.details')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('audit.time')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                  {logs.map((log, i) => (
                    <tr key={log.id} className="table-row-hover stagger-item" style={{ animationDelay: `${i * 30}ms` }}>
                      <td className="px-6 py-4">
                        <Badge variant={actionVariant(log.action)}>{log.action}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">
                        <span className="font-mono text-xs">{log.node_id || '—'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{log.user || '—'}</td>
                      <td className="px-6 py-4 text-xs text-surface-500 max-w-xs truncate">{log.details || '—'}</td>
                      <td className="px-6 py-4 text-xs text-surface-500">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
