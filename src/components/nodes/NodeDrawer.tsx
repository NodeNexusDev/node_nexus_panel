import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Checkbox } from '../ui/Checkbox'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Tabs } from '../ui/Tabs'
import { FavoriteButton } from '../ui/FavoriteButton'
import { EmptyState } from '../ui/EmptyState'
import { ErrorState } from '../ui/ErrorState'
import { Skeleton, TableSkeleton, StatCardSkeleton } from '../ui/Skeleton'
import { InfiniteScroll } from '../ui/InfiniteScroll'
import { KeyValueList } from '../ui/KeyValueList'
import { StatCard, StatsGrid } from '../ui/StatCard'
import { Spinner } from '../ui/Spinner'
import { SearchInput } from '../ui/SearchInput'
import { formatBytes, formatPercent, formatDurationMs } from '../../lib/format'
import { nodeStatusVariant } from '../../lib/variants'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { useToast } from '../ui/useToast'
import {
  IconNodes,
  IconCopy,
  IconDocker,
  IconCheckCircle,
  IconCommands,
  IconScripts,
  IconXCircle,
} from '../ui/Icons'
import {
  useNodeMetrics,
  useNodeStats,
  useInfiniteNodeStatusHistory,
  useInfiniteNodeCommandHistory,
  useRetryNodeCommand,
  useCheckNode,
  useUpdateNode,
  useDeleteNode,
  useExecuteNode,
} from '../../hooks/useNodes'
import { useCommands, useExecuteCommand } from '../../hooks/useCommands'
import { useScripts, useRunScript } from '../../hooks/useScripts'
import { CONNECTION_TYPE_OPTIONS, type ConnectionType } from './connection-types'
import { getDefaultParams } from '../commands/command-form-utils'
import { CommandParamInputs } from '../commands/CommandParamInputs'
import { ExecutionResult } from '../commands/ExecutionResult'
import type { CommandResponse, CommandResult, Node, ScriptNodeResult } from '../../api/types'

type DrawerTab = 'overview' | 'metrics' | 'stats' | 'history' | 'edit' | 'exec' | 'script'

interface NodeDrawerProps {
  node: Node
  onClose: () => void
  onEdit?: (node: Node) => void
  onDelete?: (node: Node) => void
  onExec: (node: Node) => void
  onRunScript: (node: Node) => void
  onValidate?: (node: Node) => void
}

export function NodeDrawer({ node, onClose, onEdit: _onEdit, onDelete, onExec: _onExec, onRunScript: _onRunScript, onValidate: _onValidate }: NodeDrawerProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const checkNode = useCheckNode()
  const [active, setActive] = useState<DrawerTab>('overview')
  const [validateResult, setValidateResult] = useState<{ status: string; message: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteNode = useDeleteNode()
  const updateNode = useUpdateNode()

  const [editNode, setEditNode] = useState({ name: node.name, host: node.host, port: String(node.port), connection_type: node.connection_type as ConnectionType, description: (node as unknown as { description?: string }).description || '', username: node.username || '', password: '', ssh_key: '', passphrase: '', docker_host: node.docker_host || '', has_docker: node.has_docker ?? false, tags: node.tags.join(', ') })
  const [clearFields, setClearFields] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setEditNode({ name: node.name, host: node.host, port: String(node.port), connection_type: node.connection_type as ConnectionType, description: (node as unknown as { description?: string }).description || '', username: node.username || '', password: '', ssh_key: '', passphrase: '', docker_host: node.docker_host || '', has_docker: node.has_docker ?? false, tags: node.tags.join(', ') })
    setClearFields({})
    setValidateResult(null)
    setShowDeleteConfirm(false)
  }, [node])

  useEffect(() => { setValidateResult(null); setShowDeleteConfirm(false) }, [active])

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: 'overview', label: t('nodes.overview', 'Overview') },
    { key: 'metrics', label: t('nodes.metrics', 'Metrics') },
    { key: 'stats', label: t('nodes.stats', 'Stats') },
    { key: 'history', label: t('common.history', 'History') },
    { key: 'edit', label: t('common.edit', 'Edit') },
    { key: 'exec', label: t('commands.title', 'Commands') },
    { key: 'script', label: t('scripts.title', 'Scripts') },
  ]

  const toggleClear = (field: string) => setClearFields((prev) => ({ ...prev, [field]: !prev[field] }))

  const handleValidateInline = () => {
    setValidateResult(null)
    checkNode.mutate(node.id, {
      onSuccess: (checkedRes: unknown) => {
        const r = checkedRes as { results?: Array<{ status: string }> }
        const status = r?.results?.[0]?.status || 'active'
        setValidateResult({ status, message: status === 'success' || status === 'active' ? t('nodes.validateSuccess', 'Connection successful') : t('nodes.validateFailed', 'Connection failed') })
      },
      onError: () => toast('error', t('nodes.toastValidateFailed')),
    })
  }

  const handleDeleteConfirm = () => {
    if (onDelete) {
      // fallback to parent if provided
      onDelete(node)
      return
    }
    deleteNode.mutate(node.id, {
      onSuccess: () => { toast('success', t('nodes.toastDeleted', { name: node.name })); onClose() },
      onError: () => toast('error', t('nodes.toastDeleteFailed')),
    })
  }

  const handleDeleteInlineConfirm = () => {
    deleteNode.mutate(node.id, {
      onSuccess: () => { toast('success', t('nodes.toastDeleted', { name: node.name })); onClose() },
      onError: () => toast('error', t('nodes.toastDeleteFailed')),
    })
  }

  const handleEditSave = () => {
    if (!editNode.name.trim()) { toast('error', t('nodes.toastNameRequired', 'Name is required')); return }
    const port = parseInt(String(editNode.port), 10)
    if (isNaN(port) || port < 1 || port > 65535) { toast('error', t('nodes.toastInvalidPort', 'Invalid port number')); return }
    const toNull = (v: string) => v === '' ? null : v
    updateNode.mutate({
      id: node.id,
      data: {
        name: editNode.name,
        host: editNode.host,
        port,
        connection_type: editNode.connection_type,
        description: toNull(editNode.description),
        username: toNull(editNode.username),
        password: editNode.password ? editNode.password : clearFields.password ? null : undefined,
        ssh_key: editNode.ssh_key ? editNode.ssh_key : clearFields.ssh_key ? null : undefined,
        passphrase: editNode.passphrase ? editNode.passphrase : clearFields.passphrase ? null : undefined,
        docker_host: toNull(editNode.docker_host),
        has_docker: editNode.has_docker,
        tags: editNode.tags ? editNode.tags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      },
    }, {
      onSuccess: () => { toast('success', t('nodes.toastUpdated', { name: editNode.name })); setActive('overview') },
      onError: () => toast('error', t('nodes.toastUpdateFailed')),
    })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          node.status === 'active' ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
          : node.status === 'unreachable' ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
          : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
        }`}>
          <IconNodes className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-surface-900 dark:text-white truncate">{node.name}</p>
          <p className="text-xs font-mono text-surface-500 truncate">{node.host}:{node.port}{node.username ? ` (${node.username})` : ''}</p>
        </div>
        <FavoriteButton targetType="node" targetId={node.id} resourceName={node.name} size="sm" />
        <button
          onClick={onClose}
          aria-label={t('common.close')}
          className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant={nodeStatusVariant(node.status)}>{node.status}</Badge>
        <Badge variant="default">{node.connection_type}</Badge>
        {node.has_docker && <Badge variant="info">docker</Badge>}
        {node.tags.map((tag) => (
          <Badge key={tag} variant="default">{tag}</Badge>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="secondary" size="sm" onClick={() => navigate(`/docker?node=${node.id}`)} className="px-3">
          <IconDocker className="w-4 h-4 mr-1.5" />{t('nodes.openDocker', 'Docker')}
        </Button>
        <Button variant="ghost" size="sm" disabled={checkNode.isPending} onClick={() => checkNode.mutate(node.id, { onSuccess: () => toast('success', t('nodes.toastNodeChecked')), onError: () => toast('error', t('nodes.toastCheckFailed')) })}>
          <IconCheckCircle className="w-4 h-4 mr-1" />{t('nodes.checkNode')}
        </Button>
        <Button variant="ghost" size="sm" disabled={checkNode.isPending} onClick={handleValidateInline}>
          {checkNode.isPending ? <><Spinner size="sm" /> <span className="ml-1">{t('common.loading')}</span></> : t('nodes.validate')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm((v) => !v)} className="text-red-500 hover:text-red-600 ml-auto">
          <IconXCircle className="w-4 h-4 mr-1" />{t('common.delete')}
        </Button>
      </div>
      {validateResult && (
        <div className={`p-3 rounded-lg flex items-center justify-between ${validateResult.status === 'active' || validateResult.status === 'success' ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
          <div className="flex items-center gap-2"><Badge variant={validateResult.status === 'active' || validateResult.status === 'success' ? 'success' : 'danger'}>{validateResult.status}</Badge><span className="text-xs text-surface-700 dark:text-surface-300">{validateResult.message}</span></div>
          <button onClick={() => setValidateResult(null)} className="text-xs text-surface-500 hover:text-surface-700 cursor-pointer">{t('common.close')}</button>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-between gap-3">
          <p className="text-xs text-red-700 dark:text-red-300">{t('nodes.deleteMsg', { name: node.name })}</p>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" size="sm" disabled={deleteNode.isPending} onClick={showDeleteConfirm ? handleDeleteInlineConfirm : handleDeleteConfirm}>
              {deleteNode.isPending ? t('common.loading') : t('common.delete')}
            </Button>
          </div>
        </div>
      )}

      <Tabs tabs={tabs} active={active} onChange={setActive} />

      {active === 'overview' && <DrawerOverview node={node} />}
      {active === 'metrics' && <DrawerMetrics nodeId={node.id} />}
      {active === 'stats' && <DrawerStats nodeId={node.id} />}
      {active === 'history' && <DrawerHistory nodeId={node.id} />}
      {active === 'edit' && (
        <div className="space-y-4">
          <Input label={t('nodes.node')} placeholder="prod-server-05" value={editNode.name} onChange={(e) => setEditNode({ ...editNode, name: e.target.value })} />
          <Input label={t('nodes.host')} placeholder="192.168.1.105" value={editNode.host} onChange={(e) => setEditNode({ ...editNode, host: e.target.value })} />
          <Input label={t('nodes.port')} placeholder="22" type="number" value={editNode.port} onChange={(e) => setEditNode({ ...editNode, port: e.target.value })} />
          <Select label={t('nodes.connectionType')} value={editNode.connection_type} onChange={(val) => setEditNode({ ...editNode, connection_type: val as ConnectionType })} options={CONNECTION_TYPE_OPTIONS} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.descriptionLabel', 'Description')}</label>
            <textarea placeholder={t('nodes.descriptionPlaceholder', 'Main production node')} value={editNode.description} onChange={(e) => setEditNode({ ...editNode, description: e.target.value })} maxLength={1000} rows={3} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
            <p className="text-xs text-surface-400 text-right">{editNode.description.length}/1000</p>
          </div>
          <div className="pt-2 border-t border-surface-200 dark:border-surface-800">
            <p className="text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wide mb-2">{t('nodes.credentialsSection', 'Credentials')} {t('common.requiredMark', '*')}</p>
            <div className="space-y-3 p-3 bg-surface-50 dark:bg-surface-800/30 rounded-lg border border-surface-200 dark:border-surface-800">
              <Input label={t('nodes.username', 'Username')} placeholder="root" value={editNode.username} onChange={(e) => setEditNode({ ...editNode, username: e.target.value })} />
              <div className="space-y-1">
                <div className="flex items-center justify-between"><label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.password', 'Password')}</label><Button variant="ghost" size="sm" onClick={() => toggleClear('password')} className="h-6 px-2 text-xs">{clearFields.password ? t('common.cancel') : t('common.clear', 'Clear')}</Button></div>
                <Input type="password" placeholder={clearFields.password ? t('common.willBeCleared') : t('common.leaveBlank')} value={editNode.password} onChange={(e) => setEditNode({ ...editNode, password: e.target.value })} disabled={clearFields.password} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between"><label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.sshKey', 'SSH Key')}</label><Button variant="ghost" size="sm" onClick={() => toggleClear('ssh_key')} className="h-6 px-2 text-xs">{clearFields.ssh_key ? t('common.cancel') : t('common.clear', 'Clear')}</Button></div>
                <textarea placeholder={clearFields.ssh_key ? t('common.willBeCleared') : t('common.leaveBlank')} value={editNode.ssh_key} onChange={(e) => setEditNode({ ...editNode, ssh_key: e.target.value })} disabled={clearFields.ssh_key} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm font-mono disabled:opacity-50 dark:bg-surface-800 dark:border-surface-700 dark:text-white" rows={3} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between"><label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.passphrase', 'Passphrase')}</label><Button variant="ghost" size="sm" onClick={() => toggleClear('passphrase')} className="h-6 px-2 text-xs">{clearFields.passphrase ? t('common.cancel') : t('common.clear', 'Clear')}</Button></div>
                <Input type="password" placeholder={clearFields.passphrase ? t('common.willBeCleared') : t('common.leaveBlank')} value={editNode.passphrase} onChange={(e) => setEditNode({ ...editNode, passphrase: e.target.value })} disabled={clearFields.passphrase} />
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-surface-200 dark:border-surface-800">
            <p className="text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wide mb-2">{t('nodes.dockerSection', 'Docker')}</p>
            <div className="space-y-3 p-3 bg-surface-50 dark:bg-surface-800/30 rounded-lg border border-surface-200 dark:border-surface-800">
              <Input label={t('nodes.dockerHost', 'Docker Host')} placeholder="/var/run/docker.sock" value={editNode.docker_host} onChange={(e) => setEditNode({ ...editNode, docker_host: e.target.value })} />
              <Checkbox checked={editNode.has_docker} onChange={(v) => setEditNode({ ...editNode, has_docker: v })} label={t('nodes.hasDocker', 'Has Docker')} />
            </div>
          </div>
          <Input label={t('nodes.tagsLabel', 'Tags')} placeholder="production, linux" value={editNode.tags} onChange={(e) => setEditNode({ ...editNode, tags: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setActive('overview')}>{t('common.cancel')}</Button>
            <Button onClick={handleEditSave} disabled={updateNode.isPending || !editNode.name || !editNode.host}>{updateNode.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      )}
      {active === 'exec' && <DrawerExec node={node} />}
      {active === 'script' && <DrawerScript node={node} />}
    </div>
  )
}

function DrawerOverview({ node }: { node: Node }) {
  const { t } = useTranslation()
  const { copy } = useCopyToClipboard()
  const navigate = useNavigate()
  const rows: [string, React.ReactNode][] = [
    [t('nodes.host'), (
      <span key="host" className="inline-flex items-center gap-2 font-mono text-xs">
        {node.host}:{node.port}
        <button onClick={() => copy(`${node.host}:${node.port}`)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 cursor-pointer"><IconCopy className="w-3 h-3 text-surface-400" /></button>
      </span>
    )],
    [t('nodes.descriptionLabel', 'Description'), (node as unknown as { description?: string | null }).description ? <span key="desc" className="text-xs">{(node as unknown as { description: string }).description}</span> : '—'],
    [t('nodes.connectionType'), <Badge key="ct" variant="info">{node.connection_type}</Badge>],
    [t('nodes.status'), <Badge key="s" variant={nodeStatusVariant(node.status)}>{node.status}</Badge>],
    [t('nodes.username', 'Username'), node.username ? <span key="u" className="inline-flex items-center gap-1 text-xs">{node.username}<button onClick={() => copy(node.username!)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 cursor-pointer"><IconCopy className="w-3 h-3 text-surface-400" /></button></span> : '—'],
    [t('nodes.dockerHost', 'Docker Host'), node.docker_host ? <span key="d" className="font-mono text-xs truncate max-w-[160px]">{node.docker_host}</span> : '—'],
    [t('nodes.hasDocker', 'Has Docker'), node.has_docker ? <Badge key="hd" variant="success">Yes</Badge> : <Badge key="hd2" variant="default">No</Badge>],
    [t('nodes.tags', 'Tags'), node.tags.length ? (
      <span key="tags" className="flex flex-wrap gap-1">
        {node.tags.map((tag) => <button key={tag} onClick={() => navigate(`/nodes?tag=${encodeURIComponent(tag)}`)} className="cursor-pointer"><Badge variant="default">{tag}</Badge></button>)}
      </span>
    ) : '—'],
    [t('nodes.created', 'Created'), new Date(node.created_at).toLocaleString()],
    [t('nodes.updated', 'Updated'), new Date(node.updated_at).toLocaleString()],
  ]
  return (
    <div className="grid grid-cols-1 gap-3">
      {rows.map(([label, value]) => (
        <div key={label} className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
          <p className="text-[11px] uppercase tracking-wide text-surface-500 dark:text-surface-400">{label}</p>
          <div className="text-sm font-medium text-surface-900 dark:text-white mt-1">{value}</div>
        </div>
      ))}
    </div>
  )
}

function DrawerMetricBar({ label, value, percent }: { label: string; value: string; percent: number }) {
  const pct = Math.min(100, Math.max(0, percent))
  return (
    <div>
      <div className="flex justify-between mb-1"><span className="text-xs text-surface-600 dark:text-surface-400">{label}</span><span className="text-xs font-medium text-surface-900 dark:text-white">{value}</span></div>
      <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-accent-500'}`} style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

function DrawerMetrics({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { data: metrics, isLoading, error, refetch } = useNodeMetrics(nodeId)
  if (isLoading) return <div className="space-y-3"><Skeleton variant="rectangular" className="w-full h-20" /><Skeleton variant="rectangular" className="w-full h-20" /><Skeleton variant="rectangular" className="w-full h-12" /></div>
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!metrics) return <EmptyState title={t('nodes.noMetrics', 'No metrics available')} />
  const cpuPct = metrics.cpu.usage_percent ?? 0
  const memPct = metrics.memory.percent ?? 0
  const diskPct = metrics.disk.percent ?? 0
  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <DrawerMetricBar label={t('nodes.cpu', 'CPU')} value={`${cpuPct.toFixed(1)}% (${metrics.cpu.cores} cores)`} percent={cpuPct} />
        <DrawerMetricBar label={t('nodes.memory', 'Memory')} value={`${formatBytes(metrics.memory.used_bytes)} / ${formatBytes(metrics.memory.total_bytes)} (${memPct.toFixed(1)}%)`} percent={memPct} />
        <DrawerMetricBar label={t('nodes.disk', 'Disk')} value={`${formatBytes(metrics.disk.used_bytes)} / ${formatBytes(metrics.disk.total_bytes)} (${diskPct.toFixed(1)}%)`} percent={diskPct} />
        <KeyValueList rows={[{ label: t('nodes.uptimeSince', 'Uptime Since'), value: metrics.uptime_since ? new Date(metrics.uptime_since).toLocaleString() : '—' }]} />
        <div className="pt-1"><p className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-2">{t('nodes.loadAverage', 'Load Average')}</p><KeyValueList rows={[{ label: '1m', value: metrics.load_average.one_min.toFixed(2) },{ label: '5m', value: metrics.load_average.five_min.toFixed(2) },{ label: '15m', value: metrics.load_average.fifteen_min.toFixed(2) }]} /></div>
      </CardContent>
    </Card>
  )
}

function DrawerStats({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { data: stats, isLoading, error, refetch } = useNodeStats(nodeId, { date_from: dateFrom || undefined, date_to: dateTo || undefined })
  if (isLoading) return <div className="grid grid-cols-2 gap-3"><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></div>
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!stats) return <EmptyState title={t('nodes.noStats', 'No stats available')} />
  return (
    <Card>
      <CardHeader>
        <div className="flex gap-2">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="flex-1 px-2 py-1.5 bg-white border border-surface-300 rounded-lg text-xs dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
          <span className="text-surface-400 self-center">—</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="flex-1 px-2 py-1.5 bg-white border border-surface-300 rounded-lg text-xs dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <StatsGrid>
          <StatCard label={t('nodes.totalExecutions')} value={stats.total} />
          <StatCard label={t('nodes.successRate')} value={formatPercent(stats.success_rate)} tone="success" />
          <StatCard label={t('nodes.avgDuration')} value={formatDurationMs(stats.avg_duration_ms)} />
          <StatCard label={t('nodes.failed')} value={stats.failed} tone="danger" />
        </StatsGrid>
      </CardContent>
    </Card>
  )
}

function DrawerHistory({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: statusInfinite, isLoading: sLoading, error: sError, refetch: sRefetch, fetchNextPage: sFetch, hasNextPage: sHas, isFetchingNextPage: sFetching } = useInfiniteNodeStatusHistory(nodeId, { limit: 5 })
  const { data: cmdInfinite, isLoading: cLoading, error: cError, refetch: cRefetch, fetchNextPage: cFetch, hasNextPage: cHas, isFetchingNextPage: cFetching } = useInfiniteNodeCommandHistory(nodeId, { limit: 5 })
  const retry = useRetryNodeCommand()
  const sItems = statusInfinite ? statusInfinite.pages.flatMap((p) => p.items) : []
  const cItems = cmdInfinite ? cmdInfinite.pages.flatMap((p) => p.items) : []
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><h3 className="text-sm font-semibold text-surface-900 dark:text-white">{t('nodes.statusHistory', 'Status History')}</h3></CardHeader>
        <CardContent className="p-0">
          {sLoading ? <TableSkeleton rows={3} cols={2} /> : sError ? <ErrorState error={sError} onRetry={sRefetch} /> : sItems.length === 0 ? <EmptyState title={t('nodes.emptyTitle')} /> : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800 max-h-64 overflow-y-auto">
              {sItems.map((item: { id: string; old_status?: string | null; new_status: string; source: string; changed_at: string }) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {item.old_status && <Badge variant="default">{item.old_status}</Badge>}
                    {item.old_status && <span className="text-surface-400">→</span>}
                    <Badge variant={item.new_status === 'active' ? 'success' : 'danger'}>{item.new_status}</Badge>
                  </div>
                  <div className="text-right"><p className="text-[11px] text-surface-500">{item.source}</p><p className="text-[11px] text-surface-400">{new Date(item.changed_at).toLocaleString()}</p></div>
                </div>
              ))}
            </div>
          )}
          <InfiniteScroll hasMore={!!sHas} isFetchingNextPage={sFetching} onLoadMore={() => sFetch()} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><h3 className="text-sm font-semibold text-surface-900 dark:text-white">{t('nodes.cmdHistory', 'Command History')}</h3></CardHeader>
        <CardContent className="p-0">
          {cLoading ? <TableSkeleton rows={3} cols={2} /> : cError ? <ErrorState error={cError} onRetry={cRefetch} /> : cItems.length === 0 ? <EmptyState title={t('nodes.noCmdHistory', 'No command history')} /> : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800 max-h-64 overflow-y-auto">
              {cItems.map((item: { id: string; command_fingerprint: string; created_at: string; exit_code: number }) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0 flex-1"><p className="text-xs font-mono text-surface-900 dark:text-white truncate">{item.command_fingerprint}</p><p className="text-[11px] text-surface-500">{new Date(item.created_at).toLocaleString()}</p><Badge variant={item.exit_code === 0 ? 'success' : 'danger'}>exit {item.exit_code}</Badge></div>
                  <div className="ml-2">
                    {item.exit_code !== 0 && <Button variant="ghost" size="sm" disabled={retry.isPending} onClick={() => retry.mutate({ executionId: item.id }, { onSuccess: () => toast('success', t('nodes.toastRetried')), onError: () => toast('error', t('nodes.toastRetryFailed')) })}>{t('common.retry')}</Button>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <InfiniteScroll hasMore={!!cHas} isFetchingNextPage={cFetching} onLoadMore={() => cFetch()} />
        </CardContent>
      </Card>
    </div>
  )
}

function DrawerExec({ node }: { node: Node }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: commandsData } = useCommands({ size: 100 })
  const commands = commandsData?.items || []
  const executeCommand = useExecuteCommand()
  const executeNode = useExecuteNode()
  const [tab, setTab] = useState<'command' | 'custom'>('command')
  const [search, setSearch] = useState('')
  const [selectedCommand, setSelectedCommand] = useState<CommandResponse | null>(null)
  const [params, setParams] = useState<Record<string, unknown>>({})
  const [customCommand, setCustomCommand] = useState('')
  const [customTimeout, setCustomTimeout] = useState('')
  const [commandResult, setCommandResult] = useState<CommandResult | null>(null)
  const [customOutputs, setCustomOutputs] = useState<Array<{ command: string; result: CommandResult }>>([])

  useEffect(() => {
    setSearch('')
    setSelectedCommand(null)
    setParams({})
    setCustomCommand('')
    setCustomTimeout('')
    setCommandResult(null)
    setCustomOutputs([])
    setTab('command')
  }, [node.id])

  const filtered = commands.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  const selectCommand = (cmd: CommandResponse) => {
    setSelectedCommand(cmd)
    setParams(getDefaultParams(cmd.parameters))
    setCommandResult(null)
  }
  const handleRunCommand = () => {
    if (!selectedCommand) return
    const values: Record<string, unknown> = {}
    for (const p of selectedCommand.parameters || []) {
      const raw = params[p.name]
      if (raw === '' || raw === undefined || raw === null) continue
      if (p.type === 'integer') values[p.name] = Number(raw)
      else if (p.type === 'boolean') values[p.name] = !!raw
      else values[p.name] = raw
    }
    executeCommand.mutate({ id: selectedCommand.id, data: { node_id: node.id, params: Object.keys(values).length > 0 ? values : undefined } }, {
      onSuccess: (res) => {
        toast('success', t('commands.toastExecuted', { target: node.name }))
        const batch = res as unknown as { results?: Array<{ stdout: string; stderr: string; exit_code?: number | null }> }
        const first = batch.results?.[0]
        if (first) setCommandResult({ stdout: first.stdout ?? '', stderr: first.stderr ?? '', exit_code: first.exit_code ?? 0 } as CommandResult)
        else setCommandResult(res as unknown as CommandResult)
      },
      onError: () => toast('error', t('commands.toastFailed')),
    })
  }
  const handleRunCustom = () => {
    if (!customCommand) return
    executeNode.mutate({ id: node.id, command: customCommand, timeout: customTimeout ? Number(customTimeout) : undefined }, {
      onSuccess: (res) => {
        const batch = res as unknown as { results?: Array<{ stdout: string; stderr: string; exit_code?: number | null }> }
        const first = batch.results?.[0] ?? (res as unknown as { stdout: string; stderr: string; exit_code?: number | null })
        const result = { stdout: first.stdout ?? '', stderr: first.stderr ?? '', exit_code: first.exit_code ?? 0 } as CommandResult
        toast('success', t('nodes.execResult', { code: result.exit_code, output: result.stdout.slice(0, 100) }))
        setCustomOutputs((prev) => [...prev, { command: customCommand, result }])
      },
      onError: () => toast('error', t('nodes.toastExecFailed')),
    })
  }
  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      <Tabs tabs={[{ key: 'command', label: t('nodes.commandTab', 'Command') }, { key: 'custom', label: t('nodes.customTab', 'Custom') }]} active={tab} onChange={setTab} />
      {tab === 'command' ? (
        commandResult ? (
          <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
            <ExecutionResult stdout={commandResult.stdout} stderr={commandResult.stderr} exitCode={commandResult.exit_code} />
            <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setCommandResult(null)}>{t('commands.executeAgain')}</Button></div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 space-y-3">
            <SearchInput value={search} onChange={setSearch} placeholder={t('nodes.selectCommand', 'Search commands...')} />
            <div className="w-full flex-1 min-h-[200px] overflow-y-auto divide-y divide-surface-200 dark:divide-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg">
              {filtered.length === 0 ? <p className="text-sm text-surface-500 text-center py-4">{t('nodes.noCommands', 'No commands')}</p> : filtered.map((cmd) => (
                <button key={cmd.id} type="button" onClick={() => selectCommand(cmd)} className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm cursor-pointer ${selectedCommand?.id === cmd.id ? 'bg-accent-50 dark:bg-accent-900/20' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'}`}>
                  <IconCommands className="w-4 h-4 text-surface-400 shrink-0" />
                  <div className="min-w-0"><p className="font-medium text-surface-900 dark:text-white truncate">{cmd.name}</p><p className="text-xs text-surface-500 font-mono truncate">{cmd.command}</p></div>
                </button>
              ))}
            </div>
            {selectedCommand && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-surface-600 dark:text-surface-400">{t('commands.parameters', 'Parameters')}</p>
                {selectedCommand.parameters && selectedCommand.parameters.length > 0 ? <CommandParamInputs parameters={selectedCommand.parameters} values={params} onChange={(name, value) => setParams((prev) => ({ ...prev, [name]: value }))} /> : <p className="text-xs text-surface-400">{t('commands.noParameters', 'No parameters')}</p>}
              </div>
            )}
            <div className="flex justify-end"><Button size="sm" onClick={handleRunCommand} disabled={!selectedCommand || executeCommand.isPending}>{executeCommand.isPending ? <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span> : t('commands.execute')}</Button></div>
          </div>
        )
      ) : (
        <div className="flex flex-col flex-1 min-h-0 space-y-3 overflow-y-auto">
          <Input label={t('nodes.command', 'Command')} placeholder="uptime" value={customCommand} onChange={(e) => setCustomCommand(e.target.value)} />
          <Input label={t('nodes.timeout', 'Timeout (seconds)')} placeholder="30" type="number" value={customTimeout} onChange={(e) => setCustomTimeout(e.target.value)} />
          <div className="flex justify-end"><Button size="sm" onClick={handleRunCustom} disabled={!customCommand || executeNode.isPending}>{executeNode.isPending ? <span className="flex items-center gap-2"><Spinner size="sm" /> {t('common.loading')}</span> : t('nodes.execCommand')}</Button></div>
          {customOutputs.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-surface-200 dark:border-surface-700 flex-1 overflow-y-auto min-h-0">
              {customOutputs.map((item, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-xs font-mono text-surface-500">$ {item.command}</p>
                  <ExecutionResult stdout={item.result.stdout} stderr={item.result.stderr} exitCode={item.result.exit_code} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DrawerScript({ node }: { node: Node }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: scriptsData } = useScripts({ size: 100 })
  const scripts = scriptsData?.items || []
  const runScript = useRunScript()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<import('../../api/types').ScriptResponse | null>(null)
  const [result, setResult] = useState<ScriptNodeResult | null>(null)
  useEffect(() => { setSearch(''); setSelected(null); setResult(null) }, [node.id])
  const filtered = scripts.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  const handleRun = () => {
    if (!selected) return
    runScript.mutate({ id: selected.id, data: { node_ids: [node.id] } }, {
      onSuccess: (response) => {
        toast('success', t('scripts.toastStarted', { name: selected.name }))
        const batch = response as unknown as { results?: ScriptNodeResult[] }
        const fallback = response as unknown as { results?: Array<{ node_id: string; status: string; steps?: unknown[] }> }
        const first = batch.results?.[0] as ScriptNodeResult | undefined ?? (fallback.results?.[0] as unknown as ScriptNodeResult)
        if (first) setResult(first)
      },
      onError: () => toast('error', t('scripts.toastRunFailed', { name: selected.name })),
    })
  }
  if (result) {
    return (
      <div className="flex flex-col flex-1 min-h-0 space-y-3 overflow-y-auto">
        <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{t('scripts.result', 'Result')}: {selected?.name}</p>
        <div className="flex-1 min-h-0 space-y-3 overflow-y-auto">
          {result.steps.map((step, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2"><span className="text-xs font-medium text-surface-700 dark:text-surface-300">{t('scripts.step', 'Step')} {idx + 1}{step.label ? `: ${step.label}` : ''}</span><Badge variant={step.exit_code === 0 ? 'success' : 'danger'}>{t('common.exitCode', 'exit')} {step.exit_code}</Badge>{step.truncated && <Badge variant="warning">{t('scripts.truncated', 'Truncated')}</Badge>}</div>
              <ExecutionResult stdout={step.stdout} stderr={step.stderr} exitCode={step.exit_code} showExitCode={false} />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 shrink-0"><Button variant="ghost" size="sm" onClick={() => setResult(null)}>{t('common.close')}</Button><Button size="sm" onClick={() => setResult(null)}>{t('scripts.runAgain', 'Run Again')}</Button></div>
      </div>
    )
  }
  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-3">
      <SearchInput value={search} onChange={setSearch} placeholder={t('nodes.selectScript', 'Search scripts...')} />
      <div className="w-full flex-1 min-h-[200px] overflow-y-auto divide-y divide-surface-200 dark:divide-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg">
        {filtered.length === 0 ? <p className="text-sm text-surface-500 text-center py-4">{t('nodes.noScripts', 'No scripts')}</p> : filtered.map((script) => (
          <button key={script.id} type="button" onClick={() => setSelected(script)} className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm cursor-pointer ${selected?.id === script.id ? 'bg-accent-50 dark:bg-accent-900/20' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'}`}>
            <IconScripts className="w-4 h-4 text-surface-400 shrink-0" />
            <div className="min-w-0"><p className="font-medium text-surface-900 dark:text-white truncate">{script.name}</p>{script.description && <p className="text-xs text-surface-500 truncate">{script.description}</p>}</div>
          </button>
        ))}
      </div>
      <div className="flex justify-end"><Button size="sm" onClick={handleRun} disabled={!selected || runScript.isPending}>{runScript.isPending ? <Spinner size="sm" /> : t('scripts.run')}</Button></div>
    </div>
  )
}
