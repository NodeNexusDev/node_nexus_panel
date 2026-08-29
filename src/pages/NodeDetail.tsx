import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { Skeleton, StatCardSkeleton, TableSkeleton } from '../components/ui/Skeleton'
import { NotesPanel } from '../components/ui/NotesPanel'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { Tabs } from '../components/ui/Tabs'
import { StatCard, StatsGrid } from '../components/ui/StatCard'
import { KeyValueList } from '../components/ui/KeyValueList'
import { formatBytes, formatPercent, formatDurationMs } from '../lib/format'
import { nodeStatusVariant } from '../lib/variants'
import { NodeCommandModal } from '../components/nodes/NodeCommandModal'
import { CONNECTION_TYPE_OPTIONS } from '../components/nodes/connection-types'
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
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
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
} from '../hooks/useNodes'
import type { NodeUpdate, Node } from '../api/types'
import { nodeUpdateSchema, type NodeUpdateFormValues } from '../lib/validators/node-schema'
import { NodeDetailSkeleton } from './NodeDetailSkeleton'

type Tab = 'overview' | 'metrics' | 'stats' | 'status-history' | 'command-history' | 'notes'

export function NodeDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { copy } = useCopyToClipboard({ onCopied: () => toast('success', t('nodes.addressCopied')) })
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab') as Tab | null
  const activeTab: Tab = (['overview', 'metrics', 'stats', 'status-history', 'command-history', 'notes'] as Tab[]).includes(tabFromUrl as Tab) ? (tabFromUrl as Tab) : 'overview'

  const changeTab = (key: Tab) => {
    setSearchParams(key === 'overview' ? {} : { tab: key }, { replace: false })
  }
  const [showEditModal, setShowEditModal] = useState(false)
  const [clearFields, setClearFields] = useState<Record<string, boolean>>({})
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
      passphrase: null,
      docker_host: node?.docker_host ?? null,
      tags: node?.tags,
    },
  })

  useEffect(() => {
    if (!node) return
    reset({
      name: node.name,
      host: node.host,
      port: node.port,
      connection_type: node.connection_type,
      username: node.username ?? null,
      docker_host: node.docker_host ?? null,
      tags: node.tags,
    })
  }, [node, reset])

  const toggleClear = (field: string) => {
    setClearFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const openEdit = () => {
    reset({
      name: node?.name,
      host: node?.host,
      port: node?.port,
      connection_type: node?.connection_type,
      username: node?.username ?? null,
      docker_host: node?.docker_host ?? null,
      tags: node?.tags,
    })
    setClearFields({})
    setShowEditModal(true)
  }

  const onSubmitEdit = (values: NodeUpdateFormValues) => {
    if (!id) return
    const data: NodeUpdate = {
      name: values.name,
      host: values.host,
      port: values.port,
      connection_type: values.connection_type,
      username: values.username,
      docker_host: values.docker_host,
      tags: values.tags,
    }
    if (values.password) data.password = values.password
    else if (clearFields.password) data.password = null

    if (values.ssh_key) data.ssh_key = values.ssh_key
    else if (clearFields.ssh_key) data.ssh_key = null

    if (values.passphrase) data.passphrase = values.passphrase
    else if (clearFields.passphrase) data.passphrase = null

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
    copy(address)
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
    { key: 'notes', label: t('nodes.notes', 'Notes') },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slide-up">
        <div className="flex items-center gap-3">
          <Tooltip content={t('common.back', 'Back')}>
            <Button variant="ghost" size="sm" onClick={() => navigate('/nodes')} className="px-2" aria-label={t('common.back', 'Back')}>
              <IconArrowLeft className="w-5 h-5" />
            </Button>
          </Tooltip>
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
          <FavoriteButton targetType="node" targetId={node.id} resourceName={node.name} size="sm" />
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
      {activeTab === 'notes' && <NotesTab nodeId={node.id} />}

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={t('nodes.editNode', 'Edit Node')} size="lg">
        <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
          <Input label={t('nodes.node')} placeholder="prod-server-05" {...register('name')} error={errors.name?.message} />
          <Input label={t('nodes.host')} placeholder="192.168.1.105" {...register('host')} error={errors.host?.message} />
          <Controller
            name="port"
            control={control}
            render={({ field }) => (
              <Input label={t('nodes.port')} placeholder="22" type="number" value={String(field.value ?? 22)} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} error={errors.port?.message} />
            )}
          />
          <Controller
            name="connection_type"
            control={control}
            render={({ field }) => (
              <Select
                label={t('nodes.connectionType')}
                value={field.value ?? 'ssh'}
                onChange={field.onChange}
                options={CONNECTION_TYPE_OPTIONS}
              />
            )}
          />
          <Input label={t('nodes.username', 'Username')} placeholder="root" {...register('username')} error={errors.username?.message} />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.password', 'Password')}</label>
              <Button type="button" variant="ghost" size="sm" onClick={() => toggleClear('password')} className="h-6 px-2 text-xs">
                {clearFields.password ? t('common.cancel') : t('common.clear', 'Clear')}
              </Button>
            </div>
            <Input type="password" placeholder={clearFields.password ? t('common.willBeCleared') : t('common.leaveBlank')} disabled={clearFields.password} {...register('password')} error={errors.password?.message} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.sshKey', 'SSH Key')}</label>
              <Button type="button" variant="ghost" size="sm" onClick={() => toggleClear('ssh_key')} className="h-6 px-2 text-xs">
                {clearFields.ssh_key ? t('common.cancel') : t('common.clear', 'Clear')}
              </Button>
            </div>
            <textarea {...register('ssh_key')} placeholder={clearFields.ssh_key ? t('common.willBeCleared') : t('common.leaveBlank')} disabled={clearFields.ssh_key} rows={4} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
            {errors.ssh_key && <p className="text-xs text-red-500 mt-1">{errors.ssh_key.message}</p>}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.passphrase', 'Passphrase')}</label>
              <Button type="button" variant="ghost" size="sm" onClick={() => toggleClear('passphrase')} className="h-6 px-2 text-xs">
                {clearFields.passphrase ? t('common.cancel') : t('common.clear', 'Clear')}
              </Button>
            </div>
            <Input type="password" placeholder={clearFields.passphrase ? t('common.willBeCleared') : t('common.leaveBlank')} disabled={clearFields.passphrase} {...register('passphrase')} error={errors.passphrase?.message} />
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

function OverviewTab({ node }: { node: Node }) {
  const { t } = useTranslation()
  const { copy } = useCopyToClipboard()
  const navigate = useNavigate()
  const connTypeBadge = <Badge variant="info">{node.connection_type}</Badge>
  const statusBadge = <Badge variant={nodeStatusVariant(node.status)}>{node.status}</Badge>
  // oxlint-disable-next-line react(jsx-key)
  const rows: [string, React.ReactNode][] = [
    [t('nodes.host'), (
      <span key="host" className="inline-flex items-center gap-2 font-mono">
        {node.host}:{node.port}
        <button onClick={() => copy(`${node.host}:${node.port}`)} aria-label={t('common.copy')} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors cursor-pointer">
          <IconCopy className="w-3.5 h-3.5 text-surface-500" />
        </button>
      </span>
    )],
    [t('nodes.connectionType'), connTypeBadge],
    [t('nodes.status'), statusBadge],
    [t('nodes.username', 'Username'), node.username ? (
      <span key="user" className="inline-flex items-center gap-1">
        {node.username}
        <button onClick={() => copy(node.username!)} aria-label={t('common.copy')} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 cursor-pointer"><IconCopy className="w-3 h-3 text-surface-400" /></button>
      </span>
    ) : '—'],
    [t('nodes.dockerHost', 'Docker Host'), node.docker_host ? (
      <span key="docker" className="inline-flex items-center gap-1 font-mono text-xs">
        {node.docker_host}
        <button onClick={() => copy(node.docker_host!)} aria-label={t('common.copy')} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 cursor-pointer"><IconCopy className="w-3 h-3 text-surface-400" /></button>
      </span>
    ) : '—'],
    [t('nodes.tags', 'Tags'), node.tags.length ? (
      <span key="tags" className="flex flex-wrap gap-1">
        {node.tags.map((tag) => (
          <button key={tag} onClick={() => navigate(`/nodes?tag=${encodeURIComponent(tag)}`)} className="cursor-pointer">
            <Badge variant="default">{tag}</Badge>
          </button>
        ))}
      </span>
    ) : '—'],
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
              <div className="text-sm font-medium text-surface-900 dark:text-white mt-0.5 flex items-center">{value}</div>
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
  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton variant="text" className="w-32 h-5" /></CardHeader>
        <CardContent className="space-y-4" aria-busy="true" aria-live="polite">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between"><Skeleton variant="text" className="w-16 h-4" /><Skeleton variant="text" className="w-24 h-4" /></div>
              <Skeleton variant="rectangular" className="w-full h-2" />
            </div>
          ))}
          <Skeleton variant="rectangular" className="w-full h-12" />
          <Skeleton variant="rectangular" className="w-full h-16" />
        </CardContent>
      </Card>
    )
  }
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
          <div className="pt-1">
            <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">{t('nodes.loadAverage', 'Load Average')}</h3>
            <KeyValueList
              rows={[
                { label: t('nodes.load1m', '1 min'), value: metrics.load_average.one_min.toFixed(2) },
                { label: t('nodes.load5m', '5 min'), value: metrics.load_average.five_min.toFixed(2) },
                { label: t('nodes.load15m', '15 min'), value: metrics.load_average.fifteen_min.toFixed(2) },
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
  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton variant="text" className="w-32 h-5" /></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-busy="true" aria-live="polite">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        </CardContent>
      </Card>
    )
  }
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
          <StatCard label={t('nodes.successRate')} value={formatPercent(stats.success_rate)} tone="success" />
          <StatCard label={t('nodes.avgDuration')} value={formatDurationMs(stats.avg_duration_ms)} />
          <StatCard label={t('nodes.failed')} value={stats.failed} tone="danger" />
          {stats.cancelled != null && stats.cancelled > 0 && <StatCard label={t('nodes.cancelled', 'Cancelled')} value={stats.cancelled} tone="warning" />}
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
                  <p className="text-xs text-surface-500">{new Date(item.created_at).toLocaleString()}</p>
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

function NotesTab({ nodeId }: { nodeId: string }) {
  return (
    <Card>
      <CardContent>
        <NotesPanel targetType="node" targetId={nodeId} />
      </CardContent>
    </Card>
  )
}
