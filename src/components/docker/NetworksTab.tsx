import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { TableSkeleton } from '../ui/Skeleton'
import { IconDocker } from '../ui/Icons'
import { useToast } from '../ui/useToast'
import { useDockerNetworks, useCreateNetwork, useDeleteNetwork, useConnectNetwork, useDisconnectNetwork } from '../../hooks/useDocker'
import { NetworkInspectContent } from './NetworkInspectContent'

export function NetworksTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: networks, isLoading, error, refetch } = useDockerNetworks(nodeId)
  const createNetwork = useCreateNetwork()
  const deleteNetwork = useDeleteNetwork()
  const connectNetwork = useConnectNetwork()
  const disconnectNetwork = useDisconnectNetwork()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDriver, setCreateDriver] = useState('bridge')
  const [inspectTarget, setInspectTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [connectTarget, setConnectTarget] = useState<{ id: string; name: string } | null>(null)
  const [connectContainer, setConnectContainer] = useState('')
  const [disconnectTarget, setDisconnectTarget] = useState<{ id: string; name: string } | null>(null)
  const [disconnectContainer, setDisconnectContainer] = useState('')

  if (isLoading) return <TableSkeleton rows={3} cols={4} />
  if (error) return <ErrorState error={error} onRetry={refetch} title={t('docker.failedToLoadNetworks')} />
  if (!networks?.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noNetworks')} description={t('docker.noNetworksDesc')} action={<Button onClick={() => setShowCreateModal(true)}>{t('docker.createNetwork')}</Button>} />

  return (
    <>
      <div className="flex justify-end mb-4 px-4 gap-2">
        <Button onClick={() => setShowCreateModal(true)}>{t('docker.createNetwork')}</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-zebra">
          <thead className="table-sticky">
            <tr className="border-b border-surface-200 dark:border-surface-800">
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.name')}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.driver')}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.scope')}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {networks.map((n) => (
              <tr key={n.ID} className="table-row-hover">
                <td className="px-6 py-4 text-sm font-semibold text-surface-900 dark:text-white">{n.Name}</td>
                <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{n.Driver}</td>
                <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{n.Scope}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setInspectTarget({ id: n.ID, name: n.Name })}>{t('docker.inspect')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => setConnectTarget({ id: n.ID, name: n.Name })}>{t('docker.connect')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDisconnectTarget({ id: n.ID, name: n.Name })}>{t('docker.disconnect')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: n.ID, name: n.Name })} className="text-red-500">{t('common.delete')}</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('docker.createNetwork')}>
        <div className="space-y-4">
          <Input label={t('docker.name')} placeholder="my-network" value={createName} onChange={(e) => setCreateName(e.target.value)} />
          <Input label={t('docker.driver')} placeholder="bridge" value={createDriver} onChange={(e) => setCreateDriver(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => { if (createName.trim()) { createNetwork.mutate({ nodeId, data: { name: createName.trim(), driver: createDriver || undefined } }, { onSuccess: () => { toast('success', t('docker.createNetwork')); setShowCreateModal(false); setCreateName(''); setCreateDriver('bridge') }, onError: () => toast('error', t('docker.toastCreateNetworkFailed')) }) } }} disabled={!createName.trim() || createNetwork.isPending}>{createNetwork.isPending ? t('common.loading') : t('common.create')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!inspectTarget} onClose={() => setInspectTarget(null)} title={`${t('docker.inspect')}: ${inspectTarget?.name || ''}`} size="lg">
        {inspectTarget && <NetworkInspectContent nodeId={nodeId} networkId={inspectTarget.id} />}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('docker.deleteNetwork')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.deleteNetworkMsg', { name: deleteTarget?.name })}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { if (deleteTarget) { deleteNetwork.mutate({ nodeId, networkId: deleteTarget.id }, { onSuccess: () => { toast('success', t('docker.deleteNetwork')); setDeleteTarget(null) }, onError: () => toast('error', t('docker.toastDeleteNetworkFailed')) }) } }} disabled={deleteNetwork.isPending}>{deleteNetwork.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!connectTarget} onClose={() => setConnectTarget(null)} title={`${t('docker.connect')}: ${connectTarget?.name || ''}`}>
        <div className="space-y-4">
          <Input label={t('docker.containerId')} placeholder="container-id" value={connectContainer} onChange={(e) => setConnectContainer(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setConnectTarget(null)}>{t('common.cancel')}</Button>
            <Button onClick={() => { const trimmed = connectContainer.trim(); if (connectTarget && trimmed) { connectNetwork.mutate({ nodeId, networkId: connectTarget.id, data: { container_id: trimmed } }, { onSuccess: () => { toast('success', t('docker.connect')); setConnectTarget(null); setConnectContainer('') }, onError: () => toast('error', t('docker.toastConnectFailed')) }) } }} disabled={!connectContainer.trim() || connectNetwork.isPending}>{connectNetwork.isPending ? t('common.loading') : t('docker.connect')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!disconnectTarget} onClose={() => setDisconnectTarget(null)} title={`${t('docker.disconnect')}: ${disconnectTarget?.name || ''}`}>
        <div className="space-y-4">
          <Input label={t('docker.containerId')} placeholder="container-id" value={disconnectContainer} onChange={(e) => setDisconnectContainer(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDisconnectTarget(null)}>{t('common.cancel')}</Button>
            <Button onClick={() => { const trimmed = disconnectContainer.trim(); if (disconnectTarget && trimmed) { disconnectNetwork.mutate({ nodeId, networkId: disconnectTarget.id, data: { container_id: trimmed } }, { onSuccess: () => { toast('success', t('docker.disconnect')); setDisconnectTarget(null); setDisconnectContainer('') }, onError: () => toast('error', t('docker.toastDisconnectFailed')) }) } }} disabled={!disconnectContainer.trim() || disconnectNetwork.isPending}>{disconnectNetwork.isPending ? t('common.loading') : t('docker.disconnect')}</Button>
          </div>
        </div>
      </Modal>

    </>
  )
}
