import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { ContainerStatusBadge } from './ContainerStatusBadge'
import type { DockerContainer } from '../../api/types'

interface ContainerRowProps {
  container: DockerContainer
  onStart: () => void
  onStop: () => void
  onRestart: () => void
  onDelete: () => void
  onPause: () => void
  onUnpause: () => void
  onRename: () => void
  onTop: () => void
  loading: boolean
  selected: boolean
  onSelect: () => void
  expanded: boolean
  onToggleExpand: () => void
}

export function ContainerRow({
  container,
  onStart,
  onStop,
  onRestart,
  onDelete,
  onPause,
  onUnpause,
  onRename,
  onTop,
  loading,
  selected,
  onSelect,
  expanded,
  onToggleExpand,
}: ContainerRowProps) {
  const { t } = useTranslation()
  const containerName = container.Names?.split('/').pop() || container.Names
  const isRunning = container.State?.toLowerCase() === 'running'
  return (
    <tr className={`table-row-hover cursor-pointer ${expanded ? 'bg-surface-50 dark:bg-surface-800/50' : ''}`} onClick={onToggleExpand}>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center"><input type="checkbox" checked={selected} onChange={onSelect} aria-label={t('common.selectItem', 'Select {{name}}', { name: containerName })} className="w-4 h-4 rounded border-surface-300 dark:border-surface-600" /></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs text-surface-400 transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
          <div>
            <p className="text-sm font-semibold text-surface-900 dark:text-white">{containerName}</p>
            <p className="text-xs text-surface-500 font-mono">{container.ID?.slice(0, 12) || '—'}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300 font-mono">{container.Image}</td>
      <td className="px-6 py-4"><ContainerStatusBadge state={container.State} /></td>
      <td className="px-6 py-4 text-xs text-surface-500">{container.Ports || '—'}</td>
      <td className="px-6 py-4 text-xs text-surface-500">{container.CreatedAt}</td>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1 flex-wrap">
          {!isRunning && <Button variant="ghost" size="sm" onClick={onStart} disabled={loading}>{t('common.start')}</Button>}
          {isRunning && <Button variant="ghost" size="sm" onClick={onStop} disabled={loading}>{t('common.stop')}</Button>}
          <Button variant="ghost" size="sm" onClick={onRestart} disabled={loading}>{t('common.restart')}</Button>
          {isRunning && container.State?.toLowerCase() !== 'paused' && <Button variant="ghost" size="sm" onClick={onPause} disabled={loading}>{t('docker.pause')}</Button>}
          {container.State?.toLowerCase() === 'paused' && <Button variant="ghost" size="sm" onClick={onUnpause} disabled={loading}>{t('docker.unpause')}</Button>}
          <Button variant="ghost" size="sm" onClick={onRename} disabled={loading}>{t('docker.rename')}</Button>
          <Button variant="ghost" size="sm" onClick={onTop} disabled={loading || !isRunning}>{t('docker.top')}</Button>
          <Button variant="ghost" size="sm" onClick={onDelete} disabled={loading} className="text-red-500 hover:text-red-600">{t('common.delete')}</Button>
        </div>
      </td>
    </tr>
  )
}
