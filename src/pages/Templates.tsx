import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { TableSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/useToast'
import { useInfinitePacks, usePackStats, useInfiniteRegistries, useSyncRegistry, useDeleteRegistry, useCreateRegistry, useInstallPack, useUninstallPack, usePack } from '../hooks/useTemplates'
import { Modal } from '../components/ui/Modal'
import { InfiniteScroll } from '../components/ui/InfiniteScroll'
import { ResponsiveTable } from '../components/ui/ResponsiveTable'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import type { Column } from '../components/ui/table-types'

type Tab = 'packs' | 'registries'

export function Templates() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('packs')
  return (
    <div className="space-y-6">
      <PageHeader title={t('templates.title')} description={t('templates.description')} />
      <div className="border-b border-surface-200 dark:border-surface-800">
        <nav className="flex gap-4">
          {(['packs', 'registries'] as Tab[]).map((k) => (
            <button key={k} onClick={() => setActiveTab(k)} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === k ? 'border-accent-500 text-accent-600 dark:text-accent-400' : 'border-transparent text-surface-500 hover:text-surface-700'}`}>
              {t(`templates.${k}`)}
            </button>
          ))}
        </nav>
      </div>
      {activeTab === 'packs' ? <PacksTab /> : <RegistriesTab />}
    </div>
  )
}

function PacksTab() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const { data: infiniteData, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePacks({ limit: 20, search: debouncedSearch || null, tag: selectedTag })
  const { data: stats } = usePackStats()
  const install = useInstallPack()
  const uninstall = useUninstallPack()
  const [detailId, setDetailId] = useState<string | null>(null)
  const { data: detail } = usePack(detailId ?? '')
  const packs = infiniteData ? infiniteData.pages.flatMap((p) => (p as unknown as { items: Array<{ id: string; name: string; description?: string | null; tags?: string[]; installed?: boolean }> }).items) : []
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  const allTags = useMemo(() => [...new Set(packs.flatMap((p)=> p.tags ?? []))], [infiniteData])

  if (isLoading) return <TableSkeleton rows={5} cols={4} />
  if (error) return <div className="text-sm text-red-500">{String(error)}</div>

  const columns: Column<{ id: string; name: string; description?: string | null; tags?: string[]; installed?: boolean }>[] = [
    { key: 'name', header: t('common.name'), render: (p) => <span className="font-medium text-surface-900 dark:text-white">{p.name}</span> },
    { key: 'desc', header: t('common.description', 'Description'), render: (p) => <span className="text-xs text-surface-500 truncate max-w-[260px] inline-block">{p.description ?? '—'}</span> },
    { key: 'tags', header: t('common.tagsFilter'), render: (p) => <span className="flex gap-1 flex-wrap">{(p.tags ?? []).map((tag)=> <Badge key={tag} variant="default">{tag}</Badge>)} {p.installed && <Badge variant="success">{t('templates.installed')}</Badge>}</span> },
    { key: 'actions', header: t('common.actions'), render: (p) => (
      <div className="flex gap-1">
        {p.installed ? (
          <Button variant="ghost" size="sm" onClick={()=> uninstall.mutate({packId:p.id},{onSuccess:()=>toast('success',t('templates.uninstallStarted')), onError:()=>toast('error',t('templates.uninstallFailed'))})} disabled={uninstall.isPending}>{t('templates.uninstall')}</Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => install.mutate({ packId: p.id }, { onSuccess: () => toast('success', t('templates.installStarted')), onError: () => toast('error', t('templates.installFailed')) })} disabled={install.isPending}>{t('templates.install')}</Button>
        )}
        <Button variant="ghost" size="sm" onClick={()=> setDetailId(p.id)}>{t('common.view')}</Button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 max-w-sm">
              <Input placeholder={t('templates.searchPacks')} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {allTags.length>0 && (
              <div className="flex gap-1 flex-wrap">
                <Button variant={selectedTag===null?'secondary':'ghost'} size="sm" onClick={()=> setSelectedTag(null)}>{t('common.clearAll')}</Button>
                {allTags.slice(0,8).map((tag)=> <Button key={tag} variant={selectedTag===tag?'secondary':'ghost'} size="sm" onClick={()=> setSelectedTag(tag===selectedTag?null:tag)}>{tag}</Button>)}
              </div>
            )}
            {stats && (
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="default">{t('templates.total')}: {stats.total}</Badge>
                <Badge variant="success">{t('templates.installed')}: {stats.installed}</Badge>
                <Badge variant="info">{t('templates.notInstalled')}: {stats.not_installed}</Badge>
              </div>
            )}
            <Button variant="ghost" onClick={() => refetch()}>{t('common.refresh')}</Button>
          </div>
        </CardContent>
      </Card>
      <Card hover>
        <CardContent className="p-0">
          {packs.length === 0 ? (
            <EmptyState title={t('templates.noPacks')} description={t('templates.noPacksDesc')} />
          ) : (
            <>
              <ResponsiveTable data={packs} columns={columns} keyExtractor={(p)=>p.id} renderMobileItem={(p)=> (
                <div className="p-4 space-y-2">
                  <p className="font-semibold">{p.name}</p>
                  {p.description && <p className="text-xs text-surface-500">{p.description}</p>}
                  <div className="flex gap-1 flex-wrap">{(p.tags ?? []).map((tag)=> <Badge key={tag} variant="default">{tag}</Badge>)}</div>
                </div>
              )} onRowClick={(p)=> setDetailId(p.id)} />
              <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
            </>
          )}
        </CardContent>
      </Card>
      <Modal isOpen={!!detailId} onClose={()=> setDetailId(null)} title={detail?.name ?? t('templates.packs')} size="lg">
        {detail ? (
          <div className="space-y-3">
            {detail.description && <p className="text-sm text-surface-600 dark:text-surface-300">{detail.description}</p>}
            <div className="flex gap-1 flex-wrap">{(detail.tags ?? []).map((tag:string)=> <Badge key={tag} variant="default">{tag}</Badge>)}</div>
            <div>
              <h4 className="text-sm font-medium mb-1">{t('docker.compose')}</h4>
              <pre className="text-xs bg-surface-900 text-white p-3 rounded-lg max-h-64 overflow-auto">{JSON.stringify((detail as unknown as {assets?: unknown}).assets ?? [], null, 2)}</pre>
            </div>
          </div>
        ) : <p className="text-sm text-surface-500">{t('common.loading')}</p>}
      </Modal>
    </div>
  )
}

function RegistriesTab() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: infiniteData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteRegistries({ limit: 20 })
  const regs = infiniteData ? infiniteData.pages.flatMap((p) => (p as unknown as { items: Array<{ id: string; name: string; url: string; enabled?: boolean }> }).items) : []
  const sync = useSyncRegistry()
  const del = useDeleteRegistry()
  const create = useCreateRegistry()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [search, setSearch] = useState('')
  const filtered = regs.filter((r)=> !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.url.toLowerCase().includes(search.toLowerCase()))
  const columns: Column<{ id: string; name: string; url: string; enabled?: boolean }>[] = [
    { key:'name', header: t('templates.name'), render:(r)=> <span className="font-medium">{r.name}</span> },
    { key:'url', header: t('templates.url'), render:(r)=> <span className="text-xs font-mono text-surface-500 break-all">{r.url}</span> },
    { key:'actions', header: t('common.actions'), render:(r)=> (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => sync.mutate(r.id, { onSuccess: () => toast('success', t('templates.synced')), onError: () => toast('error', t('templates.syncFailed')) })} disabled={sync.isPending}>{t('templates.sync')}</Button>
        <Button variant="ghost" size="sm" onClick={() => del.mutate(r.id, { onSuccess: () => toast('success', t('templates.deleted')), onError: () => toast('error', t('templates.deleteFailed')) })} className="text-red-500" disabled={del.isPending}>{t('common.delete')}</Button>
      </div>
    )},
  ]

  if (isLoading) return <TableSkeleton rows={3} cols={3} />

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 max-w-sm"><Input placeholder={t('templates.searchRegistries', 'Search registries...')} value={search} onChange={(e)=> setSearch(e.target.value)} /></div>
            <Button variant="ghost" onClick={()=> refetch()}>{t('common.refresh')}</Button>
            <Button onClick={() => setShowCreate(true)}>{t('templates.addRegistry')}</Button>
          </div>
        </CardContent>
      </Card>
      <Card hover>
        <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('templates.registries')}</h2></CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState title={t('templates.noRegistries')} />
          ) : (
            <>
              <ResponsiveTable data={filtered} columns={columns} keyExtractor={(r)=>r.id} renderMobileItem={(r)=> (
                <div className="p-3 space-y-1">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs font-mono text-surface-500 break-all">{r.url}</p>
                </div>
              )} />
              <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
            </>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('templates.addRegistry')} size="sm">
        <div className="space-y-4">
          <Input label={t('templates.name')} placeholder="my-registry" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label={t('templates.url')} placeholder="https://example.com/registry.json" value={url} onChange={(e) => setUrl(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => { let ok=true; try{ new URL(url); } catch{ ok=false } if(!ok){ toast('error', t('templates.createFailed')); return } if (name.trim() && url.trim()) create.mutate({ name: name.trim(), url: url.trim() } as never, { onSuccess: () => { toast('success', t('templates.created', 'Created')); setShowCreate(false); setName(''); setUrl('') }, onError: () => toast('error', t('templates.createFailed')) }) }} disabled={!name.trim() || !url.trim() || create.isPending}>{create.isPending ? t('common.loading') : t('common.create')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
