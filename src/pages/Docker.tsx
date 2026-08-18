import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { TableSkeleton } from '../components/ui/Skeleton'
import { IconDocker } from '../components/ui/Icons'
import { containerCreateFormSchema, type ContainerCreateFormInput } from '../lib/validators/docker-schema'
import { formatBytes } from '../lib/format'
import {
  useDockerContainers,
  useDockerImages,
  useDockerNetworks,
  useDockerVolumes,
  useDockerContainerLogs,
  useDockerContainerStats,
  useDockerContainerInspect,
  useDockerImageInspect,
  useStartContainer,
  useStopContainer,
  useRestartContainer,
  useDeleteContainer,
  useCreateContainer,
  useExecContainer,
  usePullImage,
  useDeleteImage,
  useBuildImage,
  useTagImage,
  useBulkDockerExec,
  useBulkDockerRestart,
  useBulkDockerStart,
  useBulkDockerStop,
} from '../hooks/useDocker'
import { useNodes } from '../hooks/useNodes'
import type { DockerContainer, DockerPullResult, ContainerCreatedResponse } from '../api/types'

type Tab = 'containers' | 'images' | 'networks' | 'volumes'

function ContainerStatusBadge({ state }: { state: string }) {
  const lower = state.toLowerCase()
  const variant = lower === 'running' ? 'success' : lower === 'paused' ? 'warning' : 'default'
  return <Badge variant={variant}>{state}</Badge>
}

function ContainerRow({
  container,
  nodeId: _nodeId,
  onStart,
  onStop,
  onRestart,
  onDelete,
  onLogs,
  onStats,
  onExec,
  onInspect,
  loading,
  selected,
  onSelect,
}: {
  container: DockerContainer
  nodeId: string
  onStart: () => void
  onStop: () => void
  onRestart: () => void
  onDelete: () => void
  onLogs: () => void
  onStats: () => void
  onExec: () => void
  onInspect: () => void
  loading: boolean
  selected: boolean
  onSelect: () => void
}) {
  const { t } = useTranslation()
  const containerName = container.Names?.split('/').pop() || container.Names
  const isRunning = container.State?.toLowerCase() === 'running'
  return (
    <tr className="table-row-hover">
      <td className="px-6 py-4">
        <input type="checkbox" checked={selected} onChange={onSelect} className="rounded border-surface-300 dark:border-surface-600" />
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
      <td className="px-6 py-4 text-xs text-surface-500">{container.CreatedAt}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1 flex-wrap">
          {!isRunning && <Button variant="ghost" size="sm" onClick={onStart} disabled={loading}>{t('common.start')}</Button>}
          {isRunning && <Button variant="ghost" size="sm" onClick={onStop} disabled={loading}>{t('common.stop')}</Button>}
          <Button variant="ghost" size="sm" onClick={onRestart} disabled={loading}>{t('common.restart')}</Button>
          {isRunning && <Button variant="ghost" size="sm" onClick={onExec}>{t('nodes.execCommand')}</Button>}
          <Button variant="ghost" size="sm" onClick={onLogs}>{t('nodes.logs')}</Button>
          <Button variant="ghost" size="sm" onClick={onStats}>{t('nodes.stats')}</Button>
          <Button variant="ghost" size="sm" onClick={onInspect}>{t('docker.inspect', 'Inspect')}</Button>
          <Button variant="ghost" size="sm" onClick={onDelete} disabled={loading} className="text-red-500 hover:text-red-600">{t('common.delete')}</Button>
        </div>
      </td>
    </tr>
  )
}

function ContainersTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)
  const { data: containers, isLoading } = useDockerContainers(nodeId, showAll)
  const startContainer = useStartContainer()
  const stopContainer = useStopContainer()
  const restartContainer = useRestartContainer()
  const deleteContainer = useDeleteContainer()
  const bulkExec = useBulkDockerExec()
  const bulkRestart = useBulkDockerRestart()
  const bulkStart = useBulkDockerStart()
  const bulkStop = useBulkDockerStop()

  const [deleteTarget, setDeleteTarget] = useState<DockerContainer | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [logsTarget, setLogsTarget] = useState<DockerContainer | null>(null)
  const [statsTarget, setStatsTarget] = useState<DockerContainer | null>(null)
  const [execTarget, setExecTarget] = useState<DockerContainer | null>(null)
  const [inspectTarget, setInspectTarget] = useState<DockerContainer | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkExecModal, setShowBulkExecModal] = useState(false)
  const [bulkExecCommand, setBulkExecCommand] = useState('')
  const [bulkExecResult, setBulkExecResult] = useState<string>('')

  const allSelected = containers && selectedIds.size === containers.length
  const toggleAll = () => {
    if (!containers) return
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(containers.map((c) => c.ID)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  // Bulk operations target a single container_id across many nodes. Selecting
  // multiple different containers in one bulk request is not supported by the API.
  const bulkContainerId = selectedIds.size === 1 ? Array.from(selectedIds)[0] : undefined
  const bulkDisabled = !bulkContainerId

  const handleBulkExec = () => {
    if (!bulkExecCommand || !bulkContainerId) return
    bulkExec.mutate(
      { container_id: bulkContainerId, command: bulkExecCommand, node_ids: [nodeId] },
      {
        onSuccess: (data) => {
          const results = data.results.map((r) => `[${r.node_name}] ${r.status}: ${r.output || r.error}`).join('\n')
          setBulkExecResult(results || 'No output')
        },
      }
    )
  }

  if (isLoading) return <TableSkeleton rows={5} cols={7} />
  if (!containers?.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noContainers')} description={t('docker.noContainersDesc')} action={<Button onClick={() => setShowCreateModal(true)}>{t('docker.createContainer')}</Button>} />

  const loading = startContainer.isPending || stopContainer.isPending || restartContainer.isPending

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800">
          <span className="text-sm text-accent-700 dark:text-accent-300">{t('docker.selected', { count: selectedIds.size })}</span>
          <Button variant="ghost" size="sm" onClick={() => bulkRestart.mutate({ container_id: bulkContainerId!, node_ids: [nodeId] })} disabled={bulkDisabled || bulkRestart.isPending}>{t('docker.restartAll')}</Button>
          <Button variant="ghost" size="sm" onClick={() => bulkStart.mutate({ container_id: bulkContainerId!, node_ids: [nodeId] })} disabled={bulkDisabled || bulkStart.isPending}>{t('docker.startAll')}</Button>
          <Button variant="ghost" size="sm" onClick={() => bulkStop.mutate({ container_id: bulkContainerId!, node_ids: [nodeId] })} disabled={bulkDisabled || bulkStop.isPending}>{t('docker.stopAll')}</Button>
          <Button variant="ghost" size="sm" onClick={() => { setShowBulkExecModal(true); setBulkExecResult('') }} disabled={bulkDisabled}>{t('docker.bulkExec', 'Exec on selected')}</Button>
        </div>
      )}
      {bulkDisabled && selectedIds.size > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 px-4 -mt-2">
          {t('docker.bulkSingleContainer', 'Bulk operations apply to one container across multiple nodes. Select a single container to proceed.')}
        </p>
      )}
      <div className="flex items-center gap-3 mb-4 px-4">
        <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="rounded border-surface-300 dark:border-surface-600" />
          {t('docker.showAll', 'Show all (including stopped)')}
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-zebra">
          <thead className="table-sticky">
            <tr className="border-b border-surface-200 dark:border-surface-800">
              <th className="px-6 py-3"><input type="checkbox" checked={!!allSelected} onChange={toggleAll} className="rounded border-surface-300 dark:border-surface-600" /></th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.name')}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.image')}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.status')}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.ports')}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.created')}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {containers.map((c) => (
              <ContainerRow key={c.ID} container={c} nodeId={nodeId}
                onStart={() => startContainer.mutate({ nodeId, containerId: c.ID })}
                onStop={() => stopContainer.mutate({ nodeId, containerId: c.ID })}
                onRestart={() => restartContainer.mutate({ nodeId, containerId: c.ID })}
                onDelete={() => setDeleteTarget(c)}
                onLogs={() => setLogsTarget(c)}
                onStats={() => setStatsTarget(c)}
                onExec={() => setExecTarget(c)}
                onInspect={() => setInspectTarget(c)}
                loading={loading} selected={selectedIds.has(c.ID)} onSelect={() => toggleOne(c.ID)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('docker.createContainer')} size="lg">
        <CreateContainerForm nodeId={nodeId} onClose={() => setShowCreateModal(false)} />
      </Modal>

      <Modal isOpen={!!logsTarget} onClose={() => setLogsTarget(null)} title={`${t('docker.logs')}: ${logsTarget?.Names?.split('/').pop() || ''}`} size="lg">
        {logsTarget && <ContainerLogsContent nodeId={nodeId} containerId={logsTarget.ID} />}
      </Modal>

      <Modal isOpen={!!statsTarget} onClose={() => setStatsTarget(null)} title={`${t('docker.stats')}: ${statsTarget?.Names?.split('/').pop() || ''}`} size="md">
        {statsTarget && <ContainerStatsContent nodeId={nodeId} containerId={statsTarget.ID} />}
      </Modal>

      <Modal isOpen={!!execTarget} onClose={() => setExecTarget(null)} title={`${t('docker.exec')}: ${execTarget?.Names?.split('/').pop() || ''}`} size="lg">
        {execTarget && <ExecContainerContent nodeId={nodeId} containerId={execTarget.ID} onClose={() => setExecTarget(null)} />}
      </Modal>

      <Modal isOpen={!!inspectTarget} onClose={() => setInspectTarget(null)} title={`${t('docker.inspect')}: ${inspectTarget?.Names?.split('/').pop() || ''}`} size="lg">
        {inspectTarget && <ContainerInspectContent nodeId={nodeId} containerId={inspectTarget.ID} />}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('docker.deleteContainer')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.deleteContainerMsg', { name: deleteTarget?.Names?.split('/').pop() })}</p>
          <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
            <input type="checkbox" id="forceDelete" className="rounded border-surface-300 dark:border-surface-600" />
            {t('docker.forceDelete', 'Force delete')}
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { if (deleteTarget) { const force = (document.getElementById('forceDelete') as HTMLInputElement)?.checked; deleteContainer.mutate({ nodeId, containerId: deleteTarget.ID, force: force || undefined }, { onSuccess: () => setDeleteTarget(null) }) } }} disabled={deleteContainer.isPending}>{deleteContainer.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBulkExecModal} onClose={() => setShowBulkExecModal(false)} title={t('docker.bulkExec', 'Bulk Exec')} size="lg">
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.bulkExecMsg', { count: selectedIds.size })}</p>
          <Input label={t('docker.command')} placeholder="sh -c 'uptime'" value={bulkExecCommand} onChange={(e) => setBulkExecCommand(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowBulkExecModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleBulkExec} disabled={bulkExec.isPending || !bulkExecCommand}>{bulkExec.isPending ? t('common.loading') : t('common.execute')}</Button>
          </div>
          {bulkExecResult && (
            <pre className="text-xs font-mono text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800/50 rounded p-4 max-h-64 overflow-y-auto whitespace-pre-wrap">{bulkExecResult}</pre>
          )}
        </div>
      </Modal>
    </>
  )
}

function CreateContainerForm({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const { t } = useTranslation()
  const createContainer = useCreateContainer()
  const [result, setResult] = useState<ContainerCreatedResponse | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContainerCreateFormInput>({
    resolver: zodResolver(containerCreateFormSchema) as Resolver<ContainerCreateFormInput>,
    defaultValues: {
      image: '',
      name: '',
      command: '',
      ports: '',
      env: '',
      volumes: '',
      network: '',
      labels: '',
      restart_policy: 'unless-stopped',
    },
  })

  const parsePorts = (value: string): Record<string, string> | undefined => {
    const entries = value.split(',').map((p) => p.trim()).filter(Boolean)
    if (entries.length === 0) return undefined
    const result: Record<string, string> = {}
    for (const entry of entries) {
      const [host, container] = entry.split(':').map((s) => s.trim())
      if (host && container) result[`${container}/tcp`] = `${host}/tcp`
    }
    return Object.keys(result).length > 0 ? result : undefined
  }

  const parseVolumes = (value: string): Record<string, { bind: string; mode?: 'rw' | 'ro' }> | undefined => {
    const entries = value.split(',').map((p) => p.trim()).filter(Boolean)
    if (entries.length === 0) return undefined
    const result: Record<string, { bind: string; mode?: 'rw' | 'ro' }> = {}
    for (const entry of entries) {
      const parts = entry.split(':').map((s) => s.trim())
      const [host, container] = parts
      if (!host || !container) continue
      const mode = parts[2] === 'ro' ? 'ro' as const : 'rw' as const
      result[container] = { bind: host, mode }
    }
    return Object.keys(result).length > 0 ? result : undefined
  }

  const parseLabels = (value: string): Record<string, string> | undefined => {
    const entries = value.split(',').map((p) => p.trim()).filter(Boolean)
    if (entries.length === 0) return undefined
    const result: Record<string, string> = {}
    for (const entry of entries) {
      const eq = entry.indexOf('=')
      if (eq === -1) continue
      result[entry.slice(0, eq).trim()] = entry.slice(eq + 1).trim()
    }
    return Object.keys(result).length > 0 ? result : undefined
  }

  const onSubmit = (values: ContainerCreateFormInput) => {
    setResult(null)
    createContainer.mutate(
      {
        nodeId,
        data: {
          image: values.image,
          name: values.name.trim() || undefined,
          command: values.command.trim() || undefined,
          ports: parsePorts(values.ports),
          env: values.env ? values.env.split(',').map((e) => e.trim()).filter(Boolean) : undefined,
          volumes: parseVolumes(values.volumes),
          network: values.network.trim() || undefined,
          labels: parseLabels(values.labels),
          detach: true,
          restart_policy: values.restart_policy.trim() || undefined,
        },
      },
      {
        onSuccess: (data) => {
          setResult(data)
          reset()
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {result && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-sm">
          <p className="font-medium text-green-800 dark:text-green-300">{t('docker.containerCreated', 'Container created')}</p>
          <p className="text-green-700 dark:text-green-400 font-mono text-xs mt-1">
            id: {result.id.slice(0, 12)} · name: {result.name} · image: {result.image} · status: {result.status}
          </p>
        </div>
      )}
      <Input label={t('docker.image')} placeholder="nginx:latest" {...register('image')} error={errors.image?.message} />
      <Input label={t('docker.name')} placeholder="my-container" {...register('name')} error={errors.name?.message} />
      <Input label={t('docker.command')} placeholder="/bin/sh -c 'echo hello'" {...register('command')} error={errors.command?.message} />
      <Input label={`${t('docker.ports')} (${t('docker.hostPort')})`} placeholder="8080:80, 443:443" {...register('ports')} />
      <Input label={t('docker.environment')} placeholder="NODE_ENV=production, PORT=3000" {...register('env')} />
      <Input label={t('docker.volumes', 'Volumes')} placeholder="/host/path:/container/path:rw" {...register('volumes')} />
      <Input label={t('docker.network', 'Network')} placeholder="bridge" {...register('network')} error={errors.network?.message} />
      <Input label={t('docker.labels', 'Labels')} placeholder="env=prod, app=web" {...register('labels')} />
      <Input label={t('docker.restartPolicy', 'Restart policy')} placeholder="unless-stopped" {...register('restart_policy')} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
        <Button type="submit" disabled={createContainer.isPending}>{createContainer.isPending ? t('common.loading') : t('docker.createContainer')}</Button>
      </div>
    </form>
  )
}

function ContainerLogsContent({ nodeId, containerId }: { nodeId: string; containerId: string }) {
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

function ContainerStatsContent({ nodeId, containerId }: { nodeId: string; containerId: string }) {
  const { t } = useTranslation()
  const { data: stats, isLoading } = useDockerContainerStats(nodeId, containerId)
  if (isLoading) return <Spinner size="lg" className="mx-auto my-8" />
  if (!stats) return <p className="text-sm text-surface-500 text-center py-4">{t('docker.noStats')}</p>
  return (
    <div className="space-y-3">
      {[
        [t('docker.container'), stats.Container],
        [t('docker.name'), stats.Name],
        [t('docker.cpu'), stats.CPUPerc],
        [t('docker.memory'), `${stats.MemUsage} (${stats.MemPerc})`],
        [t('docker.netIO'), stats.NetIO],
        [t('docker.blockIO'), stats.BlockIO],
        [t('docker.memoryLimit'), stats.MemLimit || '—'],
        [t('docker.pids'), stats.PIDs || '—'],
      ].map(([key, value]) => (
        <div key={key} className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800 last:border-0">
          <span className="text-sm text-surface-600 dark:text-surface-400">{key}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white">{value}</span>
        </div>
      ))}
    </div>
  )
}

function ExecContainerContent({ nodeId, containerId, onClose }: { nodeId: string; containerId: string; onClose: () => void }) {
  const { t } = useTranslation()
  const execContainer = useExecContainer()
  const [command, setCommand] = useState('sh')
  const [output, setOutput] = useState('')

  const handleExec = () => {
    execContainer.mutate({ nodeId, containerId, data: { command } }, { onSuccess: (res) => { setOutput((prev) => prev + `\n$ ${command}\nstdout: ${res.stdout}\nstderr: ${res.stderr}\nexit_code: ${res.exit_code}\n`) }, onError: (err) => { setOutput((prev) => prev + `\n$ ${command}\nError: ${err.message}\n`) } })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input label={t('docker.command')} placeholder="sh -c 'ls -la'" value={command} onChange={(e) => setCommand(e.target.value)} className="flex-1" />
        <div className="flex items-end">
          <Button onClick={handleExec} disabled={execContainer.isPending || !command}>{execContainer.isPending ? <Spinner size="sm" /> : t('common.start')}</Button>
        </div>
      </div>
      {output && <pre className="text-xs font-mono text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800/50 rounded p-4 max-h-64 overflow-y-auto whitespace-pre-wrap">{output}</pre>}
      <div className="flex justify-end"><Button variant="ghost" onClick={onClose}>{t('common.close')}</Button></div>
    </div>
  )
}

function ContainerInspectContent({ nodeId, containerId }: { nodeId: string; containerId: string }) {
  const { t } = useTranslation()
  const { data: inspect, isLoading } = useDockerContainerInspect(nodeId, containerId)
  if (isLoading) return <Spinner size="lg" className="mx-auto my-8" />
  if (!inspect) return <p className="text-sm text-surface-500 text-center py-4">{t('docker.noData')}</p>
  const rows: [string, string][] = [
    [t('docker.id'), inspect.Id?.slice(0, 12) || '—'],
    [t('docker.name'), inspect.Name?.split('/').pop() || '—'],
    [t('docker.status'), inspect.State?.status || '—'],
    [t('docker.running'), inspect.State?.running ? t('docker.yes') : t('docker.no')],
    [t('docker.exitCode'), String(inspect.State?.exit_code ?? '—')],
    [t('docker.command'), inspect.Config?.cmd?.join(' ') || '—'],
    [t('docker.hostname'), inspect.Config?.hostname || '—'],
    [t('docker.image'), inspect.Config?.image || '—'],
  ]
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {rows.map(([key, value]) => (
        <div key={key} className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800 last:border-0">
          <span className="text-sm text-surface-600 dark:text-surface-400">{key}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white font-mono text-right max-w-[60%] truncate">{value}</span>
        </div>
      ))}
      {inspect.NetworkSettings && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-surface-500 uppercase mb-1">{t('docker.networkSettings', 'Network Settings')}</p>
          <pre className="text-xs font-mono text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800/50 rounded p-3 overflow-x-auto">{JSON.stringify(inspect.NetworkSettings, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

function ImagesTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { data: images, isLoading } = useDockerImages(nodeId)
  const deleteImage = useDeleteImage()
  const tagImage = useTagImage()
  const buildImage = useBuildImage()
  const [tagTarget, setTagTarget] = useState<{ id: string; tag: string } | null>(null)
  const [tagRepo, setTagRepo] = useState('')
  const [tagName, setTagName] = useState('')
  const [showBuildModal, setShowBuildModal] = useState(false)
  const [buildDockerfile, setBuildDockerfile] = useState('')
  const [buildTag, setBuildTag] = useState('')
  const [inspectTarget, setInspectTarget] = useState<{ id: string; name: string } | null>(null)

  if (isLoading) return <TableSkeleton rows={5} cols={5} />
  if (!images?.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noImages')} description={t('docker.noImagesDesc')} action={<Button onClick={() => setShowBuildModal(true)}>{t('docker.buildImage')}</Button>} />

  return (
    <>
      <div className="flex justify-end mb-4 px-4"><Button onClick={() => setShowBuildModal(true)}>{t('docker.buildImage')}</Button></div>
      <div className="overflow-x-auto">
        <table className="w-full table-zebra">
          <thead className="table-sticky">
            <tr className="border-b border-surface-200 dark:border-surface-800">
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.repository')}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.tag')}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.id')}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.size')}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {images.map((img) => (
              <tr key={img.ID} className="table-row-hover">
                <td className="px-6 py-4 text-sm font-mono text-surface-900 dark:text-white">{img.Repository}</td>
                <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300 font-mono">{img.Tag}</td>
                <td className="px-6 py-4 text-xs text-surface-500 font-mono">{img.ID?.slice(0, 12) || '—'}</td>
                <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{img.Size}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setInspectTarget({ id: img.ID, name: img.Repository || img.ID?.slice(0, 12) || '' })}>{t('docker.inspect', 'Inspect')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => setTagTarget({ id: img.ID, tag: img.Tag })}>{t('docker.tag')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteImage.mutate({ nodeId, imageId: img.ID })} disabled={deleteImage.isPending} className="text-red-500">{t('common.delete')}</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!tagTarget} onClose={() => setTagTarget(null)} title={`${t('docker.tag')}: ${tagTarget?.tag || ''}`}>
        <div className="space-y-4">
          <Input label={t('docker.repository')} placeholder="myregistry/myimage" value={tagRepo} onChange={(e) => setTagRepo(e.target.value)} />
          <Input label={t('docker.tag')} placeholder="latest" value={tagName} onChange={(e) => setTagName(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setTagTarget(null)}>{t('common.cancel')}</Button>
            <Button onClick={() => { if (tagTarget && tagRepo && tagName) { tagImage.mutate({ nodeId, imageId: tagTarget.id, data: { repo: tagRepo, tag: tagName } }, { onSuccess: () => setTagTarget(null) }) } }} disabled={!tagRepo || !tagName || tagImage.isPending}>{tagImage.isPending ? t('common.loading') : t('docker.tag')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBuildModal} onClose={() => setShowBuildModal(false)} title={t('docker.buildImage')} size="lg">
        <div className="space-y-4">
          <Input label={t('docker.tag')} placeholder="myimage:latest" value={buildTag} onChange={(e) => setBuildTag(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">{t('docker.dockerfile')}</label>
            <textarea rows={10} value={buildDockerfile} onChange={(e) => setBuildDockerfile(e.target.value)} className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" placeholder="FROM nginx:latest" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowBuildModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => { buildImage.mutate({ nodeId, data: { dockerfile: buildDockerfile, tag: buildTag } }, { onSuccess: () => setShowBuildModal(false) }) }} disabled={!buildTag || !buildDockerfile || buildImage.isPending}>{buildImage.isPending ? t('common.loading') : t('docker.buildImage')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!inspectTarget} onClose={() => setInspectTarget(null)} title={`${t('docker.inspect')}: ${inspectTarget?.name || ''}`} size="lg">
        {inspectTarget && <ImageInspectContent nodeId={nodeId} imageId={inspectTarget.id} />}
      </Modal>
    </>
  )
}

function ImageInspectContent({ nodeId, imageId }: { nodeId: string; imageId: string }) {
  const { t } = useTranslation()
  const { data: inspect, isLoading } = useDockerImageInspect(nodeId, imageId)
  if (isLoading) return <Spinner size="lg" className="mx-auto my-8" />
  if (!inspect) return <p className="text-sm text-surface-500 text-center py-4">{t('docker.noData')}</p>
  const rows: [string, string][] = [
    [t('docker.id'), inspect.id?.slice(0, 12) || '—'],
    [t('docker.architecture', 'Architecture'), inspect.architecture || '—'],
    [t('docker.os', 'OS'), inspect.os || '—'],
    [t('docker.size'), formatBytes(inspect.size)],
    [t('docker.created'), inspect.created ? new Date(inspect.created).toLocaleString() : '—'],
    [t('docker.tags', 'Tags'), inspect.repo_tags?.join(', ') || '—'],
  ]
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {rows.map(([key, value]) => (
        <div key={key} className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800 last:border-0">
          <span className="text-sm text-surface-600 dark:text-surface-400">{key}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white text-right max-w-[60%] truncate">{value}</span>
        </div>
      ))}
    </div>
  )
}

function NetworksTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { data: networks, isLoading } = useDockerNetworks(nodeId)
  if (isLoading) return <TableSkeleton rows={3} cols={4} />
  // List-only: the OpenAPI spec only exposes GET /nodes/{id}/docker/networks.
  // Create/delete endpoints for networks do not exist, so no such actions are offered.
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

function VolumesTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { data: volumes, isLoading } = useDockerVolumes(nodeId)
  if (isLoading) return <TableSkeleton rows={3} cols={4} />
  // List-only: the OpenAPI spec only exposes GET /nodes/{id}/docker/volumes.
  // Create/delete endpoints for volumes do not exist, so no such actions are offered.
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

export function Docker() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const { data: nodesData } = useNodes({ size: 100 })
  const nodes = nodesData?.items || []
  const [selectedNodeId, setSelectedNodeId] = useState(() => searchParams.get('node') ?? '')

  useEffect(() => {
    if (nodes.length > 0 && !nodes.some((n) => n.id === selectedNodeId)) {
      setSelectedNodeId(nodes[0].id)
    }
  }, [nodes, selectedNodeId])
  const [activeTab, setActiveTab] = useState<Tab>('containers')
  const [showPullModal, setShowPullModal] = useState(false)
  const [pullImage, setPullImage] = useState('')
  const [pullTimeout, setPullTimeout] = useState(300)
  const [pullResult, setPullResult] = useState<DockerPullResult | null>(null)
  const pullImageMutation = usePullImage()

  const handlePull = () => {
    if (!selectedNodeId || !pullImage) return
    setPullResult(null)
    pullImageMutation.mutate(
      { nodeId: selectedNodeId, data: { image: pullImage, timeout: pullTimeout } },
      {
        onSuccess: (data) => {
          setPullResult(data)
          setPullImage('')
          setPullTimeout(300)
        },
      },
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'containers', label: t('docker.containers') },
    { key: 'images', label: t('docker.images') },
    { key: 'networks', label: t('docker.networks') },
    { key: 'volumes', label: t('docker.volumes') },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('docker.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{t('docker.description')}</p>
        </div>
        <Button onClick={() => setShowPullModal(true)}>{t('docker.pullImage')}</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-surface-600 dark:text-surface-400">{t('docker.selectNode')}</label>
          <select value={selectedNodeId} onChange={(e) => setSelectedNodeId(e.target.value)} className="px-4 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
            {nodes.map((n) => (<option key={n.id} value={n.id}>{n.name}</option>))}
          </select>
        </div>
      </div>

      <div className="border-b border-surface-200 dark:border-surface-800">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-accent-500 text-accent-600 dark:text-accent-400' : 'border-transparent text-surface-500 hover:text-surface-700 dark:text-surface-400'}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <Card className="stagger-item">
        <CardContent className="p-0">
          {selectedNodeId && (
            <>
              {activeTab === 'containers' && <ContainersTab nodeId={selectedNodeId} />}
              {activeTab === 'images' && <ImagesTab nodeId={selectedNodeId} />}
              {activeTab === 'networks' && <NetworksTab nodeId={selectedNodeId} />}
              {activeTab === 'volumes' && <VolumesTab nodeId={selectedNodeId} />}
            </>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showPullModal} onClose={() => { setShowPullModal(false); setPullResult(null) }} title={t('docker.pullImage')}>
        <div className="space-y-4">
          <Input label={t('docker.image')} placeholder="nginx:latest" value={pullImage} onChange={(e) => setPullImage(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-600 dark:text-surface-400">{t('docker.pullTimeout', 'Timeout (seconds)')}</label>
            <input type="number" min={1} max={3600} value={pullTimeout} onChange={(e) => setPullTimeout(Number(e.target.value) || 300)} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
          </div>
          {pullResult && (
            <div className={`p-3 rounded-lg border text-xs font-mono max-h-56 overflow-y-auto whitespace-pre-wrap ${pullResult.success ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>
              {pullResult.output || (pullResult.success ? t('docker.pullSuccess', 'Image pulled successfully') : t('docker.pullFailed', 'Pull failed'))}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setShowPullModal(false); setPullResult(null) }}>{t('common.cancel')}</Button>
            <Button onClick={handlePull} disabled={!pullImage || !selectedNodeId || pullImageMutation.isPending}>
              {pullImageMutation.isPending ? t('common.loading') : t('docker.pull')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
