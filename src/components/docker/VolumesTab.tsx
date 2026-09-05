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
import { Checkbox } from '../ui/Checkbox'
import { useInfiniteDockerVolumes, useCreateVolume, usePruneVolumes, useBulkVolumeRemovals } from '../../hooks/useDocker'
import { VolumeDrawer } from './VolumeDrawer'
import type { DockerVolume } from '../../api/types'

type SortKey = 'name' | 'driver'

export function VolumesTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const { sort, toggle } = useSort<SortKey>()
  const { data: infiniteData, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteDockerVolumes(nodeId, { limit: 20 })
  const volumeList = useMemo(() => infiniteData ? infiniteData.pages.flatMap((p) => (p as unknown as { items: DockerVolume[] }).items) : [], [infiniteData])
  const createVolume = useCreateVolume()
  const pruneVolumes = usePruneVolumes()
  const bulkRemove = useBulkVolumeRemovals()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDriver, setCreateDriver] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showPruneConfirm, setShowPruneConfirm] = useState(false)
  const [showBulkRemove, setShowBulkRemove] = useState(false)
  const [drawerVolume, setDrawerVolume] = useState<DockerVolume | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return [...volumeList]
      .filter((v) => !q || v.Name.toLowerCase().includes(q) || v.Driver.toLowerCase().includes(q))
      .sort((a, b) => {
        if (!sort) return 0
        const dir = sort.dir === 'asc' ? 1 : -1
        switch (sort.key) {
          case 'name': return a.Name.localeCompare(b.Name) * dir
          case 'driver': return a.Driver.localeCompare(b.Driver) * dir
          default: return 0
        }
      })
  }, [volumeList, search, sort])

  const allSelected = filtered.length > 0 && filtered.every((v) => selectedIds.has(v.Name))
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map((v) => v.Name)))
  }
  const toggleOne = (id: string) => setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })

  if (isLoading) return <TableSkeleton rows={3} cols={4} />
  if (error) return <ErrorState error={error} onRetry={refetch} title={t('docker.failedToLoadVolumes')} />
  if (!volumeList.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noVolumes')} description={t('docker.noVolumesDesc')} action={<Button onClick={() => setShowCreateModal(true)}>{t('docker.createVolume')}</Button>} />

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800 mb-4">
          <span className="text-sm text-accent-700 dark:text-accent-300">{t('docker.selected', { count: selectedIds.size })}</span>
          <Button variant="ghost" size="sm" onClick={() => setShowBulkRemove(true)} className="text-red-500">{t('common.delete')}</Button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-surface-500 cursor-pointer">{t('docker.clearSelection')}</button>
        </div>
      )}
      <div className="flex items-center gap-3 mb-4 px-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder={t('docker.searchVolumes', 'Search volumes...')} className="flex-1 max-w-sm" />
        <Button variant="ghost" onClick={() => setShowPruneConfirm(true)} disabled={pruneVolumes.isPending}>{pruneVolumes.isPending ? t('common.loading') : t('docker.pruneVolumes')}</Button>
        <Button onClick={() => setShowCreateModal(true)}>{t('docker.createVolume')}</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-sticky">
            <tr className="border-b border-surface-200 dark:border-surface-800">
              <th className="px-6 py-3"><div className="flex items-center"><Checkbox checked={!!allSelected} onChange={toggleAll} ariaLabel={t('common.selectAll')} /></div></th>
              <th className="px-6 py-3 text-left"><SortableHeader label={t('docker.name')} sortKey="name" sort={sort as SortState<SortKey> | null} onSort={toggle} /></th>
              <th className="px-6 py-3 text-left"><SortableHeader label={t('docker.driver')} sortKey="driver" sort={sort as SortState<SortKey> | null} onSort={toggle} /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {filtered.map((v) => (
              <tr key={v.Name} className="table-row-hover cursor-pointer" onClick={() => setDrawerVolume(v)}>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}><div className="flex items-center"><Checkbox checked={selectedIds.has(v.Name)} onChange={() => toggleOne(v.Name)} ariaLabel={t('common.selectItem', { name: v.Name })} /></div></td>
                <td className="px-6 py-4 text-sm font-semibold text-surface-900 dark:text-white">{v.Name}</td>
                <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{v.Driver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
      {filtered.length === 0 && volumeList.length > 0 && (
        <div className="text-center py-8 text-sm text-surface-500">{t('docker.noMatch', 'No volumes match')}</div>
      )}

      <Drawer isOpen={!!drawerVolume} onClose={() => setDrawerVolume(null)} size="lg">
        {drawerVolume && <VolumeDrawer nodeId={nodeId} volume={drawerVolume} onClose={() => setDrawerVolume(null)} />}
      </Drawer>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('docker.createVolume')}>
        <div className="space-y-4">
          <Input label={t('docker.name')} placeholder="my-volume" value={createName} onChange={(e) => setCreateName(e.target.value)} />
          <Input label={t('docker.driver')} placeholder="local" value={createDriver} onChange={(e) => setCreateDriver(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => { const trimmed = createName.trim(); if (trimmed) { createVolume.mutate({ nodeId, data: { name: trimmed, driver: createDriver.trim() || 'local' } }, { onSuccess: () => { toast('success', t('docker.createVolume')); setShowCreateModal(false); setCreateName(''); setCreateDriver('') }, onError: () => toast('error', t('docker.toastCreateVolumeFailed')) }) } }} disabled={!createName.trim() || createVolume.isPending}>{createVolume.isPending ? t('common.loading') : t('common.create')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBulkRemove} onClose={() => setShowBulkRemove(false)} title={t('common.delete')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.bulkDeleteMsg', { count: selectedIds.size })}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowBulkRemove(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => {
              const ids = Array.from(selectedIds)
              bulkRemove.mutate({ nodeId, volume_names: ids }, {
                onSuccess: (data: unknown) => {
                  const d = data as { failed?: number }
                  if (d.failed && d.failed>0) toast('warning', t('docker.toastBulkRemoveDone') + t('common.failedSuffix', { count: d.failed }))
                  else toast('success', t('docker.toastBulkRemoveDone'))
                  setShowBulkRemove(false); setSelectedIds(new Set())
                },
                onError: () => toast('error', t('docker.toastBulkRemoveFailed')),
              })
            }} disabled={bulkRemove.isPending}>{bulkRemove.isPending ? t('common.loading') : t('common.delete')}</Button>
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
