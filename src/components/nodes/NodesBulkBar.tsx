import { Button } from '../ui/Button'
import { useTranslation } from 'react-i18next'
import { useToast } from '../ui/useToast'
import type { useBulkCheck, useBulkMetrics, useBulkValidateCredentials } from '../../hooks/useNodes'

type Props = {
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  setShowBulkExec: (v: boolean) => void
  setShowBulkScript: (v: boolean) => void
  setShowBulkMetrics: (v: boolean) => void
  setBulkMetricsResult: (v: unknown | null) => void
  setShowBulkUpdate: (v: boolean) => void
  setBulkUpdateChanges: (v: { name: string; host: string; port: string; description: string; username: string; docker_host: string; has_docker: boolean | undefined; tags: string }) => void
  setShowBulkDelete: (v: boolean) => void
  bulkCheck: ReturnType<typeof useBulkCheck>
  bulkMetrics: ReturnType<typeof useBulkMetrics>
  bulkValidateCreds: ReturnType<typeof useBulkValidateCredentials>
}

export function NodesBulkBar({ selectedIds, setSelectedIds, setShowBulkExec, setShowBulkScript, setShowBulkMetrics, setBulkMetricsResult, setShowBulkUpdate, setBulkUpdateChanges, setShowBulkDelete, bulkCheck, bulkMetrics, bulkValidateCreds }: Props) {
  const { t } = useTranslation()
  // toast handled in parent via props? we need toast here — import directly
  // to avoid prop drilling, we use useToast inside
  // but parent already has toast, we can import here as well
  if (selectedIds.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-accent-50 dark:bg-accent-900/20 border-b border-accent-200 dark:border-accent-800">
      <span className="text-sm font-medium text-accent-700 dark:text-accent-300">{t('nodes.selected', { count: selectedIds.length })}</span>
      <Button variant="ghost" size="sm" onClick={() => setShowBulkExec(true)}>{t('nodes.bulkExec', 'Run Commands')}</Button>
      <Button variant="ghost" size="sm" onClick={() => setShowBulkScript(true)}>{t('nodes.bulkScript', 'Run Scripts')}</Button>
      <BulkCheckButton selectedIds={selectedIds} setSelectedIds={setSelectedIds} bulkCheck={bulkCheck} />
      <BulkMetricsButton selectedIds={selectedIds} setShowBulkMetrics={setShowBulkMetrics} setBulkMetricsResult={setBulkMetricsResult} bulkMetrics={bulkMetrics} />
      <Button variant="ghost" size="sm" onClick={() => { setShowBulkUpdate(true); setBulkUpdateChanges({ name: '', host: '', port: '', description: '', username: '', docker_host: '', has_docker: undefined, tags: '' }) }}>{t('nodes.bulkUpdate', 'Bulk Update')}</Button>
      <BulkValidateButton selectedIds={selectedIds} setSelectedIds={setSelectedIds} bulkValidateCreds={bulkValidateCreds} />
      <Button variant="ghost" size="sm" onClick={() => setShowBulkDelete(true)} className="text-red-500">{t('nodes.bulkDelete', 'Bulk Delete')}</Button>
      <button onClick={() => setSelectedIds([])} className="ml-auto text-xs text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 cursor-pointer">{t('nodes.clearSelection', 'Clear')}</button>
    </div>
  )
}

function BulkCheckButton({ selectedIds, setSelectedIds, bulkCheck }: { selectedIds: string[]; setSelectedIds: (ids: string[]) => void; bulkCheck: ReturnType<typeof useBulkCheck> }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  return (
    <Button variant="ghost" size="sm" disabled={bulkCheck.isPending} onClick={() => {
      bulkCheck.mutate(selectedIds, {
        onSuccess: (data: unknown) => { const d = data as { failed?: number; succeeded?: number }; if (d.failed && d.failed > 0) toast('warning', t('nodes.toastBulkCheckDone') + t('common.failedSuffix', { count: d.failed })); else toast('success', t('nodes.toastBulkCheckDone')); setSelectedIds([]) },
        onError: () => toast('error', t('nodes.toastBulkCheckFailed')),
      })
    }}>{bulkCheck.isPending ? t('common.loading') : t('nodes.bulkCheck')}</Button>
  )
}

function BulkMetricsButton({ selectedIds, setShowBulkMetrics, setBulkMetricsResult, bulkMetrics }: { selectedIds: string[]; setShowBulkMetrics: (v: boolean) => void; setBulkMetricsResult: (v: unknown | null) => void; bulkMetrics: ReturnType<typeof useBulkMetrics> }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  return (
    <Button variant="ghost" size="sm" onClick={() => { setShowBulkMetrics(true); setBulkMetricsResult(null); bulkMetrics.mutate(selectedIds, { onSuccess: (data) => { setBulkMetricsResult(data); const d = data as { failed?: number }; if (d.failed && d.failed > 0) toast('warning', t('nodes.toastBulkMetricsFailed', 'Failed to fetch metrics') + t('common.failedSuffix', { count: d.failed })) }, onError: () => toast('error', t('nodes.toastBulkMetricsFailed', 'Failed to fetch metrics')), }) }} disabled={bulkMetrics.isPending}>{bulkMetrics.isPending ? t('common.loading') : t('nodes.bulkMetrics', 'Bulk Metrics')}</Button>
  )
}

function BulkValidateButton({ selectedIds, setSelectedIds, bulkValidateCreds }: { selectedIds: string[]; setSelectedIds: (ids: string[]) => void; bulkValidateCreds: ReturnType<typeof useBulkValidateCredentials> }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  return (
    <Button variant="ghost" size="sm" disabled={bulkValidateCreds.isPending} onClick={() => { bulkValidateCreds.mutate({ ids: selectedIds }, { onSuccess: (data: unknown) => { const d = data as { succeeded: number; failed: number }; if (d.failed > 0) toast('warning', t('nodes.toastBulkValidateDone', { succeeded: d.succeeded, failed: d.failed })); else toast('success', t('nodes.toastBulkValidateDone', { succeeded: d.succeeded, failed: d.failed })); setSelectedIds([]) }, onError: () => toast('error', t('nodes.toastBulkValidateFailed', 'Failed to validate credentials')), }) }}>{bulkValidateCreds.isPending ? t('common.loading') : t('nodes.bulkValidate', 'Bulk Validate')}</Button>
  )
}
