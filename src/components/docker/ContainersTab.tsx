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
import {
  useInfiniteDockerContainers,
  usePruneContainers,
  useBulkDockerExec,
  useBulkDockerRestart,
  useBulkDockerStart,
  useBulkDockerStop,
  useBulkDockerRemove,
  useBulkDockerInspect,
  useBulkDockerLogs,
  useBulkDockerStats,
} from '../../hooks/useDocker'
import { useDockerContainerSse } from '../../hooks/useDockerContainerSse'
import { InfiniteScroll } from '../ui/InfiniteScroll'
import { ContainerRow } from './ContainerRow'
import { CreateContainerForm } from './CreateContainerForm'
import { BulkResultContent } from './BulkResultContent'
import { ContainerDrawer } from './ContainerDrawer'
import { Checkbox } from '../ui/Checkbox'
import type { DockerContainer, BulkDockerResponse } from '../../api/types'

type SortKey = 'name' | 'image' | 'status' | 'created'

export function ContainersTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  useDockerContainerSse(nodeId)
  const { data: containersInfinite, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteDockerContainers(nodeId, { limit: 20, all: true })
  const containerItems = useMemo(() => containersInfinite ? containersInfinite.pages.flatMap((p) => (p as unknown as { items: DockerContainer[] }).items) : [], [containersInfinite])
  const pruneContainers = usePruneContainers()
  const bulkExec = useBulkDockerExec()
  const bulkRestart = useBulkDockerRestart()
  const bulkStart = useBulkDockerStart()
  const bulkStop = useBulkDockerStop()
  const bulkRemove = useBulkDockerRemove()
  const bulkInspect = useBulkDockerInspect()
  const bulkLogs = useBulkDockerLogs()
  const bulkStats = useBulkDockerStats()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'stopped'>('all')
  const { sort, toggle } = useSort<SortKey>()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [drawerContainer, setDrawerContainer] = useState<DockerContainer | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkExecModal, setShowBulkExecModal] = useState(false)
  const [bulkExecCommand, setBulkExecCommand] = useState('')
  const [bulkExecResult, setBulkExecResult] = useState<string>('')
  const [showBulkInspectModal, setShowBulkInspectModal] = useState(false)
  const [bulkInspectResult, setBulkInspectResult] = useState<BulkDockerResponse | null>(null)
  const [showBulkLogsModal, setShowBulkLogsModal] = useState(false)
  const [bulkLogsResult, setBulkLogsResult] = useState<BulkDockerResponse | null>(null)
  const [showBulkStatsModal, setShowBulkStatsModal] = useState(false)
  const [bulkStatsResult, setBulkStatsResult] = useState<BulkDockerResponse | null>(null)
  const [showPruneConfirm, setShowPruneConfirm] = useState(false)
  const [showBulkRemoveConfirm, setShowBulkRemoveConfirm] = useState(false)
  const filtered = useMemo(() => {
    if (!containerItems.length) return [] as DockerContainer[]
    const q = search.toLowerCase()
    return [...containerItems]
      .filter((c: DockerContainer) => {
        const name = (c as unknown as { Names?: string }).Names?.split('/').pop()?.toLowerCase() || ''
        const image = (c as unknown as { Image?: string }).Image?.toLowerCase() || ''
        if (q && !name.includes(q) && !image.includes(q)) return false
        if (statusFilter === 'running' && (c as unknown as { State?: string }).State?.toLowerCase() !== 'running') return false
        if (statusFilter === 'stopped' && (c as unknown as { State?: string }).State?.toLowerCase() === 'running') return false
        return true
      })
      .sort((a: DockerContainer, b: DockerContainer) => {
        if (!sort) return 0
        const dir = sort.dir === 'asc' ? 1 : -1
        switch (sort.key) {
          case 'name': {
            const aName = (a as unknown as { Names?: string }).Names?.split('/').pop() || ''
            const bName = (b as unknown as { Names?: string }).Names?.split('/').pop() || ''
            return aName.localeCompare(bName) * dir
          }
          case 'image': return ((a as unknown as { Image?: string }).Image || '').localeCompare((b as unknown as { Image?: string }).Image || '') * dir
          case 'status': return ((a as unknown as { State?: string }).State || '').localeCompare((b as unknown as { State?: string }).State || '') * dir
          case 'created': return ((a as unknown as { CreatedAt?: string }).CreatedAt || '').localeCompare((b as unknown as { CreatedAt?: string }).CreatedAt || '') * dir
          default: return 0
        }
      })
  }, [containerItems, search, statusFilter, sort])

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map((c: DockerContainer) => (c as unknown as { ID: string }).ID)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  const selectedContainerIds = useMemo(() => Array.from(selectedIds), [selectedIds])

  const handleBulkExec = () => {
    if (!bulkExecCommand || selectedIds.size === 0) return
    bulkExec.mutate(
      { nodeId, container_ids: selectedContainerIds, command: bulkExecCommand },
      {
        onSuccess: (data: unknown) => {
          const d = data as { results?: Array<{ container_id?: string; node_name?: string; status?: string; output?: string; error?: string }> }
          const results = (d.results ?? []).map((r) => `[${r.container_id ?? r.node_name ?? 'unknown'}] ${r.status}: ${(r.output ?? r.error ?? '')}`).join('\n')
          if ((d as { failed?: number }).failed && (d as { failed?: number }).failed! > 0) toast('warning', t('docker.bulkExec') + t('common.failedSuffix', { count: (d as { failed?: number }).failed! }))
          setBulkExecResult(results || 'No output')
        },
        onError: () => toast('error', t('docker.toastBulkExecFailed')),
      }
    )
  }

  if (isLoading) return <TableSkeleton rows={5} cols={6} />
  if (error) return <ErrorState error={error} onRetry={refetch} title={t('docker.failedToLoadContainers')} />
  if (!containerItems.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noContainers')} description={t('docker.noContainersDesc')} action={<Button onClick={() => setShowCreateModal(true)}>{t('docker.createContainer')}</Button>} />

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800">
          <span className="text-sm text-accent-700 dark:text-accent-300">{t('docker.selected', { count: selectedIds.size })}</span>
          <Button variant="ghost" size="sm" onClick={() => bulkRestart.mutate({ nodeId, container_ids: selectedContainerIds }, { onSuccess: (d: unknown) => { const r = d as { failed?: number }; if (r.failed && r.failed>0) toast('warning', t('docker.restartAll') + t('common.failedSuffix', { count: r.failed })); else toast('success', t('docker.restartAll')) } })} disabled={bulkRestart.isPending}>{t('docker.restartAll')}</Button>
          <Button variant="ghost" size="sm" onClick={() => bulkStart.mutate({ nodeId, container_ids: selectedContainerIds }, { onSuccess: (d: unknown) => { const r = d as { failed?: number }; if (r.failed && r.failed>0) toast('warning', t('docker.startAll') + t('common.failedSuffix', { count: r.failed })); else toast('success', t('docker.startAll')) } })} disabled={bulkStart.isPending}>{t('docker.startAll')}</Button>
          <Button variant="ghost" size="sm" onClick={() => bulkStop.mutate({ nodeId, container_ids: selectedContainerIds }, { onSuccess: (d: unknown) => { const r = d as { failed?: number }; if (r.failed && r.failed>0) toast('warning', t('docker.stopAll') + t('common.failedSuffix', { count: r.failed })); else toast('success', t('docker.stopAll')) } })} disabled={bulkStop.isPending}>{t('docker.stopAll')}</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowBulkRemoveConfirm(true)} disabled={bulkRemove.isPending} className="text-red-500">{bulkRemove.isPending ? t('common.loading') : t('docker.bulkRemove')}</Button>
          <Button variant="ghost" size="sm" onClick={() => { setShowBulkExecModal(true); setBulkExecResult('') }}>{t('docker.bulkExec')}</Button>
          <Button variant="ghost" size="sm" onClick={() => { setShowBulkInspectModal(true); setBulkInspectResult(null); bulkInspect.mutate({ nodeId, container_ids: selectedContainerIds }, { onSuccess: (data) => setBulkInspectResult(data as unknown as BulkDockerResponse), onError: () => toast('error', t('docker.toastBulkInspectFailed')) }) }} disabled={bulkInspect.isPending}>{t('docker.bulkInspect')}</Button>
          <Button variant="ghost" size="sm" onClick={() => { setShowBulkLogsModal(true); setBulkLogsResult(null); bulkLogs.mutate({ nodeId, container_ids: selectedContainerIds }, { onSuccess: (data) => setBulkLogsResult(data as unknown as BulkDockerResponse), onError: () => toast('error', t('docker.toastBulkLogsFailed')) }) }} disabled={bulkLogs.isPending}>{t('docker.bulkLogs')}</Button>
          <Button variant="ghost" size="sm" onClick={() => { setShowBulkStatsModal(true); setBulkStatsResult(null); bulkStats.mutate({ nodeId, container_ids: selectedContainerIds }, { onSuccess: (data) => setBulkStatsResult(data as unknown as BulkDockerResponse), onError: () => toast('error', t('docker.toastBulkStatsFailed')) }) }} disabled={bulkStats.isPending}>{t('docker.bulkStats')}</Button>
        </div>
      )}
      <div className="flex items-center gap-3 mb-4 px-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder={t('docker.searchContainers')} className="flex-1 max-w-sm" />
        <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-1">
          {(['all', 'running', 'stopped'] as const).map((key) => (
            <button key={key} onClick={() => setStatusFilter(key)} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${statusFilter === key ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500 hover:text-surface-700 dark:text-surface-400'}`}>
              {t(`docker.${key}`)}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowPruneConfirm(true)} disabled={pruneContainers.isPending}>{pruneContainers.isPending ? t('common.loading') : t('docker.pruneContainers')}</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-zebra">
          <thead className="table-sticky">
            <tr className="border-b border-surface-200 dark:border-surface-800">
              <th className="px-6 py-3"><div className="flex items-center"><Checkbox checked={!!allSelected} onChange={toggleAll} ariaLabel={t('common.selectAll')} /></div></th>
              <th className="px-6 py-3 text-left"><SortableHeader label={t('docker.name')} sortKey="name" sort={sort as SortState<SortKey> | null} onSort={toggle} /></th>
              <th className="px-6 py-3 text-left"><SortableHeader label={t('docker.image')} sortKey="image" sort={sort as SortState<SortKey> | null} onSort={toggle} /></th>
              <th className="px-6 py-3 text-left"><SortableHeader label={t('docker.status')} sortKey="status" sort={sort as SortState<SortKey> | null} onSort={toggle} /></th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.ports')}</th>
              <th className="px-6 py-3 text-left"><SortableHeader label={t('docker.created')} sortKey="created" sort={sort as SortState<SortKey> | null} onSort={toggle} /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {filtered.map((c: DockerContainer) => (
              <ContainerRow key={c.ID} container={c} selected={selectedIds.has(c.ID)} onSelect={() => toggleOne(c.ID)} onRowClick={() => setDrawerContainer(c)} />
            ))}
          </tbody>
        </table>
      </div>
      <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
      {containerItems.length > 0 && filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-surface-500">{t('docker.noMatch', 'No containers match the current filters')}</div>
      )}

      <Drawer isOpen={!!drawerContainer} onClose={() => setDrawerContainer(null)} size="lg">
        {drawerContainer && <ContainerDrawer nodeId={nodeId} container={drawerContainer} onClose={() => setDrawerContainer(null)} />}
      </Drawer>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('docker.createContainer')} size="lg">
        <CreateContainerForm nodeId={nodeId} onClose={() => setShowCreateModal(false)} />
      </Modal>

      <Modal isOpen={showBulkExecModal} onClose={() => setShowBulkExecModal(false)} title={t('docker.bulkExec', 'Bulk Exec')} size="lg">
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.bulkExecMsg', { count: selectedIds.size })}</p>
          <Input label={t('docker.command')} placeholder="sh -c 'uptime'" value={bulkExecCommand} onChange={(e) => setBulkExecCommand(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowBulkExecModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleBulkExec} disabled={bulkExec.isPending || !bulkExecCommand}>{bulkExec.isPending ? t('common.loading') : t('common.execute')}</Button>
          </div>
          {bulkExecResult && (
            <pre className="text-xs font-mono text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800/50 rounded p-4 max-h-64 overflow-y-auto whitespace-pre-wrap">{bulkExecResult}</pre>
          )}
        </div>
      </Modal>

      <Modal isOpen={showBulkInspectModal} onClose={() => setShowBulkInspectModal(false)} title={t('docker.bulkInspect', 'Bulk Inspect')} size="lg">
        <BulkResultContent result={bulkInspectResult} isLoading={bulkInspect.isPending} />
      </Modal>

      <Modal isOpen={showBulkLogsModal} onClose={() => setShowBulkLogsModal(false)} title={t('docker.bulkLogs', 'Bulk Logs')} size="lg">
        <BulkResultContent result={bulkLogsResult} isLoading={bulkLogs.isPending} />
      </Modal>

      <Modal isOpen={showBulkStatsModal} onClose={() => setShowBulkStatsModal(false)} title={t('docker.bulkStats', 'Bulk Stats')} size="lg">
        <BulkResultContent result={bulkStatsResult} isLoading={bulkStats.isPending} />
      </Modal>

      <Modal isOpen={showPruneConfirm} onClose={() => setShowPruneConfirm(false)} title={t('docker.pruneContainers')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.confirmPrune')}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowPruneConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { pruneContainers.mutate(nodeId, { onSuccess: () => { toast('success', t('docker.toastPruneDone')); setShowPruneConfirm(false) }, onError: () => toast('error', t('docker.toastPruneFailed')) }) }} disabled={pruneContainers.isPending}>{pruneContainers.isPending ? t('common.loading') : t('docker.pruneContainers')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBulkRemoveConfirm} onClose={() => setShowBulkRemoveConfirm(false)} title={t('docker.bulkRemove')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{String(t('docker.confirmBulkRemove', { count: selectedIds.size } as never) ?? `Remove ${selectedIds.size} containers?`)}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowBulkRemoveConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { bulkRemove.mutate({ nodeId, container_ids: selectedContainerIds }, { onSuccess: (d: unknown) => { const r = d as { failed?: number }; if (r.failed && r.failed>0) toast('warning', t('docker.toastBulkRemoveDone') + t('common.failedSuffix', { count: r.failed })); else toast('success', t('docker.toastBulkRemoveDone')); setSelectedIds(new Set()); setShowBulkRemoveConfirm(false) }, onError: () => toast('error', t('docker.toastBulkRemoveFailed')) }) }} disabled={bulkRemove.isPending}>{bulkRemove.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
