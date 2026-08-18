import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { TableSkeleton } from '../components/ui/Skeleton'
import { IconDocker } from '../components/ui/Icons'
import {
  useDockerContainers,
  useDockerImages,
  useDockerNetworks,
  useDockerVolumes,
  useDockerContainerLogs,
  useDockerContainerStats,
  useStartContainer,
  useStopContainer,
  useRestartContainer,
  useDeleteContainer,
  useCreateContainer,
  useExecContainer,
  usePullImage,
  useDeleteImage,
  useBulkDockerRestart,
  useBulkDockerStart,
  useBulkDockerStop,
} from '../hooks/useDocker'
import { useNodes } from '../hooks/useNodes'
import { dockerApi } from '../api/docker'
import type { DockerContainer } from '../api/types'

type Tab = 'containers' | 'images' | 'networks' | 'volumes'

function ContainerStatusBadge({ status }: { status: DockerContainer['status'] }) {
  const variant = status === 'running' ? 'success' : status === 'paused' ? 'warning' : 'default'
  return <Badge variant={variant}>{status}</Badge>
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
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
  loading: boolean
  selected: boolean
  onSelect: () => void
}) {
  return (
    <tr className="table-row-hover">
      <td className="px-6 py-4">
        <input type="checkbox" checked={selected} onChange={onSelect} className="rounded border-surface-300 dark:border-surface-600" />
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-surface-900 dark:text-white">{container.name}</p>
          <p className="text-xs text-surface-500 font-mono">{container.id.slice(0, 12)}</p>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300 font-mono">{container.image}</td>
      <td className="px-6 py-4"><ContainerStatusBadge status={container.status} /></td>
      <td className="px-6 py-4 text-xs text-surface-500">{container.ports.map((p) => `${p.host_port}:${p.container_port}`).join(', ') || '—'}</td>
      <td className="px-6 py-4 text-xs text-surface-500">{container.created}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1 flex-wrap">
          {container.status !== 'running' && <Button variant="ghost" size="sm" onClick={onStart} disabled={loading}>Start</Button>}
          {container.status === 'running' && <Button variant="ghost" size="sm" onClick={onStop} disabled={loading}>Stop</Button>}
          <Button variant="ghost" size="sm" onClick={onRestart} disabled={loading}>Restart</Button>
          {container.status === 'running' && <Button variant="ghost" size="sm" onClick={onExec}>Exec</Button>}
          <Button variant="ghost" size="sm" onClick={onLogs}>Logs</Button>
          <Button variant="ghost" size="sm" onClick={onStats}>Stats</Button>
          <Button variant="ghost" size="sm" onClick={onDelete} disabled={loading} className="text-red-500 hover:text-red-600">Delete</Button>
        </div>
      </td>
    </tr>
  )
}

function ContainersTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { data: containers, isLoading } = useDockerContainers(nodeId)
  const startContainer = useStartContainer()
  const stopContainer = useStopContainer()
  const restartContainer = useRestartContainer()
  const deleteContainer = useDeleteContainer()
  const bulkRestart = useBulkDockerRestart()
  const bulkStart = useBulkDockerStart()
  const bulkStop = useBulkDockerStop()

  const [deleteTarget, setDeleteTarget] = useState<DockerContainer | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [logsTarget, setLogsTarget] = useState<DockerContainer | null>(null)
  const [statsTarget, setStatsTarget] = useState<DockerContainer | null>(null)
  const [execTarget, setExecTarget] = useState<DockerContainer | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', image: '', ports: '', env: '' })

  const allSelected = containers && selectedIds.size === containers.length
  const toggleAll = () => {
    if (!containers) return
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(containers.map((c) => c.id)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  if (isLoading) return <TableSkeleton rows={5} cols={7} />
  if (!containers?.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title="No containers" description="No Docker containers found on this node" action={<Button onClick={() => setShowCreateModal(true)}>Create Container</Button>} />

  const loading = startContainer.isPending || stopContainer.isPending || restartContainer.isPending

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800">
          <span className="text-sm text-accent-700 dark:text-accent-300">{selectedIds.size} selected</span>
          <Button variant="ghost" size="sm" onClick={() => bulkRestart.mutate({ container_ids: Array.from(selectedIds) })} disabled={bulkRestart.isPending}>Restart all</Button>
          <Button variant="ghost" size="sm" onClick={() => bulkStart.mutate({ container_ids: Array.from(selectedIds) })} disabled={bulkStart.isPending}>Start all</Button>
          <Button variant="ghost" size="sm" onClick={() => bulkStop.mutate({ container_ids: Array.from(selectedIds) })} disabled={bulkStop.isPending}>Stop all</Button>
          <Button variant="ghost" size="sm" onClick={() => {}}>Exec all</Button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full table-zebra">
          <thead className="table-sticky">
            <tr className="border-b border-surface-200 dark:border-surface-800">
              <th className="px-6 py-3"><input type="checkbox" checked={!!allSelected} onChange={toggleAll} className="rounded border-surface-300 dark:border-surface-600" /></th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Ports</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {containers.map((c) => (
              <ContainerRow key={c.id} container={c} nodeId={nodeId}
                onStart={() => startContainer.mutate({ nodeId, containerId: c.id })}
                onStop={() => stopContainer.mutate({ nodeId, containerId: c.id })}
                onRestart={() => restartContainer.mutate({ nodeId, containerId: c.id })}
                onDelete={() => setDeleteTarget(c)}
                onLogs={() => setLogsTarget(c)}
                onStats={() => setStatsTarget(c)}
                onExec={() => setExecTarget(c)}
                loading={loading} selected={selectedIds.has(c.id)} onSelect={() => toggleOne(c.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Container" size="lg">
        <CreateContainerForm nodeId={nodeId} form={createForm} onChange={setCreateForm} onClose={() => setShowCreateModal(false)} />
      </Modal>

      <Modal isOpen={!!logsTarget} onClose={() => setLogsTarget(null)} title={`Logs: ${logsTarget?.name || ''}`} size="lg">
        {logsTarget && <ContainerLogsContent nodeId={nodeId} containerId={logsTarget.id} />}
      </Modal>

      <Modal isOpen={!!statsTarget} onClose={() => setStatsTarget(null)} title={`Stats: ${statsTarget?.name || ''}`} size="md">
        {statsTarget && <ContainerStatsContent nodeId={nodeId} containerId={statsTarget.id} />}
      </Modal>

      <Modal isOpen={!!execTarget} onClose={() => setExecTarget(null)} title={`Exec: ${execTarget?.name || ''}`} size="lg">
        {execTarget && <ExecContainerContent nodeId={nodeId} containerId={execTarget.id} onClose={() => setExecTarget(null)} />}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deleteContainer.mutate({ nodeId, containerId: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) }) }} title="Delete Container" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel={t('common.delete')} loading={deleteContainer.isPending} />
    </>
  )
}

function CreateContainerForm({ nodeId, form, onChange, onClose }: { nodeId: string; form: { name: string; image: string; ports: string; env: string }; onChange: (f: { name: string; image: string; ports: string; env: string }) => void; onClose: () => void }) {
  const { t } = useTranslation()
  const createContainer = useCreateContainer()
  const handleCreate = () => {
    const ports = form.ports ? form.ports.split(',').map((p) => { const [host, container] = p.trim().split(':').map(Number); return { host_port: host, container_port: container, protocol: 'tcp' as const } }) : []
    const env = form.env ? Object.fromEntries(form.env.split(',').map((e) => { const [k, ...v] = e.trim().split('='); return [k, v.join('=')] })) : {}
    createContainer.mutate({ nodeId, data: { name: form.name, image: form.image, ports, env, restart_policy: 'unless-stopped' } }, { onSuccess: () => { onClose(); onChange({ name: '', image: '', ports: '', env: '' }) } })
  }
  return (
    <div className="space-y-4">
      <Input label="Name" placeholder="my-container" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} />
      <Input label="Image" placeholder="nginx:latest" value={form.image} onChange={(e) => onChange({ ...form, image: e.target.value })} />
      <Input label="Ports (host:container, ...)" placeholder="8080:80, 443:443" value={form.ports} onChange={(e) => onChange({ ...form, ports: e.target.value })} />
      <Input label="Environment (KEY=val, ...)" placeholder="NODE_ENV=production, PORT=3000" value={form.env} onChange={(e) => onChange({ ...form, env: e.target.value })} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleCreate} disabled={createContainer.isPending || !form.name || !form.image}>{createContainer.isPending ? t('common.loading') : 'Create'}</Button>
      </div>
    </div>
  )
}

function ContainerLogsContent({ nodeId, containerId }: { nodeId: string; containerId: string }) {
  const { data: logs, isLoading } = useDockerContainerLogs(nodeId, containerId, 200)
  return (
    <div className="max-h-96 overflow-y-auto">
      {isLoading ? <Spinner size="lg" className="mx-auto my-8" /> : (
        <pre className="text-xs font-mono text-surface-700 dark:text-surface-300 whitespace-pre-wrap break-all bg-surface-50 dark:bg-surface-800/50 rounded p-4">{logs?.logs || 'No logs'}</pre>
      )}
    </div>
  )
}

function ContainerStatsContent({ nodeId, containerId }: { nodeId: string; containerId: string }) {
  const { data: stats, isLoading } = useDockerContainerStats(nodeId, containerId)
  if (isLoading) return <Spinner size="lg" className="mx-auto my-8" />
  if (!stats) return <p className="text-sm text-surface-500 text-center py-4">No stats available</p>
  return (
    <div className="space-y-3">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800 last:border-0">
          <span className="text-sm text-surface-600 dark:text-surface-400">{key}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white">{String(value)}</span>
        </div>
      ))}
    </div>
  )
}

function ExecContainerContent({ nodeId, containerId, onClose }: { nodeId: string; containerId: string; onClose: () => void }) {
  const { t } = useTranslation()
  const execContainer = useExecContainer()
  const [command, setCommand] = useState('sh')
  const [workingDir, setWorkingDir] = useState('')
  const [output, setOutput] = useState('')

  const handleExec = () => {
    const cmd = command.split(/\s+/).filter(Boolean)
    execContainer.mutate({ nodeId, containerId, data: { command: cmd, working_dir: workingDir || undefined } }, { onSuccess: (res) => { setOutput((prev) => prev + `\n$ ${command}\n${JSON.stringify(res, null, 2)}\n`) }, onError: (err) => { setOutput((prev) => prev + `\n$ ${command}\nError: ${err.message}\n`) } })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input label="Command" placeholder="sh -c 'ls -la'" value={command} onChange={(e) => setCommand(e.target.value)} className="flex-1" />
        <Input label="Working dir" placeholder="/app" value={workingDir} onChange={(e) => setWorkingDir(e.target.value)} className="w-40" />
        <div className="flex items-end">
          <Button onClick={handleExec} disabled={execContainer.isPending || !command}>{execContainer.isPending ? <Spinner size="sm" /> : 'Run'}</Button>
        </div>
      </div>
      {output && <pre className="text-xs font-mono text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800/50 rounded p-4 max-h-64 overflow-y-auto whitespace-pre-wrap">{output}</pre>}
      <div className="flex justify-end"><Button variant="ghost" onClick={onClose}>{t('common.close')}</Button></div>
    </div>
  )
}

function ImagesTab({ nodeId }: { nodeId: string }) {
  const { data: images, isLoading } = useDockerImages(nodeId)
  const deleteImage = useDeleteImage()
  const [tagTarget, setTagTarget] = useState<{ id: string; tag: string } | null>(null)
  const [tagRepo, setTagRepo] = useState('')
  const [tagName, setTagName] = useState('')
  const [showBuildModal, setShowBuildModal] = useState(false)
  const [buildDockerfile, setBuildDockerfile] = useState('')
  const [buildTag, setBuildTag] = useState('')

  if (isLoading) return <TableSkeleton rows={5} cols={5} />
  if (!images?.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title="No images" description="No Docker images found on this node" action={<Button onClick={() => setShowBuildModal(true)}>Build Image</Button>} />

  return (
    <>
      <div className="flex justify-end mb-4 px-4"><Button onClick={() => setShowBuildModal(true)}>Build Image</Button></div>
      <div className="overflow-x-auto">
        <table className="w-full table-zebra">
          <thead className="table-sticky">
            <tr className="border-b border-surface-200 dark:border-surface-800">
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Tag</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Size</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {images.map((img) => (
              <tr key={img.id} className="table-row-hover">
                <td className="px-6 py-4 text-sm font-mono text-surface-900 dark:text-white">{img.tag}</td>
                <td className="px-6 py-4 text-xs text-surface-500 font-mono">{img.id.slice(0, 12)}</td>
                <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{formatBytes(img.size_bytes)}</td>
                <td className="px-6 py-4 text-xs text-surface-500">{img.created}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setTagTarget({ id: img.id, tag: img.tag.split(':').pop() || '' })}>Tag</Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteImage.mutate({ nodeId, imageId: img.id })} disabled={deleteImage.isPending} className="text-red-500">Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!tagTarget} onClose={() => setTagTarget(null)} title={`Tag image: ${tagTarget?.tag || ''}`}>
        <div className="space-y-4">
          <Input label="Repository" placeholder="myregistry/myimage" value={tagRepo} onChange={(e) => setTagRepo(e.target.value)} />
          <Input label="Tag" placeholder="latest" value={tagName} onChange={(e) => setTagName(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setTagTarget(null)}>Cancel</Button>
            <Button onClick={() => { if (tagTarget && tagRepo && tagName) { dockerApi.tagImage(nodeId, tagTarget.id, { repository: tagRepo, tag: tagName }).then(() => setTagTarget(null)) } }} disabled={!tagRepo || !tagName}>Tag</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBuildModal} onClose={() => setShowBuildModal(false)} title="Build Image" size="lg">
        <div className="space-y-4">
          <Input label="Tag" placeholder="myimage:latest" value={buildTag} onChange={(e) => setBuildTag(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Dockerfile</label>
            <textarea rows={10} value={buildDockerfile} onChange={(e) => setBuildDockerfile(e.target.value)} className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" placeholder="FROM nginx:latest" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowBuildModal(false)}>Cancel</Button>
            <Button onClick={() => { dockerApi.buildImage(nodeId, { dockerfile: buildDockerfile, tag: buildTag }).then(() => setShowBuildModal(false)) }} disabled={!buildTag || !buildDockerfile}>Build</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

function NetworksTab({ nodeId }: { nodeId: string }) {
  const { data: networks, isLoading } = useDockerNetworks(nodeId)
  if (isLoading) return <TableSkeleton rows={3} cols={4} />
  if (!networks?.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title="No networks" description="No Docker networks found" />
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-zebra">
        <thead className="table-sticky">
          <tr className="border-b border-surface-200 dark:border-surface-800">
            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Driver</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Containers</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
          {networks.map((n) => (
            <tr key={n.id} className="table-row-hover">
              <td className="px-6 py-4 text-sm font-semibold text-surface-900 dark:text-white">{n.name}</td>
              <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{n.driver}</td>
              <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{n.containers.length}</td>
              <td className="px-6 py-4 text-xs text-surface-500">{n.created}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function VolumesTab({ nodeId }: { nodeId: string }) {
  const { data: volumes, isLoading } = useDockerVolumes(nodeId)
  if (isLoading) return <TableSkeleton rows={3} cols={4} />
  if (!volumes?.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title="No volumes" description="No Docker volumes found" />
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-zebra">
        <thead className="table-sticky">
          <tr className="border-b border-surface-200 dark:border-surface-800">
            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Driver</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Mountpoint</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
          {volumes.map((v) => (
            <tr key={v.name} className="table-row-hover">
              <td className="px-6 py-4 text-sm font-semibold text-surface-900 dark:text-white">{v.name}</td>
              <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{v.driver}</td>
              <td className="px-6 py-4 text-xs text-surface-500 font-mono truncate max-w-xs">{v.mountpoint}</td>
              <td className="px-6 py-4 text-xs text-surface-500">{v.created}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Docker() {
  const { t } = useTranslation()
  const { data: nodesData } = useNodes({ size: 100 })
  const nodes = nodesData?.items || []
  const [selectedNodeId, setSelectedNodeId] = useState(nodes[0]?.id || '')
  const [activeTab, setActiveTab] = useState<Tab>('containers')
  const [showPullModal, setShowPullModal] = useState(false)
  const [pullImage, setPullImage] = useState('')
  const pullImageMutation = usePullImage()

  const tabs: { key: Tab; label: string }[] = [
    { key: 'containers', label: 'Containers' },
    { key: 'images', label: 'Images' },
    { key: 'networks', label: 'Networks' },
    { key: 'volumes', label: 'Volumes' },
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

      <Card>
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

      <Modal isOpen={showPullModal} onClose={() => setShowPullModal(false)} title={t('docker.pullImage')}>
        <div className="space-y-4">
          <Input label="Image" placeholder="nginx:latest" value={pullImage} onChange={(e) => setPullImage(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowPullModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => { if (selectedNodeId && pullImage) { pullImageMutation.mutate({ nodeId: selectedNodeId, data: { image: pullImage } }, { onSuccess: () => { setShowPullModal(false); setPullImage('') } }) } }} disabled={!pullImage || !selectedNodeId || pullImageMutation.isPending}>
              {pullImageMutation.isPending ? t('common.loading') : t('docker.pull')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
