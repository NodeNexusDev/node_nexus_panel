import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { useDockerContainerLogs } from '../../hooks/useDocker'

export function ContainerLogsContent({ nodeId, containerId }: { nodeId: string; containerId: string }) {
  const { t } = useTranslation()
  const [tail, setTail] = useState(200)
  const [since, setSince] = useState('')
  const { data: logs, isLoading, refetch } = useDockerContainerLogs(nodeId, containerId, tail, since || undefined)
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-surface-600 dark:text-surface-400">{t('docker.tailLines', 'Tail lines')}</label>
          <input type="number" value={tail} onChange={(e) => setTail(Number(e.target.value) || 100)} className="w-20 px-2 py-1 bg-white border border-surface-300 rounded text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" min={10} max={10000} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-surface-600 dark:text-surface-400">{t('docker.since', 'Since')}</label>
          <input type="datetime-local" value={since} onChange={(e) => setSince(e.target.value)} className="px-2 py-1 bg-white border border-surface-300 rounded text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>{t('common.refresh')}</Button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? <Spinner size="lg" className="mx-auto my-8" /> : (
          <pre className="text-xs font-mono text-surface-700 dark:text-surface-300 whitespace-pre-wrap break-all bg-surface-50 dark:bg-surface-800/50 rounded p-4">{logs || t('docker.noLogs')}</pre>
        )}
      </div>
    </div>
  )
}
