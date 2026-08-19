import { useTranslation } from 'react-i18next'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { TableSkeleton } from '../ui/Skeleton'
import { IconDocker } from '../ui/Icons'
import { useDockerNetworks } from '../../hooks/useDocker'

export function NetworksTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { data: networks, isLoading, error, refetch } = useDockerNetworks(nodeId)
  if (isLoading) return <TableSkeleton rows={3} cols={4} />
  if (error) return <ErrorState error={error} onRetry={refetch} title={t('docker.failedToLoadNetworks')} />
  if (!networks?.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noNetworks')} description={t('docker.noNetworksDesc')} />
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-zebra">
        <thead className="table-sticky">
          <tr className="border-b border-surface-200 dark:border-surface-800">
            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.name')}</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.driver')}</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.scope')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
          {networks.map((n) => (
            <tr key={n.ID} className="table-row-hover">
              <td className="px-6 py-4 text-sm font-semibold text-surface-900 dark:text-white">{n.Name}</td>
              <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{n.Driver}</td>
              <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{n.Scope}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
