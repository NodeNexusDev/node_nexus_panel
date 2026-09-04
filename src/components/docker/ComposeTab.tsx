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
import { ResponsiveTable } from '../ui/ResponsiveTable'
import type { Column } from '../ui/table-types'
import {
  useInfiniteComposeProjects,
  useCreateComposeProject,
  useUpdateComposeProject,
  useDeleteComposeProject,
  useComposeUp,
  useComposeDown,
  useComposeStart,
  useComposeStop,
  useComposeRestart,
  useComposePull,
  useComposeBuild,
  useComposePs,
  useComposeLogs,
  useComposeConfig,
  useComposePause,
  useComposeUnpause,
  useComposeKill,
  useComposePush,
  useComposeRm,
  useComposeImages,
  useComposeTop,
  useComposePort,
  useComposeVersion,
} from '../../hooks/useCompose'

export function ComposeTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: infiniteData, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteComposeProjects(nodeId, { limit: 20 })
  const projects = infiniteData ? infiniteData.pages.flatMap((p) => (p as unknown as { items: Array<{ id: string; project_name: string; created_at: string; updated_at: string; compose?: string }> }).items) : []
  const create = useCreateComposeProject()
  const update = useUpdateComposeProject()
  const remove = useDeleteComposeProject()
  const up = useComposeUp()
  const down = useComposeDown()
  const start = useComposeStart()
  const stop = useComposeStop()
  const restart = useComposeRestart()
  const pull = useComposePull()
  const build = useComposeBuild()
  const pause = useComposePause()
  const unpause = useComposeUnpause()
  const kill = useComposeKill()
  const push = useComposePush()
  const rm = useComposeRm()

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')
  const [composeYaml, setComposeYaml] = useState('version: "3.8"\nservices:\n  web:\n    image: nginx:alpine\n    ports:\n      - "80:80"')
  const [selected, setSelected] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const filtered = projects.filter((p)=> !search || p.project_name.toLowerCase().includes(search.toLowerCase()))

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
    { key: 'project', header: t('docker.projectName'), render: (p)=> <span className="font-semibold text-surface-900 dark:text-white">{p.project_name}</span> },
    { key: 'created', header: t('docker.created'), render: (p)=> <span className="text-sm text-surface-600 dark:text-surface-300">{new Date(p.created_at).toLocaleString()}</span> },
    { key: 'actions', header: t('docker.actions'), render: (p)=> (
      <div className="flex items-center gap-1 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => setSelected(p.project_name)}>{t('docker.details')}</Button>
        <Button variant="ghost" size="sm" onClick={()=> { const f=projects.find((x)=> x.project_name===p.project_name); setComposeYaml((f as unknown as {compose?:string})?.compose ?? composeYaml); setEditTarget(p.project_name)}}>{t('common.edit')}</Button>
        <Button variant="ghost" size="sm" onClick={() => up.mutate({ nodeId, projectName: p.project_name }, { onSuccess: () => toast('success', t('docker.composeUp')), onError: () => toast('error', t('docker.composeUpFailed')) })} disabled={up.isPending}>{t('docker.up')}</Button>
        <Button variant="ghost" size="sm" onClick={() => down.mutate({ nodeId, projectName: p.project_name }, { onSuccess: () => toast('success', t('docker.composeDown')), onError: () => toast('error', t('docker.composeDownFailed')) })} disabled={down.isPending}>{t('docker.down')}</Button>
        <Button variant="ghost" size="sm" onClick={()=> start.mutate({nodeId, projectName:p.project_name},{onSuccess:()=>toast('success',t('docker.toastStartFailed', 'Started')), onError:()=>toast('error','Failed')})} disabled={start.isPending}>{t('docker.start')}</Button>
        <Button variant="ghost" size="sm" onClick={()=> stop.mutate({nodeId, projectName:p.project_name},{onSuccess:()=>toast('success','Stopped'), onError:()=>toast('error','Failed')})} disabled={stop.isPending}>{t('docker.stop')}</Button>
        <Button variant="ghost" size="sm" onClick={()=> restart.mutate({nodeId, projectName:p.project_name},{onSuccess:()=>toast('success','Restarted'), onError:()=>toast('error','Failed')})} disabled={restart.isPending}>{t('docker.restartCompose')}</Button>
        <Button variant="ghost" size="sm" onClick={()=> pull.mutate({nodeId, projectName:p.project_name},{onSuccess:()=>toast('success','Pulled'), onError:()=>toast('error','Failed')})} disabled={pull.isPending}>{t('docker.pull')}</Button>
        <Button variant="ghost" size="sm" onClick={()=> push.mutate({nodeId, projectName:p.project_name},{onSuccess:()=>toast('success','Pushed'), onError:()=>toast('error','Failed')})} disabled={push.isPending}>{t('docker.push','Push')}</Button>
        <Button variant="ghost" size="sm" onClick={()=> pause.mutate({nodeId, projectName:p.project_name},{onSuccess:()=>toast('success','Paused'), onError:()=>toast('error','Failed')})} disabled={pause.isPending}>{t('docker.pause')}</Button>
        <Button variant="ghost" size="sm" onClick={()=> unpause.mutate({nodeId, projectName:p.project_name},{onSuccess:()=>toast('success','Unpaused'), onError:()=>toast('error','Failed')})} disabled={unpause.isPending}>{t('docker.unpause')}</Button>
        <Button variant="ghost" size="sm" onClick={()=> kill.mutate({nodeId, projectName:p.project_name},{onSuccess:()=>toast('success','Killed'), onError:()=>toast('error','Failed')})} disabled={kill.isPending}>Kill</Button>
        <Button variant="ghost" size="sm" onClick={()=> rm.mutate({nodeId, projectName:p.project_name},{onSuccess:()=>toast('success','Removed'), onError:()=>toast('error','Failed')})} disabled={rm.isPending}>RM</Button>
        <Button variant="ghost" size="sm" onClick={()=> build.mutate({nodeId, projectName:p.project_name},{onSuccess:()=>toast('success','Built'), onError:()=>toast('error','Failed')})} disabled={build.isPending}>{t('docker.build')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(p.project_name)} className="text-red-500">{t('common.delete')}</Button>
      </div>
    )},
  ]

  return (
    <>
      <div className="flex gap-3 mb-4 px-4">
        <div className="flex-1 max-w-sm"><Input placeholder={t('common.search')} value={search} onChange={(e)=> setSearch(e.target.value)} /></div>
        <Button variant="ghost" onClick={()=> refetch()}>{t('common.refresh')}</Button>
        <Button onClick={() => setShowCreate(true)}>{t('docker.createCompose')}</Button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<IconDocker className="w-10 h-10" />} title={t('docker.noCompose')} description={t('docker.noComposeDesc')} action={<Button onClick={() => setShowCreate(true)}>{t('docker.createCompose')}</Button>} />
      ) : (
        <>
          <ResponsiveTable data={filtered} columns={columns as unknown as Column<typeof filtered[number]>[]} keyExtractor={(p)=>p.id} renderMobileItem={(p)=> (
            <div className="p-4 space-y-2">
              <div className="flex gap-2"><span className="font-semibold">{p.project_name}</span><Badge variant="default">{p.id.slice(0,8)}</Badge></div>
              <p className="text-xs text-surface-500">{new Date(p.created_at).toLocaleString()}</p>
            </div>
          )} onRowClick={(p)=> setSelected(p.project_name)} />
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
          <p className="text-sm text-surface-600 dark:text-surface-300">{t('docker.deleteComposeMsg', { name: deleteTarget } as unknown as string)}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { if (deleteTarget) remove.mutate({ nodeId, projectName: deleteTarget }, { onSuccess: () => { toast('success', t('docker.composeDeleted')); setDeleteTarget(null) }, onError: () => toast('error', t('docker.composeDeleteFailed')) }) }} disabled={remove.isPending}>{remove.isPending ? t('common.loading') : t('common.delete')}</Button>
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
  const { data: cfg } = useComposeConfig(nodeId, projectName, !!projectName)
  const { data: images } = useComposeImages(nodeId, projectName, !!projectName)
  const { data: top } = useComposeTop(nodeId, projectName, !!projectName)
  const { data: version } = useComposeVersion(nodeId, projectName, !!projectName)
  const { data: port } = useComposePort(nodeId, projectName, 'web', '80', false)
  const [tab, setTab] = useState<'ps' | 'logs' | 'config' | 'images' | 'top' | 'version' | 'port'>('ps')
  return (
    <Modal isOpen={!!projectName} onClose={onClose} title={`${projectName}`} size="lg">
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-surface-200 dark:border-surface-800 overflow-x-auto">
          {(['ps','logs','config','images','top','version','port'] as const).map((k)=> (
            <button key={k} onClick={() => setTab(k)} className={`pb-2 text-sm font-medium border-b-2 whitespace-nowrap ${tab === k ? 'border-accent-500 text-accent-600' : 'border-transparent text-surface-500'}`}>{t(`docker.${k}`, k)}</button>
          ))}
        </div>
        {tab === 'ps' && <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{JSON.stringify(ps ?? {}, null, 2)}</pre>}
        {tab === 'logs' && <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{typeof logs === 'string' ? logs : JSON.stringify(logs ?? {}, null, 2)}</pre>}
        {tab === 'config' && <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{typeof cfg === 'string' ? cfg : JSON.stringify(cfg ?? {}, null, 2)}</pre>}
        {tab === 'images' && <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{JSON.stringify(images ?? {}, null, 2)}</pre>}
        {tab === 'top' && <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{JSON.stringify(top ?? {}, null, 2)}</pre>}
        {tab === 'version' && <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{JSON.stringify(version ?? {}, null, 2)}</pre>}
        {tab === 'port' && <pre className="text-xs font-mono bg-surface-50 dark:bg-surface-800/50 rounded p-3 max-h-96 overflow-y-auto whitespace-pre-wrap">{JSON.stringify(port ?? {}, null, 2)}</pre>}
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>{t('common.close')}</Button>
        </div>
      </div>
    </Modal>
  )
}
