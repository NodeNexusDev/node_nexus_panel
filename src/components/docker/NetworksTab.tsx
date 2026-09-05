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
import { useInfiniteDockerNetworks, useCreateNetwork, usePruneNetworks, useBulkNetworkRemovals } from '../../hooks/useDocker'
import { NetworkDrawer } from './NetworkDrawer'
import type { DockerNetwork } from '../../api/types'

type SortKey = 'name' | 'driver' | 'scope'

export function NetworksTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const { sort, toggle } = useSort<SortKey>()
  const { data: infiniteData, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteDockerNetworks(nodeId, { limit: 20 })
  const networkList = useMemo(() => infiniteData ? infiniteData.pages.flatMap((p) => (p as unknown as { items: DockerNetwork[] }).items) : [], [infiniteData])
  const createNetwork = useCreateNetwork()
  const pruneNetworks = usePruneNetworks()
  const bulkRemove = useBulkNetworkRemovals()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDriver, setCreateDriver] = useState('bridge')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showPruneConfirm, setShowPruneConfirm] = useState(false)
  const [showBulkRemove, setShowBulkRemove] = useState(false)
  const [drawerNetwork, setDrawerNetwork] = useState<DockerNetwork | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return [...networkList]
      .filter((n) => !q || n.Name.toLowerCase().includes(q) || n.Driver.toLowerCase().includes(q) || n.ID.toLowerCase().includes(q))
      .sort((a, b) => {
        if (!sort) return 0
        const dir = sort.dir === 'asc' ? 1 : -1
        switch (sort.key) {
          case 'name': return a.Name.localeCompare(b.Name) * dir
          case 'driver': return a.Driver.localeCompare(b.Driver) * dir
          case 'scope': return a.Scope.localeCompare(b.Scope) * dir
          default: return 0
        }
      })
  }, [networkList, search, sort])

  const allSelected = filtered.length > 0 && filtered.every((n) => selectedIds.has(n.ID))
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map((n) => n.ID)))
  }
  const toggleOne = (id: string) => setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })

  if (isLoading) return <TableSkeleton rows={3} cols={4} />
  if (error) return <ErrorState error={error} onRetry={refetch} title={t('docker.failedToLoadNetworks')} />
  if (!networkList.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noNetworks')} description={t('docker.noNetworksDesc')} action={<Button onClick={() => setShowCreateModal(true)}>{t('docker.createNetwork')}</Button>} />

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
        <SearchInput value={search} onChange={setSearch} placeholder={t('docker.searchNetworks', 'Search networks...')} className="flex-1 max-w-sm" />
        <Button variant="ghost" size="sm" onClick={() => setShowPruneConfirm(true)} disabled={pruneNetworks.isPending}>{pruneNetworks.isPending ? t('common.loading') : t('docker.pruneNetworks', 'Prune')}</Button>
        <Button onClick={() => setShowCreateModal(true)}>{t('docker.createNetwork')}</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-sticky">
            <tr className="border-b border-surface-200 dark:border-surface-800">
              <th className="px-6 py-3"><div className="flex items-center"><Checkbox checked={!!allSelected} onChange={toggleAll} ariaLabel={t('common.selectAll')} /></div></th>
              <th className="px-6 py-3 text-left"><SortableHeader label={t('docker.name')} sortKey="name" sort={sort as SortState<SortKey> | null} onSort={toggle} /></th>
              <th className="px-6 py-3 text-left"><SortableHeader label={t('docker.driver')} sortKey="driver" sort={sort as SortState<SortKey> | null} onSort={toggle} /></th>
              <th className="px-6 py-3 text-left"><SortableHeader label={t('docker.scope')} sortKey="scope" sort={sort as SortState<SortKey> | null} onSort={toggle} /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {filtered.map((n) => (
              <tr key={n.ID} className="table-row-hover cursor-pointer" onClick={() => setDrawerNetwork(n)}>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}><div className="flex items-center"><Checkbox checked={selectedIds.has(n.ID)} onChange={() => toggleOne(n.ID)} ariaLabel={t('common.selectItem', { name: n.Name })} /></div></td>
                <td className="px-6 py-4 text-sm font-semibold text-surface-900 dark:text-white">{n.Name}</td>
                <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{n.Driver}</td>
                <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{n.Scope}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
      {filtered.length === 0 && networkList.length > 0 && (
        <div className="text-center py-8 text-sm text-surface-500">{t('docker.noMatch', 'No networks match')}</div>
      )}

      <Drawer isOpen={!!drawerNetwork} onClose={() => setDrawerNetwork(null)} size="lg">
        {drawerNetwork && <NetworkDrawer nodeId={nodeId} network={drawerNetwork} onClose={() => setDrawerNetwork(null)} />}
      </Drawer>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('docker.createNetwork')}>
        <div className="space-y-4">
          <Input label={t('docker.name')} placeholder="my-network" value={createName} onChange={(e) => setCreateName(e.target.value)} />
          <Input label={t('docker.driver')} placeholder="bridge" value={createDriver} onChange={(e) => setCreateDriver(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => { if (createName.trim()) { createNetwork.mutate({ nodeId, data: { name: createName.trim(), driver: createDriver || 'bridge' } }, { onSuccess: () => { toast('success', t('docker.createNetwork')); setShowCreateModal(false); setCreateName(''); setCreateDriver('bridge') }, onError: () => toast('error', t('docker.toastCreateNetworkFailed')) }) } }} disabled={!createName.trim() || createNetwork.isPending}>{createNetwork.isPending ? t('common.loading') : t('common.create')}</Button>
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
              bulkRemove.mutate({ nodeId, network_ids: ids }, {
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

      <Modal isOpen={showPruneConfirm} onClose={() => setShowPruneConfirm(false)} title={t('docker.pruneNetworks', 'Prune Networks')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.confirmPruneNetworks', 'Remove unused networks?')}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowPruneConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => pruneNetworks.mutate(nodeId, { onSuccess: () => { toast('success', t('docker.toastPruneDone')); setShowPruneConfirm(false) }, onError: () => toast('error', t('docker.toastPruneFailed')) })} disabled={pruneNetworks.isPending}>{pruneNetworks.isPending ? t('common.loading') : t('docker.pruneNetworks')}</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
