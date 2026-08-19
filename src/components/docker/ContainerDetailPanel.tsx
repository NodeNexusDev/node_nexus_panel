import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import type { DockerContainer } from '../../api/types'

interface ContainerDetailPanelProps {
  container: DockerContainer
  onLogs: () => void
  onStats: () => void
  onExec: () => void
  onInspect: () => void
}

export function ContainerDetailPanel({ container, onLogs, onStats, onExec, onInspect }: ContainerDetailPanelProps) {
  const { t } = useTranslation()
  const isRunning = container.State?.toLowerCase() === 'running'
  const info: [string, string][] = [
    [t('docker.id'), container.ID?.slice(0, 12) || '—'],
    [t('docker.image'), container.Image || '—'],
    [t('docker.status'), container.State || '—'],
    [t('docker.ports'), container.Ports || '—'],
    [t('docker.created'), container.CreatedAt || '—'],
  ]
  return (
    <div className="px-6 py-4 bg-surface-50 dark:bg-surface-800/50 border-t border-surface-200 dark:border-surface-800 animate-fade-in">
      <div className="flex items-start gap-8">
        <div className="flex-1 space-y-2">
          {info.map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-surface-500 w-20 shrink-0">{key}</span>
              <span className="text-sm text-surface-900 dark:text-white font-mono">{value}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isRunning && <Button variant="ghost" size="sm" onClick={onExec}>{t('nodes.execCommand')}</Button>}
          <Button variant="ghost" size="sm" onClick={onLogs}>{t('nodes.logs')}</Button>
          <Button variant="ghost" size="sm" onClick={onStats}>{t('nodes.stats')}</Button>
          <Button variant="ghost" size="sm" onClick={onInspect}>{t('docker.inspect', 'Inspect')}</Button>
        </div>
      </div>
    </div>
  )
}
