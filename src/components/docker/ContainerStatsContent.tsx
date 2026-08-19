import { useTranslation } from 'react-i18next'
import { Spinner } from '../ui/Spinner'
import { useDockerContainerStats } from '../../hooks/useDocker'

export function ContainerStatsContent({ nodeId, containerId }: { nodeId: string; containerId: string }) {
  const { t } = useTranslation()
  const { data: stats, isLoading } = useDockerContainerStats(nodeId, containerId)
  if (isLoading) return <Spinner size="lg" className="mx-auto my-8" />
  if (!stats) return <p className="text-sm text-surface-500 text-center py-4">{t('docker.noStats')}</p>
  return (
    <div className="space-y-3">
      {[
        [t('docker.container'), stats.Container],
        [t('docker.name'), stats.Name],
        [t('docker.cpu'), stats.CPUPerc],
        [t('docker.memory'), `${stats.MemUsage} (${stats.MemPerc})`],
        [t('docker.netIO'), stats.NetIO],
        [t('docker.blockIO'), stats.BlockIO],
        [t('docker.memoryLimit'), stats.MemLimit || '—'],
        [t('docker.pids'), stats.PIDs || '—'],
      ].map(([key, value]) => (
        <div key={key} className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800 last:border-0">
          <span className="text-sm text-surface-600 dark:text-surface-400">{key}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white">{value}</span>
        </div>
      ))}
    </div>
  )
}
