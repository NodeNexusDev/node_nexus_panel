// oxlint-disable react-hooks/exhaustive-deps
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Tabs } from '../ui/Tabs'
import { Card, CardContent } from '../ui/Card'
import { useToast } from '../ui/useToast'
import { IconDocker } from '../ui/Icons'
import {
  useComposePs,
  useComposeLogs,
  useComposeConfig,
  useComposeImages,
  useComposeTop,
  useComposeVersion,
  useComposePort,
  useComposeUp,
  useComposeDown,
  useComposeStart,
  useComposeStop,
  useComposeRestart,
  useComposePull,
  useComposePush,
  useComposePause,
  useComposeUnpause,
  useComposeKill,
  useComposeRm,
  useComposeBuild,
  useDeleteComposeProject,
  useUpdateComposeProject,
} from '../../hooks/useCompose'

type DrawerTab = 'overview' | 'ps' | 'logs' | 'config' | 'images' | 'top' | 'version' | 'port'

interface ComposeDrawerProps {
  nodeId: string
  projectName: string
  composeYaml?: string
  onClose: () => void
}

export function ComposeDrawer({ nodeId, projectName, composeYaml, onClose }: ComposeDrawerProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [active, setActive] = useState<DrawerTab>('ps')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editYaml, setEditYaml] = useState(composeYaml || '')
  const up = useComposeUp()
  const down = useComposeDown()
  const start = useComposeStart()
  const stop = useComposeStop()
  const restart = useComposeRestart()
  const pull = useComposePull()
  const push = useComposePush()
  const pause = useComposePause()
  const unpause = useComposeUnpause()
  const kill = useComposeKill()
  const rm = useComposeRm()
  const build = useComposeBuild()
  const remove = useDeleteComposeProject()
  const update = useUpdateComposeProject()

  const { data: ps } = useComposePs(nodeId, projectName, !!projectName)
  const { data: logs } = useComposeLogs(nodeId, projectName, !!projectName)
  const { data: cfg } = useComposeConfig(nodeId, projectName, !!projectName)
  const { data: images } = useComposeImages(nodeId, projectName, !!projectName)
  const { data: top } = useComposeTop(nodeId, projectName, !!projectName)
  const { data: version } = useComposeVersion(nodeId, projectName, !!projectName)
  const { data: port } = useComposePort(nodeId, projectName, 'web', '80', false)

  useEffect(() => {
    setActive('ps')
    setShowDeleteConfirm(false)
    setShowEdit(false)
    setEditYaml(composeYaml || '')
  }, [projectName])

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: 'overview', label: t('docker.overview', 'Overview') },
    { key: 'ps', label: 'ps' },
    { key: 'logs', label: 'logs' },
    { key: 'config', label: 'config' },
    { key: 'images', label: 'images' },
    { key: 'top', label: 'top' },
    { key: 'version', label: 'version' },
    { key: 'port', label: 'port' },
  ]

  const handleDelete = () => {
    remove.mutate({ nodeId, projectName }, {
      onSuccess: () => { toast('success', t('docker.composeDeleted')); onClose() },
      onError: () => toast('error', t('docker.composeDeleteFailed')),
    })
  }
  const handleUpdate = () => {
    update.mutate({ nodeId, projectName, data: { compose: editYaml } }, {
      onSuccess: () => { toast('success', t('docker.composeUpdated')); setShowEdit(false) },
      onError: () => toast('error', t('docker.composeUpdateFailed')),
    })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <IconDocker className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-surface-900 dark:text-white truncate">{projectName}</p>
          <p className="text-xs font-mono text-surface-500 truncate">{nodeId.slice(0, 8)}</p>
        </div>
        <button onClick={onClose} aria-label={t('common.close')} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 shrink-0 cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="default">{projectName}</Badge>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="secondary" size="sm" disabled={up.isPending} onClick={() => up.mutate({ nodeId, projectName }, { onSuccess: () => toast('success', t('docker.composeUp')), onError: () => toast('error', t('docker.composeUpFailed')) })}>{t('docker.up')}</Button>
        <Button variant="ghost" size="sm" disabled={down.isPending} onClick={() => down.mutate({ nodeId, projectName }, { onSuccess: () => toast('success', t('docker.composeDown')), onError: () => toast('error', t('docker.composeDownFailed')) })}>{t('docker.down')}</Button>
        <Button variant="ghost" size="sm" disabled={start.isPending} onClick={() => start.mutate({ nodeId, projectName }, { onSuccess: () => toast('success', 'Started'), onError: () => toast('error', 'Failed') })}>{t('docker.start')}</Button>
        <Button variant="ghost" size="sm" disabled={stop.isPending} onClick={() => stop.mutate({ nodeId, projectName }, { onSuccess: () => toast('success', 'Stopped'), onError: () => toast('error', 'Failed') })}>{t('docker.stop')}</Button>
        <Button variant="ghost" size="sm" disabled={restart.isPending} onClick={() => restart.mutate({ nodeId, projectName }, { onSuccess: () => toast('success', 'Restarted'), onError: () => toast('error', 'Failed') })}>{t('docker.restartCompose')}</Button>
        <Button variant="ghost" size="sm" disabled={pull.isPending} onClick={() => pull.mutate({ nodeId, projectName }, { onSuccess: () => toast('success', 'Pulled'), onError: () => toast('error', 'Failed') })}>{t('docker.pull')}</Button>
        <Button variant="ghost" size="sm" disabled={push.isPending} onClick={() => push.mutate({ nodeId, projectName }, { onSuccess: () => toast('success', 'Pushed'), onError: () => toast('error', 'Failed') })}>{t('docker.push', 'Push')}</Button>
        <Button variant="ghost" size="sm" disabled={pause.isPending} onClick={() => pause.mutate({ nodeId, projectName }, { onSuccess: () => toast('success', 'Paused'), onError: () => toast('error', 'Failed') })}>{t('docker.pause')}</Button>
        <Button variant="ghost" size="sm" disabled={unpause.isPending} onClick={() => unpause.mutate({ nodeId, projectName }, { onSuccess: () => toast('success', 'Unpaused'), onError: () => toast('error', 'Failed') })}>{t('docker.unpause')}</Button>
        <Button variant="ghost" size="sm" disabled={kill.isPending} onClick={() => kill.mutate({ nodeId, projectName }, { onSuccess: () => toast('success', 'Killed'), onError: () => toast('error', 'Failed') })}>Kill</Button>
        <Button variant="ghost" size="sm" disabled={rm.isPending} onClick={() => rm.mutate({ nodeId, projectName }, { onSuccess: () => toast('success', 'Removed'), onError: () => toast('error', 'Failed') })}>RM</Button>
        <Button variant="ghost" size="sm" disabled={build.isPending} onClick={() => build.mutate({ nodeId, projectName }, { onSuccess: () => toast('success', 'Built'), onError: () => toast('error', 'Failed') })}>{t('docker.build')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setShowEdit((v) => !v)}>{t('common.edit')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm((v) => !v)} className="text-red-500 ml-auto">{t('common.delete')}</Button>
      </div>

      {showEdit && (
        <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 border space-y-2">
          <label className="text-sm font-medium">{t('docker.composeYaml')}</label>
          <textarea value={editYaml} onChange={(e) => setEditYaml(e.target.value)} rows={12} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-xs font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowEdit(false)}>{t('common.cancel')}</Button>
            <Button size="sm" disabled={update.isPending} onClick={handleUpdate}>{update.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-between gap-3">
          <p className="text-xs text-red-700 dark:text-red-300">{t('docker.deleteComposeMsg', { name: projectName } as unknown as string)}</p>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" size="sm" disabled={remove.isPending} onClick={handleDelete}>{remove.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      )}

      <Tabs tabs={tabs} active={active} onChange={setActive} />

      {active === 'overview' && (
        <Card>
          <CardContent className="pt-4">
            <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap break-all">{composeYaml || '—'}</pre>
          </CardContent>
        </Card>
      )}
      {active === 'ps' && <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{JSON.stringify(ps ?? {}, null, 2)}</pre>}
      {active === 'logs' && <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{typeof logs === 'string' ? logs : JSON.stringify(logs ?? {}, null, 2)}</pre>}
      {active === 'config' && <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{typeof cfg === 'string' ? cfg : JSON.stringify(cfg ?? {}, null, 2)}</pre>}
      {active === 'images' && <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{JSON.stringify(images ?? {}, null, 2)}</pre>}
      {active === 'top' && <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{JSON.stringify(top ?? {}, null, 2)}</pre>}
      {active === 'version' && <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{JSON.stringify(version ?? {}, null, 2)}</pre>}
      {active === 'port' && <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{JSON.stringify(port ?? {}, null, 2)}</pre>}
    </div>
  )
}
