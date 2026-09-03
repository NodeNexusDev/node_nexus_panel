import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { TableSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/useToast'
import { useInfinitePacks, usePackStats, useInfiniteRegistries, useSyncRegistry, useDeleteRegistry, useCreateRegistry, useInstallPack } from '../hooks/useTemplates'
import { Modal } from '../components/ui/Modal'
import { InfiniteScroll } from '../components/ui/InfiniteScroll'

type Tab = 'packs' | 'registries'

export function Templates() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('packs')
  return (
    <div className="space-y-6">
      <PageHeader title={t('templates.title', 'Templates')} description={t('templates.description', 'Manage packs and registries')} />
      <div className="border-b border-surface-200 dark:border-surface-800">
        <nav className="flex gap-4">
          {(['packs', 'registries'] as Tab[]).map((k) => (
            <button key={k} onClick={() => setActiveTab(k)} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === k ? 'border-accent-500 text-accent-600 dark:text-accent-400' : 'border-transparent text-surface-500 hover:text-surface-700'}`}>
              {t(`templates.${k}`, k)}
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
  const { data: infiniteData, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePacks({ limit: 50 })
  const { data: stats } = usePackStats()
  const install = useInstallPack()
  const packs = infiniteData ? infiniteData.pages.flatMap((p) => (p as unknown as { items: Array<{ id: string; name: string; description?: string | null; tags?: string[]; installed?: boolean }> }).items) : []
  const [search, setSearch] = useState('')
  const filtered = packs.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))

  if (isLoading) return <TableSkeleton rows={5} cols={4} />
  if (error) return <div className="text-sm text-red-500">{String(error)}</div>

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 max-w-sm">
              <Input placeholder={t('templates.searchPacks', 'Search packs...')} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {stats && (
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="default">{t('templates.total', 'Total')}: {stats.total}</Badge>
                <Badge variant="success">{t('templates.installed', 'Installed')}: {stats.installed}</Badge>
                <Badge variant="info">{t('templates.notInstalled', 'Not installed')}: {stats.not_installed}</Badge>
              </div>
            )}
            <Button variant="ghost" onClick={() => refetch()}>{t('common.refresh')}</Button>
          </div>
        </CardContent>
      </Card>
      <Card hover>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState title={t('templates.noPacks', 'No packs')} description={t('templates.noPacksDesc', 'Add a registry to discover packs')} />
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800">
              {filtered.map((pack) => (
                <div key={pack.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{pack.name}</p>
                    {pack.description && <p className="text-xs text-surface-500 truncate">{pack.description}</p>}
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {(pack.tags ?? []).map((tag) => <Badge key={tag} variant="default">{tag}</Badge>)}
                      {pack.installed && <Badge variant="success">{t('templates.installed', 'Installed')}</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => install.mutate({ packId: pack.id }, { onSuccess: () => toast('success', t('templates.installStarted', 'Install started')), onError: () => toast('error', t('templates.installFailed', 'Install failed')) })} disabled={install.isPending}>{t('templates.install', 'Install')}</Button>
                  </div>
                </div>
              ))}
              <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function RegistriesTab() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: infiniteData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteRegistries({ limit: 50 })
  const regs = infiniteData ? infiniteData.pages.flatMap((p) => (p as unknown as { items: Array<{ id: string; name: string; url: string; enabled?: boolean }> }).items) : []
  const sync = useSyncRegistry()
  const del = useDeleteRegistry()
  const create = useCreateRegistry()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')

  if (isLoading) return <TableSkeleton rows={3} cols={3} />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>{t('templates.addRegistry', 'Add Registry')}</Button>
      </div>
      <Card hover>
        <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('templates.registries', 'Registries')}</h2></CardHeader>
        <CardContent className="p-0">
          {regs.length === 0 ? (
            <EmptyState title={t('templates.noRegistries', 'No registries')} />
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800">
              {regs.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{r.name}</p>
                    <p className="text-xs text-surface-500 font-mono">{r.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => sync.mutate(r.id, { onSuccess: () => toast('success', t('templates.synced', 'Synced')), onError: () => toast('error', t('templates.syncFailed', 'Sync failed')) })} disabled={sync.isPending}>{t('templates.sync', 'Sync')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => del.mutate(r.id, { onSuccess: () => toast('success', t('templates.deleted', 'Deleted')), onError: () => toast('error', t('templates.deleteFailed', 'Delete failed')) })} className="text-red-500" disabled={del.isPending}>{t('common.delete')}</Button>
                  </div>
                </div>
              ))}
              <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('templates.addRegistry', 'Add Registry')} size="sm">
        <div className="space-y-4">
          <Input label={t('templates.name', 'Name')} placeholder="my-registry" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label={t('templates.url', 'URL')} placeholder="https://example.com/registry.json" value={url} onChange={(e) => setUrl(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => { if (name.trim() && url.trim()) create.mutate({ name: name.trim(), url: url.trim() } as never, { onSuccess: () => { toast('success', t('templates.created', 'Created')); setShowCreate(false); setName(''); setUrl('') }, onError: () => toast('error', t('templates.createFailed', 'Create failed')) }) }} disabled={!name.trim() || !url.trim() || create.isPending}>{create.isPending ? t('common.loading') : t('common.create')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
