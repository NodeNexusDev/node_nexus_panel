import { useTranslation } from 'react-i18next'
import { TableSkeleton } from '../ui/Skeleton'
import type { BulkDockerResponse } from '../../api/types'

interface BulkResultContentProps {
  result: BulkDockerResponse | null
  isLoading: boolean
  title?: string
}

export function BulkResultContent({ result, isLoading, title }: BulkResultContentProps) {
  const { t } = useTranslation()

  if (isLoading) return <TableSkeleton rows={5} cols={3} />

  if (!result) return null

  return (
    <div className="space-y-4">
      {title && (
        <p className="text-sm text-surface-600 dark:text-surface-300">{title}</p>
      )}

      <div className="flex items-center gap-4 text-sm">
        <span className="text-surface-500">{t('common.total')}: {result.total}</span>
        <span className="text-green-600 dark:text-green-400">{t('common.succeeded')}: {result.succeeded}</span>
        {result.failed > 0 && (
          <span className="text-red-600 dark:text-red-400">{t('common.failed')}: {result.failed}</span>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2">
        {result.results.map((r) => (
          <div
            key={r.node_id}
            className={`p-3 rounded-lg border text-xs font-mono ${
              r.status === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{r.node_name}</span>
              <span className={r.status === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                {r.status}
              </span>
            </div>
            {(r.output || r.error) && (
              <pre className="whitespace-pre-wrap break-all text-surface-700 dark:text-surface-300">
                {r.output || r.error}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
