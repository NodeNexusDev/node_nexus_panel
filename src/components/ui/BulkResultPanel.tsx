import { useTranslation } from 'react-i18next'
import { TableSkeleton } from './Skeleton'

export interface BulkResultLike {
  total: number
  succeeded: number
  failed: number
  results?: unknown[] | null
}

interface BulkItemView {
  key: string
  label: string
  status: string
  detail?: string | null
}

const MAX_DETAIL_CHARS = 2000

function stringifyDetail(value: unknown): string | null {
  if (typeof value === 'string') return value || null
  if (value === null || value === undefined) return null
  try {
    const text = JSON.stringify(value, null, 2) ?? ''
    return text.length > MAX_DETAIL_CHARS ? text.slice(0, MAX_DETAIL_CHARS) + '…' : text || null
  } catch {
    return String(value)
  }
}

function defaultView(item: unknown, idx: number): BulkItemView {
  const r = (item ?? {}) as Record<string, unknown>
  const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined)
  const label =
    str(r.node_name) ??
    str(r.container_id) ??
    str(r.image) ??
    str(r.network_id) ??
    str(r.volume_name) ??
    str(r.node_id) ??
    str(r.service) ??
    str(r.name) ??
    str(r.pack_id) ??
    str(r.entity_id) ??
    `result-${idx}`
  const status = str(r.status) ?? 'unknown'
  // Payload lives in type-specific fields depending on the bulk verb:
  // output (generic), logs, stdout/stderr/exit_code (exec), stats/data (objects).
  const stdout = str(r.stdout)
  const stderr = str(r.stderr)
  const exitCode = typeof r.exit_code === 'number' ? r.exit_code : undefined
  const execBlock =
    stdout !== undefined || stderr !== undefined || exitCode !== undefined
      ? [
          stdout !== undefined ? `stdout: ${stdout}` : null,
          stderr !== undefined ? `stderr: ${stderr}` : null,
          exitCode !== undefined ? `exit_code: ${exitCode}` : null,
        ]
          .filter((x): x is string => x !== null)
          .join('\n') || null
      : null
  const detail =
    str(r.output) ??
    str(r.logs) ??
    execBlock ??
    stringifyDetail(r.stats) ??
    stringifyDetail(r.data) ??
    str(r.error) ??
    null
  return { key: `${label}:${status}:${idx}`, label, status, detail }
}

interface BulkResultPanelProps {
  result: BulkResultLike | null
  isLoading?: boolean
  title?: string
  maxHeightClass?: string
  toView?: (item: unknown, idx: number) => BulkItemView
}

/** Shared BulkResult (200/207/422) renderer: totals + per-item status list. */
export function BulkResultPanel({
  result,
  isLoading = false,
  title,
  maxHeightClass = 'max-h-64',
  toView = defaultView,
}: BulkResultPanelProps) {
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

      <div className={`${maxHeightClass} overflow-y-auto space-y-2`}>
        {(result.results ?? []).map((r, idx) => {
          const item = toView(r, idx)
          return (
            <div
              key={item.key}
              className={`p-3 rounded-lg border text-xs font-mono ${
                item.status === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{item.label}</span>
                <span className={item.status === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                  {item.status}
                </span>
              </div>
              {item.detail && (
                <pre className="whitespace-pre-wrap break-all text-surface-700 dark:text-surface-300">
                  {item.detail}
                </pre>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
