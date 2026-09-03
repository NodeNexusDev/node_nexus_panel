import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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
import { DropdownMenu, type DropdownMenuItem } from '../components/ui/DropdownMenu'
import { IconCommands, IconZap } from '../components/ui/Icons'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import {
  useInfiniteCommands,
  useCommandTags,
  useCreateCommand,
  useUpdateCommand,
  useCloneCommand,
  useDeleteCommand,
} from '../hooks/useCommands'
import { useToast } from '../components/ui/useToast'
import { TagBadge } from '../components/ui/TagBadge'
import { TagFilter } from '../components/ui/TagFilter'
import { useSort } from '../hooks/useSort'
import type { CommandResponse, CommandCreate, CommandUpdate } from '../api/types'
import type { Column } from '../components/ui/table-types'
import { ParameterEditor } from '../components/commands/CommandFormEditor'
import { CommandExecuteModal } from '../components/commands/CommandExecuteModal'
import { normalizeParameters } from '../components/commands/command-form-utils'
import {
  commandCreateSchema,
  commandUpdateSchema,
  type CommandCreateFormValues,
  type CommandUpdateFormValues,
} from '../lib/validators/command-schema'

type SortKey = 'name' | 'tags' | 'updated_at' | 'created_at'

export function Commands() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const { sort, toggle: toggleSort } = useSort<SortKey>()
  const limit = 20

  const { data: infiniteData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteCommands({ limit, search: search || undefined })
  const commandsData = infiniteData ? { items: infiniteData.pages.flatMap((p) => p.items) } as { items: CommandResponse[] } : undefined
  const { data: tags } = useCommandTags()
  const createCommand = useCreateCommand()
  const updateCommand = useUpdateCommand()
  const cloneCommand = useCloneCommand()
  const deleteCommand = useDeleteCommand()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editTarget, setEditTarget] = useState<CommandResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [executeTarget, setExecuteTarget] = useState<CommandResponse | null>(null)

  const createForm = useForm<CommandCreateFormValues>({
    resolver: zodResolver(commandCreateSchema) as Resolver<CommandCreateFormValues>,
    defaultValues: { name: '', command: '', description: '', tags: [], parameters: [] },
  })

  const editForm = useForm<CommandUpdateFormValues>({
    resolver: zodResolver(commandUpdateSchema) as Resolver<CommandUpdateFormValues>,
  })

  const commands = (commandsData?.items || []).filter(
    (cmd: CommandResponse) => tagFilter.length === 0 || tagFilter.some((t) => cmd.tags.includes(t))
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

  const openCreate = () => {
    createForm.reset({ name: '', command: '', description: '', tags: [], parameters: [] })
    setShowCreateModal(true)
  }

  const openEdit = (cmd: CommandResponse) => {
    setEditTarget(cmd)
    editForm.reset({
      name: cmd.name,
      command: cmd.command,
      description: cmd.description ?? '',
      tags: cmd.tags,
      parameters:
        cmd.parameters?.map((p) => ({
          name: p.name,
          type: p.type,
          required: p.required,
          default: typeof p.default === 'string' || typeof p.default === 'number' || typeof p.default === 'boolean' ? p.default : '',
          description: p.description ?? '',
        })) ?? [],
    })
  }

  const onCreateSubmit = (values: CommandCreateFormValues) => {
    const data: CommandCreate = {
      name: values.name,
      command: values.command,
      description: values.description || undefined,
      parameters: normalizeParameters(values.parameters) as unknown as CommandCreate['parameters'],
      tags: values.tags,
    }
    createCommand.mutate(data, {
      onSuccess: () => { toast('success', t('commands.toastCreated')); setShowCreateModal(false); createForm.reset() },
      onError: () => toast('error', t('commands.toastCreateFailed')),
    })
  }

  const onEditSubmit = (values: CommandUpdateFormValues) => {
    if (!editTarget) return
    const data: CommandUpdate = {
      name: values.name,
      command: values.command,
      description: values.description || undefined,
      parameters: normalizeParameters(values.parameters) as unknown as CommandUpdate['parameters'],
      tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
    }
    updateCommand.mutate(
      { id: editTarget.id, data },
      {
        onSuccess: () => { toast('success', t('commands.toastUpdated')); setEditTarget(null); editForm.reset() },
        onError: () => toast('error', t('commands.toastUpdateFailed')),
      },
    )
  }

  const handleClone = (cmd: CommandResponse) => {
    cloneCommand.mutate(
      { id: cmd.id, newName: `${cmd.name} (copy)` },
      { onSuccess: () => toast('success', t('commands.toastCloned')), onError: () => toast('error', t('commands.toastCloneFailed')) },
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteCommand.mutate(deleteTarget.id, {
      onSuccess: () => { toast('success', t('commands.toastDeleted')); setDeleteTarget(null) },
      onError: () => toast('error', t('commands.toastDeleteFailed')),
    })
  }

  const commandMenu = (cmd: CommandResponse): DropdownMenuItem[] => [
    { key: 'edit', label: t('common.edit'), onClick: () => openEdit(cmd) },
    { key: 'clone', label: t('commands.clone'), onClick: () => handleClone(cmd) },
    { key: 'sep', label: '', onClick: () => {}, separator: true },
    { key: 'delete', label: t('common.delete'), danger: true, onClick: () => setDeleteTarget({ id: cmd.id, name: cmd.name }) },
  ]

  const columns: Column<CommandResponse>[] = [
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
    {
      key: 'actions',
      header: t('common.actions'),
      render: (cmd) => (
        <div className="flex items-center gap-1">
          <FavoriteButton targetType="command" targetId={cmd.id} resourceName={cmd.name} size="sm" />
          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setExecuteTarget(cmd) }}>
            <IconZap className="w-4 h-4 mr-1" />
            {t('commands.execute')}
          </Button>
          <DropdownMenu items={commandMenu(cmd)} ariaLabel={t('common.actionsFor', { name: cmd.name })} />
        </div>
      ),
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
      <div className="flex items-center gap-1">
        <FavoriteButton targetType="command" targetId={cmd.id} resourceName={cmd.name} size="sm" />
        <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setExecuteTarget(cmd) }}>
          <IconZap className="w-4 h-4 mr-1" />
          {t('commands.execute')}
        </Button>
        <DropdownMenu items={commandMenu(cmd)} ariaLabel={`${cmd.name} actions`} />
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
              onRowClick={(cmd) => navigate(`/commands/${cmd.id}`)}
            />
          )}
          <InfiniteScroll hasMore={!!hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
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

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={t('commands.editCommand', 'Edit Command')} size="lg">
        <FormProvider {...editForm}>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <Input label={t('commands.name')} placeholder="check-disk" {...editForm.register('name')} error={editForm.formState.errors.name?.message} />
            <Input label={t('commands.command')} placeholder="df -h" {...editForm.register('command')} error={editForm.formState.errors.command?.message} />
            <Controller
              name="description"
              control={editForm.control}
              render={({ field }) => <Input label={t('commands.descriptionField', 'Description')} placeholder={t('commands.description', 'Description')} {...field} value={field.value ?? ''} />}
            />
            <Controller
              name="tags"
              control={editForm.control}
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
              <Button type="button" variant="ghost" onClick={() => setEditTarget(null)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={updateCommand.isPending}>{updateCommand.isPending ? t('common.loading') : t('common.save')}</Button>
            </div>
          </form>
        </FormProvider>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('commands.deleteTitle', 'Delete Command')}
        message={t('commands.deleteMsg', { name: deleteTarget?.name })}
        confirmLabel={t('common.delete')}
        loading={deleteCommand.isPending}
      />

      <CommandExecuteModal command={executeTarget} onClose={() => setExecuteTarget(null)} />
    </div>
  )
}
