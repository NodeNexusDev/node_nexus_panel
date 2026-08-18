import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  useCommandStats,
} from '../hooks/useCommands'
import { useToast } from '../components/ui/useToast'
import type { Command } from '../api/types'

export function Commands() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const { data: nodesData } = useNodes()
  const { data: commandsData, isLoading: commandsLoading } = useCommands({ search: search || undefined, tag: tagFilter || undefined })
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
  const [statsTarget, setStatsTarget] = useState<Command | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const defaultCmd = { name: '', command: '', description: '', tags: '' }
  const [newCmd, setNewCmd] = useState(defaultCmd)
  const [editCmd, setEditCmd] = useState({ name: '', command: '', description: '', tags: '' })

  const nodes = nodesData?.items || []
  const commands = commandsData?.items || []
  const selectedCommand = commands.find((c) => c.id === selectedCommandId)

  const handleExecute = () => {
    if (!selectedCommandId || !selectedNode) return
    executeCommand.mutate(
      { id: selectedCommandId, data: { node_id: selectedNode, params: Object.keys(commandParams).length > 0 ? commandParams : undefined } },
      { onSuccess: () => { toast('success', t('commands.toastExecuted', { target: selectedNode })); setSelectedCommandId(''); setSelectedNode(''); setCommandParams({}) }, onError: () => toast('error', t('commands.toastFailed')) },
    )
  }

  const handleCreate = () => {
    createCommand.mutate(
      {
        name: newCmd.name,
        command: newCmd.command,
        description: newCmd.description || undefined,
        tags: newCmd.tags ? newCmd.tags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      },
      { onSuccess: () => { toast('success', t('commands.toastCreated')); setShowCreateModal(false); setNewCmd(defaultCmd) }, onError: () => toast('error', t('commands.toastCreateFailed')) },
    )
  }

  const handleEdit = () => {
    if (!editTarget) return
    updateCommand.mutate(
      {
        id: editTarget.id,
        data: {
          name: editCmd.name,
          command: editCmd.command,
          description: editCmd.description || undefined,
          tags: editCmd.tags ? editCmd.tags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        },
      },
      { onSuccess: () => { toast('success', t('commands.toastUpdated')); setEditTarget(null) }, onError: () => toast('error', t('commands.toastUpdateFailed')) },
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
    deleteCommand.mutate(deleteTarget.id, { onSuccess: () => { toast('success', t('commands.toastDeleted')); setDeleteTarget(null) }, onError: () => toast('error', t('commands.toastDeleteFailed')) })
  }

  const openEdit = (cmd: Command) => {
    setEditTarget(cmd)
    setEditCmd({
      name: cmd.name,
      command: cmd.command,
      description: cmd.description || '',
      tags: cmd.tags.join(', '),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('commands.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{t('commands.description')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>{t('commands.createCommand')}</Button>
      </div>

      <Card className="stagger-item">
        <CardHeader>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('commands.executeCommand')}</h2>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <select value={selectedCommandId} onChange={(e) => { setSelectedCommandId(e.target.value); setCommandParams({}) }} className="px-4 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white min-w-[200px]">
              <option value="">{t('commands.selectCommand')}</option>
              {commands.map((cmd) => (<option key={cmd.id} value={cmd.id}>{cmd.name}</option>))}
            </select>
            <select value={selectedNode} onChange={(e) => setSelectedNode(e.target.value)} className="px-4 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white min-w-[160px]">
              <option value="">{t('commands.selectNode')}</option>
              {nodes.map((node) => (<option key={node.id} value={node.id}>{node.name}</option>))}
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
                {tags?.map((tag) => (<option key={tag} value={tag}>{tag}</option>))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {commandsLoading ? (
            <div className="space-y-4 p-6">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="space-y-2 stagger-item"><div className="flex items-center gap-3"><Skeleton variant="text" className="w-32" /><Skeleton variant="text" className="w-16" /><Skeleton variant="text" className="w-20 ml-auto" /></div><Skeleton variant="rectangular" className="w-full h-16" /></div>))}</div>
          ) : commands.length === 0 ? (
            <EmptyState icon={<IconCommands className="w-10 h-10" />} title={t('commands.emptyTitle')} description={t('commands.emptyDesc')} action={<Button onClick={() => setShowCreateModal(true)}>{t('commands.createCommand')}</Button>} />
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800">
              {commands.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors stagger-item">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <code className="text-sm text-accent-600 dark:text-accent-400 font-mono">{item.name}</code>
                      <span className="text-xs text-surface-500 dark:text-surface-500">{item.command}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.tags.map((tag) => (<Badge key={tag} variant="default">{tag}</Badge>))}
                      <FavoriteButton targetType="command" targetId={item.id} size="sm" />
                      <Button variant="ghost" size="sm" onClick={() => setStatsTarget(item)}>{t('commands.stats', 'Stats')}</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleClone(item)} disabled={cloneCommand.isPending}>{t('commands.clone', 'Clone')}</Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>{t('common.edit')}</Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: item.id, name: item.name })} className="text-red-500">{t('common.delete')}</Button>
                    </div>
                  </div>
                  <pre className="text-sm text-surface-700 bg-surface-50 rounded p-3 overflow-x-auto font-mono dark:text-surface-300 dark:bg-surface-800/50"><Typewriter text={item.command} speed={10} /></pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('commands.createCommand')}>
        <div className="space-y-4">
          <Input label={t('commands.name', 'Name')} placeholder="check-disk" value={newCmd.name} onChange={(e) => setNewCmd({ ...newCmd, name: e.target.value })} />
          <Input label={t('commands.command', 'Command')} placeholder="df -h" value={newCmd.command} onChange={(e) => setNewCmd({ ...newCmd, command: e.target.value })} />
          <Input label={t('commands.descriptionField', 'Description')} placeholder="Check disk usage" value={newCmd.description} onChange={(e) => setNewCmd({ ...newCmd, description: e.target.value })} />
          <Input label={t('commands.tagsLabel', 'Tags')} placeholder="disk, system" value={newCmd.tags} onChange={(e) => setNewCmd({ ...newCmd, tags: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreate} disabled={createCommand.isPending || !newCmd.name || !newCmd.command}>{createCommand.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={t('commands.editCommand', 'Edit Command')}>
        <div className="space-y-4">
          <Input label={t('commands.name', 'Name')} placeholder="check-disk" value={editCmd.name} onChange={(e) => setEditCmd({ ...editCmd, name: e.target.value })} />
          <Input label={t('commands.command', 'Command')} placeholder="df -h" value={editCmd.command} onChange={(e) => setEditCmd({ ...editCmd, command: e.target.value })} />
          <Input label={t('commands.descriptionField', 'Description')} placeholder="Check disk usage" value={editCmd.description} onChange={(e) => setEditCmd({ ...editCmd, description: e.target.value })} />
          <Input label={t('commands.tagsLabel', 'Tags')} placeholder="disk, system" value={editCmd.tags} onChange={(e) => setEditCmd({ ...editCmd, tags: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditTarget(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleEdit} disabled={updateCommand.isPending || !editCmd.name || !editCmd.command}>{updateCommand.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!statsTarget} onClose={() => setStatsTarget(null)} title={t('commands.commandStats', 'Command Stats')}>
        {statsTarget && <CommandStatsContent commandId={statsTarget.id} commandName={statsTarget.name} />}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={t('commands.deleteTitle', 'Delete Command')} message={t('commands.deleteMsg', { name: deleteTarget?.name })} confirmLabel={t('common.delete')} loading={deleteCommand.isPending} />
    </div>
  )
}

function CommandStatsContent({ commandId, commandName }: { commandId: string; commandName: string }) {
  const { t } = useTranslation()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { data: stats, isLoading } = useCommandStats(commandId, { date_from: dateFrom || undefined, date_to: dateTo || undefined })
  return (
    <div className="space-y-4">
      <p className="text-sm text-surface-500">{commandName}</p>
      <div className="flex items-center gap-3">
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
        <span className="text-surface-400">—</span>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-20 shimmer rounded-lg" />))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-surface-500">{t('commands.totalExecutions', 'Total Executions')}</p>
          </div>
          <div className="text-center p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.success_rate != null ? `${stats.success_rate.toFixed(1)}%` : '—'}</p>
            <p className="text-xs text-surface-500">{t('commands.successRate', 'Success Rate')}</p>
          </div>
          <div className="text-center p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.avg_duration_ms ? `${(stats.avg_duration_ms / 1000).toFixed(1)}s` : '—'}</p>
            <p className="text-xs text-surface-500">{t('commands.avgDuration', 'Avg Duration')}</p>
          </div>
          <div className="text-center p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
            <p className="text-xs text-surface-500">{t('commands.failed', 'Failed')}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-surface-500 text-center py-4">{t('commands.noStats', 'No stats available')}</p>
      )}
    </div>
  )
}
