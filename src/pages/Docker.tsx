import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { TableSkeleton } from '../components/ui/Skeleton'
import { PageHeader } from '../components/ui/PageHeader'
import { usePullImage } from '../hooks/useDocker'
import { useNodes } from '../hooks/useNodes'
import { useToast } from '../components/ui/useToast'
import { ContainersTab } from '../components/docker/ContainersTab'
import { ImagesTab } from '../components/docker/ImagesTab'
import { NetworksTab } from '../components/docker/NetworksTab'
import { VolumesTab } from '../components/docker/VolumesTab'
import type { DockerPullResult } from '../api/types'

type Tab = 'containers' | 'images' | 'networks' | 'volumes'

export function Docker() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const { data: nodesData } = useNodes({ size: 100 })
  const nodes = (nodesData?.items || []).filter((n) => n.connection_type === 'docker')
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
        onSuccess: (data) => { setPullResult(data); setPullImage(''); setPullTimeout(300) },
        onError: () => toast('error', t('docker.toastPullFailed')),
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
      <PageHeader
        title={t('docker.title')}
        description={t('docker.description')}
        actions={<Button onClick={() => setShowPullModal(true)}>{t('docker.pullImage')}</Button>}
      />

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
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-accent-500 text-accent-600 dark:text-accent-400' : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-400'}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <Card hover className="stagger-item">
        <CardContent className="p-0">
          {!selectedNodeId ? (
            <TableSkeleton rows={6} cols={6} />
          ) : (
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
