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
import { useDockerImages, useDeleteImage, useTagImage, useBuildImage } from '../../hooks/useDocker'
import { ImageInspectContent } from './ImageInspectContent'

export function ImagesTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: images, isLoading, error, refetch } = useDockerImages(nodeId)
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
  if (error) return <ErrorState error={error} onRetry={refetch} title={t('docker.failedToLoadImages')} />
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
                    <Button variant="ghost" size="sm" onClick={() => deleteImage.mutate({ nodeId, imageId: img.ID }, { onError: () => toast('error', t('docker.toastDeleteFailed')) })} disabled={deleteImage.isPending} className="text-red-500">{t('common.delete')}</Button>
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
    </>
  )
}
