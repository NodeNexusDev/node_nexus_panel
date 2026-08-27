import { useTranslation } from 'react-i18next'
import { FormSkeleton } from '../ui/Skeleton'
import { useDockerContainerInspect } from '../../hooks/useDocker'

export function ContainerInspectContent({ nodeId, containerId }: { nodeId: string; containerId: string }) {
  const { t } = useTranslation()
  const { data: inspect, isLoading } = useDockerContainerInspect(nodeId, containerId)
  if (isLoading) return <FormSkeleton fields={4} />
  if (!inspect) return <p className="text-sm text-surface-500 text-center py-4">{t('docker.noData')}</p>
  const rows: [string, string][] = [
    [t('docker.id'), inspect.Id?.slice(0, 12) || '—'],
    [t('docker.name'), inspect.Name?.split('/').pop() || '—'],
    [t('docker.status'), inspect.State?.status || '—'],
    [t('docker.running'), inspect.State?.running ? t('docker.yes') : t('docker.no')],
    [t('docker.exitCode'), String(inspect.State?.exit_code ?? '—')],
    [t('docker.command'), inspect.Config?.cmd?.join(' ') || '—'],
    [t('docker.hostname'), inspect.Config?.hostname || '—'],
    [t('docker.image'), inspect.Config?.image || '—'],
  ]
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {rows.map(([key, value]) => (
        <div key={key} className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800 last:border-0">
          <span className="text-sm text-surface-600 dark:text-surface-400">{key}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white font-mono text-right max-w-[60%] truncate">{value}</span>
        </div>
      ))}
      {inspect.NetworkSettings && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-surface-500 uppercase mb-1">{t('docker.networkSettings', 'Network Settings')}</p>
          <pre className="text-xs font-mono text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800/50 rounded p-3 overflow-x-auto">{JSON.stringify(inspect.NetworkSettings, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
