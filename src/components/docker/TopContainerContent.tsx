import { useTranslation } from 'react-i18next'
import { TableSkeleton } from '../ui/Skeleton'
import { useDockerContainerTop } from '../../hooks/useDocker'

export function TopContainerContent({ nodeId, containerId }: { nodeId: string; containerId: string }) {
  const { t } = useTranslation()
  const { data: top, isLoading } = useDockerContainerTop(nodeId, containerId)
  if (isLoading) return <TableSkeleton rows={5} cols={3} />
  if (!top) return <p className="text-sm text-surface-500 text-center py-4">{t('docker.noData')}</p>
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="text-sm text-surface-600 dark:text-surface-300">
        <p>{t('docker.titles', 'Titles')}: {top.titles?.join(' | ') || '—'}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-800">
              {top.titles?.map((title) => (
                <th key={title} className="px-3 py-2 text-left text-xs font-semibold text-surface-500 uppercase">{title}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {top.processes?.map((process, i) => (
              <tr key={i} className="table-row-hover">
                {process.map((cell: string, j: number) => (
                  <td key={j} className="px-3 py-2 text-sm text-surface-700 dark:text-surface-300 font-mono">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
