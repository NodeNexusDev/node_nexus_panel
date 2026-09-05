import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { Modal } from '../ui/Modal'
import { Drawer } from '../ui/Drawer'
import { Input } from '../ui/Input'
import { SearchInput } from '../ui/SearchInput'
import { SortableHeader, type SortState } from '../ui/SortableHeader'
import { TableSkeleton } from '../ui/Skeleton'
import { IconDocker } from '../ui/Icons'
import { useToast } from '../ui/useToast'
import { useSort } from '../../hooks/useSort'
import { InfiniteScroll } from '../ui/InfiniteScroll'
import { useInfiniteDockerImages, useBuildImage, usePruneImages, useBulkDockerImageRemove, useBulkDockerImageBuild, useBulkDockerPull } from '../../hooks/useDocker'
import { Checkbox } from '../ui/Checkbox'
import { ImageDrawer } from './ImageDrawer'
import type { DockerImage } from '../../api/types'

type SortKey = 'repository' | 'tag' | 'size' | 'created'

export function ImagesTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const { sort, toggle } = useSort<SortKey>()
  const { data: infiniteData, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteDockerImages(nodeId, { limit: 20 })
  const imageList = useMemo(() => infiniteData ? infiniteData.pages.flatMap((p) => (p as unknown as { items: DockerImage[] }).items) : [], [infiniteData])
  const buildImage = useBuildImage()
  const bulkImageRemove = useBulkDockerImageRemove()
  const bulkImageBuild = useBulkDockerImageBuild()
  const bulkPull = useBulkDockerPull()
  const pruneImages = usePruneImages()
  const [showBuildModal, setShowBuildModal] = useState(false)
  const [buildDockerfile, setBuildDockerfile] = useState('')
  const [buildTag, setBuildTag] = useState('')
  const [drawerImage, setDrawerImage] = useState<DockerImage | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkRemove, setShowBulkRemove] = useState(false)
  const [showBulkBuild, setShowBulkBuild] = useState(false)
  const [showBulkPull, setShowBulkPull] = useState(false)
  const [bulkPullImage, setBulkPullImage] = useState('')
  const [showPruneConfirm, setShowPruneConfirm] = useState(false)

  const filtered = useMemo(() => {
    if (!imageList.length) return []
    const q = search.toLowerCase()
    return [...imageList]
      .filter((img) => {
        const im = img as unknown as { Repository?: string; Tag?: string; ID?: string }
        if (q && !(im.Repository?.toLowerCase().includes(q) || im.Tag?.toLowerCase().includes(q) || im.ID?.toLowerCase().includes(q))) return false
        return true
      })
      .sort((a, b) => {
        if (!sort) return 0
        const dir = sort.dir === 'asc' ? 1 : -1
        const av = a as unknown as { Repository?: string; Tag?: string; Size?: string; CreatedAt?: string }
        const bv = b as unknown as { Repository?: string; Tag?: string; Size?: string; CreatedAt?: string }
        switch (sort.key) {
          case 'repository': return (av.Repository || '').localeCompare(bv.Repository || '') * dir
          case 'tag': return (av.Tag || '').localeCompare(bv.Tag || '') * dir
          case 'size': return (av.Size || '').localeCompare(bv.Size || '') * dir
          case 'created': return (av.CreatedAt || '').localeCompare(bv.CreatedAt || '') * dir
          default: return 0
        }
      })
  }, [imageList, search, sort])

  const allSelected = filtered.length > 0 && filtered.every((img) => selectedIds.has((img as unknown as { ID: string }).ID))
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map((img) => (img as unknown as { ID: string }).ID)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  if (isLoading) return <TableSkeleton rows={5} cols={5} />
  if (error) return <ErrorState error={error} onRetry={refetch} title={t('docker.failedToLoadImages')} />
  if (!imageList.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noImages')} description={t('docker.noImagesDesc')} action={<Button onClick={() => setShowBuildModal(true)}>{t('docker.buildImage')}</Button>} />

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800 mb-4 flex-wrap">
          <span className="text-sm text-accent-700 dark:text-accent-300">{t('docker.selected', { count: selectedIds.size })}</span>
          <Button variant="ghost" size="sm" onClick={() => setShowBulkRemove(true)} className="text-red-500">{t('docker.bulkRemoveImages')}</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowBulkBuild(true)}>{t('docker.buildImage')}</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowBulkPull(true)}>{t('docker.pullImage')}</Button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 cursor-pointer">{t('docker.clearSelection')}</button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4 px-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder={t('docker.searchImages', 'Search images...')} className="flex-1 max-w-sm" />
        <Button variant="ghost" onClick={() => setShowBulkPull(true)}>{t('docker.pullImage')}</Button>
        <Button variant="ghost" onClick={() => setShowPruneConfirm(true)} disabled={pruneImages.isPending}>{pruneImages.isPending ? t('common.loading') : t('docker.pruneImages')}</Button>
        <Button onClick={() => setShowBuildModal(true)}>{t('docker.buildImage')}</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-sticky">
            <tr className="border-b border-surface-200 dark:border-surface-800">
              <th className="px-6 py-3"><div className="flex items-center"><Checkbox checked={!!allSelected} onChange={toggleAll} ariaLabel={t('common.selectAll')} /></div></th>
              <th className="px-6 py-3 text-left"><SortableHeader label={t('docker.repository')} sortKey="repository" sort={sort as SortState<SortKey> | null} onSort={toggle} /></th>
              <th className="px-6 py-3 text-left"><SortableHeader label={t('docker.tag')} sortKey="tag" sort={sort as SortState<SortKey> | null} onSort={toggle} /></th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.id')}</th>
              <th className="px-6 py-3 text-left"><SortableHeader label={t('docker.size')} sortKey="size" sort={sort as SortState<SortKey> | null} onSort={toggle} /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {filtered.map((img: DockerImage) => {
              const im = img as unknown as { ID: string; Repository?: string; Tag?: string; Size?: string }
              return (
              <tr key={im.ID} className="table-row-hover cursor-pointer" onClick={() => setDrawerImage(img)}>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}><div className="flex items-center"><Checkbox checked={selectedIds.has(im.ID)} onChange={() => toggleOne(im.ID)} ariaLabel={t('common.selectItem', { name: im.Repository || im.ID?.slice(0, 12) || '' })} /></div></td>
                <td className="px-6 py-4 text-sm font-mono text-surface-900 dark:text-white">{im.Repository}</td>
                <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300 font-mono">{im.Tag}</td>
                <td className="px-6 py-4 text-xs text-surface-500 font-mono">{im.ID?.slice(0, 12) || '—'}</td>
                <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{im.Size}</td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
      {filtered.length === 0 && imageList.length > 0 && (
        <div className="text-center py-8 text-sm text-surface-500">{t('docker.noMatch', 'No images match the current filters')}</div>
      )}

      <Drawer isOpen={!!drawerImage} onClose={() => setDrawerImage(null)} size="lg">
        {drawerImage && <ImageDrawer nodeId={nodeId} image={drawerImage} onClose={() => setDrawerImage(null)} />}
      </Drawer>

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

      <Modal isOpen={showBulkRemove} onClose={() => setShowBulkRemove(false)} title={t('docker.bulkRemoveImages', 'Bulk Remove Images')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.bulkRemoveImagesMsg', { count: selectedIds.size })}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowBulkRemove(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => {
              const ids = Array.from(selectedIds)
              bulkImageRemove.mutate({ nodeId, image_ids: ids }, {
                onSuccess: (data: unknown) => {
                  const d = data as { failed?: number; succeeded?: number }
                  if (d.failed && d.failed>0) toast('warning', t('docker.toastBulkRemovePartial', { succeeded: d.succeeded, failed: d.failed }))
                  else toast('success', t('docker.toastBulkRemoveDone', 'Images removed'))
                  setShowBulkRemove(false); setSelectedIds(new Set())
                },
                onError: () => toast('error', t('docker.toastBulkRemoveFailed')),
              })
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
                onSuccess: (data: unknown) => {
                  const d = data as { failed?: number }
                  if (d.failed && d.failed>0) toast('warning', t('docker.toastPullDone') + t('common.failedSuffix', { count: d.failed }))
                  else toast('success', t('docker.toastPullDone'))
                  setShowBulkPull(false); setBulkPullImage('')
                },
                onError: () => toast('error', t('docker.toastPullFailed')),
              })
            }} disabled={!bulkPullImage || bulkPull.isPending}>{bulkPull.isPending ? t('common.loading') : t('docker.pullImage')}</Button>
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
