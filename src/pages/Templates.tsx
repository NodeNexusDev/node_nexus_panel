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
import { useInfinitePacks, usePackStats, useInfiniteRegistries, useSyncRegistry, useDeleteRegistry, useCreateRegistry, useInstallPack, useUninstallPack, usePack, useInfinitePackInstallations, useCreatePack, useUpdatePack, useRegistry } from '../hooks/useTemplates'
import { templatesApi } from '../api/templates'
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
  const [installedFilter, setInstalledFilter] = useState<'all'|'installed'|'notInstalled'>('all')
  const [registryFilter, setRegistryFilter] = useState<string | null>(null)
  const [onConflict, setOnConflict] = useState<'fail'|'rename'>('fail')
  const [lastBulk, setLastBulk] = useState<{ total:number; succeeded:number; failed:number; results:Array<{name:string; entity_type:string; status:string; error:string}> } | null>(null)
  const { data: regData } = useInfiniteRegistries({ limit: 50 })
  const regsForFilter = regData ? regData.pages.flatMap((p)=> (p as unknown as { items: Array<{ id:string; owner:string; name:string }> }).items) : []
  const { data: infiniteData, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePacks({ limit: 20, search: debouncedSearch || null, tag: selectedTag, installed: installedFilter==='all'? null : installedFilter==='installed', registry_id: registryFilter })
  const { data: stats } = usePackStats()
  const install = useInstallPack()
  const uninstall = useUninstallPack()
  const [detailId, setDetailId] = useState<string | null>(null)
  const { data: detail } = usePack(detailId ?? '')
  const { data: instInfinite, fetchNextPage: fetchInstNext, hasNextPage: hasInstNext, isFetchingNextPage: isInstFetching } = useInfinitePackInstallations(detailId ?? '')
  const createPack = useCreatePack()
  const updatePack = useUpdatePack()
  const [showCreatePack, setShowCreatePack] = useState(false)
  const [cpPackId, setCpPackId] = useState('')
  const [cpName, setCpName] = useState('')
  const [cpVersion, setCpVersion] = useState('1.0.0')
  const [cpDesc, setCpDesc] = useState('')
  const [cpTags, setCpTags] = useState('')
  const [cpCommands, setCpCommands] = useState('[]')
  const [cpScripts, setCpScripts] = useState('[]')
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
      <div className="flex gap-1 flex-wrap">
        {p.installed ? (
          <>
            <Button variant="ghost" size="sm" onClick={()=> uninstall.mutate(p.id,{onSuccess:()=>toast('success',t('templates.uninstallStarted')), onError:()=>toast('error',t('templates.uninstallFailed'))})} disabled={uninstall.isPending}>{t('templates.uninstall')}</Button>
            <Button variant="ghost" size="sm" onClick={()=> updatePack.mutate({packId:p.id, on_conflict: onConflict},{onSuccess:(res)=>{ setLastBulk(res as never); toast('success',`${t('templates.updatePack')} ${res.succeeded}/${res.total}`)}, onError:()=>toast('error',t('templates.updateFailed','Update failed'))})} disabled={updatePack.isPending}>{t('templates.updatePack')}</Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => install.mutate({ packId: p.id, on_conflict: onConflict }, { onSuccess: (res) => { setLastBulk(res as never); toast('success', `${t('templates.installStarted')} ${res.succeeded}/${res.total}`)}, onError: () => toast('error', t('templates.installFailed')) })} disabled={install.isPending}>{t('templates.install')}</Button>
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
            <select value={installedFilter} onChange={(e)=> setInstalledFilter(e.target.value as never)} className="px-2 py-1 text-xs bg-white border border-surface-300 rounded dark:bg-surface-800 dark:border-surface-700">
              <option value="all">{t('templates.total')}</option>
              <option value="installed">{t('templates.installed')}</option>
              <option value="notInstalled">{t('templates.notInstalled')}</option>
            </select>
            <select value={registryFilter ?? ''} onChange={(e)=> setRegistryFilter(e.target.value||null)} className="px-2 py-1 text-xs bg-white border border-surface-300 rounded dark:bg-surface-800 dark:border-surface-700">
              <option value="">{t('templates.registries')}</option>
              {regsForFilter.map((r)=> <option key={r.id} value={r.id}>{r.owner}/{r.name}</option>)}
            </select>
            <select value={onConflict} onChange={(e)=> setOnConflict(e.target.value as never)} className="px-2 py-1 text-xs bg-white border border-surface-300 rounded dark:bg-surface-800 dark:border-surface-700">
              <option value="fail">{t('templates.onConflictFail','Fail')}</option>
              <option value="rename">{t('templates.onConflictRename','Rename')}</option>
            </select>
            {stats && (
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="default">{t('templates.total')}: {stats.total}</Badge>
                <Badge variant="success">{t('templates.installed')}: {stats.installed}</Badge>
                <Badge variant="info">{t('templates.notInstalled')}: {stats.not_installed}</Badge>
              </div>
            )}
            <Button variant="ghost" onClick={() => refetch()}>{t('common.refresh')}</Button>
            <Button onClick={()=> setShowCreatePack(true)}>{t('templates.createPack','Create Pack')}</Button>
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
              {lastBulk && (
                <div className="px-6 py-3 border-t border-surface-200 dark:border-surface-800">
                  <h4 className="text-xs font-medium mb-2">{t('templates.bulkResult','Bulk result')}: {lastBulk.succeeded}/{lastBulk.total}</h4>
                  <div className="space-y-1 max-h-32 overflow-auto">
                    {lastBulk.results.map((r,i)=> <div key={i} className="text-xs flex gap-2"><Badge variant={r.status==='success'?'success':'danger'}>{r.status}</Badge><span>{r.entity_type}:{r.name}</span>{r.error && <span className="text-red-500">{r.error}</span>}</div>)}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Modal isOpen={!!detailId} onClose={()=> setDetailId(null)} title={detail?.name ?? t('templates.packs')} size="lg">
        {detail ? (
          <div className="space-y-3">
            {detail.description && <p className="text-sm text-surface-600 dark:text-surface-300">{detail.description}</p>}
            <div className="flex gap-1 flex-wrap">{(detail.tags ?? []).map((tag:string)=> <Badge key={tag} variant="default">{tag}</Badge>)}</div>
            <div className="text-xs text-surface-500 space-y-1">
              {(detail as unknown as {version?:string}).version && <p>{t('templates.version')}: {(detail as unknown as {version:string}).version}</p>}
              {(detail as unknown as {author?:string}).author && <p>{t('templates.author','Author')}: {(detail as unknown as {author:string}).author}</p>}
              {detail.created_at && <p>{t('common.created')}: {new Date(detail.created_at).toLocaleString()}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={async()=> { try{ const blob = await templatesApi.getPackArchive(detail.id); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${detail.name}.tar`; a.click(); URL.revokeObjectURL(url)} catch{ toast('error', t('templates.downloadFailed','Download failed')) } }}>{t('templates.download','Download')}</Button>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">{t('templates.installations','Installations')}</h4>
              {(() => { const instItems = instInfinite ? instInfinite.pages.flatMap((p)=> (p as unknown as {items:unknown[]}).items) : []; return instItems.length? (
                <div className="space-y-2">
                  <pre className="text-xs bg-surface-900 text-white p-3 rounded-lg max-h-32 overflow-auto">{JSON.stringify(instItems, null, 2)}</pre>
                  <InfiniteScroll hasMore={!!hasInstNext} isFetchingNextPage={isInstFetching} onLoadMore={()=> fetchInstNext()} />
                </div>
              ) : <p className="text-xs text-surface-500">{t('templates.noInstallations','No installations')}</p> })()}
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">{t('templates.assets','Assets')}</h4>
              <pre className="text-xs bg-surface-900 text-white p-3 rounded-lg max-h-64 overflow-auto">{JSON.stringify((detail as unknown as {assets?: unknown}).assets ?? [], null, 2)}</pre>
            </div>
          </div>
        ) : <p className="text-sm text-surface-500">{t('common.loading')}</p>}
      </Modal>
      <Modal isOpen={showCreatePack} onClose={()=> setShowCreatePack(false)} title={t('templates.createPack')} size="lg">
        <div className="space-y-4">
          <Input label={t('templates.packId')} placeholder="my-pack" value={cpPackId} onChange={(e)=> setCpPackId(e.target.value)} />
          <Input label={t('templates.name')} placeholder="My Pack" value={cpName} onChange={(e)=> setCpName(e.target.value)} />
          <Input label={t('templates.version')} placeholder="1.0.0" value={cpVersion} onChange={(e)=> setCpVersion(e.target.value)} />
          <Input label={t('templates.descriptionLabel', 'Description')} placeholder="Pack description" value={cpDesc} onChange={(e)=> setCpDesc(e.target.value)} />
          <Input label={t('docker.tags', 'Tags')} placeholder="web, proxy" value={cpTags} onChange={(e)=> setCpTags(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('templates.commandsJson','Commands JSON')}</label>
            <textarea value={cpCommands} onChange={(e)=> setCpCommands(e.target.value)} rows={4} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-xs font-mono dark:bg-surface-800 dark:border-surface-700" placeholder='[{"name":"cmd1","command":"echo hi"}]' />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('templates.scriptsJson','Scripts JSON')}</label>
            <textarea value={cpScripts} onChange={(e)=> setCpScripts(e.target.value)} rows={4} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-xs font-mono dark:bg-surface-800 dark:border-surface-700" placeholder='[{"name":"script1","steps":[]}]' />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={()=> setShowCreatePack(false)}>{t('common.cancel')}</Button>
            <Button onClick={()=> {
              if(!cpPackId.trim()||!cpName.trim()){ toast('error', t('templates.createFailed')); return }
              let cmds: unknown[] = []; let scrips: unknown[] = [];
              try{ cmds = cpCommands.trim()? JSON.parse(cpCommands):[] } catch{ toast('error','Invalid commands JSON'); return }
              try{ scrips = cpScripts.trim()? JSON.parse(cpScripts):[] } catch{ toast('error','Invalid scripts JSON'); return }
              const tags = cpTags.split(',').map((s)=>s.trim()).filter(Boolean)
              createPack.mutate({ manifest:{ pack_id: cpPackId.trim(), name: cpName.trim(), version: cpVersion.trim()||'1.0.0', description: cpDesc||undefined, tags }, commands: cmds as never, scripts: scrips as never } as never, { onSuccess:()=>{ toast('success', t('templates.created','Created')); setShowCreatePack(false); setCpPackId(''); setCpName(''); setCpVersion('1.0.0'); setCpDesc(''); setCpTags(''); setCpCommands('[]'); setCpScripts('[]') }, onError:()=> toast('error', t('templates.createFailed')) })
            }} disabled={!cpPackId.trim()||!cpName.trim()||createPack.isPending}>{createPack.isPending? t('common.loading'): t('common.create')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function RegistriesTab() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: infiniteData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteRegistries({ limit: 20 })
  const regs = infiniteData ? infiniteData.pages.flatMap((p) => (p as unknown as { items: Array<{ id: string; owner: string; name: string; default_branch: string; last_synced_at: string | null }> }).items) : []
  const sync = useSyncRegistry()
  const del = useDeleteRegistry()
  const create = useCreateRegistry()
  const [showCreate, setShowCreate] = useState(false)
  const [owner, setOwner] = useState('')
  const [name, setName] = useState('')
  const [branch, setBranch] = useState('main')
  const [search, setSearch] = useState('')
  const [regDetailId, setRegDetailId] = useState<string | null>(null)
  const { data: regDetail } = useRegistry(regDetailId ?? '')
  const filtered = regs.filter((r)=> !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase()))
  const columns: Column<{ id: string; owner: string; name: string; default_branch: string; last_synced_at: string | null }>[] = [
    { key:'owner', header: t('templates.owner', 'Owner'), render:(r)=> <span className="text-sm">{r.owner}</span> },
    { key:'name', header: t('templates.name'), render:(r)=> <span className="font-medium">{r.name}</span> },
    { key:'branch', header: t('templates.defaultBranch', 'Branch'), render:(r)=> <Badge variant="default">{r.default_branch}</Badge> },
    { key:'synced', header: t('templates.lastSyncedAt', 'Synced'), render:(r)=> <span className="text-xs text-surface-500">{r.last_synced_at ? new Date(r.last_synced_at).toLocaleString() : '—'}</span> },
    { key:'actions', header: t('common.actions'), render:(r)=> (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={()=> setRegDetailId(r.id)}>{t('common.view')}</Button>
        <Button variant="ghost" size="sm" onClick={() => sync.mutate(r.id, { onSuccess: (res) => toast('success', `${t('templates.synced')} ${res.succeeded}/${res.total}`), onError: () => toast('error', t('templates.syncFailed')) })} disabled={sync.isPending}>{t('templates.sync')}</Button>
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
                  <p className="font-medium">{r.owner}/{r.name}</p>
                  <p className="text-xs text-surface-500">branch: {r.default_branch}</p>
                </div>
              )} />
              <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
            </>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('templates.addRegistry')} size="sm">
        <div className="space-y-4">
          <Input label={t('templates.owner', 'Owner')} placeholder="NodeNexusDev" value={owner} onChange={(e) => setOwner(e.target.value)} />
          <Input label={t('templates.name')} placeholder="official" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label={t('templates.defaultBranch', 'Branch')} placeholder="main" value={branch} onChange={(e) => setBranch(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => { if (owner.trim() && name.trim()) create.mutate({ owner: owner.trim(), name: name.trim(), default_branch: branch.trim()||'main' } as never, { onSuccess: () => { toast('success', t('templates.created', 'Created')); setShowCreate(false); setOwner(''); setName(''); setBranch('main') }, onError: () => toast('error', t('templates.createFailed')) }) }} disabled={!owner.trim() || !name.trim() || create.isPending}>{create.isPending ? t('common.loading') : t('common.create')}</Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={!!regDetailId} onClose={()=> setRegDetailId(null)} title={regDetail ? `${regDetail.owner}/${regDetail.name}` : t('templates.registries')} size="sm">
        {regDetail ? (
          <div className="space-y-2 text-sm">
            <p><span className="text-surface-500">{t('templates.owner')}:</span> {regDetail.owner}</p>
            <p><span className="text-surface-500">{t('templates.name')}:</span> {regDetail.name}</p>
            <p><span className="text-surface-500">{t('templates.defaultBranch')}:</span> {regDetail.default_branch}</p>
            <p><span className="text-surface-500">{t('templates.lastSyncedAt')}:</span> {regDetail.last_synced_at ? new Date(regDetail.last_synced_at).toLocaleString() : '—'}</p>
            <p><span className="text-surface-500">{t('common.created')}:</span> {new Date(regDetail.created_at).toLocaleString()}</p>
          </div>
        ) : <p className="text-sm text-surface-500">{t('common.loading')}</p>}
      </Modal>
    </div>
  )
}
