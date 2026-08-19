import { useTranslation } from 'react-i18next'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { TableSkeleton } from '../ui/Skeleton'
import { IconDocker } from '../ui/Icons'
import { useDockerVolumes } from '../../hooks/useDocker'

export function VolumesTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { data: volumes, isLoading, error, refetch } = useDockerVolumes(nodeId)
  if (isLoading) return <TableSkeleton rows={3} cols={4} />
  if (error) return <ErrorState error={error} onRetry={refetch} title={t('docker.failedToLoadVolumes')} />
  if (!volumes?.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noVolumes')} description={t('docker.noVolumesDesc')} />
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-zebra">
        <thead className="table-sticky">
          <tr className="border-b border-surface-200 dark:border-surface-800">
            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.name')}</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.driver')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
          {volumes.map((v) => (
            <tr key={v.Name} className="table-row-hover">
              <td className="px-6 py-4 text-sm font-semibold text-surface-900 dark:text-white">{v.Name}</td>
              <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{v.Driver}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
