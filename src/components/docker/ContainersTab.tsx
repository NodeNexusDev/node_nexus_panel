import { useState, useMemo, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { SearchInput } from '../ui/SearchInput'
import { SortableHeader, type SortState } from '../ui/SortableHeader'
import { TableSkeleton } from '../ui/Skeleton'
import { IconDocker } from '../ui/Icons'
import { useToast } from '../ui/useToast'
import { useSort } from '../../hooks/useSort'
import {
  useDockerContainers,
  useStartContainer,
  useStopContainer,
  useRestartContainer,
  useDeleteContainer,
  usePauseContainer,
  useUnpauseContainer,
  useRenameContainer,
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
import { ContainerRow } from './ContainerRow'
import { ContainerDetailPanel } from './ContainerDetailPanel'
import { CreateContainerForm } from './CreateContainerForm'
import { ContainerLogsContent } from './ContainerLogsContent'
import { ContainerStatsContent } from './ContainerStatsContent'
import { ExecContainerContent } from './ExecContainerContent'
import { ContainerInspectContent } from './ContainerInspectContent'
import { TopContainerContent } from './TopContainerContent'
import { BulkResultContent } from './BulkResultContent'
import { Checkbox } from '../ui/Checkbox'
import type { DockerContainer, BulkDockerResponse } from '../../api/types'

type SortKey = 'name' | 'image' | 'status' | 'created'

export function ContainersTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  useDockerContainerSse(nodeId)
  const { data: containers, isLoading, error, refetch } = useDockerContainers(nodeId, true)
  const startContainer = useStartContainer()
  const stopContainer = useStopContainer()
  const restartContainer = useRestartContainer()
  const deleteContainer = useDeleteContainer()
  const pauseContainer = usePauseContainer()
  const unpauseContainer = useUnpauseContainer()
  const renameContainer = useRenameContainer()
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

  const [deleteTarget, setDeleteTarget] = useState<DockerContainer | null>(null)
  const [forceDelete, setForceDelete] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [logsTarget, setLogsTarget] = useState<DockerContainer | null>(null)
  const [statsTarget, setStatsTarget] = useState<DockerContainer | null>(null)
  const [execTarget, setExecTarget] = useState<DockerContainer | null>(null)
  const [inspectTarget, setInspectTarget] = useState<DockerContainer | null>(null)
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
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [renameTarget, setRenameTarget] = useState<DockerContainer | null>(null)
  const [renameName, setRenameName] = useState('')
  const [topTarget, setTopTarget] = useState<DockerContainer | null>(null)
  const [showPruneConfirm, setShowPruneConfirm] = useState(false)
  const [showBulkRemoveConfirm, setShowBulkRemoveConfirm] = useState(false)
  const filtered = useMemo(() => {
    if (!containers) return []
    const q = search.toLowerCase()
    return containers
      .filter((c) => {
        const name = c.Names?.split('/').pop()?.toLowerCase() || ''
        const image = c.Image?.toLowerCase() || ''
        if (q && !name.includes(q) && !image.includes(q)) return false
        if (statusFilter === 'running' && c.State?.toLowerCase() !== 'running') return false
        if (statusFilter === 'stopped' && c.State?.toLowerCase() === 'running') return false
        return true
      })
      .sort((a, b) => {
        if (!sort) return 0
        const dir = sort.dir === 'asc' ? 1 : -1
        switch (sort.key) {
          case 'name': {
            const aName = a.Names?.split('/').pop() || ''
            const bName = b.Names?.split('/').pop() || ''
            return aName.localeCompare(bName) * dir
          }
          case 'image': return (a.Image || '').localeCompare(b.Image || '') * dir
          case 'status': return (a.State || '').localeCompare(b.State || '') * dir
          case 'created': return (a.CreatedAt || '').localeCompare(b.CreatedAt || '') * dir
          default: return 0
        }
      })
  }, [containers, search, statusFilter, sort])

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map((c) => c.ID)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  const bulkContainerId = selectedIds.size === 1 ? Array.from(selectedIds)[0] : undefined
  const bulkDisabled = !bulkContainerId

  const handleBulkExec = () => {
    if (!bulkExecCommand || !bulkContainerId) return
    bulkExec.mutate(
      { container_id: bulkContainerId, command: bulkExecCommand, node_ids: [nodeId] },
      {
        onSuccess: (data) => {
          const results = data.results.map((r) => `[${r.node_name}] ${r.status}: ${r.output || r.error}`).join('\n')
          setBulkExecResult(results || 'No output')
        },
        onError: () => toast('error', t('docker.toastBulkExecFailed')),
      }
    )
  }

  if (isLoading) return <TableSkeleton rows={5} cols={7} />
  if (error) return <ErrorState error={error} onRetry={refetch} title={t('docker.failedToLoadContainers')} />
  if (!containers?.length) return <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noContainers')} description={t('docker.noContainersDesc')} action={<Button onClick={() => setShowCreateModal(true)}>{t('docker.createContainer')}</Button>} />

  const loading = startContainer.isPending || stopContainer.isPending || restartContainer.isPending || pauseContainer.isPending || unpauseContainer.isPending || renameContainer.isPending

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800">
          <span className="text-sm text-accent-700 dark:text-accent-300">{t('docker.selected', { count: selectedIds.size })}</span>
          <Button variant="ghost" size="sm" onClick={() => bulkRestart.mutate({ container_id: bulkContainerId!, node_ids: [nodeId] })} disabled={bulkDisabled || bulkRestart.isPending}>{t('docker.restartAll')}</Button>
          <Button variant="ghost" size="sm" onClick={() => bulkStart.mutate({ container_id: bulkContainerId!, node_ids: [nodeId] })} disabled={bulkDisabled || bulkStart.isPending}>{t('docker.startAll')}</Button>
          <Button variant="ghost" size="sm" onClick={() => bulkStop.mutate({ container_id: bulkContainerId!, node_ids: [nodeId] })} disabled={bulkDisabled || bulkStop.isPending}>{t('docker.stopAll')}</Button>
          <Button variant="ghost" size="sm" onClick={() => { if (bulkContainerId) setShowBulkRemoveConfirm(true) }} disabled={bulkDisabled || bulkRemove.isPending} className="text-red-500">{bulkRemove.isPending ? t('common.loading') : t('docker.bulkRemove')}</Button>
          <Button variant="ghost" size="sm" onClick={() => { setShowBulkExecModal(true); setBulkExecResult('') }} disabled={bulkDisabled}>{t('docker.bulkExec')}</Button>
          <Button variant="ghost" size="sm" onClick={() => { if (bulkContainerId) { setShowBulkInspectModal(true); setBulkInspectResult(null); bulkInspect.mutate({ container_id: bulkContainerId, node_ids: [nodeId] }, { onSuccess: (data) => setBulkInspectResult(data), onError: () => toast('error', t('docker.toastBulkInspectFailed')) }) } }} disabled={bulkDisabled || bulkInspect.isPending}>{t('docker.bulkInspect')}</Button>
          <Button variant="ghost" size="sm" onClick={() => { if (bulkContainerId) { setShowBulkLogsModal(true); setBulkLogsResult(null); bulkLogs.mutate({ container_id: bulkContainerId, node_ids: [nodeId] }, { onSuccess: (data) => setBulkLogsResult(data), onError: () => toast('error', t('docker.toastBulkLogsFailed')) }) } }} disabled={bulkDisabled || bulkLogs.isPending}>{t('docker.bulkLogs')}</Button>
          <Button variant="ghost" size="sm" onClick={() => { if (bulkContainerId) { setShowBulkStatsModal(true); setBulkStatsResult(null); bulkStats.mutate({ container_id: bulkContainerId, node_ids: [nodeId] }, { onSuccess: (data) => setBulkStatsResult(data), onError: () => toast('error', t('docker.toastBulkStatsFailed')) }) } }} disabled={bulkDisabled || bulkStats.isPending}>{t('docker.bulkStats')}</Button>
        </div>
      )}
      {bulkDisabled && selectedIds.size > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 px-4 -mt-2">
          {t('docker.bulkSingleContainer', 'Bulk operations apply to one container across multiple nodes. Select a single container to proceed.')}
        </p>
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {filtered.map((c) => (
              <Fragment key={c.ID}>
                <ContainerRow container={c}
                  onStart={() => startContainer.mutate({ nodeId, containerId: c.ID }, { onSuccess: () => toast('success', t('common.start')), onError: () => toast('error', t('docker.toastStartFailed')) })}
                  onStop={() => stopContainer.mutate({ nodeId, containerId: c.ID }, { onSuccess: () => toast('success', t('common.stop')), onError: () => toast('error', t('docker.toastStopFailed')) })}
                  onRestart={() => restartContainer.mutate({ nodeId, containerId: c.ID }, { onSuccess: () => toast('success', t('common.restart')), onError: () => toast('error', t('docker.toastRestartFailed')) })}
                  onDelete={() => setDeleteTarget(c)}
                  onPause={() => pauseContainer.mutate({ nodeId, containerId: c.ID }, { onSuccess: () => toast('success', t('docker.pause')), onError: () => toast('error', t('docker.toastPauseFailed')) })}
                  onUnpause={() => unpauseContainer.mutate({ nodeId, containerId: c.ID }, { onSuccess: () => toast('success', t('docker.unpause')), onError: () => toast('error', t('docker.toastUnpauseFailed')) })}
                  onRename={() => { setRenameTarget(c); setRenameName(c.Names?.split('/').pop() || '') }}
                  onTop={() => setTopTarget(c)}
                  loading={loading} selected={selectedIds.has(c.ID)} onSelect={() => toggleOne(c.ID)}
                  expanded={expandedId === c.ID} onToggleExpand={() => setExpandedId(expandedId === c.ID ? null : c.ID)}
                />
                {expandedId === c.ID && (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <ContainerDetailPanel container={c} onLogs={() => setLogsTarget(c)} onStats={() => setStatsTarget(c)} onExec={() => setExecTarget(c)} onInspect={() => setInspectTarget(c)} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {containers.length > 0 && filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-surface-500">{t('docker.noMatch', 'No containers match the current filters')}</div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('docker.createContainer')} size="lg">
        <CreateContainerForm nodeId={nodeId} onClose={() => setShowCreateModal(false)} />
      </Modal>

      <Modal isOpen={!!logsTarget} onClose={() => setLogsTarget(null)} title={`${t('docker.logs')}: ${logsTarget?.Names?.split('/').pop() || ''}`} size="lg">
        {logsTarget && <ContainerLogsContent nodeId={nodeId} containerId={logsTarget.ID} />}
      </Modal>

      <Modal isOpen={!!statsTarget} onClose={() => setStatsTarget(null)} title={`${t('docker.stats')}: ${statsTarget?.Names?.split('/').pop() || ''}`} size="md">
        {statsTarget && <ContainerStatsContent nodeId={nodeId} containerId={statsTarget.ID} />}
      </Modal>

      <Modal isOpen={!!execTarget} onClose={() => setExecTarget(null)} title={`${t('docker.exec')}: ${execTarget?.Names?.split('/').pop() || ''}`} size="lg">
        {execTarget && <ExecContainerContent nodeId={nodeId} containerId={execTarget.ID} onClose={() => setExecTarget(null)} />}
      </Modal>

      <Modal isOpen={!!inspectTarget} onClose={() => setInspectTarget(null)} title={`${t('docker.inspect')}: ${inspectTarget?.Names?.split('/').pop() || ''}`} size="lg">
        {inspectTarget && <ContainerInspectContent nodeId={nodeId} containerId={inspectTarget.ID} />}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('docker.deleteContainer')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.deleteContainerMsg', { name: deleteTarget?.Names?.split('/').pop() })}</p>
          <Checkbox checked={forceDelete} onChange={setForceDelete} label={t('docker.forceDelete', 'Force delete')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { if (deleteTarget) { deleteContainer.mutate({ nodeId, containerId: deleteTarget.ID, force: forceDelete || undefined }, { onSuccess: () => { setDeleteTarget(null); setForceDelete(false) }, onError: () => toast('error', t('docker.toastDeleteFailed')) }) } }} disabled={deleteContainer.isPending}>{deleteContainer.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
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

      <Modal isOpen={!!renameTarget} onClose={() => setRenameTarget(null)} title={t('docker.renameContainer')}>
        <div className="space-y-4">
          <Input label={t('docker.newName')} placeholder="my-container" value={renameName} onChange={(e) => setRenameName(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setRenameTarget(null)}>{t('common.cancel')}</Button>
            <Button onClick={() => { const trimmed = renameName.trim(); if (renameTarget && trimmed) { renameContainer.mutate({ nodeId, containerId: renameTarget.ID, data: { new_name: trimmed } }, { onSuccess: () => { toast('success', t('docker.renameContainer')); setRenameTarget(null); setRenameName('') }, onError: () => toast('error', t('docker.toastRenameFailed')) }) } }} disabled={!renameName.trim() || renameContainer.isPending}>{renameContainer.isPending ? t('common.loading') : t('docker.rename')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!topTarget} onClose={() => setTopTarget(null)} title={`${t('docker.top')}: ${topTarget?.Names?.split('/').pop() || ''}`} size="lg">
        {topTarget && <TopContainerContent nodeId={nodeId} containerId={topTarget.ID} />}
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
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.confirmBulkRemove')}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowBulkRemoveConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { if (bulkContainerId) { bulkRemove.mutate({ container_id: bulkContainerId, node_ids: [nodeId] }, { onSuccess: () => { toast('success', t('docker.toastBulkRemoveDone')); setSelectedIds(new Set()); setShowBulkRemoveConfirm(false) }, onError: () => toast('error', t('docker.toastBulkRemoveFailed')) }) } }} disabled={bulkRemove.isPending}>{bulkRemove.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
