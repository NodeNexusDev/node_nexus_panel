// oxlint-disable react-hooks/exhaustive-deps
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Tabs } from '../ui/Tabs'
import { Card, CardContent } from '../ui/Card'
import { KeyValueList } from '../ui/KeyValueList'
import { useToast } from '../ui/useToast'
import { IconDocker } from '../ui/Icons'
import { useDeleteNetwork, useConnectNetwork, useDisconnectNetwork } from '../../hooks/useDocker'
import { NetworkInspectContent } from './NetworkInspectContent'
import type { DockerNetwork } from '../../api/types'

type DrawerTab = 'overview' | 'inspect' | 'containers'

interface NetworkDrawerProps {
  nodeId: string
  network: DockerNetwork
  onClose: () => void
}

export function NetworkDrawer({ nodeId, network, onClose }: NetworkDrawerProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [active, setActive] = useState<DrawerTab>('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteNetwork = useDeleteNetwork()
  const connectNetwork = useConnectNetwork()
  const disconnectNetwork = useDisconnectNetwork()
  const [connectContainerId, setConnectContainerId] = useState('')
  const [disconnectContainerId, setDisconnectContainerId] = useState('')

  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setActive('overview')
    setShowDeleteConfirm(false)
    setConnectContainerId('')
    setDisconnectContainerId('')
  }, [network.ID])

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: 'overview', label: t('docker.overview', 'Overview') },
    { key: 'inspect', label: t('docker.inspect', 'Inspect') },
    { key: 'containers', label: t('docker.containers', 'Containers') },
  ]

  const handleDelete = () => {
    deleteNetwork.mutate({ nodeId, networkId: network.ID }, {
      onSuccess: () => { toast('success', t('docker.toastDeleteNetworkDone', 'Network deleted')); onClose() },
      onError: () => toast('error', t('docker.toastDeleteNetworkFailed', 'Delete failed')),
    })
  }
  const handleConnect = () => {
    if (!connectContainerId.trim()) return
    connectNetwork.mutate({ nodeId, networkId: network.ID, data: { container_id: connectContainerId.trim() } as never }, {
      onSuccess: () => { toast('success', t('docker.toastConnectDone', 'Connected')); setConnectContainerId('') },
      onError: () => toast('error', t('docker.toastConnectFailed', 'Connect failed')),
    })
  }
  const handleDisconnect = () => {
    if (!disconnectContainerId.trim()) return
    disconnectNetwork.mutate({ nodeId, networkId: network.ID, data: { container_id: disconnectContainerId.trim() } as never }, {
      onSuccess: () => { toast('success', t('docker.toastDisconnectDone', 'Disconnected')); setDisconnectContainerId('') },
      onError: () => toast('error', t('docker.toastDisconnectFailed', 'Disconnect failed')),
    })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center shrink-0">
          <IconDocker className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-surface-900 dark:text-white truncate">{network.Name}</p>
          <p className="text-xs font-mono text-surface-500 truncate">{network.ID.slice(0, 12)} — {network.Driver}</p>
        </div>
        <button onClick={onClose} aria-label={t('common.close')} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 shrink-0 cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="default">{network.Driver}</Badge>
        <Badge variant="info">{network.Scope}</Badge>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm((v) => !v)} className="text-red-500 ml-auto">{t('common.delete')}</Button>
      </div>
      {showDeleteConfirm && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-between gap-3">
          <p className="text-xs text-red-700 dark:text-red-300">{t('docker.deleteNetworkMsg', { name: network.Name })}</p>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" size="sm" disabled={deleteNetwork.isPending} onClick={handleDelete}>{deleteNetwork.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      )}

      <Tabs tabs={tabs} active={active} onChange={setActive} />

      {active === 'overview' && <NetworkOverview network={network} />}
      {active === 'inspect' && <NetworkInspectContent nodeId={nodeId} networkId={network.ID} />}
      {active === 'containers' && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-surface-900 dark:text-white">{t('docker.connectContainer', 'Connect container')}</p>
              <div className="flex gap-2">
                <Input value={connectContainerId} onChange={(e) => setConnectContainerId(e.target.value)} placeholder={t('docker.containerId')} className="flex-1" />
                <Button size="sm" disabled={connectNetwork.isPending || !connectContainerId.trim()} onClick={handleConnect}>{connectNetwork.isPending ? t('common.loading') : t('docker.connect', 'Connect')}</Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-surface-900 dark:text-white">{t('docker.disconnectContainer', 'Disconnect container')}</p>
              <div className="flex gap-2">
                <Input value={disconnectContainerId} onChange={(e) => setDisconnectContainerId(e.target.value)} placeholder={t('docker.containerId')} className="flex-1" />
                <Button size="sm" disabled={disconnectNetwork.isPending || !disconnectContainerId.trim()} onClick={handleDisconnect}>{disconnectNetwork.isPending ? t('common.loading') : t('docker.disconnect', 'Disconnect')}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function NetworkOverview({ network }: { network: DockerNetwork }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        <KeyValueList rows={[
          { label: t('docker.id', 'ID'), value: network.ID },
          { label: t('docker.name', 'Name'), value: network.Name },
          { label: t('docker.driver', 'Driver'), value: network.Driver },
          { label: t('docker.scope', 'Scope'), value: network.Scope },
        ]} />
      </CardContent>
    </Card>
  )
}
