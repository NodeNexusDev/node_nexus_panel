import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Pagination } from '../components/ui/Pagination'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { TableSkeleton } from '../components/ui/Skeleton'
import { NotesPanel } from '../components/ui/NotesPanel'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { Tabs } from '../components/ui/Tabs'
import { StatCard, StatsGrid } from '../components/ui/StatCard'
import { KeyValueList } from '../components/ui/KeyValueList'
import { formatBytes } from '../lib/format'
import { nodeStatusVariant } from '../lib/variants'
import { NodeCommandModal } from '../components/nodes/NodeCommandModal'
import { NodeScriptModal } from '../components/nodes/NodeScriptModal'
import { Tooltip } from '../components/ui/Tooltip'
import {
  IconNodes,
  IconCommands,
  IconScripts,
  IconCheckCircle,
  IconXCircle,
  IconArrowLeft,
  IconCopy,
  IconDocker,
} from '../components/ui/Icons'
import { useToast } from '../components/ui/useToast'
import {
  useNode,
  useNodeStats,
  useNodeStatusHistory,
  useNodeMetrics,
  useNodeCommandHistory,
  useRetryNodeCommand,
  useUpdateNode,
  useCheckNode,
  useDeleteNode,
  useAddNodeTag,
  useRemoveNodeTag,
} from '../hooks/useNodes'
import type { NodeUpdate } from '../api/types'
import { nodeUpdateSchema, type NodeUpdateFormValues } from '../lib/validators/node-schema'
import { NodeDetailSkeleton } from './NodeDetailSkeleton'

type Tab = 'overview' | 'metrics' | 'stats' | 'status-history' | 'command-history' | 'tags' | 'notes'

export function NodeDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const TAB_KEYS: Tab[] = ['overview', 'metrics', 'stats', 'status-history', 'command-history', 'tags', 'notes']
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<Tab>(TAB_KEYS.includes(tabFromUrl as Tab) ? (tabFromUrl as Tab) : 'overview')

  const changeTab = (key: Tab) => {
    setActiveTab(key)
    setSearchParams(key === 'overview' ? {} : { tab: key })
  }
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCommandModal, setShowCommandModal] = useState(false)
  const [showScriptModal, setShowScriptModal] = useState(false)
  const [statusHistoryPage, setStatusHistoryPage] = useState(1)
  const [commandHistoryPage, setCommandHistoryPage] = useState(1)
  const pageSize = 20

  const {
    data: node,
    isLoading: nodeLoading,
    error: nodeError,
    refetch: refetchNode,
  } = useNode(id || '')

  const updateNode = useUpdateNode()
  const deleteNode = useDeleteNode()
  const checkNode = useCheckNode()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<NodeUpdateFormValues>({
    resolver: zodResolver(nodeUpdateSchema),
    defaultValues: {
      name: node?.name,
      host: node?.host,
      port: node?.port,
      connection_type: node?.connection_type,
      username: node?.username ?? null,
      docker_host: node?.docker_host ?? null,
      tags: node?.tags,
    },
  })

  const openEdit = () => {
    reset({
      name: node?.name,
      host: node?.host,
      port: node?.port,
      connection_type: node?.connection_type,
      username: node?.username ?? null,
      password: null,
      ssh_key: null,
      docker_host: node?.docker_host ?? null,
      tags: node?.tags,
    })
    setShowEditModal(true)
  }

  const onSubmitEdit = (values: NodeUpdateFormValues) => {
    if (!id) return
    const data: NodeUpdate = {
      ...values,
      tags: values.tags,
    }
    updateNode.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast('success', t('nodes.toastUpdated', { name: values.name }))
          setShowEditModal(false)
        },
        onError: () => toast('error', t('nodes.toastUpdateFailed')),
      },
    )
  }

  const handleDelete = () => {
    if (!id) return
    deleteNode.mutate(id, {
      onSuccess: () => {
        toast('success', t('nodes.toastDeleted', { name: node?.name }))
        navigate('/nodes')
      },
      onError: () => toast('error', t('nodes.toastDeleteFailed')),
    })
  }

  const handleCheck = () => {
    if (!id) return
    checkNode.mutate(id, {
      onSuccess: () => toast('success', t('nodes.toastNodeChecked')),
      onError: () => toast('error', t('nodes.toastCheckFailed')),
    })
  }

  const handleCopyAddress = () => {
    const address = `${node?.host ?? ''}:${node?.port ?? ''}`
    navigator.clipboard?.writeText(address).then(() => toast('success', t('nodes.addressCopied')))
  }

  if (nodeLoading) return <NodeDetailSkeleton />
  if (nodeError || !node) {
    return (
      <ErrorState
        title={t('nodes.notFound', 'Node not found')}
        description={t('nodes.notFoundDesc', 'The requested node could not be loaded.')}
        error={nodeError}
        onRetry={refetchNode}
      />
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('nodes.overview', 'Overview') },
    { key: 'metrics', label: t('nodes.metrics', 'Metrics') },
    { key: 'stats', label: t('nodes.stats', 'Stats') },
    { key: 'status-history', label: t('nodes.statusHistory', 'Status History') },
    { key: 'command-history', label: t('nodes.cmdHistory', 'Command History') },
    { key: 'tags', label: t('nodes.tags', 'Tags') },
    { key: 'notes', label: t('nodes.notes', 'Notes') },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/nodes')} className="px-2">
            <IconArrowLeft className="w-5 h-5" />
          </Button>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            node.status === 'active'
              ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
          }`}>
            <IconNodes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{node.name}</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400 font-mono">{node.host}:{node.port}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FavoriteButton targetType="node" targetId={node.id} size="sm" />
          <Tooltip content={t('nodes.copyAddress')}>
            <Button variant="ghost" size="sm" className="px-2" onClick={handleCopyAddress} aria-label={t('nodes.copyAddress')}>
              <IconCopy className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content={t('nodes.openDocker')}>
            <Button variant="ghost" size="sm" className="px-2" onClick={() => navigate(`/docker?node=${node.id}`)} aria-label={t('nodes.openDocker')}>
              <IconDocker className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Button variant="secondary" size="sm" onClick={handleCheck} disabled={checkNode.isPending}>
            <IconCheckCircle className="w-4 h-4 mr-1" />
            {t('nodes.checkNode')}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowCommandModal(true)}>
            <IconCommands className="w-4 h-4 mr-1" />
            {t('nodes.execCommand')}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowScriptModal(true)}>
            <IconScripts className="w-4 h-4 mr-1" />
            {t('nodes.runScript')}
          </Button>
          <Button variant="ghost" size="sm" onClick={openEdit}>{t('common.edit')}</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowDeleteDialog(true)} className="text-red-500 hover:text-red-600">
            <IconXCircle className="w-4 h-4 mr-1" />
            {t('common.delete')}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={nodeStatusVariant(node.status)}>{node.status}</Badge>
        <Badge variant="default">{node.connection_type}</Badge>
        {node.tags.map((tag) => (
          <Badge key={tag} variant="default">{tag}</Badge>
        ))}
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={changeTab} />

      {activeTab === 'overview' && <OverviewTab node={node} />}
      {activeTab === 'metrics' && <MetricsTab nodeId={node.id} />}
      {activeTab === 'stats' && <StatsTab nodeId={node.id} />}
      {activeTab === 'status-history' && (
        <StatusHistoryTab nodeId={node.id} page={statusHistoryPage} size={pageSize} onPageChange={setStatusHistoryPage} />
      )}
      {activeTab === 'command-history' && (
        <CommandHistoryTab nodeId={node.id} page={commandHistoryPage} size={pageSize} onPageChange={setCommandHistoryPage} />
      )}
      {activeTab === 'tags' && <TagsTab nodeId={node.id} />}
      {activeTab === 'notes' && <NotesTab nodeId={node.id} />}

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={t('nodes.editNode', 'Edit Node')} size="lg">
        <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
          <Input label={t('nodes.node')} placeholder="prod-server-05" {...register('name')} error={errors.name?.message} />
          <Input label={t('nodes.host')} placeholder="192.168.1.105" {...register('host')} error={errors.host?.message} />
          <Controller
            name="port"
            control={control}
            render={({ field }) => (
              <Input label={t('nodes.port')} placeholder="22" type="number" value={String(field.value ?? 22)} onChange={(e) => field.onChange(Number(e.target.value))} error={errors.port?.message} />
            )}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.connectionType')}</label>
            <select {...register('connection_type')} className="w-full px-4 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white">
              <option value="ssh">SSH</option>
              <option value="docker">Docker</option>
              <option value="proxmox">Proxmox</option>
            </select>
          </div>
          <Input label={t('nodes.username', 'Username')} placeholder="root" {...register('username')} error={errors.username?.message} />
          <Input label={t('nodes.password', 'Password')} type="password" placeholder="Leave blank to keep unchanged" {...register('password')} error={errors.password?.message} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.sshKey', 'SSH Key')}</label>
            <textarea {...register('ssh_key')} placeholder={t('common.leaveBlank')} rows={4} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
            {errors.ssh_key && <p className="text-xs text-red-500 mt-1">{errors.ssh_key.message}</p>}
          </div>
          <Input label={t('nodes.dockerHost', 'Docker Host')} placeholder="/var/run/docker.sock" {...register('docker_host')} error={errors.docker_host?.message} />
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <Input label={t('nodes.tagsLabel', 'Tags')} placeholder="production, linux" value={(field.value ?? []).join(', ')} onChange={(e) => field.onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} error={errors.tags?.message} />
            )}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowEditModal(false)}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={updateNode.isPending}>{updateNode.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </form>
      </Modal>

      <NodeCommandModal node={showCommandModal ? node : null} onClose={() => setShowCommandModal(false)} />

      <NodeScriptModal node={showScriptModal ? node : null} onClose={() => setShowScriptModal(false)} />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={t('nodes.deleteTitle')}
        message={t('nodes.deleteMsg', { name: node.name })}
        confirmLabel={t('common.delete')}
        loading={deleteNode.isPending}
      />
    </div>
  )
}

function OverviewTab({ node }: { node: import('../api/types').Node }) {
  const { t } = useTranslation()
  const connTypeBadge = <Badge variant="info">{node.connection_type}</Badge>
  const statusBadge = <Badge variant={nodeStatusVariant(node.status)}>{node.status}</Badge>
  const rows: [string, React.ReactNode][] = [
    [t('nodes.host'), `${node.host}:${node.port}`],
    [t('nodes.connectionType'), connTypeBadge],
    [t('nodes.status'), statusBadge],
    [t('nodes.username', 'Username'), node.username || '—'],
    [t('nodes.dockerHost', 'Docker Host'), node.docker_host || '—'],
    [t('nodes.created', 'Created'), new Date(node.created_at).toLocaleString()],
    [t('nodes.updated', 'Updated'), new Date(node.updated_at).toLocaleString()],
  ]
  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('nodes.overview', 'Overview')}</h2></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map(([label, value]) => (
            <div key={label} className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
              <p className="text-xs text-surface-500 dark:text-surface-400 uppercase">{label}</p>
              <div className="text-sm font-medium text-surface-900 dark:text-white mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MetricBar({ label, value, percent }: { label: string; value: string; percent: number }) {
  const pct = Math.min(100, Math.max(0, percent))
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-surface-600 dark:text-surface-400">{label}</span>
        <span className="text-sm font-medium text-surface-900 dark:text-white">{value}</span>
      </div>
      <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-accent-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function MetricsTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { data: metrics, isLoading, error, refetch } = useNodeMetrics(nodeId)
  if (isLoading) return <Spinner size="lg" className="mx-auto my-8" />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!metrics) return <EmptyState title={t('nodes.noMetrics', 'No metrics available')} />

  const cpuPct = metrics.cpu.usage_percent ?? 0
  const memPct = metrics.memory.percent ?? 0
  const diskPct = metrics.disk.percent ?? 0

  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('nodes.metrics', 'Metrics')}</h2></CardHeader>
      <CardContent>
        <div className="space-y-4">
          <MetricBar
            label={t('nodes.cpu', 'CPU')}
            value={`${cpuPct.toFixed(1)}% (${metrics.cpu.cores} ${t('nodes.cores', 'cores')})`}
            percent={cpuPct}
          />
          <MetricBar
            label={t('nodes.memory', 'Memory')}
            value={`${formatBytes(metrics.memory.used_bytes)} / ${formatBytes(metrics.memory.total_bytes)} (${memPct.toFixed(1)}%)`}
            percent={memPct}
          />
          <MetricBar
            label={t('nodes.disk', 'Disk')}
            value={`${formatBytes(metrics.disk.used_bytes)} / ${formatBytes(metrics.disk.total_bytes)} (${diskPct.toFixed(1)}%)`}
            percent={diskPct}
          />
          <div className="pt-1">
            <KeyValueList
              rows={[
                { label: t('nodes.uptimeSince', 'Uptime Since'), value: metrics.uptime_since ? new Date(metrics.uptime_since).toLocaleString() : '—' },
              ]}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatsTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { data: stats, isLoading, error, refetch } = useNodeStats(nodeId, { date_from: dateFrom || undefined, date_to: dateTo || undefined })
  if (isLoading) return <Spinner size="lg" className="mx-auto my-8" />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!stats) return <EmptyState title={t('nodes.noStats', 'No stats available')} />
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('nodes.stats', 'Stats')}</h2>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-1.5 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
            <span className="text-surface-400">—</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-1.5 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <StatsGrid>
          <StatCard label={t('nodes.totalExecutions')} value={stats.total} />
          <StatCard label={t('nodes.successRate')} value={stats.success_rate != null ? `${stats.success_rate.toFixed(1)}%` : '—'} tone="success" />
          <StatCard label={t('nodes.avgDuration')} value={stats.avg_duration_ms ? `${(stats.avg_duration_ms / 1000).toFixed(1)}s` : '—'} />
          <StatCard label={t('nodes.failed')} value={stats.failed} tone="danger" />
        </StatsGrid>
      </CardContent>
    </Card>
  )
}

function StatusHistoryTab({ nodeId, page, size, onPageChange }: { nodeId: string; page: number; size: number; onPageChange: (p: number) => void }) {
  const { t } = useTranslation()
  const { data, isLoading, error, refetch } = useNodeStatusHistory(nodeId, { page, size })
  if (isLoading) return <TableSkeleton rows={5} cols={4} />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  const items = data?.items ?? []
  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('nodes.statusHistory')}</h2></CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <EmptyState title={t('nodes.emptyTitle')} />
        ) : (
          <div className="divide-y divide-surface-200 dark:divide-surface-800">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-2">
                  {item.old_status && <Badge variant="default">{item.old_status}</Badge>}
                  {item.old_status && <span className="text-surface-400">→</span>}
                  <Badge variant={item.new_status === 'active' ? 'success' : 'danger'}>{item.new_status}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs text-surface-500">{item.source}</p>
                  <p className="text-xs text-surface-400">{new Date(item.changed_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {data && data.total > size && (
          <div className="px-6 py-3 border-t border-surface-200 dark:border-surface-800">
            <Pagination page={page} totalPages={Math.ceil(data.total / size)} onPageChange={onPageChange} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CommandHistoryTab({ nodeId, page, size, onPageChange }: { nodeId: string; page: number; size: number; onPageChange: (p: number) => void }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data, isLoading, error, refetch } = useNodeCommandHistory(nodeId, { page, size })
  const retry = useRetryNodeCommand()
  if (isLoading) return <TableSkeleton rows={5} cols={3} />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  const items = data?.items ?? []
  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('nodes.cmdHistory')}</h2></CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <EmptyState title={t('nodes.noCmdHistory', 'No command history')} />
        ) : (
          <div className="divide-y divide-surface-200 dark:divide-surface-800">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-surface-900 dark:text-white truncate">{item.command_fingerprint}</p>
                  <p className="text-xs text-surface-500">{item.node_id || '—'} · {new Date(item.created_at).toLocaleString()}</p>
                  <Badge variant={item.exit_code === 0 ? 'success' : 'danger'}>exit {item.exit_code}</Badge>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {item.exit_code !== 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => retry.mutate({ nodeId, executionId: item.id }, { onSuccess: () => toast('success', t('nodes.toastRetried')), onError: () => toast('error', t('nodes.toastRetryFailed')) })}
                      disabled={retry.isPending}
                    >
                      {t('common.retry')}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {data && data.total > size && (
          <div className="px-6 py-3 border-t border-surface-200 dark:border-surface-800">
            <Pagination page={page} totalPages={Math.ceil(data.total / size)} onPageChange={onPageChange} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TagsTab({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: node, refetch } = useNode(nodeId)
  const addTag = useAddNodeTag()
  const removeTag = useRemoveNodeTag()
  const [newTag, setNewTag] = useState('')
  const tags = node?.tags ?? []

  const handleAdd = () => {
    const tag = newTag.trim()
    if (!tag) return
    addTag.mutate({ id: nodeId, tag }, {
      onSuccess: () => { toast('success', t('nodes.toastTagAdded')); setNewTag(''); refetch() },
      onError: () => toast('error', t('nodes.toastTagAddFailed')),
    })
  }

  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t('nodes.tags')}</h2></CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="default" className="gap-1">
              {tag}
              <button onClick={() => removeTag.mutate({ id: nodeId, tag }, { onSuccess: () => { toast('success', t('nodes.toastTagRemoved')); refetch() }, onError: () => toast('error', t('nodes.toastTagRemoveFailed')) })} className="ml-1 text-surface-400 hover:text-red-500">×</button>
            </Badge>
          ))}
          {tags.length === 0 && <p className="text-sm text-surface-500">{t('nodes.noTags', 'No tags')}</p>}
        </div>
        <div className="flex gap-2">
          <Input placeholder={t('nodes.newTag', 'New tag')} value={newTag} onChange={(e) => setNewTag(e.target.value)} />
          <Button onClick={handleAdd} disabled={!newTag.trim() || addTag.isPending}>{t('nodes.addTag')}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function NotesTab({ nodeId }: { nodeId: string }) {
  return (
    <Card>
      <CardContent>
        <NotesPanel targetType="node" targetId={nodeId} />
      </CardContent>
    </Card>
  )
}
