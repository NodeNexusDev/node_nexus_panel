import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { TableSkeleton } from '../components/ui/Skeleton'
import { PageHeader } from '../components/ui/PageHeader'
import { IconAudit } from '../components/ui/Icons'
import { useAuditLogs, useClearAudit, useExportAudit } from '../hooks/useAudit'
import { useNodes } from '../hooks/useNodes'
import { useToast } from '../components/ui/useToast'
import { activityVariant } from '../lib/variants'

const COMMON_ACTIONS = [
  'node.create',
  'node.update',
  'node.delete',
  'node.check',
  'command.create',
  'command.execute',
  'command.delete',
  'script.create',
  'script.execute',
  'script.schedule',
  'api_key.create',
  'api_key.revoke',
  'tag.rename',
  'tag.delete',
  'config.export',
  'config.import',
  'favorite.add',
  'favorite.remove',
]

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
  const [page, setPage] = useState(1)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json')
  const pageSize = 20

  const { data, isLoading } = useAuditLogs({
    page,
    size: pageSize,
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
    setPage(1)
  }

  const handleExport = () => {
    exportAudit.mutate({
      from_date: dateFrom || undefined,
      to_date: dateTo || undefined,
      action: actionFilter || undefined,
      node_id: nodeFilter || undefined,
      fmt: exportFormat,
    }, {
      onSuccess: (data) => {
        let content: string
        let mimeType: string
        let extension: string

        if (exportFormat === 'csv') {
          const record = data as { csv?: string; items?: Record<string, unknown>[] }
          if (typeof record?.csv === 'string') {
            content = record.csv
          } else if (Array.isArray(record?.items)) {
            const headers = ['id', 'action', 'node_id', 'user', 'details', 'created_at']
            const rows = record.items.map((log) => headers.map((h) => `"${String(log[h] ?? '').replace(/"/g, '""')}"`).join(','))
            content = [headers.join(','), ...rows].join('\n')
          } else {
            content = typeof data === 'string' ? data : JSON.stringify(data ?? {}, null, 2)
          }
          mimeType = 'text/csv'
          extension = 'csv'
        } else {
          content = typeof data === 'string' ? data : JSON.stringify(data ?? {}, null, 2)
          mimeType = 'application/json'
          extension = 'json'
        }

        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.${extension}`
        a.click()
        URL.revokeObjectURL(url)
        toast('success', t('audit.toastExported'))
      },
      onError: () => toast('error', t('audit.toastExportFailed')),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('audit.title')}
        description={t('audit.description')}
        actions={
          <>
            <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')} className="px-3 py-1 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
            <Button variant="ghost" onClick={handleExport} disabled={exportAudit.isPending}>
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
          </>
        }
      />

      <Card className="stagger-item">
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={nodeFilter} onChange={(e) => setNodeFilter(e.target.value)} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
              <option value="">{t('audit.allNodes', 'All nodes')}</option>
              {nodes.map((n) => (<option key={n.id} value={n.id}>{n.name}</option>))}
            </select>
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
              <option value="">{t('audit.allActions', 'All actions')}</option>
              {COMMON_ACTIONS.map((action) => (<option key={action} value={action}>{action}</option>))}
            </select>
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

      <Card hover className="stagger-item">
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
                        <Badge variant={activityVariant(log.action)}>{log.action}</Badge>
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
          {data && data.total > pageSize && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-surface-200 dark:border-surface-800">
              <p className="text-sm text-surface-500">
                {t('audit.showing', 'Showing')} {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.total)} {t('audit.of', 'of')} {data.total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>{t('common.previous', 'Previous')}</Button>
                <span className="text-sm text-surface-500">{page} / {Math.ceil(data.total / pageSize)}</span>
                <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(Math.ceil(data.total / pageSize), p + 1))} disabled={page >= Math.ceil(data.total / pageSize)}>{t('common.next', 'Next')}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
