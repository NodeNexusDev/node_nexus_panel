import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
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
  useStartContainer,
  useStopContainer,
  useRestartContainer,
  useDeleteContainer,
  usePullImage,
  useDeleteImage,
} from '../hooks/useDocker'
import { useNodes } from '../hooks/useNodes'
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
  loading,
}: {
  container: DockerContainer
  nodeId: string
  onStart: () => void
  onStop: () => void
  onRestart: () => void
  onDelete: () => void
  loading: boolean
}) {
  return (
    <tr className="table-row-hover">
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
        <div className="flex items-center gap-1">
          {container.status !== 'running' && (
            <Button variant="ghost" size="sm" onClick={onStart} disabled={loading}>Start</Button>
          )}
          {container.status === 'running' && (
            <Button variant="ghost" size="sm" onClick={onStop} disabled={loading}>Stop</Button>
          )}
          <Button variant="ghost" size="sm" onClick={onRestart} disabled={loading}>Restart</Button>
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
  const [deleteTarget, setDeleteTarget] = useState<DockerContainer | null>(null)

  if (isLoading) return <TableSkeleton rows={5} cols={6} />
  if (!containers?.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title="No containers" description="No Docker containers found on this node" />

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full table-zebra">
          <thead className="table-sticky">
            <tr className="border-b border-surface-200 dark:border-surface-800">
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
              <ContainerRow
                key={c.id}
                container={c}
                nodeId={nodeId}
                onStart={() => startContainer.mutate({ nodeId, containerId: c.id })}
                onStop={() => stopContainer.mutate({ nodeId, containerId: c.id })}
                onRestart={() => restartContainer.mutate({ nodeId, containerId: c.id })}
                onDelete={() => setDeleteTarget(c)}
                loading={startContainer.isPending || stopContainer.isPending || restartContainer.isPending}
              />
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteContainer.mutate({ nodeId, containerId: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) })
        }}
        title="Delete Container"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel={t('common.delete')}
        loading={deleteContainer.isPending}
      />
    </>
  )
}

function ImagesTab({ nodeId }: { nodeId: string }) {
  const { data: images, isLoading } = useDockerImages(nodeId)
  const deleteImage = useDeleteImage()

  if (isLoading) return <TableSkeleton rows={5} cols={4} />
  if (!images?.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title="No images" description="No Docker images found on this node" />

  return (
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
                <Button variant="ghost" size="sm" onClick={() => deleteImage.mutate({ nodeId, imageId: img.id })} disabled={deleteImage.isPending} className="text-red-500">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
          <select
            value={selectedNodeId}
            onChange={(e) => setSelectedNodeId(e.target.value)}
            className="px-4 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-b border-surface-200 dark:border-surface-800">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                  : 'border-transparent text-surface-500 hover:text-surface-700 dark:text-surface-400'
              }`}
            >
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
            <Button
              onClick={() => {
                if (selectedNodeId && pullImage) {
                  pullImageMutation.mutate(
                    { nodeId: selectedNodeId, data: { image: pullImage } },
                    { onSuccess: () => { setShowPullModal(false); setPullImage('') } },
                  )
                }
              }}
              disabled={!pullImage || !selectedNodeId || pullImageMutation.isPending}
            >
              {pullImageMutation.isPending ? t('common.loading') : t('docker.pull')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
