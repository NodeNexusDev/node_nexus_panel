import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { TableSkeleton } from '../ui/Skeleton'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { Badge } from '../ui/Badge'
import { IconDocker } from '../ui/Icons'
import { useToast } from '../ui/useToast'
import { InfiniteScroll } from '../ui/InfiniteScroll'
import {
  useInfiniteComposeProjects,
  useCreateComposeProject,
  useDeleteComposeProject,
  useComposeUp,
  useComposeDown,
  useComposePs,
  useComposeLogs,
} from '../../hooks/useCompose'

export function ComposeTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: infiniteData, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteComposeProjects(nodeId, { limit: 50 })
  const projects = infiniteData ? infiniteData.pages.flatMap((p) => (p as unknown as { items: Array<{ id: string; project_name: string; created_at: string; updated_at: string }> }).items) : []
  const create = useCreateComposeProject()
  const remove = useDeleteComposeProject()
  const up = useComposeUp()
  const down = useComposeDown()

  const [showCreate, setShowCreate] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [composeYaml, setComposeYaml] = useState('version: "3.8"\nservices:\n  web:\n    image: nginx:alpine\n    ports:\n      - "80:80"')
  const [selected, setSelected] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleCreate = () => {
    if (!projectName.trim() || !composeYaml.trim()) return
    create.mutate({ nodeId, data: { project_name: projectName.trim(), compose: composeYaml } }, {
      onSuccess: () => { toast('success', t('docker.composeCreated', 'Compose project created')); setShowCreate(false); setProjectName(''); },
      onError: () => toast('error', t('docker.composeCreateFailed', 'Failed to create project')),
    })
  }

  if (isLoading) return <TableSkeleton rows={4} cols={4} />
  if (error) return <ErrorState error={error} onRetry={refetch} title={t('docker.failedToLoadCompose', 'Failed to load compose projects')} />

  return (
    <>
      <div className="flex justify-end mb-4 px-4">
        <Button onClick={() => setShowCreate(true)}>{t('docker.createCompose', 'Create Compose Project')}</Button>
      </div>
      {projects.length === 0 ? (
        <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noCompose', 'No compose projects')} description={t('docker.noComposeDesc', 'Create a compose project from YAML')} action={<Button onClick={() => setShowCreate(true)}>{t('docker.createCompose', 'Create Compose Project')}</Button>} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-zebra">
            <thead className="table-sticky">
              <tr className="border-b border-surface-200 dark:border-surface-800">
                <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.projectName', 'Project')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.created', 'Created')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('docker.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
              {projects.map((p) => (
                <tr key={p.id} className="table-row-hover">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-surface-900 dark:text-white">{p.project_name}</span>
                      <Badge variant="default">{p.id.slice(0, 8)}</Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{new Date(p.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 flex-wrap">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(p.project_name)}>{t('docker.details', 'Details')}</Button>
                      <Button variant="ghost" size="sm" onClick={() => up.mutate({ nodeId, projectName: p.project_name }, { onSuccess: () => toast('success', t('docker.composeUp', 'Up started')), onError: () => toast('error', t('docker.composeUpFailed', 'Up failed')) })} disabled={up.isPending}>{t('docker.up', 'Up')}</Button>
                      <Button variant="ghost" size="sm" onClick={() => down.mutate({ nodeId, projectName: p.project_name }, { onSuccess: () => toast('success', t('docker.composeDown', 'Down done')), onError: () => toast('error', t('docker.composeDownFailed', 'Down failed')) })} disabled={down.isPending}>{t('docker.down', 'Down')}</Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(p.project_name)} className="text-red-500">{t('common.delete')}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('docker.createCompose', 'Create Compose Project')} size="lg">
        <div className="space-y-4">
          <Input label={t('docker.projectName', 'Project Name')} placeholder="my-app" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">{t('docker.composeYaml', 'Compose YAML')}</label>
            <textarea value={composeYaml} onChange={(e) => setComposeYaml(e.target.value)} rows={12} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-xs font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" placeholder={'version: "3"\nservices:\n  web:\n    image: nginx'} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreate} disabled={!projectName.trim() || !composeYaml.trim() || create.isPending}>{create.isPending ? t('common.loading') : t('common.create')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('docker.deleteCompose', 'Delete Compose Project')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.deleteComposeMsg', { name: deleteTarget } as unknown as string)}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { if (deleteTarget) remove.mutate({ nodeId, projectName: deleteTarget }, { onSuccess: () => { toast('success', t('docker.composeDeleted', 'Deleted')); setDeleteTarget(null) }, onError: () => toast('error', t('docker.composeDeleteFailed', 'Delete failed')) }) }} disabled={remove.isPending}>{remove.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      </Modal>

      {selected && <ComposeDetailModal nodeId={nodeId} projectName={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

function ComposeDetailModal({ nodeId, projectName, onClose }: { nodeId: string; projectName: string; onClose: () => void }) {
  const { t } = useTranslation()
  const { data: ps } = useComposePs(nodeId, projectName, !!projectName)
  const { data: logs } = useComposeLogs(nodeId, projectName, !!projectName)
  const [tab, setTab] = useState<'ps' | 'logs'>('ps')
  return (
    <Modal isOpen={!!projectName} onClose={onClose} title={`${projectName}`} size="lg">
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-surface-200 dark:border-surface-800">
          <button onClick={() => setTab('ps')} className={`pb-2 text-sm font-medium border-b-2 ${tab === 'ps' ? 'border-accent-500 text-accent-600' : 'border-transparent text-surface-500'}`}>{t('docker.ps', 'PS')}</button>
          <button onClick={() => setTab('logs')} className={`pb-2 text-sm font-medium border-b-2 ${tab === 'logs' ? 'border-accent-500 text-accent-600' : 'border-transparent text-surface-500'}`}>{t('docker.logs', 'Logs')}</button>
        </div>
        {tab === 'ps' ? (
          <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{JSON.stringify(ps ?? {}, null, 2)}</pre>
        ) : (
          <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{typeof logs === 'string' ? logs : JSON.stringify(logs ?? {}, null, 2)}</pre>
        )}
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>{t('common.close')}</Button>
        </div>
      </div>
    </Modal>
  )
}
