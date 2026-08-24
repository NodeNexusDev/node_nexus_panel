import { useTranslation } from 'react-i18next'
import { Spinner } from '../ui/Spinner'
import { useInspectVolume } from '../../hooks/useDocker'

export function VolumeInspectContent({ nodeId, volumeName }: { nodeId: string; volumeName: string }) {
  const { t } = useTranslation()
  const { data: volume, isLoading } = useInspectVolume(nodeId, volumeName)
  if (isLoading) return <Spinner size="lg" className="mx-auto my-8" />
  if (!volume) return <p className="text-sm text-surface-500 text-center py-4">{t('docker.noData')}</p>
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="space-y-2">
        <div className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800">
          <span className="text-sm text-surface-600 dark:text-surface-400">{t('docker.name')}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white font-mono">{volume.name || '—'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800">
          <span className="text-sm text-surface-600 dark:text-surface-400">{t('docker.driver')}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white font-mono">{volume.driver || '—'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800">
          <span className="text-sm text-surface-600 dark:text-surface-400">{t('docker.mountpoint')}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white font-mono text-right max-w-[60%] truncate">{volume.mountpoint || '—'}</span>
        </div>
      </div>
      {volume.labels && Object.keys(volume.labels).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase mb-1">{t('docker.labels')}</p>
          <pre className="text-xs font-mono text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800/50 rounded p-3 overflow-x-auto">{JSON.stringify(volume.labels, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
