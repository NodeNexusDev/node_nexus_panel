import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { ErrorState } from '../ui/ErrorState'
import { TableSkeleton } from '../ui/Skeleton'
import { useDockerSystemInfo, useDockerSystemDf } from '../../hooks/useDocker'

export function SystemTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { data: systemInfo, isLoading: infoLoading, error: infoError, refetch: refetchInfo } = useDockerSystemInfo(nodeId)
  const { data: diskUsage, isLoading: dfLoading, error: dfError, refetch: refetchDf } = useDockerSystemDf(nodeId)

  if (infoLoading || dfLoading) {
    return (
      <div className="space-y-4 p-4" aria-busy="true" aria-live="polite">
        <TableSkeleton rows={3} cols={4} />
        <TableSkeleton rows={5} cols={5} />
      </div>
    )
  }

  if (infoError) return <ErrorState error={infoError} onRetry={refetchInfo} title={t('docker.failedToLoadSystemInfo', 'Failed to load system info')} />
  if (dfError) return <ErrorState error={dfError} onRetry={refetchDf} title={t('docker.failedToLoadDiskUsage', 'Failed to load disk usage')} />

  const infoCards = systemInfo ? [
    { label: t('docker.serverVersion', 'Server Version'), value: systemInfo.server_version || '—' },
    { label: t('docker.os', 'OS'), value: systemInfo.operating_system || '—' },
    { label: t('docker.architecture', 'Architecture'), value: systemInfo.architecture || '—' },
    { label: t('docker.totalMemory', 'Total Memory'), value: systemInfo.total_memory || '—' },
    { label: t('docker.cpus', 'CPUs'), value: systemInfo.cpus ?? '—' },
    { label: t('docker.storageDriver', 'Storage Driver'), value: systemInfo.storage_driver || '—' },
    { label: t('docker.containersRunning', 'Running'), value: systemInfo.containers_running ?? 0 },
    { label: t('docker.containersStopped', 'Stopped'), value: systemInfo.containers_stopped ?? 0 },
    { label: t('docker.images', 'Images'), value: systemInfo.images ?? 0 },
  ] : []

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>{t('docker.systemInfo', 'System Info')}</CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {infoCards.map((item) => (
              <div key={item.label} className="flex flex-col">
                <span className="text-xs text-surface-500 dark:text-surface-400">{item.label}</span>
                <span className="text-sm font-medium text-surface-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {diskUsage && diskUsage.length > 0 && (
        <Card>
          <CardHeader>{t('docker.diskUsage', 'Disk Usage')}</CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.type', 'Type')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('common.total', 'Total')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.activeSize', 'Active Size')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.reclaimableSize', 'Reclaimable')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.reclaimablePercent', 'Reclaimable %')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {diskUsage.map((item) => (
                  <tr key={item.type}>
                    <td className="px-6 py-3 text-sm font-medium text-surface-900 dark:text-white">{item.type}</td>
                    <td className="px-6 py-3 text-sm text-surface-600 dark:text-surface-300">{item.total_count ?? 0}</td>
                    <td className="px-6 py-3 text-sm text-surface-600 dark:text-surface-300">{item.active_size || '—'}</td>
                    <td className="px-6 py-3 text-sm text-surface-600 dark:text-surface-300">{item.reclaimable_size || '—'}</td>
                    <td className="px-6 py-3 text-sm text-surface-600 dark:text-surface-300">{item.reclaimable_percent || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
