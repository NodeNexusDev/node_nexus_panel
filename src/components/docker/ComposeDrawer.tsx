// oxlint-disable react-hooks/exhaustive-deps
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Checkbox } from '../ui/Checkbox'
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
  useComposeRestart,
  useDeleteComposeProject,
  useUpdateComposeProject,
} from '../../hooks/useCompose'
import type { BulkResult_ComposeServiceBulkResult_, ComposeServiceBulkResult } from '../../api/types'

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
  const [servicesInput, setServicesInput] = useState('')
  const [pull, setPull] = useState(false)
  const [build, setBuild] = useState(false)
  const [upResult, setUpResult] = useState<BulkResult_ComposeServiceBulkResult_ | null>(null)
  const [actionResult, setActionResult] = useState<BulkResult_ComposeServiceBulkResult_ | null>(null)
  const [downVolumes, setDownVolumes] = useState(false)
  const [downOrphans, setDownOrphans] = useState(false)
  const [killSignal, setKillSignal] = useState('SIGTERM')
  const up = useComposeUp()
  const down = useComposeDown()
  const restart = useComposeRestart()
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
    setServicesInput('')
    setPull(false)
    setBuild(false)
    setUpResult(null)
    setActionResult(null)
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

  const parseServices = (): string[] | null => {
    const s = servicesInput.split(',').map((x) => x.trim()).filter(Boolean)
    return s.length ? s : null
  }

  const handleUp = () => {
    setUpResult(null)
    setActionResult(null)
    const data = { build, pull, services: parseServices() }
    up.mutate({ nodeId, projectName, data }, {
      onSuccess: (res) => {
        const bulk = res as unknown as BulkResult_ComposeServiceBulkResult_
        setUpResult(bulk)
        if (bulk.failed > 0) toast('warning', t('docker.composeUp') + ` — ${bulk.failed} failed`)
        else toast('success', t('docker.composeUp'))
      },
      onError: () => toast('error', t('docker.composeUpFailed')),
    })
  }
  const handleDown = () => {
    setActionResult(null); setUpResult(null)
    down.mutate({ nodeId, projectName, data: { volumes: downVolumes, remove_orphans: downOrphans } as never }, {
      onSuccess: (res) => {
        const bulk = res as unknown as BulkResult_ComposeServiceBulkResult_ | { status: string }
        // downs returns ComposeActionResponse, not BulkResult — handle both
        if ((bulk as BulkResult_ComposeServiceBulkResult_).results) setActionResult(bulk as BulkResult_ComposeServiceBulkResult_)
        toast('success', t('docker.composeDown'))
      },
      onError: () => toast('error', t('docker.composeDownFailed')),
    })
  }
  const handleGeneric = (
    fn: { mutate: (vars: any, opts: any) => void; isPending: boolean },
    name: string,
  ) => {
    setActionResult(null); setUpResult(null)
    const services = parseServices()
    // for kills need signal
    const isKill = name === 'kill'
    const data = isKill ? { signal: killSignal || 'SIGTERM', services } : { services }
    fn.mutate({ nodeId, projectName, data }, {
      onSuccess: (res: unknown) => {
        const bulk = res as BulkResult_ComposeServiceBulkResult_
        if (bulk.results) setActionResult(bulk)
        if (bulk.failed && bulk.failed > 0) toast('warning', name + ` — ${bulk.failed} failed`)
        else toast('success', name)
      },
      onError: () => toast('error', 'Failed'),
    })
  }

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

      <Card>
        <CardContent className="pt-4 space-y-3">
          <Input label={t('docker.servicesFilter', 'Services (comma, empty = all)')} placeholder="web, db" value={servicesInput} onChange={(e) => setServicesInput(e.target.value)} />
          <div className="flex flex-wrap gap-3 items-center">
            <Checkbox checked={pull} onChange={setPull} label={t('docker.pullBeforeUp', 'Pull')} />
            <Checkbox checked={build} onChange={setBuild} label={t('docker.buildBeforeUp', 'Build')} />
            <span className="text-xs text-surface-500 ml-auto">{servicesInput ? `services: ${parseServices()?.join(', ')}` : 'all services'}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="secondary" size="sm" disabled={up.isPending} onClick={handleUp}>{up.isPending ? t('common.loading') : t('docker.up')}</Button>
        <Button variant="ghost" size="sm" disabled={down.isPending} onClick={handleDown}>{t('docker.down')}</Button>
        <Button variant="ghost" size="sm" disabled={restart.isPending} onClick={() => handleGeneric(restart, 'restart')}>{t('docker.restartCompose')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setShowEdit((v) => !v)}>{t('common.edit')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm((v) => !v)} className="text-red-500 ml-auto">{t('common.delete')}</Button>
      </div>

      {(upResult || actionResult) && (
        <Card>
          <CardContent className="pt-4 space-y-2">
            {(() => {
              const bulk = (upResult || actionResult) as BulkResult_ComposeServiceBulkResult_
              if (!bulk || !bulk.results) return <p className="text-sm text-surface-500">Done</p>
              return (
                <div className="space-y-2">
                  <div className="flex gap-4 text-sm">
                    <span>{t('common.total')}: {bulk.total}</span>
                    <span className="text-green-600">{t('common.succeeded')}: {bulk.succeeded}</span>
                    <span className="text-red-600">{t('common.failed')}: {bulk.failed}</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {(bulk.results as ComposeServiceBulkResult[]).map((r) => (
                      <div key={r.service} className={`p-3 rounded-lg border text-xs font-mono ${r.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{r.service}</span>
                          <Badge variant={r.status === 'success' ? 'success' : 'danger'}>{r.status}</Badge>
                        </div>
                        {r.output && <pre className="whitespace-pre-wrap break-all text-surface-700 dark:text-surface-300">{r.output}</pre>}
                        {r.error && <pre className="whitespace-pre-wrap break-all text-red-600">{r.error}</pre>}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => { setUpResult(null); setActionResult(null) }}>{t('common.close')}</Button></div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2 items-center text-xs">
        <Checkbox checked={downVolumes} onChange={setDownVolumes} label="volumes" />
        <Checkbox checked={downOrphans} onChange={setDownOrphans} label="orphans" />
        <Input value={killSignal} onChange={(e) => setKillSignal(e.target.value)} placeholder="SIGTERM" className="w-24 ml-auto" />
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
