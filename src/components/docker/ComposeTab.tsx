import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Drawer } from '../ui/Drawer'
import { TableSkeleton } from '../ui/Skeleton'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { Badge } from '../ui/Badge'
import { IconDocker } from '../ui/Icons'
import { useToast } from '../ui/useToast'
import { InfiniteScroll } from '../ui/InfiniteScroll'
import { ResponsiveTable } from '../ui/ResponsiveTable'
import type { Column } from '../ui/table-types'
import {
  useInfiniteComposeProjects,
  useCreateComposeProject,
  useUpdateComposeProject,
  useDeleteComposeProject,
} from '../../hooks/useCompose'
import { ComposeDrawer } from './ComposeDrawer'
import { Checkbox } from '../ui/Checkbox'

export function ComposeTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: infiniteData, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteComposeProjects(nodeId, { limit: 20 })
  const projects = infiniteData ? infiniteData.pages.flatMap((p) => (p as { items: Array<{ id: string; project_name: string; created_at: string; updated_at: string; compose?: string }> }).items) : []
  const create = useCreateComposeProject()
  const update = useUpdateComposeProject()
  const remove = useDeleteComposeProject()

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')
  const [composeYaml, setComposeYaml] = useState('version: "3.8"\nservices:\n  web:\n    image: nginx:alpine\n    ports:\n      - "80:80"')
  const [drawerProject, setDrawerProject] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const filtered = projects.filter((p)=> !search || p.project_name.toLowerCase().includes(search.toLowerCase()))

  const toggleOne = (id: string) => setSelectedIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const handleCreate = () => {
    if (!projectName.trim() || !composeYaml.trim()) return
    create.mutate({ nodeId, data: { project_name: projectName.trim(), compose: composeYaml } }, {
      onSuccess: () => { toast('success', t('docker.composeCreated')); setShowCreate(false); setProjectName(''); },
      onError: () => toast('error', t('docker.composeCreateFailed')),
    })
  }
  const handleUpdate = () => {
    if (!editTarget) return
    update.mutate({ nodeId, projectName: editTarget, data: { compose: composeYaml } }, {
      onSuccess: () => { toast('success', t('docker.composeUpdated')); setEditTarget(null); },
      onError: () => toast('error', t('docker.composeUpdateFailed')),
    })
  }

  if (isLoading) return <TableSkeleton rows={4} cols={3} />
  if (error) return <ErrorState error={error} onRetry={refetch} title={t('docker.failedToLoadCompose')} />

  const columns: Column<{ id: string; project_name: string; created_at: string }> [] = [
    { key: 'select', header: '', render: (p) => <div onClick={(e) => e.stopPropagation()}><Checkbox checked={selectedIds.has(p.id)} onChange={() => toggleOne(p.id)} ariaLabel={t('common.selectItem', { name: p.project_name })} /></div> },
    { key: 'project', header: t('docker.projectName'), render: (p)=> <span className="font-semibold text-surface-900 dark:text-white">{p.project_name}</span> },
    { key: 'created', header: t('docker.created'), render: (p)=> <span className="text-sm text-surface-600 dark:text-surface-300">{new Date(p.created_at).toLocaleString()}</span> },
  ]

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800 mb-4">
          <span className="text-sm text-accent-700 dark:text-accent-300">{t('docker.selected', { count: selectedIds.size })}</span>
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(filtered.find((p) => selectedIds.has(p.id))?.project_name || null)} className="text-red-500">{t('common.delete')}</Button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-surface-500 cursor-pointer">{t('docker.clearSelection')}</button>
        </div>
      )}
      <div className="flex gap-3 mb-4 px-4">
        <div className="flex-1 max-w-sm"><Input placeholder={t('common.search')} value={search} onChange={(e)=> setSearch(e.target.value)} /></div>
        <Button variant="ghost" onClick={()=> refetch()}>{t('common.refresh')}</Button>
        <Button onClick={() => setShowCreate(true)}>{t('docker.createCompose')}</Button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noCompose')} description={t('docker.noComposeDesc')} action={<Button onClick={() => setShowCreate(true)}>{t('docker.createCompose')}</Button>} />
      ) : (
        <>
          <ResponsiveTable data={filtered} columns={columns as Column<typeof filtered[number]>[]} keyExtractor={(p)=>p.id} renderMobileItem={(p)=> (
            <div className="p-4 space-y-2">
              <div className="flex gap-2"><span className="font-semibold">{p.project_name}</span><Badge variant="default">{p.id.slice(0,8)}</Badge></div>
              <p className="text-xs text-surface-500">{new Date(p.created_at).toLocaleString()}</p>
            </div>
          )} onRowClick={(p)=> setDrawerProject(p.project_name)} />
          <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
        </>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('docker.createCompose')} size="lg">
        <div className="space-y-4">
          <Input label={t('docker.projectName')} placeholder="my-app" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">{t('docker.composeYaml')}</label>
            <textarea value={composeYaml} onChange={(e) => setComposeYaml(e.target.value)} rows={12} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-xs font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreate} disabled={!projectName.trim() || !composeYaml.trim() || create.isPending}>{create.isPending ? t('common.loading') : t('common.create')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editTarget} onClose={()=> setEditTarget(null)} title={t('docker.editCompose')} size="lg">
        <div className="space-y-4">
          <Input label={t('docker.projectName')} value={editTarget ?? ''} disabled />
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('docker.composeYaml')}</label>
            <textarea value={composeYaml} onChange={(e)=> setComposeYaml(e.target.value)} rows={12} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-xs font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={()=> setEditTarget(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleUpdate} disabled={update.isPending}>{update.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('docker.deleteCompose')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.deleteComposeMsg', { name: deleteTarget })}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { if (deleteTarget) remove.mutate({ nodeId, projectName: deleteTarget }, { onSuccess: () => { toast('success', t('docker.composeDeleted')); setDeleteTarget(null) }, onError: () => toast('error', t('docker.composeDeleteFailed')) }) }} disabled={remove.isPending}>{remove.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      </Modal>

      <Drawer isOpen={!!drawerProject} onClose={() => setDrawerProject(null)} size="lg">
        {drawerProject && <ComposeDrawer nodeId={nodeId} projectName={drawerProject} composeYaml={(projects.find((p) => p.project_name === drawerProject) as { compose?: string } | undefined)?.compose} onClose={() => setDrawerProject(null)} />}
      </Drawer>
    </>
  )
}
