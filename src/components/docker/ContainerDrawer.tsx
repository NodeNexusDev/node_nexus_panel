// oxlint-disable react-hooks/exhaustive-deps
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Checkbox } from '../ui/Checkbox'
import { Tabs } from '../ui/Tabs'
import { Card, CardContent } from '../ui/Card'
import { KeyValueList } from '../ui/KeyValueList'
import { Spinner } from '../ui/Spinner'
import { useToast } from '../ui/useToast'
import { IconDocker, IconCopy } from '../ui/Icons'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import {
  useStartContainer,
  useStopContainer,
  useRestartContainer,
  useDeleteContainer,
  usePauseContainer,
  useUnpauseContainer,
  useRenameContainer,
  useKillContainer,
  useUpdateContainer,
  useWaitContainer,
} from '../../hooks/useDocker'
import { ContainerLogsContent } from './ContainerLogsContent'
import { ContainerStatsContent } from './ContainerStatsContent'
import { ExecContainerContent } from './ExecContainerContent'
import { ContainerInspectContent } from './ContainerInspectContent'
import { TopContainerContent } from './TopContainerContent'
import { ContainerStatusBadge } from './ContainerStatusBadge'
import type { DockerContainer } from '../../api/types'
import { dockerApi } from '../../api/docker'

type DrawerTab = 'overview' | 'logs' | 'stats' | 'exec' | 'inspect' | 'top'

interface ContainerDrawerProps {
  nodeId: string
  container: DockerContainer
  onClose: () => void
}

export function ContainerDrawer({ nodeId, container, onClose }: ContainerDrawerProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { copy } = useCopyToClipboard({ onCopied: () => toast('success', t('common.copied')) })
  const [active, setActive] = useState<DrawerTab>('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [forceDelete, setForceDelete] = useState(false)
  const [renameTarget, setRenameTarget] = useState(false)
  const [renameName, setRenameName] = useState(container.Names?.split('/').pop() || '')
  const [killSignal, setKillSignal] = useState('SIGTERM')
  const [showKill, setShowKill] = useState(false)
  const [showPort, setShowPort] = useState(false)
  const [portInput, setPortInput] = useState('')
  const [portResult, setPortResult] = useState<string | null>(null)
  const [showUpdate, setShowUpdate] = useState(false)
  const [updateMemory, setUpdateMemory] = useState('')
  const [updateCpus, setUpdateCpus] = useState('')

  const startContainer = useStartContainer()
  const stopContainer = useStopContainer()
  const restartContainer = useRestartContainer()
  const deleteContainer = useDeleteContainer()
  const pauseContainer = usePauseContainer()
  const unpauseContainer = useUnpauseContainer()
  const renameContainer = useRenameContainer()
  const killContainer = useKillContainer()
  const updateContainer = useUpdateContainer()
  const waitContainer = useWaitContainer()

  const [waitResult, setWaitResult] = useState<string | null>(null)

  useEffect(() => {
    setActive('overview')
    setShowDeleteConfirm(false)
    setForceDelete(false)
    setRenameTarget(false)
    setRenameName(container.Names?.split('/').pop() || '')
    setShowKill(false)
    setShowPort(false)
    setPortResult(null)
    setShowUpdate(false)
    setWaitResult(null)
  }, [container.ID])

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: 'overview', label: t('docker.overview', 'Overview') },
    { key: 'logs', label: t('docker.logs', 'Logs') },
    { key: 'stats', label: t('docker.stats', 'Stats') },
    { key: 'exec', label: t('docker.exec', 'Exec') },
    { key: 'inspect', label: t('docker.inspect', 'Inspect') },
    { key: 'top', label: t('docker.top', 'Top') },
  ]

  const isRunning = (container as unknown as { State?: string }).State?.toLowerCase() === 'running'
  const isPaused = (container as unknown as { State?: string }).State?.toLowerCase() === 'paused'

  const handleDelete = () => {
    deleteContainer.mutate({ nodeId, containerId: container.ID, force: forceDelete || undefined }, {
      onSuccess: () => { toast('success', t('docker.toastDeleteDone', 'Container deleted')); onClose() },
      onError: () => toast('error', t('docker.toastDeleteFailed')),
    })
  }
  const handleRename = () => {
    const trimmed = renameName.trim()
    if (!trimmed) return
    renameContainer.mutate({ nodeId, containerId: container.ID, data: { new_name: trimmed } }, {
      onSuccess: () => { toast('success', t('docker.toastRenameDone', 'Renamed')); setRenameTarget(false) },
      onError: () => toast('error', t('docker.toastRenameFailed')),
    })
  }
  const handleKill = () => {
    killContainer.mutate({ nodeId, containerId: container.ID, signal: killSignal || undefined }, {
      onSuccess: () => toast('success', t('docker.toastKillDone', 'Killed')),
      onError: () => toast('error', t('docker.toastKillFailed', 'Kill failed')),
    })
  }
  const handlePort = async () => {
    try {
      const res = await dockerApi.getContainerPort(nodeId, container.ID, portInput || undefined)
      setPortResult(JSON.stringify(res, null, 2))
    } catch (e) {
      setPortResult(String((e as Error).message))
    }
  }
  const handleUpdate = () => {
    const data: Record<string, unknown> = {}
    if (updateMemory) data.memory = updateMemory
    if (updateCpus) data.cpus = updateCpus
    updateContainer.mutate({ nodeId, containerId: container.ID, data }, {
      onSuccess: () => toast('success', t('docker.toastUpdateDone', 'Updated')),
      onError: () => toast('error', t('docker.toastUpdateFailed', 'Update failed')),
    })
  }
  const handleWait = () => {
    setWaitResult(null)
    waitContainer.mutate({ nodeId, containerId: container.ID }, {
      onSuccess: (res) => setWaitResult(JSON.stringify(res, null, 2)),
      onError: (e) => setWaitResult(String((e as Error).message)),
    })
  }

  const name = (container as unknown as { Names?: string }).Names?.split('/').pop() || container.ID.slice(0, 12)
  const image = (container as unknown as { Image?: string }).Image || '—'

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isRunning ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' : isPaused ? 'bg-amber-500/10 text-amber-600' : 'bg-surface-100 dark:bg-surface-800 text-surface-500'}`}>
          <IconDocker className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-surface-900 dark:text-white truncate">{name}</p>
          <p className="text-xs font-mono text-surface-500 truncate">{container.ID.slice(0, 12)} — {image}</p>
        </div>
        <button onClick={onClose} aria-label={t('common.close')} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 shrink-0 cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ContainerStatusBadge state={(container as unknown as { State?: string }).State || ''} />
        <Badge variant="default">{image.slice(0, 30)}</Badge>
        {(container as unknown as { Ports?: string | null }).Ports && <Badge variant="default">{(container as unknown as { Ports: string }).Ports}</Badge>}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {!isRunning && <Button variant="secondary" size="sm" disabled={startContainer.isPending} onClick={() => startContainer.mutate({ nodeId, containerId: container.ID }, { onSuccess: () => toast('success', t('common.start')), onError: () => toast('error', t('docker.toastStartFailed')) })}>{t('common.start')}</Button>}
        {isRunning && <Button variant="secondary" size="sm" disabled={stopContainer.isPending} onClick={() => stopContainer.mutate({ nodeId, containerId: container.ID }, { onSuccess: () => toast('success', t('common.stop')), onError: () => toast('error', t('docker.toastStopFailed')) })}>{t('common.stop')}</Button>}
        <Button variant="ghost" size="sm" disabled={restartContainer.isPending} onClick={() => restartContainer.mutate({ nodeId, containerId: container.ID }, { onSuccess: () => toast('success', t('common.restart')), onError: () => toast('error', t('docker.toastRestartFailed')) })}>{t('common.restart')}</Button>
        {isRunning && !isPaused && <Button variant="ghost" size="sm" disabled={pauseContainer.isPending} onClick={() => pauseContainer.mutate({ nodeId, containerId: container.ID }, { onSuccess: () => toast('success', t('docker.pause')), onError: () => toast('error', t('docker.toastPauseFailed')) })}>{t('docker.pause')}</Button>}
        {isPaused && <Button variant="ghost" size="sm" disabled={unpauseContainer.isPending} onClick={() => unpauseContainer.mutate({ nodeId, containerId: container.ID }, { onSuccess: () => toast('success', t('docker.unpause')), onError: () => toast('error', t('docker.toastUnpauseFailed')) })}>{t('docker.unpause')}</Button>}
        <Button variant="ghost" size="sm" onClick={() => setShowKill((v) => !v)}>{t('docker.kill', 'Kill')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setShowPort((v) => !v)}>{t('docker.port', 'Port')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setShowUpdate((v) => !v)}>{t('docker.update', 'Update')}</Button>
        <Button variant="ghost" size="sm" onClick={handleWait} disabled={waitContainer.isPending}>{waitContainer.isPending ? <Spinner size="sm" /> : t('docker.wait', 'Wait')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setRenameTarget((v) => !v)}>{t('docker.rename', 'Rename')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm((v) => !v)} className="text-red-500 ml-auto">{t('common.delete')}</Button>
      </div>

      {showKill && (
        <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 flex items-center gap-2">
          <Input label={t('docker.signal', 'Signal')} value={killSignal} onChange={(e) => setKillSignal(e.target.value)} placeholder="SIGTERM" className="flex-1" />
          <Button size="sm" disabled={killContainer.isPending} onClick={handleKill}>{killContainer.isPending ? t('common.loading') : t('docker.kill')}</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowKill(false)}>{t('common.close')}</Button>
        </div>
      )}
      {showPort && (
        <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 space-y-2">
          <div className="flex items-end gap-2">
            <Input label={t('docker.port', 'Port')} value={portInput} onChange={(e) => setPortInput(e.target.value)} placeholder="80/tcp" className="flex-1" />
            <Button size="sm" onClick={handlePort}>{t('common.search')}</Button>
          </div>
          {portResult && <pre className="text-xs font-mono bg-white dark:bg-surface-900 p-2 rounded border overflow-x-auto">{portResult}</pre>}
        </div>
      )}
      {showUpdate && (
        <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 space-y-2">
          <div className="flex gap-2">
            <Input label={t('docker.memory', 'Memory')} value={updateMemory} onChange={(e) => setUpdateMemory(e.target.value)} placeholder="512m" className="flex-1" />
            <Input label={t('docker.cpus', 'CPUs')} value={updateCpus} onChange={(e) => setUpdateCpus(e.target.value)} placeholder="1.5" className="flex-1" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowUpdate(false)}>{t('common.cancel')}</Button>
            <Button size="sm" disabled={updateContainer.isPending} onClick={handleUpdate}>{updateContainer.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      )}
      {waitResult && (
        <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 border">
          <pre className="text-xs font-mono whitespace-pre-wrap">{waitResult}</pre>
          <div className="flex justify-end mt-2"><Button variant="ghost" size="sm" onClick={() => setWaitResult(null)}>{t('common.close')}</Button></div>
        </div>
      )}
      {renameTarget && (
        <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 border flex items-center gap-2">
          <Input value={renameName} onChange={(e) => setRenameName(e.target.value)} placeholder="new-name" className="flex-1" />
          <Button size="sm" disabled={renameContainer.isPending || !renameName.trim()} onClick={handleRename}>{renameContainer.isPending ? t('common.loading') : t('common.save')}</Button>
          <Button variant="ghost" size="sm" onClick={() => setRenameTarget(false)}>{t('common.cancel')}</Button>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-red-700 dark:text-red-300">{t('docker.deleteContainerMsg', { name })}</p>
            <Checkbox checked={forceDelete} onChange={setForceDelete} label={t('docker.forceDelete', 'Force delete')} />
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" size="sm" disabled={deleteContainer.isPending} onClick={handleDelete}>{deleteContainer.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      )}

      <Tabs tabs={tabs} active={active} onChange={setActive} />

      {active === 'overview' && <ContainerOverview container={container} copy={copy} />}
      {active === 'logs' && <ContainerLogsContent nodeId={nodeId} containerId={container.ID} />}
      {active === 'stats' && <ContainerStatsContent nodeId={nodeId} containerId={container.ID} />}
      {active === 'exec' && <ExecContainerContent nodeId={nodeId} containerId={container.ID} onClose={() => setActive('overview')} />}
      {active === 'inspect' && <ContainerInspectContent nodeId={nodeId} containerId={container.ID} />}
      {active === 'top' && <TopContainerContent nodeId={nodeId} containerId={container.ID} />}
    </div>
  )
}

function ContainerOverview({ container, copy }: { container: DockerContainer; copy: (t: string) => void }) {
  const { t } = useTranslation()
  const rows: [string, React.ReactNode][] = [
    [t('docker.id', 'ID'), (
      <span key="id" className="inline-flex items-center gap-2 font-mono text-xs">{container.ID.slice(0, 12)}<button onClick={() => copy(container.ID)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 cursor-pointer"><IconCopy className="w-3 h-3 text-surface-400" /></button></span>
    )],
    [t('docker.name', 'Name'), (container as unknown as { Names?: string }).Names?.split('/').pop() || '—'],
    [t('docker.image', 'Image'), (container as unknown as { Image?: string }).Image || '—'],
    [t('docker.status', 'Status'), <ContainerStatusBadge key="st" state={(container as unknown as { State?: string }).State || ''} />],
    [t('docker.ports', 'Ports'), (container as unknown as { Ports?: string | null }).Ports || '—'],
    [t('docker.created', 'Created'), (container as unknown as { CreatedAt?: string }).CreatedAt ? new Date((container as unknown as { CreatedAt: string }).CreatedAt).toLocaleString() : '—'],
  ]
  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800 last:border-0">
            <span className="text-sm text-surface-600 dark:text-surface-400">{label}</span>
            <span className="text-sm font-medium text-surface-900 dark:text-white text-right max-w-[60%] truncate">{value}</span>
          </div>
        ))}
        <KeyValueList rows={[
          { label: t('docker.id'), value: container.ID },
          { label: t('docker.command'), value: (container as unknown as { Command?: string }).Command || '—' },
        ]} />
      </CardContent>
    </Card>
  )
}
