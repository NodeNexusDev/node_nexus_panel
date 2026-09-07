import { useTranslation } from 'react-i18next'
import { Checkbox } from '../ui/Checkbox'
import { ContainerStatusBadge } from './ContainerStatusBadge'
import type { DockerContainer } from '../../api/types'

interface ContainerRowProps {
  container: DockerContainer
  selected: boolean
  onSelect: () => void
  onRowClick: () => void
}

export function ContainerRow({ container, selected, onSelect, onRowClick }: ContainerRowProps) {
  const { t } = useTranslation()
  const containerName = container.Names?.split('/').pop() || container.Names
  return (
    <tr className="table-row-hover cursor-pointer" onClick={onRowClick}>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center"><Checkbox checked={selected} onChange={onSelect} ariaLabel={t('common.selectItem', 'Select {{name}}', { name: containerName })} /></div>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-surface-900 dark:text-white">{containerName}</p>
          <p className="text-xs text-surface-500 font-mono">{container.ID?.slice(0, 12) || '—'}</p>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300 font-mono">{container.Image}</td>
      <td className="px-6 py-4"><ContainerStatusBadge state={container.State} /></td>
      <td className="px-6 py-4 text-xs text-surface-500">{container.Ports || '—'}</td>
      <td className="px-6 py-4 text-xs text-surface-500">{container.CreatedAt ? new Date(container.CreatedAt).toLocaleString() : container.CreatedAt || '—'}</td>
    </tr>
  )
}
