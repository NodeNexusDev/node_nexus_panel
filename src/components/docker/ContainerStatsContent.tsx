import { useTranslation } from 'react-i18next'
import { FormSkeleton } from '../ui/Skeleton'
import { useDockerContainerStats } from '../../hooks/useDocker'

export function ContainerStatsContent({ nodeId, containerId }: { nodeId: string; containerId: string }) {
  const { t } = useTranslation()
  const { data: statsRaw, isLoading } = useDockerContainerStats(nodeId, containerId)
  if (isLoading) return <FormSkeleton fields={4} />
  if (!statsRaw) return <p className="text-sm text-surface-500 text-center py-4">{t('docker.noStats')}</p>
  const stats = statsRaw as unknown as { Container: string; Name: string; CPUPerc: string; MemUsage: string; MemPerc: string; NetIO: string; BlockIO: string; MemLimit?: string | null; PIDs?: string | null }
  return (
    <div className="space-y-3">
      {( [
        [t('docker.container'), stats.Container],
        [t('docker.name'), stats.Name],
        [t('docker.cpu'), stats.CPUPerc],
        [t('docker.memory'), `${stats.MemUsage} (${stats.MemPerc})`],
        [t('docker.netIO'), stats.NetIO],
        [t('docker.blockIO'), stats.BlockIO],
        [t('docker.memoryLimit'), stats.MemLimit || '—'],
        [t('docker.pids'), stats.PIDs || '—'],
      ] as Array<[string, string]>).map(([key, value]) => (
        <div key={key} className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800 last:border-0">
          <span className="text-sm text-surface-600 dark:text-surface-400">{key}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white">{value}</span>
        </div>
      ))}
    </div>
  )
}
