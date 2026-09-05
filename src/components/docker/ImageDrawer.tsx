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
import { useDeleteImage, useTagImage, usePushImage, usePushImageById, useImageHistory } from '../../hooks/useDocker'
import { ImageInspectContent } from './ImageInspectContent'
import type { DockerImage } from '../../api/types'

type DrawerTab = 'overview' | 'inspect' | 'history'

interface ImageDrawerProps {
  nodeId: string
  image: DockerImage
  onClose: () => void
}

export function ImageDrawer({ nodeId, image, onClose }: ImageDrawerProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [active, setActive] = useState<DrawerTab>('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showTag, setShowTag] = useState(false)
  const [tagRepo, setTagRepo] = useState('')
  const [tagTag, setTagTag] = useState('latest')
  const deleteImage = useDeleteImage()
  const tagImage = useTagImage()
  const pushImage = usePushImage()
  const pushById = usePushImageById()

  useEffect(() => {
    setActive('overview')
    setShowDeleteConfirm(false)
    setShowTag(false)
    setTagRepo('')
    setTagTag('latest')
  }, [image.ID])

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: 'overview', label: t('docker.overview', 'Overview') },
    { key: 'inspect', label: t('docker.inspect', 'Inspect') },
    { key: 'history', label: t('docker.history', 'History') },
  ]

  const handleDelete = () => {
    deleteImage.mutate({ nodeId, imageId: image.ID }, {
      onSuccess: () => { toast('success', t('docker.toastDeleteImageDone', 'Image deleted')); onClose() },
      onError: () => toast('error', t('docker.toastDeleteImageFailed', 'Delete failed')),
    })
  }
  const handleTag = () => {
    if (!tagRepo || !tagTag) return
    tagImage.mutate({ nodeId, imageId: image.ID, data: { repo: tagRepo, tag: tagTag } }, {
      onSuccess: () => { toast('success', t('docker.toastTagDone', 'Tagged')); setShowTag(false) },
      onError: () => toast('error', t('docker.toastTagFailed', 'Tag failed')),
    })
  }
  const handlePush = () => {
    pushImage.mutate({ nodeId, data: { image: `${image.Repository}:${image.Tag}` } }, {
      onSuccess: () => toast('success', t('docker.toastPushDone', 'Pushed')),
      onError: () => toast('error', t('docker.toastPushFailed', 'Push failed')),
    })
  }
  const handlePushById = () => {
    pushById.mutate({ nodeId, imageId: image.ID }, {
      onSuccess: () => toast('success', t('docker.toastPushDone')),
      onError: () => toast('error', t('docker.toastPushFailed')),
    })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center shrink-0">
          <IconDocker className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-surface-900 dark:text-white truncate">{image.Repository}:{image.Tag}</p>
          <p className="text-xs font-mono text-surface-500 truncate">{image.ID.slice(0, 12)} — {image.Size}</p>
        </div>
        <button onClick={onClose} aria-label={t('common.close')} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 shrink-0 cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="default">{image.Repository}</Badge>
        <Badge variant="info">{image.Tag}</Badge>
        <Badge variant="default">{image.Size}</Badge>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="secondary" size="sm" onClick={() => setShowTag((v) => !v)}>{t('docker.tag', 'Tag')}</Button>
        <Button variant="ghost" size="sm" disabled={pushImage.isPending} onClick={handlePush}>{t('docker.push', 'Push')}</Button>
        <Button variant="ghost" size="sm" disabled={pushById.isPending} onClick={handlePushById}>{t('docker.pushById', 'Push by ID')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm((v) => !v)} className="text-red-500 ml-auto">{t('common.delete')}</Button>
      </div>

      {showTag && (
        <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 border flex flex-col gap-2">
          <div className="flex gap-2">
            <Input label={t('docker.repo', 'Repo')} value={tagRepo} onChange={(e) => setTagRepo(e.target.value)} placeholder="myrepo/app" className="flex-1" />
            <Input label={t('docker.tag', 'Tag')} value={tagTag} onChange={(e) => setTagTag(e.target.value)} placeholder="latest" className="flex-1" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowTag(false)}>{t('common.cancel')}</Button>
            <Button size="sm" disabled={tagImage.isPending || !tagRepo || !tagTag} onClick={handleTag}>{tagImage.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-between gap-3">
          <p className="text-xs text-red-700 dark:text-red-300">{t('docker.deleteImageMsg', { name: `${image.Repository}:${image.Tag}` })}</p>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" size="sm" disabled={deleteImage.isPending} onClick={handleDelete}>{deleteImage.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      )}

      <Tabs tabs={tabs} active={active} onChange={setActive} />

      {active === 'overview' && <ImageOverview image={image} />}
      {active === 'inspect' && <ImageInspectContent nodeId={nodeId} imageId={image.ID} />}
      {active === 'history' && <ImageHistory nodeId={nodeId} imageId={image.ID} />}
    </div>
  )
}

function ImageOverview({ image }: { image: DockerImage }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        <KeyValueList rows={[
          { label: t('docker.id', 'ID'), value: image.ID },
          { label: t('docker.repository', 'Repository'), value: image.Repository },
          { label: t('docker.tag', 'Tag'), value: image.Tag },
          { label: t('docker.size', 'Size'), value: image.Size },
          { label: t('docker.created', 'Created'), value: image.CreatedAt ? new Date(image.CreatedAt).toLocaleString() : '—' },
        ]} />
      </CardContent>
    </Card>
  )
}

function ImageHistory({ nodeId, imageId }: { nodeId: string; imageId: string }) {
  const { t } = useTranslation()
  const { data: history, isLoading } = useImageHistory(nodeId, imageId)
  if (isLoading) return <p className="text-sm text-surface-500 text-center py-4">{t('common.loading')}</p>
  if (!history || (history as unknown as unknown[]).length === 0) return <p className="text-sm text-surface-500 text-center py-4">{t('docker.noHistory', 'No history')}</p>
  const items = history as unknown as Array<{ id: string; created: string; created_by: string; size: string; comment: string }>
  return (
    <Card>
      <CardContent className="pt-4 space-y-2 max-h-96 overflow-y-auto">
        {items.map((h) => (
          <div key={h.id} className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            <p className="text-xs font-mono text-surface-900 dark:text-white">{h.created_by?.slice(0, 80) || '—'}</p>
            <p className="text-xs text-surface-500">{h.id.slice(0, 12)} — {h.size} — {h.comment || '—'}</p>
            <p className="text-xs text-surface-400">{h.created ? new Date(h.created).toLocaleString() : '—'}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
