import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { TableSkeleton } from '../components/ui/Skeleton'
import { PageHeader } from '../components/ui/PageHeader'
import { FilterBar } from '../components/ui/FilterBar'
import { SortableHeader } from '../components/ui/SortableHeader'
import { ResponsiveTable } from '../components/ui/ResponsiveTable'
import { Checkbox } from '../components/ui/Checkbox'
import { IconScripts } from '../components/ui/Icons'
import { Drawer } from '../components/ui/Drawer'
import { ScriptDrawer } from '../components/scripts/ScriptDrawer'
import { BulkRunScriptsOnNodesModal } from '../components/scripts/BulkRunScriptsOnNodesModal'
import { ScriptFormModal, type ScriptFormValues } from '../components/scripts/ScriptFormModal'
import { InfiniteScroll } from '../components/ui/InfiniteScroll'
import {
  useInfiniteScripts,
  useScriptTags,
  useCreateScript,
  useDeleteScript,
  useBulkDeleteScripts,
  useBulkCloneScripts,
} from '../hooks/useScripts'
import { useToast } from '../components/ui/useToast'
import { TagBadge } from '../components/ui/TagBadge'
import { TagFilter } from '../components/ui/TagFilter'
import { useSort } from '../hooks/useSort'
import type { ScriptResponse, ScriptCreate } from '../api/types'
import type { Column } from '../components/ui/table-types'

type SortKey = 'name' | 'steps' | 'tags' | 'updated_at' | 'created_at'

function scriptSortValue(script: ScriptResponse, key: SortKey): string | number {
  if (key === 'steps') return script.steps.length
  if (key === 'tags') return script.tags[0] ?? ''
  return script[key] ?? ''
}

export function Scripts() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const { sort, toggle: toggleSort } = useSort<SortKey>()
  const limit = 20

  const { data: infiniteData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteScripts({ limit, search: search || undefined, tag: tagFilter.length === 1 ? tagFilter[0] : undefined })
  const data = infiniteData ? { items: infiniteData.pages.flatMap((p) => p.items) } as { items: ScriptResponse[] } : undefined
  const { data: tags } = useScriptTags()
  const createScript = useCreateScript()
  const deleteScript = useDeleteScript()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [drawerScript, setDrawerScript] = useState<ScriptResponse | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [showBulkRun, setShowBulkRun] = useState(false)
  const bulkDelete = useBulkDeleteScripts()
  const bulkClone = useBulkCloneScripts()

  const scripts = (data?.items || []).filter(
    (script) => tagFilter.length <= 1 || tagFilter.some((t) => script.tags.includes(t))
  )

  const sortedScripts = sort
    ? [...scripts].sort((a, b) => {
        const dir = sort.dir === 'asc' ? 1 : -1
        if (sort.key === 'tags') {
          const av = a.tags[0] ?? ''
          const bv = b.tags[0] ?? ''
          return av.localeCompare(bv) * dir
        }
        const av = scriptSortValue(a, sort.key)
        const bv = scriptSortValue(b, sort.key)
        return (typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))) * dir
      })
    : scripts

  const allSelected = scripts.length > 0 && scripts.every((s) => selectedIds.includes(s.id))
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }, [])
  const toggleAll = useCallback(() => {
    setSelectedIds(allSelected ? [] : scripts.map((s) => s.id))
  }, [allSelected, scripts])

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteScript.mutate(deleteTarget.id, { onSuccess: () => { toast('success', t('scripts.toastDeleted', { name: deleteTarget.name })); setDeleteTarget(null) }, onError: () => toast('error', t('scripts.toastDeleteFailed')) })
  }

  const columns: Column<ScriptResponse>[] = [
    {
      key: 'select',
      header: (
        <Checkbox
          checked={allSelected}
          onChange={toggleAll}
          ariaLabel={t('common.selectAll')}
        />
      ),
      className: 'w-10',
      render: (script) => (
        <Checkbox
          checked={selectedIds.includes(script.id)}
          onChange={() => toggleSelect(script.id)}
          ariaLabel={t('common.selectItem', 'Select {{name}}', { name: script.name })}
        />
      ),
    },
    {
      key: 'name',
      header: <SortableHeader label={t('common.name')} sortKey="name" sort={sort} onSort={toggleSort} />,
      render: (script) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 flex items-center justify-center shrink-0">
            <IconScripts className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{script.name}</p>
            {script.description && <p className="text-xs text-surface-500 dark:text-surface-500 truncate">{script.description}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'steps',
      header: <SortableHeader label={t('scripts.steps')} sortKey="steps" sort={sort} onSort={toggleSort} />,
      render: (script) => <Badge variant="info">{script.steps.length}</Badge>,
    },
    {
      key: 'tags',
      header: <SortableHeader label={t('scripts.tagsLabel')} sortKey="tags" sort={sort} onSort={toggleSort} />,
      render: (script) => (
        <div className="flex flex-wrap gap-1">
          {script.tags.length > 0 ? script.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} onClick={() => setTagFilter((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])} />
          )) : <span className="text-surface-400">—</span>}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: <SortableHeader label={t('scripts.created')} sortKey="created_at" sort={sort} onSort={toggleSort} />,
      render: (script) => <span className="text-sm text-surface-600 dark:text-surface-300">{new Date(script.created_at).toLocaleDateString()}</span>,
    },
    {
      key: 'updated_at',
      header: <SortableHeader label={t('scripts.updated')} sortKey="updated_at" sort={sort} onSort={toggleSort} />,
      render: (script) => <span className="text-sm text-surface-600 dark:text-surface-300">{new Date(script.updated_at).toLocaleDateString()}</span>,
    },
  ]

  const renderMobileScript = (script: ScriptResponse) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 flex items-center justify-center shrink-0">
            <IconScripts className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{script.name}</p>
            {script.description && <p className="text-xs text-surface-500 dark:text-surface-500 truncate">{script.description}</p>}
          </div>
        </div>
        <Badge variant="info">{script.steps.length} {t('scripts.steps')}</Badge>
      </div>
      <div className="flex flex-wrap gap-1">
        {script.tags.length > 0 ? script.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} onClick={() => setTagFilter((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])} />
        )) : <span className="text-surface-400">—</span>}
      </div>
      <div className="text-xs text-surface-500">
        {t('scripts.created')}: {new Date(script.created_at).toLocaleDateString()} · {t('scripts.updated')}: {new Date(script.updated_at).toLocaleDateString()}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('scripts.title')}
        description={t('scripts.description')}
        actions={<Button onClick={() => setShowCreateModal(true)}>{t('scripts.createScript')}</Button>}
      />

      <FilterBar search={search} onSearch={setSearch} searchPlaceholder={t('scripts.searchPlaceholder', 'Search scripts...')}>
        <TagFilter
          available={tags ?? []}
          selected={tagFilter}
          onChange={setTagFilter}
        />
      </FilterBar>

      <Card hover className="stagger-item">
        <CardContent className="p-0">
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-accent-50 dark:bg-accent-900/20 border-b border-accent-200 dark:border-accent-800">
              <span className="text-sm font-medium text-accent-700 dark:text-accent-300">{t('common.selected', { count: selectedIds.length })}</span>
              <Button variant="ghost" size="sm" onClick={() => setShowBulkRun(true)}>{t('scripts.run')} ({selectedIds.length})</Button>
              <Button variant="ghost" size="sm" disabled={bulkClone.isPending} onClick={() => bulkClone.mutate(selectedIds, { onSuccess: (data: unknown) => { const d = data as { failed?: number }; if (d.failed && d.failed > 0) toast('warning', t('scripts.toastCloned') + ` — ${d.failed} failed`); else toast('success', t('scripts.toastCloned')); setSelectedIds([]) }, onError: () => toast('error', t('scripts.toastCloneFailed')) })}>{bulkClone.isPending ? t('common.loading') : t('scripts.clone')}</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowBulkDelete(true)} className="text-red-500">{t('common.delete')}</Button>
              <button onClick={() => setSelectedIds([])} className="ml-auto text-xs text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 cursor-pointer">{t('common.clear')}</button>
            </div>
          )}
          {isLoading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : scripts.length === 0 ? (
            <EmptyState icon={<IconScripts className="w-10 h-10" />} title={t('scripts.emptyTitle')} description={t('scripts.emptyDesc')} action={<Button onClick={() => setShowCreateModal(true)}>{t('scripts.createScript')}</Button>} />
          ) : (
            <ResponsiveTable
              data={sortedScripts}
              columns={columns}
              renderMobileItem={renderMobileScript}
              keyExtractor={(s) => s.id}
              emptyMessage={t('scripts.emptyTitle')}
              onRowClick={(script) => setDrawerScript(script)}
            />
          )}
          <InfiniteScroll hasMore={tagFilter.length > 1 ? false : !!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
          {tagFilter.length > 1 && hasNextPage && (
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center py-2">{t('nodes.multiTagLimited', 'Multi-tag filter shows only loaded pages. Clear filter to load more.')}</p>
          )}
        </CardContent>
      </Card>

      <ScriptFormModal
        isOpen={showCreateModal}
        title={t('scripts.createScript')}
        pending={createScript.isPending}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(values: ScriptFormValues) => {
          createScript.mutate(values as unknown as ScriptCreate, {
            onSuccess: () => { toast('success', t('scripts.toastCreated', { name: values.name })); setShowCreateModal(false) },
            onError: () => toast('error', t('scripts.toastCreateFailed')),
          })
        }}
      />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={t('scripts.deleteTitle')} message={t('scripts.deleteMsg', { name: deleteTarget?.name })} confirmLabel={t('common.delete')} loading={deleteScript.isPending} />
      <ConfirmDialog isOpen={showBulkDelete} onClose={() => setShowBulkDelete(false)} onConfirm={() => bulkDelete.mutate(selectedIds, { onSuccess: (data: unknown) => { const d = data as { failed?: number }; if (d.failed && d.failed > 0) toast('warning', t('scripts.toastDeleted') + ` — ${d.failed} failed`); else toast('success', t('scripts.toastDeleted')); setShowBulkDelete(false); setSelectedIds([]) }, onError: () => toast('error', t('scripts.toastDeleteFailed')) })} title={t('scripts.deleteTitle')} message={t('scripts.deleteMsg', { name: `${selectedIds.length} scripts` })} confirmLabel={t('common.delete')} loading={bulkDelete.isPending} />
      <BulkRunScriptsOnNodesModal scriptIds={showBulkRun ? selectedIds : []} onClose={() => setShowBulkRun(false)} />

      <Drawer isOpen={!!drawerScript} onClose={() => setDrawerScript(null)} size="lg">
        {drawerScript && <ScriptDrawer script={drawerScript} onClose={() => setDrawerScript(null)} />}
      </Drawer>
    </div>
  )
}
