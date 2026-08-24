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
import { useDockerVolumes, useCreateVolume, useDeleteVolume, usePruneVolumes } from '../../hooks/useDocker'
import { VolumeInspectContent } from './VolumeInspectContent'

export function VolumesTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: volumes, isLoading, error, refetch } = useDockerVolumes(nodeId)
  const createVolume = useCreateVolume()
  const deleteVolume = useDeleteVolume()
  const pruneVolumes = usePruneVolumes()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDriver, setCreateDriver] = useState('')
  const [inspectTarget, setInspectTarget] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [showPruneConfirm, setShowPruneConfirm] = useState(false)

  if (isLoading) return <TableSkeleton rows={3} cols={4} />
  if (error) return <ErrorState error={error} onRetry={refetch} title={t('docker.failedToLoadVolumes')} />
  if (!volumes?.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noVolumes')} description={t('docker.noVolumesDesc')} action={<Button onClick={() => setShowCreateModal(true)}>{t('docker.createVolume')}</Button>} />

  return (
    <>
      <div className="flex justify-end mb-4 px-4 gap-2 flex-wrap">
        <Button variant="ghost" onClick={() => setShowPruneConfirm(true)} disabled={pruneVolumes.isPending}>{pruneVolumes.isPending ? t('common.loading') : t('docker.pruneVolumes')}</Button>
        <Button onClick={() => setShowCreateModal(true)}>{t('docker.createVolume')}</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-zebra">
          <thead className="table-sticky">
            <tr className="border-b border-surface-200 dark:border-surface-800">
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.name')}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.driver')}</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {volumes.map((v) => (
              <tr key={v.Name} className="table-row-hover">
                <td className="px-6 py-4 text-sm font-semibold text-surface-900 dark:text-white">{v.Name}</td>
                <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{v.Driver}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setInspectTarget(v.Name)}>{t('docker.inspect')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(v.Name)} className="text-red-500">{t('common.delete')}</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('docker.createVolume')}>
        <div className="space-y-4">
          <Input label={t('docker.name')} placeholder="my-volume" value={createName} onChange={(e) => setCreateName(e.target.value)} />
          <Input label={t('docker.driver')} placeholder="local" value={createDriver} onChange={(e) => setCreateDriver(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => { const trimmed = createName.trim(); if (trimmed) { createVolume.mutate({ nodeId, data: { name: trimmed, driver: createDriver.trim() || undefined } }, { onSuccess: () => { toast('success', t('docker.createVolume')); setShowCreateModal(false); setCreateName(''); setCreateDriver('') }, onError: () => toast('error', t('docker.toastCreateVolumeFailed')) }) } }} disabled={!createName.trim() || createVolume.isPending}>{createVolume.isPending ? t('common.loading') : t('common.create')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!inspectTarget} onClose={() => setInspectTarget(null)} title={`${t('docker.inspect')}: ${inspectTarget || ''}`} size="lg">
        {inspectTarget && <VolumeInspectContent nodeId={nodeId} volumeName={inspectTarget} />}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('docker.deleteVolume')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.deleteVolumeMsg', { name: deleteTarget })}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { if (deleteTarget) { deleteVolume.mutate({ nodeId, volumeName: deleteTarget }, { onSuccess: () => { toast('success', t('docker.deleteVolume')); setDeleteTarget(null) }, onError: () => toast('error', t('docker.toastDeleteVolumeFailed')) }) } }} disabled={deleteVolume.isPending}>{deleteVolume.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showPruneConfirm} onClose={() => setShowPruneConfirm(false)} title={t('docker.pruneVolumes')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.confirmPruneVolumes')}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowPruneConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { pruneVolumes.mutate(nodeId, { onSuccess: () => { toast('success', t('docker.toastPruneVolumesDone')); setShowPruneConfirm(false) }, onError: () => toast('error', t('docker.toastPruneVolumesFailed')) }) }} disabled={pruneVolumes.isPending}>{pruneVolumes.isPending ? t('common.loading') : t('docker.pruneVolumes')}</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
