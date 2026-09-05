import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { ErrorState } from '../ui/ErrorState'
import { TableSkeleton } from '../ui/Skeleton'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/useToast'
import { useDockerSystemInfo, useDockerSystemDf, useDockerSystemVersion, usePruneSystem, usePruneNetworks, usePruneImages, usePruneVolumes, usePruneContainers } from '../../hooks/useDocker'

export function SystemTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: systemInfo, isLoading: infoLoading, error: infoError, refetch: refetchInfo } = useDockerSystemInfo(nodeId)
  const { data: diskUsage, isLoading: dfLoading, error: dfError, refetch: refetchDf } = useDockerSystemDf(nodeId)
  const { data: versionInfo } = useDockerSystemVersion(nodeId)
  const pruneSystem = usePruneSystem()
  const pruneNetworks = usePruneNetworks()
  const pruneImages = usePruneImages()
  const pruneVolumes = usePruneVolumes()
  const pruneContainers = usePruneContainers()
  const [showPruneConfirm, setShowPruneConfirm] = useState<null | 'system' | 'networks' | 'images' | 'volumes' | 'containers'>(null)

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

  const handlePrune = (type: 'system' | 'networks' | 'images' | 'volumes' | 'containers') => {
    const map = {
      system: pruneSystem,
      networks: pruneNetworks,
      images: pruneImages,
      volumes: pruneVolumes,
      containers: pruneContainers,
    } as const
    const mut = map[type]
    mut.mutate(nodeId, {
      onSuccess: () => { toast('success', t('docker.toastPruneDone', 'Pruned')); setShowPruneConfirm(null) },
      onError: () => toast('error', t('docker.toastPruneFailed', 'Prune failed')),
    })
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <span>{t('docker.systemInfo', 'System Info')}</span>
            {versionInfo && <span className="text-xs text-surface-500">API {versionInfo.api_version} — {versionInfo.version}</span>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {infoCards.map((item) => (
              <div key={item.label} className="flex flex-col">
                <span className="text-xs text-surface-500 dark:text-surface-400">{item.label}</span>
                <span className="text-sm font-medium text-surface-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
          {versionInfo && (
            <div className="mt-4 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
              <p className="text-xs text-surface-500">Docker version {versionInfo.version} (API {versionInfo.api_version})</p>
            </div>
          )}
        </CardContent>
      </Card>

      {diskUsage && diskUsage.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <span>{t('docker.diskUsage', 'Disk Usage')}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowPruneConfirm('system')}>{t('docker.pruneSystem', 'Prune System')}</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowPruneConfirm('images')}>{t('docker.pruneImages')}</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowPruneConfirm('containers')}>{t('docker.pruneContainers')}</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowPruneConfirm('networks')}>{t('docker.pruneNetworks', 'Prune Networks')}</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowPruneConfirm('volumes')}>{t('docker.pruneVolumes')}</Button>
              </div>
            </div>
          </CardHeader>
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

      <Modal isOpen={!!showPruneConfirm} onClose={() => setShowPruneConfirm(null)} title={t('docker.prune', 'Prune')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.confirmPrune', 'Remove unused data? This cannot be undone.')}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowPruneConfirm(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => showPruneConfirm && handlePrune(showPruneConfirm)}>{t('common.confirm', 'Confirm')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
