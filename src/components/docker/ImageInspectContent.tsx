import { useTranslation } from 'react-i18next'
import { Spinner } from '../ui/Spinner'
import { useDockerImageInspect } from '../../hooks/useDocker'
import { formatBytes } from '../../lib/format'

export function ImageInspectContent({ nodeId, imageId }: { nodeId: string; imageId: string }) {
  const { t } = useTranslation()
  const { data: inspect, isLoading } = useDockerImageInspect(nodeId, imageId)
  if (isLoading) return <Spinner size="lg" className="mx-auto my-8" />
  if (!inspect) return <p className="text-sm text-surface-500 text-center py-4">{t('docker.noData')}</p>
  const rows: [string, string][] = [
    [t('docker.id'), inspect.id?.slice(0, 12) || '—'],
    [t('docker.architecture', 'Architecture'), inspect.architecture || '—'],
    [t('docker.os', 'OS'), inspect.os || '—'],
    [t('docker.size'), formatBytes(inspect.size)],
    [t('docker.created'), inspect.created ? new Date(inspect.created).toLocaleString() : '—'],
    [t('docker.tags', 'Tags'), inspect.repo_tags?.join(', ') || '—'],
  ]
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {rows.map(([key, value]) => (
        <div key={key} className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800 last:border-0">
          <span className="text-sm text-surface-600 dark:text-surface-400">{key}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white text-right max-w-[60%] truncate">{value}</span>
        </div>
      ))}
    </div>
  )
}
