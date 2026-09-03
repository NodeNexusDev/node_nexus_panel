import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Tabs } from '../components/ui/Tabs'
import { IconDocker } from '../components/ui/Icons'
import { usePullImage } from '../hooks/useDocker'
import { useNodes } from '../hooks/useNodes'
import { useToast } from '../components/ui/useToast'
import { ContainersTab } from '../components/docker/ContainersTab'
import { ImagesTab } from '../components/docker/ImagesTab'
import { NetworksTab } from '../components/docker/NetworksTab'
import { VolumesTab } from '../components/docker/VolumesTab'
import { SystemTab } from '../components/docker/SystemTab'
import { ComposeTab } from '../components/docker/ComposeTab'
import type { DockerPullResult } from '../api/types'

type Tab = 'containers' | 'images' | 'networks' | 'volumes' | 'system' | 'compose'

export function Docker() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const { data: nodesData } = useNodes({ size: 100 })
  const dockerNodes = useMemo(
    () => (nodesData?.items || []).filter((n) => n.has_docker),
    [nodesData]
  )
  const [selectedNodeId, setSelectedNodeId] = useState(() => searchParams.get('node') ?? '')

  useEffect(() => {
    if (dockerNodes.length > 0 && !dockerNodes.some((n) => n.id === selectedNodeId)) {
      setSelectedNodeId(dockerNodes[0].id)
    }
  }, [dockerNodes, selectedNodeId])
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
    { key: 'system', label: t('docker.system', 'System') },
    { key: 'compose', label: t('docker.compose', 'Compose') },
  ]
  const tabsForComp = tabs.map((tab) => ({ key: tab.key, label: tab.label }))

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('docker.title')}
        description={t('docker.description')}
        actions={<Button onClick={() => setShowPullModal(true)}>{t('docker.pullImage')}</Button>}
      />

      <div className="flex items-center gap-4">
        <div className="w-64">
          <Select
            label={t('docker.selectNode')}
            value={selectedNodeId}
            onChange={setSelectedNodeId}
            options={dockerNodes.map((n) => ({ value: n.id, label: n.name }))}
          />
        </div>
      </div>

      <Tabs tabs={tabsForComp} active={activeTab} onChange={(k)=> setActiveTab(k as Tab)} />

      <Card hover className="stagger-item">
        <CardContent className="p-0">
          {dockerNodes.length === 0 ? (
            <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noDockerNodes', 'No Docker nodes')} description={t('docker.noDockerNodesDesc', 'Add a Docker node to manage containers, images, networks and volumes')} action={<Button onClick={()=> window.location.href='/nodes'}>{t('nodes.addNode')}</Button>} />
          ) : !selectedNodeId ? (
            <TableSkeleton rows={6} cols={6} />
          ) : (
            <>
              {activeTab === 'containers' && <ContainersTab nodeId={selectedNodeId} />}
              {activeTab === 'images' && <ImagesTab nodeId={selectedNodeId} />}
              {activeTab === 'networks' && <NetworksTab nodeId={selectedNodeId} />}
              {activeTab === 'volumes' && <VolumesTab nodeId={selectedNodeId} />}
              {activeTab === 'system' && <SystemTab nodeId={selectedNodeId} />}
              {activeTab === 'compose' && <ComposeTab nodeId={selectedNodeId} />}
            </>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showPullModal} onClose={() => { setShowPullModal(false); setPullResult(null) }} title={t('docker.pullImage')}>
        <div className="space-y-4">
          <Input label={t('docker.image')} placeholder="nginx:latest" value={pullImage} onChange={(e) => setPullImage(e.target.value)} />
          <Input label={t('docker.pullTimeout')} placeholder="300" type="number" min={1} max={3600} value={String(pullTimeout)} onChange={(e) => setPullTimeout(Math.max(1, Math.min(3600, Number(e.target.value) || 300)))} />
          {pullResult && (
            <div className={`p-3 rounded-lg border text-xs font-mono max-h-56 overflow-y-auto whitespace-pre-wrap ${pullResult.success ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>
              {pullResult.output || (pullResult.success ? t('docker.pullSuccess') : t('docker.pullFailed'))}
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
