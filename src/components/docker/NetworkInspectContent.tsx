import { useTranslation } from 'react-i18next'
import { FormSkeleton } from '../ui/Skeleton'
import { useInspectNetwork } from '../../hooks/useDocker'

export function NetworkInspectContent({ nodeId, networkId }: { nodeId: string; networkId: string }) {
  const { t } = useTranslation()
  const { data: network, isLoading } = useInspectNetwork(nodeId, networkId)
  if (isLoading) return <FormSkeleton fields={4} />
  if (!network) return <p className="text-sm text-surface-500 text-center py-4">{t('docker.noData')}</p>
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="space-y-2">
        <div className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800">
          <span className="text-sm text-surface-600 dark:text-surface-400">{t('docker.name')}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white font-mono">{network.name || '—'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800">
          <span className="text-sm text-surface-600 dark:text-surface-400">{t('docker.id')}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white font-mono">{network.id?.slice(0, 12) || '—'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800">
          <span className="text-sm text-surface-600 dark:text-surface-400">{t('docker.driver')}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white font-mono">{network.driver || '—'}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800">
          <span className="text-sm text-surface-600 dark:text-surface-400">{t('docker.scope')}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white font-mono">{network.scope || '—'}</span>
        </div>
      </div>
      {network.containers && network.containers.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase mb-1">{t('docker.containers')}</p>
          <pre className="text-xs font-mono text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800/50 rounded p-3 overflow-x-auto">{JSON.stringify(network.containers, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
