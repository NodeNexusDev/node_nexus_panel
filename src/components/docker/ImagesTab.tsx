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
import { useDockerImages, useDeleteImage, useTagImage, useBuildImage, usePruneImages, useBulkDockerImageRemove, useBulkDockerImageBuild, useBulkDockerPull } from '../../hooks/useDocker'
import { ImageInspectContent } from './ImageInspectContent'

export function ImagesTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: images, isLoading, error, refetch } = useDockerImages(nodeId)
  const deleteImage = useDeleteImage()
  const tagImage = useTagImage()
  const buildImage = useBuildImage()
  const bulkImageRemove = useBulkDockerImageRemove()
  const bulkImageBuild = useBulkDockerImageBuild()
  const bulkPull = useBulkDockerPull()
  const pruneImages = usePruneImages()
  const [tagTarget, setTagTarget] = useState<{ id: string; tag: string } | null>(null)
  const [tagRepo, setTagRepo] = useState('')
  const [tagName, setTagName] = useState('')
  const [showBuildModal, setShowBuildModal] = useState(false)
  const [buildDockerfile, setBuildDockerfile] = useState('')
  const [buildTag, setBuildTag] = useState('')
  const [inspectTarget, setInspectTarget] = useState<{ id: string; name: string } | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkRemove, setShowBulkRemove] = useState(false)
  const [showBulkBuild, setShowBulkBuild] = useState(false)
  const [showBulkPull, setShowBulkPull] = useState(false)
  const [bulkPullImage, setBulkPullImage] = useState('')
  const [showPruneConfirm, setShowPruneConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const allSelected = images && images.length > 0 && images.every((img) => selectedIds.has(img.ID))
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(images?.map((img) => img.ID) || []))
  }
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  if (isLoading) return <TableSkeleton rows={5} cols={5} />
  if (error) return <ErrorState error={error} onRetry={refetch} title={t('docker.failedToLoadImages')} />
  if (!images?.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noImages')} description={t('docker.noImagesDesc')} action={<Button onClick={() => setShowBuildModal(true)}>{t('docker.buildImage')}</Button>} />

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800 mb-4 flex-wrap">
          <span className="text-sm text-accent-700 dark:text-accent-300">{t('docker.selected', { count: selectedIds.size })}</span>
          <Button variant="ghost" size="sm" onClick={() => setShowBulkRemove(true)} className="text-red-500">{t('docker.bulkRemoveImages')}</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowBulkBuild(true)}>{t('docker.buildImage')}</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowBulkPull(true)}>{t('docker.pullImage')}</Button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200">{t('docker.clearSelection')}</button>
        </div>
      )}

      <div className="flex justify-end mb-4 px-4 gap-2 flex-wrap">
        <Button variant="ghost" onClick={() => setShowBulkPull(true)}>{t('docker.pullImage')}</Button>
        <Button variant="ghost" onClick={() => setShowPruneConfirm(true)} disabled={pruneImages.isPending}>{pruneImages.isPending ? t('common.loading') : t('docker.pruneImages')}</Button>
        <Button onClick={() => setShowBuildModal(true)}>{t('docker.buildImage')}</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-zebra">
          <thead className="table-sticky">
            <tr className="border-b border-surface-200 dark:border-surface-800">
              <th className="px-6 py-3"><div className="flex items-center"><input type="checkbox" checked={!!allSelected} onChange={toggleAll} aria-label={t('common.selectAll')} className="w-4 h-4 rounded border-surface-300 dark:border-surface-600" /></div></th>
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
                <td className="px-6 py-4"><div className="flex items-center"><input type="checkbox" checked={selectedIds.has(img.ID)} onChange={() => toggleOne(img.ID)} onClick={(e) => e.stopPropagation()} aria-label={t('common.selectItem', { name: img.Repository || img.ID?.slice(0, 12) || '' })} className="w-4 h-4 rounded border-surface-300 dark:border-surface-600" /></div></td>
                <td className="px-6 py-4 text-sm font-mono text-surface-900 dark:text-white">{img.Repository}</td>
                <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300 font-mono">{img.Tag}</td>
                <td className="px-6 py-4 text-xs text-surface-500 font-mono">{img.ID?.slice(0, 12) || '—'}</td>
                <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{img.Size}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setInspectTarget({ id: img.ID, name: img.Repository || img.ID?.slice(0, 12) || '' })}>{t('docker.inspect')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => setTagTarget({ id: img.ID, tag: img.Tag })}>{t('docker.tag')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: img.ID, name: img.Repository || img.ID?.slice(0, 12) || '' })} className="text-red-500">{t('common.delete')}</Button>
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
            <Button onClick={() => { if (tagTarget && tagRepo && tagName) { tagImage.mutate({ nodeId, imageId: tagTarget.id, data: { repo: tagRepo, tag: tagName } }, { onSuccess: () => setTagTarget(null), onError: () => toast('error', t('docker.toastTagFailed')) }) } }} disabled={!tagRepo || !tagName || tagImage.isPending}>{tagImage.isPending ? t('common.loading') : t('docker.tag')}</Button>
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
            <Button onClick={() => { buildImage.mutate({ nodeId, data: { dockerfile: buildDockerfile, tag: buildTag } }, { onSuccess: () => setShowBuildModal(false), onError: () => toast('error', t('docker.toastBuildFailed')) }) }} disabled={!buildTag || !buildDockerfile || buildImage.isPending}>{buildImage.isPending ? t('common.loading') : t('docker.buildImage')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!inspectTarget} onClose={() => setInspectTarget(null)} title={`${t('docker.inspect')}: ${inspectTarget?.name || ''}`} size="lg">
        {inspectTarget && <ImageInspectContent nodeId={nodeId} imageId={inspectTarget.id} />}
      </Modal>

      <Modal isOpen={showBulkRemove} onClose={() => setShowBulkRemove(false)} title={t('docker.bulkRemoveImages', 'Bulk Remove Images')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.bulkRemoveImagesMsg', { count: selectedIds.size })}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowBulkRemove(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={async () => {
              const ids = Array.from(selectedIds)
              const results = await Promise.allSettled(ids.map((imageId) => bulkImageRemove.mutateAsync({ image_id: imageId, node_ids: [nodeId] })))
              const succeeded = results.filter((r) => r.status === 'fulfilled').length
              const failed = results.filter((r) => r.status === 'rejected').length
              if (failed === 0) toast('success', t('docker.toastBulkRemoveDone', 'Images removed'))
              else toast('warning', t('docker.toastBulkRemovePartial', { succeeded, failed }))
              setShowBulkRemove(false)
              setSelectedIds(new Set())
            }} disabled={bulkImageRemove.isPending}>{bulkImageRemove.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBulkBuild} onClose={() => setShowBulkBuild(false)} title={t('docker.buildImage')} size="lg">
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.bulkBuildMsg', { count: selectedIds.size })}</p>
          <Input label={t('docker.tag')} placeholder="myimage:latest" value={buildTag} onChange={(e) => setBuildTag(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">{t('docker.dockerfile')}</label>
            <textarea rows={10} value={buildDockerfile} onChange={(e) => setBuildDockerfile(e.target.value)} className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" placeholder="FROM nginx:latest" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowBulkBuild(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => {
              bulkImageBuild.mutate({ dockerfile: buildDockerfile, tag: buildTag, node_ids: [nodeId] }, {
                onSuccess: () => { toast('success', t('docker.toastBulkBuildDone', 'Build started')); setShowBulkBuild(false) },
                onError: () => toast('error', t('docker.toastBulkBuildFailed', 'Failed to start build')),
              })
            }} disabled={!buildTag || !buildDockerfile || bulkImageBuild.isPending}>{bulkImageBuild.isPending ? t('common.loading') : t('docker.buildImage')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBulkPull} onClose={() => { setShowBulkPull(false); setBulkPullImage('') }} title={t('docker.pullImage')}>
        <div className="space-y-4">
          <Input label={t('docker.image')} placeholder="nginx:latest" value={bulkPullImage} onChange={(e) => setBulkPullImage(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setShowBulkPull(false); setBulkPullImage('') }}>{t('common.cancel')}</Button>
            <Button onClick={() => {
              bulkPull.mutate({ image: bulkPullImage, node_ids: [nodeId] }, {
                onSuccess: () => { toast('success', t('docker.toastPullDone')); setShowBulkPull(false); setBulkPullImage('') },
                onError: () => toast('error', t('docker.toastPullFailed')),
              })
            }} disabled={!bulkPullImage || bulkPull.isPending}>{bulkPull.isPending ? t('common.loading') : t('docker.pullImage')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('common.delete')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.deleteImageMsg', { name: deleteTarget?.name })}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { if (deleteTarget) { deleteImage.mutate({ nodeId, imageId: deleteTarget.id }, { onSuccess: () => { toast('success', t('docker.toastBulkRemoveDone')); setDeleteTarget(null) }, onError: () => toast('error', t('docker.toastDeleteFailed')) }) } }} disabled={deleteImage.isPending}>{deleteImage.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showPruneConfirm} onClose={() => setShowPruneConfirm(false)} title={t('docker.pruneImages')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.confirmPruneImages')}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowPruneConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { pruneImages.mutate(nodeId, { onSuccess: () => { toast('success', t('docker.toastPruneImagesDone')); setShowPruneConfirm(false) }, onError: () => toast('error', t('docker.toastPruneImagesFailed')) }) }} disabled={pruneImages.isPending}>{pruneImages.isPending ? t('common.loading') : t('docker.pruneImages')}</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
