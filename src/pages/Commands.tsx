// oxlint-disable
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, FormProvider, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { TableSkeleton } from '../components/ui/Skeleton'
import { InfiniteScroll } from '../components/ui/InfiniteScroll'
import { PageHeader } from '../components/ui/PageHeader'
import { FilterBar } from '../components/ui/FilterBar'
import { SortableHeader } from '../components/ui/SortableHeader'
import { ResponsiveTable } from '../components/ui/ResponsiveTable'
import { Checkbox } from '../components/ui/Checkbox'
import { IconCommands } from '../components/ui/Icons'
import { Drawer } from '../components/ui/Drawer'
import { CommandDrawer } from '../components/commands/CommandDrawer'
import { BulkRunCommandsModal } from '../components/commands/BulkRunCommandsModal'
import {
  useInfiniteCommands,
  useCommandTags,
  useCreateCommand,
  useBulkDeleteCommands,
  useBulkCloneCommands,
} from '../hooks/useCommands'
import { useToast } from '../components/ui/useToast'
import { TagBadge } from '../components/ui/TagBadge'
import { TagFilter } from '../components/ui/TagFilter'
import { useSort } from '../hooks/useSort'
import type { CommandResponse, CommandCreate } from '../api/types'
import type { Column } from '../components/ui/table-types'
import { ParameterEditor } from '../components/commands/CommandFormEditor'
import { normalizeParameters } from '../components/commands/command-form-utils'
import {
  commandCreateSchema,
  type CommandCreateFormValues,
} from '../lib/validators/command-schema'

type SortKey = 'name' | 'tags' | 'updated_at' | 'created_at'

export function Commands() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const { sort, toggle: toggleSort } = useSort<SortKey>()
  const limit = 20

  const { data: infiniteData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteCommands({ limit, search: search || undefined, tag: tagFilter.length === 1 ? tagFilter[0] : undefined })
  const commandsData = infiniteData ? { items: infiniteData.pages.flatMap((p) => p.items) } as { items: CommandResponse[] } : undefined
  const { data: tags } = useCommandTags()
  const createCommand = useCreateCommand()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [drawerCommand, setDrawerCommand] = useState<CommandResponse | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [showBulkRun, setShowBulkRun] = useState(false)
  const bulkDelete = useBulkDeleteCommands()
  const bulkClone = useBulkCloneCommands()

  const createForm = useForm<CommandCreateFormValues>({
    resolver: zodResolver(commandCreateSchema) as Resolver<CommandCreateFormValues>,
    defaultValues: { name: '', command: '', description: '', tags: [], parameters: [] },
  })

  const commands = (commandsData?.items || []).filter(
    (cmd: CommandResponse) => tagFilter.length <= 1 || tagFilter.some((t) => cmd.tags.includes(t))
  )

  const sortedCommands = sort
    ? [...commands].sort((a, b) => {
        const dir = sort.dir === 'asc' ? 1 : -1
        if (sort.key === 'tags') {
          const av = a.tags[0] ?? ''
          const bv = b.tags[0] ?? ''
          return av.localeCompare(bv) * dir
        }
        return String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? '')) * dir
      })
    : commands

  const allSelected = commands.length > 0 && commands.every((c) => selectedIds.includes(c.id))
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }, [])
  const toggleAll = useCallback(() => {
    setSelectedIds(allSelected ? [] : commands.map((c) => c.id))
  }, [allSelected, commands])

  const openCreate = () => {
    createForm.reset({ name: '', command: '', description: '', tags: [], parameters: [] })
    setShowCreateModal(true)
  }

  const onCreateSubmit = (values: CommandCreateFormValues) => {
    const data: CommandCreate = {
      name: values.name,
      command: values.command,
      description: values.description || undefined,
      parameters: normalizeParameters(values.parameters) as CommandCreate['parameters'],
      tags: values.tags,
    }
    createCommand.mutate(data, {
      onSuccess: () => { toast('success', t('commands.toastCreated')); setShowCreateModal(false); createForm.reset() },
      onError: () => toast('error', t('commands.toastCreateFailed')),
    })
  }

  const columns: Column<CommandResponse>[] = [
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
      render: (cmd) => (
        <Checkbox
          checked={selectedIds.includes(cmd.id)}
          onChange={() => toggleSelect(cmd.id)}
          ariaLabel={t('common.selectItem', 'Select {{name}}', { name: cmd.name })}
        />
      ),
    },
    {
      key: 'name',
      header: <SortableHeader label={t('common.name')} sortKey="name" sort={sort} onSort={toggleSort} />,
      render: (cmd) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400 flex items-center justify-center shrink-0">
            <IconCommands className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{cmd.name}</p>
            <p className="text-xs text-surface-500 dark:text-surface-500 font-mono truncate">{cmd.command}</p>
            {cmd.description && <p className="text-xs text-surface-500 dark:text-surface-500 truncate">{cmd.description}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'tags',
      header: <SortableHeader label={t('commands.tags')} sortKey="tags" sort={sort} onSort={toggleSort} />,
      render: (cmd) => (
        <div className="flex flex-wrap gap-1">
          {cmd.tags.length > 0 ? cmd.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} onClick={() => setTagFilter((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])} />
          )) : <span className="text-surface-400">—</span>}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: <SortableHeader label={t('commands.created')} sortKey="created_at" sort={sort} onSort={toggleSort} />,
      render: (cmd) => <span className="text-sm text-surface-600 dark:text-surface-300">{new Date(cmd.created_at).toLocaleDateString()}</span>,
    },
    {
      key: 'updated',
      header: <SortableHeader label={t('commands.updated')} sortKey="updated_at" sort={sort} onSort={toggleSort} />,
      render: (cmd) => <span className="text-sm text-surface-600 dark:text-surface-300">{new Date(cmd.updated_at).toLocaleDateString()}</span>,
    },
  ]

  const renderMobileCommand = (cmd: CommandResponse) => (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400 flex items-center justify-center shrink-0">
          <IconCommands className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{cmd.name}</p>
          <p className="text-xs text-surface-500 dark:text-surface-500 font-mono truncate">{cmd.command}</p>
          {cmd.description && <p className="text-xs text-surface-500 dark:text-surface-500 truncate">{cmd.description}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {cmd.tags.length > 0 ? cmd.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} onClick={() => setTagFilter((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])} />
        )) : <span className="text-surface-400">—</span>}
      </div>
      <div className="flex items-center gap-3 text-xs text-surface-500">
        <span>{t('commands.created')}: {new Date(cmd.created_at).toLocaleDateString()}</span>
        <span>{t('commands.updated')}: {new Date(cmd.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('commands.title')}
        description={t('commands.description')}
        actions={<Button onClick={openCreate}>{t('commands.createCommand')}</Button>}
      />

      <FilterBar search={search} onSearch={setSearch} searchPlaceholder={t('commands.searchPlaceholder', 'Search commands...')}>
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
              <Button variant="ghost" size="sm" onClick={() => setShowBulkRun(true)}>{t('commands.execute')} ({selectedIds.length})</Button>
              <Button variant="ghost" size="sm" disabled={bulkClone.isPending} onClick={() => bulkClone.mutate(selectedIds, { onSuccess: (data: unknown) => { const d = data as { failed?: number }; if (d.failed && d.failed > 0) toast('warning', t('commands.toastCloned') + t('common.failedSuffix', { count: d.failed })); else toast('success', t('commands.toastCloned')); setSelectedIds([]) }, onError: () => toast('error', t('commands.toastCloneFailed')) })}>{bulkClone.isPending ? t('common.loading') : t('commands.clone')}</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowBulkDelete(true)} className="text-red-500">{t('common.delete')}</Button>
              <button onClick={() => setSelectedIds([])} className="ml-auto text-xs text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 cursor-pointer">{t('common.clear')}</button>
            </div>
          )}
          {isLoading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : commands.length === 0 ? (
            <EmptyState
              icon={<IconCommands className="w-10 h-10" />}
              title={t('commands.emptyTitle')}
              description={t('commands.emptyDesc')}
              action={<Button onClick={openCreate}>{t('commands.createCommand')}</Button>}
            />
          ) : (
            <ResponsiveTable
              data={sortedCommands}
              columns={columns}
              renderMobileItem={renderMobileCommand}
              keyExtractor={(c) => c.id}
              emptyMessage={t('commands.emptyTitle')}
              onRowClick={(cmd) => setDrawerCommand(cmd)}
            />
          )}
          <InfiniteScroll hasMore={tagFilter.length > 1 ? false : !!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
          {tagFilter.length > 1 && hasNextPage && (
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center py-2">{t('nodes.multiTagLimited', 'Multi-tag filter shows only loaded pages. Clear filter to load more.')}</p>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('commands.createCommand')} size="lg">
        <FormProvider {...createForm}>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <Input label={t('commands.name')} placeholder="check-disk" {...createForm.register('name')} error={createForm.formState.errors.name?.message} />
            <Input label={t('commands.command')} placeholder="df -h" {...createForm.register('command')} error={createForm.formState.errors.command?.message} />
            <Controller
              name="description"
              control={createForm.control}
              render={({ field }) => <Input label={t('commands.descriptionField', 'Description')} placeholder={t('commands.description', 'Description')} {...field} value={field.value ?? ''} />}
            />
            <Controller
              name="tags"
              control={createForm.control}
              render={({ field }) => (
                <Input
                  label={t('commands.tagsLabel')}
                  placeholder="disk, system"
                  value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                  onChange={(e) => field.onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                />
              )}
            />
            <ParameterEditor />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={createCommand.isPending}>{createCommand.isPending ? t('common.loading') : t('common.save')}</Button>
            </div>
          </form>
        </FormProvider>
      </Modal>

      <Drawer isOpen={!!drawerCommand} onClose={() => setDrawerCommand(null)} size="lg">
        {drawerCommand && <CommandDrawer command={drawerCommand} onClose={() => setDrawerCommand(null)} />}
      </Drawer>

      <ConfirmDialog isOpen={showBulkDelete} onClose={() => setShowBulkDelete(false)} onConfirm={() => bulkDelete.mutate(selectedIds, { onSuccess: (data: unknown) => { const d = data as { failed?: number }; if (d.failed && d.failed > 0) toast('warning', t('commands.toastDeleted') + t('common.failedSuffix', { count: d.failed })); else toast('success', t('commands.toastDeleted')); setShowBulkDelete(false); setSelectedIds([]) }, onError: () => toast('error', t('commands.toastDeleteFailed')) })} title={t('commands.deleteTitle', 'Delete Command')} message={t('commands.deleteMsg', { name: `${selectedIds.length} commands` })} confirmLabel={t('common.delete')} loading={bulkDelete.isPending} />
      <BulkRunCommandsModal commandIds={showBulkRun ? selectedIds : []} onClose={() => setShowBulkRun(false)} />
    </div>
  )
}
