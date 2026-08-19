import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, FormProvider, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { NotesPanel } from '../components/ui/NotesPanel'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { Tabs } from '../components/ui/Tabs'
import { StatCard, StatsGrid } from '../components/ui/StatCard'
import { IconCommands, IconArrowLeft, IconXCircle, IconCheckCircle } from '../components/ui/Icons'
import { useToast } from '../components/ui/useToast'
import {
  useCommand,
  useCommandStats,
  useUpdateCommand,
  useCloneCommand,
  useDeleteCommand,
} from '../hooks/useCommands'
import { ParameterEditor } from '../components/commands/CommandFormEditor'
import { CommandExecuteModal } from '../components/commands/CommandExecuteModal'
import { normalizeParameters } from '../components/commands/command-form-utils'
import { commandUpdateSchema, type CommandUpdateFormValues } from '../lib/validators/command-schema'
import type { Command, CommandUpdate } from '../api/types'

type Tab = 'overview' | 'parameters' | 'stats' | 'notes'

export function CommandDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [showExecModal, setShowExecModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: command, isLoading, error, refetch } = useCommand(id || '')
  const updateCommand = useUpdateCommand()
  const cloneCommand = useCloneCommand()
  const deleteCommand = useDeleteCommand()

  const editForm = useForm<CommandUpdateFormValues>({
    resolver: zodResolver(commandUpdateSchema) as Resolver<CommandUpdateFormValues>,
  })

  const openEdit = () => {
    if (!command) return
    editForm.reset({
      name: command.name,
      command: command.command,
      description: command.description ?? '',
      tags: command.tags,
      parameters:
        command.parameters?.map((p) => ({
          name: p.name,
          type: p.type,
          required: p.required,
          default: typeof p.default === 'string' || typeof p.default === 'number' || typeof p.default === 'boolean' ? p.default : '',
          description: p.description ?? '',
        })) ?? [],
    })
    setShowEditModal(true)
  }

  const onEditSubmit = (values: CommandUpdateFormValues) => {
    if (!id) return
    const data: CommandUpdate = {
      name: values.name,
      command: values.command,
      description: values.description || undefined,
      parameters: normalizeParameters(values.parameters),
      tags: values.tags,
    }
    updateCommand.mutate(
      { id, data },
      {
        onSuccess: () => { toast('success', t('commands.toastUpdated')); setShowEditModal(false) },
        onError: () => toast('error', t('commands.toastUpdateFailed')),
      },
    )
  }

  const handleClone = () => {
    if (!command) return
    cloneCommand.mutate(
      { id: command.id, newName: `${command.name} (copy)` },
      { onSuccess: () => toast('success', t('commands.toastCloned')), onError: () => toast('error', t('commands.toastCloneFailed')) },
    )
  }

  const handleDelete = () => {
    if (!id) return
    deleteCommand.mutate(id, {
      onSuccess: () => { toast('success', t('commands.toastDeleted')); navigate('/commands') },
      onError: () => toast('error', t('commands.toastDeleteFailed')),
    })
  }

  if (isLoading) return <Spinner size="lg" className="mx-auto my-16" />
  if (error || !command) {
    return (
      <ErrorState
        title={t('commands.notFound', 'Command not found')}
        error={error}
        onRetry={refetch}
      />
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('commands.overview', 'Overview') },
    { key: 'parameters', label: t('commands.parameters', 'Parameters') },
    { key: 'stats', label: t('commands.stats', 'Stats') },
    { key: 'notes', label: t('notes.title') },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/commands')} className="px-2">
            <IconArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-accent-500/10 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400 flex items-center justify-center">
            <IconCommands className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white truncate">{command.name}</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400 font-mono truncate">{command.command}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FavoriteButton targetType="command" targetId={command.id} size="sm" />
          <Button variant="secondary" size="sm" onClick={() => setShowExecModal(true)}>
            <IconCheckCircle className="w-4 h-4 mr-1" />
            {t('commands.execute')}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClone} disabled={cloneCommand.isPending}>{t('commands.clone')}</Button>
          <Button variant="ghost" size="sm" onClick={openEdit}>{t('common.edit')}</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowDeleteDialog(true)} className="text-red-500 hover:text-red-600">
            <IconXCircle className="w-4 h-4 mr-1" />
            {t('common.delete')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {command.tags.map((tag) => <Badge key={tag} variant="default">{tag}</Badge>)}
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && <OverviewTab command={command} />}
      {activeTab === 'parameters' && <ParametersTab command={command} />}
      {activeTab === 'stats' && <StatsTab commandId={command.id} />}
      {activeTab === 'notes' && <NotesTab commandId={command.id} />}

      <CommandExecuteModal command={showExecModal ? command : null} onClose={() => setShowExecModal(false)} />

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={t('commands.editCommand', 'Edit Command')} size="lg">
        <FormProvider {...editForm}>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <Input label={t('commands.name', 'Name')} placeholder="check-disk" {...editForm.register('name')} error={editForm.formState.errors.name?.message} />
            <Input label={t('commands.command', 'Command')} placeholder="df -h" {...editForm.register('command')} error={editForm.formState.errors.command?.message} />
            <Controller
              name="description"
              control={editForm.control}
              render={({ field }) => <Input label={t('commands.descriptionField', 'Description')} placeholder="Check disk usage" {...field} value={field.value ?? ''} />}
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
              <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={updateCommand.isPending}>{updateCommand.isPending ? t('common.loading') : t('common.save')}</Button>
            </div>
          </form>
        </FormProvider>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={t('commands.deleteTitle', 'Delete Command')}
        message={t('commands.deleteMsg', { name: command.name })}
        confirmLabel={t('common.delete')}
        loading={deleteCommand.isPending}
      />
    </div>
  )
}

function OverviewTab({ command }: { command: Command }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('commands.overview', 'Overview')}</h2></CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-surface-500">{t('commands.command', 'Command')}</p>
            <pre className="text-sm text-surface-700 bg-surface-50 rounded p-3 overflow-x-auto font-mono dark:text-surface-300 dark:bg-surface-800/50">{command.command}</pre>
          </div>
          {command.description && (
            <div>
              <p className="text-xs text-surface-500">{t('commands.descriptionField', 'Description')}</p>
              <p className="text-sm text-surface-700 dark:text-surface-300">{command.description}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
              <p className="text-xs text-surface-500 dark:text-surface-400 uppercase">{t('commands.created', 'Created')}</p>
              <p className="text-sm font-medium text-surface-900 dark:text-white">{new Date(command.created_at).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
              <p className="text-xs text-surface-500 dark:text-surface-400 uppercase">{t('commands.updated', 'Updated')}</p>
              <p className="text-sm font-medium text-surface-900 dark:text-white">{new Date(command.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ParametersTab({ command }: { command: Command }) {
  const { t } = useTranslation()
  const parameters = command.parameters || []
  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('commands.parameters', 'Parameters')}</h2></CardHeader>
      <CardContent>
        {parameters.length === 0 ? (
          <EmptyState title={t('commands.noParameters', 'No parameters')} />
        ) : (
          <div className="space-y-2">
            {parameters.map((p) => (
              <div key={p.name} className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
                <code className="font-mono text-sm text-surface-900 dark:text-white">{p.name}</code>
                <Badge variant="info">{p.type}</Badge>
                {p.required && <Badge variant="warning">{t('commands.paramRequired', 'Required')}</Badge>}
                {p.description && <span className="text-xs text-surface-500 flex-1">{p.description}</span>}
                {p.default !== undefined && p.default !== null && (
                  <span className="text-xs text-surface-400">{t('commands.paramDefault', 'default')}: {String(p.default)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatsTab({ commandId }: { commandId: string }) {
  const { t } = useTranslation()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { data: stats, isLoading, error, refetch } = useCommandStats(commandId, { date_from: dateFrom || undefined, date_to: dateTo || undefined })
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('commands.stats', 'Stats')}</h2>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-1.5 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
            <span className="text-surface-400">—</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-1.5 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Spinner size="lg" className="mx-auto my-8" />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : stats ? (
          <StatsGrid>
            <StatCard label={t('commands.totalExecutions', 'Total Executions')} value={stats.total} />
            <StatCard label={t('commands.successRate', 'Success Rate')} value={stats.success_rate != null ? `${stats.success_rate.toFixed(1)}%` : '—'} tone="success" />
            <StatCard label={t('commands.avgDuration', 'Avg Duration')} value={stats.avg_duration_ms ? `${(stats.avg_duration_ms / 1000).toFixed(1)}s` : '—'} />
            <StatCard label={t('commands.failed', 'Failed')} value={stats.failed} tone="danger" />
          </StatsGrid>
        ) : (
          <EmptyState title={t('commands.noStats', 'No stats available')} />
        )}
      </CardContent>
    </Card>
  )
}

function NotesTab({ commandId }: { commandId: string }) {
  return (
    <Card>
      <CardContent>
        <NotesPanel targetType="command" targetId={commandId} />
      </CardContent>
    </Card>
  )
}
