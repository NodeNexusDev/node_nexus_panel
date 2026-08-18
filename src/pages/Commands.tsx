import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useForm, FormProvider, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Typewriter } from '../components/ui/Typewriter'
import { Skeleton } from '../components/ui/Skeleton'
import { Pagination } from '../components/ui/Pagination'
import { IconCommands, IconSearch } from '../components/ui/Icons'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { useNodes } from '../hooks/useNodes'
import {
  useCommands,
  useCommandTags,
  useExecuteCommand,
  useCreateCommand,
  useUpdateCommand,
  useCloneCommand,
  useDeleteCommand,
} from '../hooks/useCommands'
import { useToast } from '../components/ui/useToast'
import type { Command, CommandCreate, CommandUpdate } from '../api/types'
import { ParameterEditor } from '../components/commands/CommandFormEditor'
import { normalizeParameters, getDefaultParams } from '../components/commands/command-form-utils'
import {
  commandCreateSchema,
  commandUpdateSchema,
  type CommandCreateFormValues,
  type CommandUpdateFormValues,
} from '../lib/validators/command-schema'

export function Commands() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    setPage(1)
  }, [search, tagFilter])

  const { data: nodesData } = useNodes()
  const { data: commandsData, isLoading: commandsLoading } = useCommands({
    page,
    size: pageSize,
    search: search || undefined,
    tag: tagFilter || undefined,
  })
  const { data: tags } = useCommandTags()
  const executeCommand = useExecuteCommand()
  const createCommand = useCreateCommand()
  const updateCommand = useUpdateCommand()
  const cloneCommand = useCloneCommand()
  const deleteCommand = useDeleteCommand()

  const [selectedCommandId, setSelectedCommandId] = useState('')
  const [selectedNode, setSelectedNode] = useState('')
  const [commandParams, setCommandParams] = useState<Record<string, unknown>>({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Command | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const createForm = useForm<CommandCreateFormValues>({
    resolver: zodResolver(commandCreateSchema) as Resolver<CommandCreateFormValues>,
    defaultValues: {
      name: '',
      command: '',
      description: '',
      tags: [],
      parameters: [],
    },
  })

  const editForm = useForm<CommandUpdateFormValues>({
    resolver: zodResolver(commandUpdateSchema) as Resolver<CommandUpdateFormValues>,
  })

  const nodes = nodesData?.items || []
  const commands = commandsData?.items || []
  const selectedCommand = commands.find((c) => c.id === selectedCommandId)

  useEffect(() => {
    if (selectedCommand) {
      setCommandParams(getDefaultParams(selectedCommand.parameters))
    } else {
      setCommandParams({})
    }
  }, [selectedCommand])

  const openCreate = () => {
    createForm.reset({
      name: '',
      command: '',
      description: '',
      tags: [],
      parameters: [],
    })
    setShowCreateModal(true)
  }

  const openEdit = (cmd: Command) => {
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
          default: p.default ?? '',
          description: p.description ?? '',
        })) ?? [],
    })
  }

  const onCreateSubmit = (values: CommandCreateFormValues) => {
    const data: CommandCreate = {
      name: values.name,
      command: values.command,
      description: values.description || undefined,
      parameters: normalizeParameters(values.parameters),
      tags: values.tags,
    }
    createCommand.mutate(data, {
      onSuccess: () => {
        toast('success', t('commands.toastCreated'))
        setShowCreateModal(false)
        createForm.reset()
      },
      onError: () => toast('error', t('commands.toastCreateFailed')),
    })
  }

  const onEditSubmit = (values: CommandUpdateFormValues) => {
    if (!editTarget) return
    const data: CommandUpdate = {
      name: values.name,
      command: values.command,
      description: values.description || undefined,
      parameters: normalizeParameters(values.parameters),
      tags: values.tags,
    }
    updateCommand.mutate(
      { id: editTarget.id, data },
      {
        onSuccess: () => {
          toast('success', t('commands.toastUpdated'))
          setEditTarget(null)
          editForm.reset()
        },
        onError: () => toast('error', t('commands.toastUpdateFailed')),
      },
    )
  }

  const handleExecute = () => {
    if (!selectedCommand || !selectedNode) return
    const parameters = selectedCommand.parameters || []
    const missing = parameters.filter((p) => {
      const raw = commandParams[p.name]
      if (p.type === 'boolean') return raw === undefined || raw === null
      return raw === '' || raw === undefined || raw === null
    })
    if (missing.length > 0) {
      toast(
        'error',
        t('commands.missingParameters', 'Missing required parameters: {{names}}', {
          names: missing.map((p) => p.name).join(', '),
        }),
      )
      return
    }

    const params: Record<string, unknown> = {}
    for (const p of parameters) {
      const raw = commandParams[p.name]
      if (raw === '' || raw === undefined || raw === null) continue
      if (p.type === 'integer') {
        params[p.name] = Number(raw)
      } else if (p.type === 'boolean') {
        params[p.name] = !!raw
      } else {
        params[p.name] = raw
      }
    }

    executeCommand.mutate(
      {
        id: selectedCommandId,
        data: {
          node_id: selectedNode,
          params: Object.keys(params).length > 0 ? params : undefined,
        },
      },
      {
        onSuccess: () => {
          toast('success', t('commands.toastExecuted', { target: selectedNode }))
          setSelectedCommandId('')
          setSelectedNode('')
          setCommandParams({})
        },
        onError: () => toast('error', t('commands.toastFailed')),
      },
    )
  }

  const handleClone = (cmd: Command) => {
    cloneCommand.mutate(
      { id: cmd.id, newName: `${cmd.name} (copy)` },
      { onSuccess: () => toast('success', t('commands.toastCloned')), onError: () => toast('error', t('commands.toastCloneFailed')) },
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteCommand.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast('success', t('commands.toastDeleted'))
        setDeleteTarget(null)
      },
      onError: () => toast('error', t('commands.toastDeleteFailed')),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('commands.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{t('commands.description')}</p>
        </div>
        <Button onClick={openCreate}>{t('commands.createCommand')}</Button>
      </div>

      <Card className="stagger-item">
        <CardHeader>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('commands.executeCommand')}</h2>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <select
              value={selectedCommandId}
              onChange={(e) => {
                setSelectedCommandId(e.target.value)
                setCommandParams({})
              }}
              className="px-4 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white min-w-[200px]"
            >
              <option value="">{t('commands.selectCommand')}</option>
              {commands.map((cmd) => (
                <option key={cmd.id} value={cmd.id}>
                  {cmd.name}
                </option>
              ))}
            </select>
            <select
              value={selectedNode}
              onChange={(e) => setSelectedNode(e.target.value)}
              className="px-4 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white min-w-[160px]"
            >
              <option value="">{t('commands.selectNode')}</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
            <Button onClick={handleExecute} disabled={executeCommand.isPending || !selectedCommandId || !selectedNode}>
              {executeCommand.isPending ? <Spinner size="sm" /> : t('commands.execute')}
            </Button>
          </div>
          {selectedCommand && (
            <div className="mt-4 p-3 bg-surface-50 rounded-lg dark:bg-surface-800/50">
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300">{selectedCommand.name}</p>
              <pre className="text-sm text-surface-600 dark:text-surface-400 font-mono mt-1">{selectedCommand.command}</pre>
              {selectedCommand.description && <p className="text-xs text-surface-500 dark:text-surface-500 mt-1">{selectedCommand.description}</p>}
              {selectedCommand.parameters && selectedCommand.parameters.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-surface-600 dark:text-surface-400">{t('commands.parameters', 'Parameters')}</p>
                  {selectedCommand.parameters.map((param) => (
                    <div key={param.name} className="flex items-center gap-2">
                      <label className="text-xs text-surface-500 dark:text-surface-400 min-w-[100px]">
                        {param.name}
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {param.type === 'boolean' ? (
                        <input
                          type="checkbox"
                          checked={!!commandParams[param.name]}
                          onChange={(e) => setCommandParams((prev) => ({ ...prev, [param.name]: e.target.checked }))}
                          className="rounded border-surface-300 dark:border-surface-600"
                        />
                      ) : (
                        <input
                          type={param.type === 'integer' ? 'number' : 'text'}
                          placeholder={param.description || `${param.type}${param.required ? ' (required)' : ''}`}
                          value={String(commandParams[param.name] ?? param.default ?? '')}
                          onChange={(e) => setCommandParams((prev) => ({ ...prev, [param.name]: e.target.value }))}
                          className="px-3 py-1 bg-white border border-surface-300 rounded text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                        />
                      )}
                      {param.description && <span className="text-xs text-surface-400">{param.description}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="stagger-item">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('commands.templates')}</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder={t('commands.searchPlaceholder', 'Search commands...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white"
              >
                <option value="">{t('commands.allTags', 'All tags')}</option>
                {tags?.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {commandsLoading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2 stagger-item">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="text" className="w-32" />
                    <Skeleton variant="text" className="w-16" />
                    <Skeleton variant="text" className="w-20 ml-auto" />
                  </div>
                  <Skeleton variant="rectangular" className="w-full h-16" />
                </div>
              ))}
            </div>
          ) : commands.length === 0 ? (
            <EmptyState
              icon={<IconCommands className="w-10 h-10" />}
              title={t('commands.emptyTitle')}
              description={t('commands.emptyDesc')}
              action={<Button onClick={openCreate}>{t('commands.createCommand')}</Button>}
            />
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800">
              {commands.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/commands/${item.id}`)}
                  className="px-6 py-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors stagger-item cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <code className="text-sm text-accent-600 dark:text-accent-400 font-mono truncate">{item.name}</code>
                      <span className="text-xs text-surface-500 dark:text-surface-500 truncate">{item.command}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="default">
                          {tag}
                        </Badge>
                      ))}
                      <FavoriteButton targetType="command" targetId={item.id} size="sm" />
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleClone(item) }} disabled={cloneCommand.isPending}>
                        {t('commands.clone', 'Clone')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(item) }}>
                        {t('common.edit')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: item.id, name: item.name }) }} className="text-red-500">
                        {t('common.delete')}
                      </Button>
                    </div>
                  </div>
                  <pre className="text-sm text-surface-700 bg-surface-50 rounded p-3 overflow-x-auto font-mono dark:text-surface-300 dark:bg-surface-800/50">
                    <Typewriter text={item.command} speed={10} />
                  </pre>
                </div>
              ))}
            </div>
          )}
          {commandsData && commandsData.total > pageSize && (
            <div className="px-6 py-3 border-t border-surface-200 dark:border-surface-800">
              <Pagination page={page} totalPages={Math.ceil(commandsData.total / pageSize)} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('commands.createCommand')} size="lg">
        <FormProvider {...createForm}>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <Input
              label={t('commands.name', 'Name')}
              placeholder="check-disk"
              {...createForm.register('name')}
              error={createForm.formState.errors.name?.message}
            />
            <Input
              label={t('commands.command', 'Command')}
              placeholder="df -h"
              {...createForm.register('command')}
              error={createForm.formState.errors.command?.message}
            />
            <Controller
              name="description"
              control={createForm.control}
              render={({ field }) => (
                <Input label={t('commands.descriptionField', 'Description')} placeholder="Check disk usage" {...field} value={field.value ?? ''} />
              )}
            />
            <Controller
              name="tags"
              control={createForm.control}
              render={({ field }) => (
                <Input
                  label={t('commands.tagsLabel', 'Tags (comma separated)')}
                  placeholder="disk, system"
                  value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                  onChange={(e) => field.onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                />
              )}
            />
            <ParameterEditor />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createCommand.isPending}>
                {createCommand.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={t('commands.editCommand', 'Edit Command')} size="lg">
        <FormProvider {...editForm}>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <Input
              label={t('commands.name', 'Name')}
              placeholder="check-disk"
              {...editForm.register('name')}
              error={editForm.formState.errors.name?.message}
            />
            <Input
              label={t('commands.command', 'Command')}
              placeholder="df -h"
              {...editForm.register('command')}
              error={editForm.formState.errors.command?.message}
            />
            <Controller
              name="description"
              control={editForm.control}
              render={({ field }) => (
                <Input label={t('commands.descriptionField', 'Description')} placeholder="Check disk usage" {...field} value={field.value ?? ''} />
              )}
            />
            <Controller
              name="tags"
              control={editForm.control}
              render={({ field }) => (
                <Input
                  label={t('commands.tagsLabel', 'Tags (comma separated)')}
                  placeholder="disk, system"
                  value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                  onChange={(e) => field.onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                />
              )}
            />
            <ParameterEditor />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditTarget(null)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={updateCommand.isPending}>
                {updateCommand.isPending ? t('common.loading') : t('common.save')}
              </Button>
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
    </div>
  )
}
