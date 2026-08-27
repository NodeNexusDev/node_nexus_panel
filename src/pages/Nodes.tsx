import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { TagFilter } from '../components/ui/TagFilter'
import { Select } from '../components/ui/Select'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Tooltip } from '../components/ui/Tooltip'
import { ResponsiveTable } from '../components/ui/ResponsiveTable'
import { Pagination } from '../components/ui/Pagination'
import { TableSkeleton } from '../components/ui/Skeleton'
import { PageHeader } from '../components/ui/PageHeader'
import { FilterBar } from '../components/ui/FilterBar'
import { SortableHeader } from '../components/ui/SortableHeader'
import { DropdownMenu, type DropdownMenuItem } from '../components/ui/DropdownMenu'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { NodeCommandModal } from '../components/nodes/NodeCommandModal'
import { NodeScriptModal } from '../components/nodes/NodeScriptModal'
import { BulkCommandModal } from '../components/commands/BulkCommandModal'
import {
  IconNodes,
  IconCommands,
  IconScripts,
  IconCheckCircle,
  IconXCircle,
  IconChart,
  IconClock,
  IconActivity,
} from '../components/ui/Icons'
import {
  useNodes,
  useCreateNode,
  useUpdateNode,
  useDeleteNode,
  useCheckNode,
  useBulkCheck,
  useNodeTags,
  useBulkDeleteNodes,
  useBulkMetrics,
  useBulkValidateCredentials,
  useBulkUpdateNodes,
} from '../hooks/useNodes'
import { useToast } from '../components/ui/useToast'
import { useSort } from '../hooks/useSort'
import { TagBadge } from '../components/ui/TagBadge'
import { nodeStatusVariant } from '../lib/variants'
import type { Node, NodeStatus, BulkNodeMetricsResponse, NodeUpdate } from '../api/types'
import type { NodeCreateFormValues } from '../lib/validators/node-schema'
import { nodeCreateSchema } from '../lib/validators/node-schema'
import type { Column } from '../components/ui/table-types'

type SortKey = 'name' | 'host' | 'status' | 'connection_type' | 'tags'

function statusDot(status: NodeStatus): string {
  switch (status) {
    case 'active': return 'bg-green-500 status-online'
    case 'unreachable': return 'bg-amber-500'
    case 'error': return 'bg-red-500'
    default: return 'bg-surface-400'
  }
}

export function Nodes() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set())
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const { sort, toggle: toggleSort } = useSort<SortKey>()
  const pageSize = 20

  const { data, isLoading } = useNodes({
    page,
    size: pageSize,
    search: search || undefined,
    status: statusFilter.size > 0 ? Array.from(statusFilter).join(',') : undefined,
  }, { refetchInterval: 30_000 })
  const { data: allTags } = useNodeTags()
  const createNode = useCreateNode()
  const updateNode = useUpdateNode()
  const deleteNode = useDeleteNode()
  const checkNode = useCheckNode()
  const bulkCheck = useBulkCheck()
  const bulkDeleteNodes = useBulkDeleteNodes()
  const bulkMetrics = useBulkMetrics()
  const bulkValidateCreds = useBulkValidateCredentials()
  const bulkUpdateNodes = useBulkUpdateNodes()

  const [showAddModal, setShowAddModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Node | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const addForm = useForm<NodeCreateFormValues>({
    resolver: zodResolver(nodeCreateSchema) as never,
    defaultValues: {
      name: '',
      host: '',
      port: 22,
      connection_type: 'ssh',
      username: null,
      password: null,
      ssh_key: null,
      passphrase: null,
      docker_host: null,
      tags: undefined,
    },
  })

  const [editNode, setEditNode] = useState({ name: '', host: '', port: '22', connection_type: 'ssh' as 'ssh' | 'docker' | 'proxmox', username: '', password: '', ssh_key: '', passphrase: '', docker_host: '', tags: '' })
  const [clearFields, setClearFields] = useState<Record<string, boolean>>({})

  const toggleClear = (field: string) => {
    setClearFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const [execTarget, setExecTarget] = useState<Node | null>(null)
  const [scriptTarget, setScriptTarget] = useState<Node | null>(null)
  const [validateTarget, setValidateTarget] = useState<Node | null>(null)
  const [validateResult, setValidateResult] = useState<{ status: string; message: string } | null>(null)
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [showBulkExec, setShowBulkExec] = useState(false)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkMetrics, setShowBulkMetrics] = useState(false)
  const [bulkMetricsResult, setBulkMetricsResult] = useState<BulkNodeMetricsResponse | null>(null)
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  const [bulkUpdateChanges, setBulkUpdateChanges] = useState({ name: '', host: '', port: '', username: '', docker_host: '', tags: '' })

  const nodes = (data?.items || []).filter(
    (node) => tagFilter.length === 0 || tagFilter.some((t) => node.tags.includes(t))
  )
  const allSelected = nodes.length > 0 && nodes.every((n) => selectedIds.includes(n.id))

  const sortedNodes = sort
    ? [...nodes].sort((a, b) => {
        const dir = sort.dir === 'asc' ? 1 : -1
        if (sort.key === 'tags') {
          const av = a.tags[0] ?? ''
          const bv = b.tags[0] ?? ''
          return av.localeCompare(bv) * dir
        }
        const av = String(a[sort.key] ?? '')
        const bv = String(b[sort.key] ?? '')
        return av.localeCompare(bv) * dir
      })
    : nodes

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : nodes.map((n) => n.id))
  }

  const openEdit = (node: Node) => {
    setEditTarget(node)
    setEditNode({
      name: node.name,
      host: node.host,
      port: String(node.port),
      connection_type: node.connection_type,
      username: node.username || '',
      password: '',
      ssh_key: '',
      passphrase: '',
      docker_host: node.docker_host || '',
      tags: node.tags.join(', '),
    })
    setClearFields({})
  }

  const handleValidate = (node: Node) => {
    setValidateTarget(node)
    setValidateResult(null)
    checkNode.mutate(node.id, {
      onSuccess: (checkedNode) => {
        setValidateResult({
          status: checkedNode.status,
          message: checkedNode.status === 'active'
            ? t('nodes.validateSuccess', 'Connection successful')
            : t('nodes.validateFailed', 'Connection failed'),
        })
      },
      onError: () => toast('error', t('nodes.toastValidateFailed')),
    })
  }

  const nodeMenu = (node: Node): DropdownMenuItem[] => [
    { key: 'edit', label: t('common.edit'), onClick: () => openEdit(node) },
    { key: 'validate', label: t('nodes.validate'), onClick: () => handleValidate(node) },
    { key: 'sep-1', label: '', onClick: () => {}, separator: true },
    { key: 'metrics', label: t('nodes.metrics', 'Metrics'), icon: <IconActivity className="w-4 h-4" />, onClick: () => navigate(`/nodes/${node.id}?tab=metrics`) },
    { key: 'stats', label: t('nodes.stats', 'Stats'), icon: <IconChart className="w-4 h-4" />, onClick: () => navigate(`/nodes/${node.id}?tab=stats`) },
    { key: 'status-history', label: t('nodes.statusHistory', 'Status History'), icon: <IconClock className="w-4 h-4" />, onClick: () => navigate(`/nodes/${node.id}?tab=status-history`) },
    { key: 'command-history', label: t('nodes.cmdHistory', 'Command History'), icon: <IconCommands className="w-4 h-4" />, onClick: () => navigate(`/nodes/${node.id}?tab=command-history`) },
    { key: 'sep-2', label: '', onClick: () => {}, separator: true },
    { key: 'delete', label: t('common.delete'), icon: <IconXCircle className="w-4 h-4" />, danger: true, onClick: () => setDeleteTarget({ id: node.id, name: node.name }) },
  ]

  const columns: Column<Node>[] = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          aria-label={t('common.selectAll')}
          className="w-4 h-4 rounded border-surface-300 dark:border-surface-600"
        />
      ),
      className: 'w-10',
      render: (node) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(node.id)}
          onChange={() => toggleSelect(node.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={t('common.selectItem', 'Select {{name}}', { name: node.name })}
          className="w-4 h-4 rounded border-surface-300 dark:border-surface-600"
        />
      ),
    },
    {
      key: 'node',
      header: <SortableHeader label={t('nodes.node')} sortKey="name" sort={sort} onSort={toggleSort} />,
      render: (node) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            node.status === 'active'
              ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
              : node.status === 'unreachable'
                ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
          }`}>
            <IconNodes className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{node.name}</p>
            <p className="text-xs text-surface-500 dark:text-surface-500 font-mono truncate">{node.host}:{node.port}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: <SortableHeader label={t('nodes.status')} sortKey="status" sort={sort} onSort={toggleSort} />,
      render: (node) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusDot(node.status)}`} />
          <Badge variant={nodeStatusVariant(node.status)}>{node.status}</Badge>
        </div>
      ),
    },
    {
      key: 'type',
      header: <SortableHeader label={t('nodes.type')} sortKey="connection_type" sort={sort} onSort={toggleSort} />,
      render: (node) => <span className="text-sm text-surface-600 dark:text-surface-300">{node.connection_type}</span>,
    },
    {
      key: 'tags',
      header: <SortableHeader label={t('nodes.tags')} sortKey="tags" sort={sort} onSort={toggleSort} />,
      render: (node) => (
        <div className="flex flex-wrap gap-1">
          {node.tags.length > 0 ? node.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} onClick={() => setTagFilter((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])} />
          )) : <span className="text-surface-400">—</span>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('nodes.actions'),
      render: (node) => (
        <div className="flex items-center gap-1">
          <FavoriteButton targetType="node" targetId={node.id} resourceName={node.name} size="sm" />
          <Tooltip content={t('nodes.checkNode')}>
            <Button variant="ghost" size="sm" className="px-2" aria-label={t('nodes.checkNode')} onClick={(e) => { e.stopPropagation(); checkNode.mutate(node.id, { onSuccess: () => toast('success', t('nodes.toastNodeChecked')), onError: () => toast('error', t('nodes.toastCheckFailed')) }) }}>
              <IconCheckCircle className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content={t('nodes.execCommand')}>
            <Button variant="ghost" size="sm" className="px-2" aria-label={t('nodes.execCommand')} onClick={(e) => { e.stopPropagation(); setExecTarget(node) }}>
              <IconCommands className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content={t('nodes.runScript')}>
            <Button variant="ghost" size="sm" className="px-2" aria-label={t('nodes.runScript')} onClick={(e) => { e.stopPropagation(); setScriptTarget(node) }}>
              <IconScripts className="w-4 h-4" />
            </Button>
          </Tooltip>
          <DropdownMenu items={nodeMenu(node)} ariaLabel={t('common.actionsFor', { name: node.name })} />
        </div>
      ),
    },
  ]

  const renderMobileNode = (node: Node) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            node.status === 'active' ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
          }`}>
            <IconNodes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-900 dark:text-white">{node.name}</p>
            <p className="text-xs text-surface-500 dark:text-surface-500 font-mono">{node.host}:{node.port}</p>
          </div>
        </div>
        <Badge variant={nodeStatusVariant(node.status)}>{node.status}</Badge>
      </div>
      <div className="flex flex-wrap gap-1">
        {node.tags.length > 0 ? node.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} onClick={() => setTagFilter((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])} />
        )) : <span className="text-surface-400">—</span>}
      </div>
      <div className="flex items-center gap-1">
        <FavoriteButton targetType="node" targetId={node.id} resourceName={node.name} size="sm" />
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExecTarget(node) }}>
          <IconCommands className="w-4 h-4 mr-1" /> {t('nodes.execCommand')}
        </Button>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setScriptTarget(node) }}>
          <IconScripts className="w-4 h-4 mr-1" /> {t('nodes.runScript')}
        </Button>
        <DropdownMenu items={nodeMenu(node)} ariaLabel={`${node.name} actions`} />
      </div>
    </div>
  )

  const handleAdd = (values: NodeCreateFormValues) => {
    createNode.mutate(
      {
        name: values.name,
        host: values.host,
        port: values.port,
        connection_type: values.connection_type,
        username: values.username ?? undefined,
        password: values.password ?? undefined,
        ssh_key: values.ssh_key ?? undefined,
        passphrase: values.passphrase ?? undefined,
        docker_host: values.docker_host ?? undefined,
        tags: values.tags,
      },
      {
        onSuccess: (createdNode) => {
          toast('success', t('nodes.toastAdded', { name: values.name }), {
            label: t('common.view', 'View'),
            onClick: () => navigate(`/nodes/${createdNode.id}`),
          })
          setShowAddModal(false)
          addForm.reset()
        },
        onError: () => toast('error', t('nodes.toastAddFailed')),
      },
    )
  }

  const handleEdit = () => {
    if (!editTarget) return
    if (!editNode.name.trim()) { toast('error', t('nodes.toastNameRequired', 'Name is required')); return }
    const port = parseInt(String(editNode.port), 10)
    if (isNaN(port) || port < 1 || port > 65535) { toast('error', t('nodes.toastInvalidPort', 'Invalid port number')); return }
    const toNull = (v: string) => v === '' ? null : v
    updateNode.mutate(
      {
        id: editTarget.id,
        data: {
          name: editNode.name,
          host: editNode.host,
          port,
          username: toNull(editNode.username),
          password: editNode.password ? editNode.password : clearFields.password ? null : undefined,
          ssh_key: editNode.ssh_key ? editNode.ssh_key : clearFields.ssh_key ? null : undefined,
          passphrase: editNode.passphrase ? editNode.passphrase : clearFields.passphrase ? null : undefined,
          docker_host: toNull(editNode.docker_host),
          tags: editNode.tags ? editNode.tags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        },
      },
      {
        onSuccess: () => { toast('success', t('nodes.toastUpdated', { name: editNode.name })); setEditTarget(null) },
        onError: () => toast('error', t('nodes.toastUpdateFailed')),
      },
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteNode.mutate(deleteTarget.id, {
      onSuccess: () => { toast('success', t('nodes.toastDeleted', { name: deleteTarget.name })); setDeleteTarget(null) },
      onError: () => toast('error', t('nodes.toastDeleteFailed')),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nodes.title')}
        description={t('nodes.description')}
        actions={<Button onClick={() => setShowAddModal(true)}>{t('nodes.addNode')}</Button>}
      />

      <FilterBar search={search} onSearch={setSearch} searchPlaceholder={t('nodes.searchPlaceholder', 'Search nodes...')}>
        <div className="flex items-center gap-1">
          {(['active', 'unreachable', 'error'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter((prev) => {
                const next = new Set(prev)
                if (next.has(s)) next.delete(s)
                else next.add(s)
                return next
              })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                statusFilter.has(s)
                  ? s === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : s === 'unreachable' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400'
              }`}
            >
              {t(`nodes.status${s.charAt(0).toUpperCase() + s.slice(1)}`, s)}
            </button>
          ))}
          {statusFilter.size > 0 && (
            <button onClick={() => setStatusFilter(new Set())} aria-label={t('nodes.clearFilters', 'Clear filters')} className="px-2 py-1.5 text-xs text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 cursor-pointer">×</button>
          )}
        </div>
        <TagFilter
          available={allTags ?? []}
          selected={tagFilter}
          onChange={setTagFilter}
        />
      </FilterBar>

      <Card hover className="stagger-item">
        <CardContent className="p-0">
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-accent-50 dark:bg-accent-900/20 border-b border-accent-200 dark:border-accent-800">
              <span className="text-sm font-medium text-accent-700 dark:text-accent-300">{t('nodes.selected', { count: selectedIds.length })}</span>
              <Button variant="ghost" size="sm" onClick={() => setShowBulkExec(true)}>{t('nodes.bulkExec', 'Bulk Exec')}</Button>
              <Button variant="ghost" size="sm" disabled={bulkCheck.isPending} onClick={() => {
                bulkCheck.mutate(selectedIds, {
                  onSuccess: () => { toast('success', t('nodes.toastBulkCheckDone')); setSelectedIds([]) },
                  onError: () => toast('error', t('nodes.toastBulkCheckFailed')),
                })
              }}>{bulkCheck.isPending ? t('common.loading') : t('nodes.bulkCheck')}</Button>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowBulkMetrics(true)
                setBulkMetricsResult(null)
                bulkMetrics.mutate(selectedIds, {
                  onSuccess: (data) => setBulkMetricsResult(data),
                  onError: () => toast('error', t('nodes.toastBulkMetricsFailed', 'Failed to fetch metrics')),
                })
              }} disabled={bulkMetrics.isPending}>{bulkMetrics.isPending ? t('common.loading') : t('nodes.bulkMetrics', 'Bulk Metrics')}</Button>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowBulkUpdate(true)
                setBulkUpdateChanges({ name: '', host: '', port: '', username: '', docker_host: '', tags: '' })
              }}>{t('nodes.bulkUpdate', 'Bulk Update')}</Button>
              <Button variant="ghost" size="sm" disabled={bulkValidateCreds.isPending} onClick={() => {
                bulkValidateCreds.mutate({ node_ids: selectedIds }, {
                  onSuccess: (data) => { toast('success', t('nodes.toastBulkValidateDone', { succeeded: data.succeeded, failed: data.failed })); setSelectedIds([]) },
                  onError: () => toast('error', t('nodes.toastBulkValidateFailed', 'Failed to validate credentials')),
                })
              }}>{bulkValidateCreds.isPending ? t('common.loading') : t('nodes.bulkValidate', 'Bulk Validate')}</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowBulkDelete(true)} className="text-red-500">{t('nodes.bulkDelete', 'Bulk Delete')}</Button>
              <button onClick={() => setSelectedIds([])} className="ml-auto text-xs text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 cursor-pointer">{t('nodes.clearSelection', 'Clear')}</button>
            </div>
          )}
          {isLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : nodes.length === 0 ? (
            <EmptyState
              icon={<IconNodes className="w-10 h-10" />}
              title={t('nodes.emptyTitle')}
              description={t('nodes.emptyDesc')}
              action={<Button onClick={() => setShowAddModal(true)}>{t('nodes.addNode')}</Button>}
            />
          ) : (
            <ResponsiveTable
              data={sortedNodes}
              columns={columns}
              renderMobileItem={renderMobileNode}
              keyExtractor={(n) => n.id}
              emptyMessage={t('nodes.emptyTitle')}
              onRowClick={(node) => navigate(`/nodes/${node.id}`)}
            />
          )}
          {data && data.total > pageSize && (
            <div className="px-6 py-3 border-t border-surface-200 dark:border-surface-800">
              <Pagination page={page} totalPages={Math.ceil(data.total / pageSize)} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('nodes.addNode')}>
        <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4">
          <Input label={t('nodes.node')} placeholder="prod-server-05" {...addForm.register('name')} error={addForm.formState.errors.name?.message} />
          <Input label={t('nodes.host')} placeholder="192.168.1.105" {...addForm.register('host')} error={addForm.formState.errors.host?.message} />
          <Controller
            name="port"
            control={addForm.control}
            render={({ field }) => (
              <Input label={t('nodes.port')} placeholder="22" type="number" value={String(field.value ?? 22)} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} error={addForm.formState.errors.port?.message} />
            )}
          />
          <Controller
            name="connection_type"
            control={addForm.control}
            render={({ field }) => (
              <Select
                label={t('nodes.connectionType')}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'ssh', label: 'SSH' },
                  { value: 'docker', label: 'SSH + Docker' },
                  { value: 'proxmox', label: 'Proxmox' },
                ]}
              />
            )}
          />
          <Input label={t('nodes.username', 'Username')} placeholder="root" {...addForm.register('username')} error={addForm.formState.errors.username?.message} />
          <Input label={t('nodes.password', 'Password')} type="password" placeholder="••••••" {...addForm.register('password')} error={addForm.formState.errors.password?.message} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.sshKey', 'SSH Key')}</label>
            <textarea placeholder="-----BEGIN OPENSSH PRIVATE KEY-----" {...addForm.register('ssh_key')} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" rows={4} />
            {addForm.formState.errors.ssh_key && <p className="text-xs text-red-500 mt-1">{addForm.formState.errors.ssh_key.message}</p>}
          </div>
          <Input label={t('nodes.passphrase', 'Passphrase')} type="password" placeholder="••••••" {...addForm.register('passphrase')} error={addForm.formState.errors.passphrase?.message} />
          <Input label={t('nodes.dockerHost', 'Docker Host')} placeholder="/var/run/docker.sock" {...addForm.register('docker_host')} error={addForm.formState.errors.docker_host?.message} />
          <Controller
            name="tags"
            control={addForm.control}
            render={({ field }) => (
              <Input label={t('nodes.tagsLabel', 'Tags')} placeholder="production, linux" value={(field.value ?? []).join(', ')} onChange={(e) => field.onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} error={addForm.formState.errors.tags?.message} />
            )}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={createNode.isPending}>
              {createNode.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={t('nodes.editNode', 'Edit Node')}>
        <div className="space-y-4">
          <Input label={t('nodes.node')} placeholder="prod-server-05" value={editNode.name} onChange={(e) => setEditNode({ ...editNode, name: e.target.value })} />
          <Input label={t('nodes.host')} placeholder="192.168.1.105" value={editNode.host} onChange={(e) => setEditNode({ ...editNode, host: e.target.value })} />
          <Input label={t('nodes.port')} placeholder="22" type="number" value={editNode.port} onChange={(e) => setEditNode({ ...editNode, port: e.target.value })} />
          <Select
            label={t('nodes.connectionType')}
            value={editNode.connection_type}
            onChange={(val) => setEditNode({ ...editNode, connection_type: val as 'ssh' | 'docker' | 'proxmox' })}
            options={[
              { value: 'ssh', label: 'SSH' },
              { value: 'docker', label: 'Docker' },
              { value: 'proxmox', label: 'Proxmox' },
            ]}
          />
          <Input label={t('nodes.username', 'Username')} placeholder="root" value={editNode.username} onChange={(e) => setEditNode({ ...editNode, username: e.target.value })} />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.password', 'Password')}</label>
              <Button variant="ghost" size="sm" onClick={() => toggleClear('password')} className="h-6 px-2 text-xs">
                {clearFields.password ? t('common.cancel') : t('common.clear', 'Clear')}
              </Button>
            </div>
            <Input type="password" placeholder={clearFields.password ? t('common.willBeCleared') : t('common.leaveBlank')} value={editNode.password} onChange={(e) => setEditNode({ ...editNode, password: e.target.value })} disabled={clearFields.password} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.sshKey', 'SSH Key')}</label>
              <Button variant="ghost" size="sm" onClick={() => toggleClear('ssh_key')} className="h-6 px-2 text-xs">
                {clearFields.ssh_key ? t('common.cancel') : t('common.clear', 'Clear')}
              </Button>
            </div>
            <textarea placeholder={clearFields.ssh_key ? t('common.willBeCleared') : t('common.leaveBlank')} value={editNode.ssh_key} onChange={(e) => setEditNode({ ...editNode, ssh_key: e.target.value })} disabled={clearFields.ssh_key} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed dark:bg-surface-800 dark:border-surface-700 dark:text-white" rows={4} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.passphrase', 'Passphrase')}</label>
              <Button variant="ghost" size="sm" onClick={() => toggleClear('passphrase')} className="h-6 px-2 text-xs">
                {clearFields.passphrase ? t('common.cancel') : t('common.clear', 'Clear')}
              </Button>
            </div>
            <Input type="password" placeholder={clearFields.passphrase ? t('common.willBeCleared') : t('common.leaveBlank')} value={editNode.passphrase} onChange={(e) => setEditNode({ ...editNode, passphrase: e.target.value })} disabled={clearFields.passphrase} />
          </div>
          <Input label={t('nodes.dockerHost', 'Docker Host')} placeholder="/var/run/docker.sock" value={editNode.docker_host} onChange={(e) => setEditNode({ ...editNode, docker_host: e.target.value })} />
          <Input label={t('nodes.tagsLabel', 'Tags')} placeholder="production, linux" value={editNode.tags} onChange={(e) => setEditNode({ ...editNode, tags: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditTarget(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleEdit} disabled={updateNode.isPending || !editNode.name || !editNode.host}>
              {updateNode.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!validateTarget} onClose={() => { setValidateTarget(null); setValidateResult(null) }} title={t('nodes.validate')}>
        <div className="space-y-4">
          {validateResult ? (
            <div className={`p-4 rounded-lg ${validateResult.status === 'active' ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
              <Badge variant={validateResult.status === 'active' ? 'success' : 'danger'}>{validateResult.status}</Badge>
              <p className="text-sm mt-2 text-surface-700 dark:text-surface-300">{validateResult.message}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-surface-500"><span className="animate-spin w-4 h-4 border-2 border-accent-500 border-t-transparent rounded-full" /> {t('nodes.toastValidating')}</div>
          )}
          <div className="flex justify-end"><Button variant="ghost" onClick={() => { setValidateTarget(null); setValidateResult(null) }}>{t('common.cancel')}</Button></div>
        </div>
      </Modal>

      <BulkCommandModal nodeIds={showBulkExec ? selectedIds : []} onClose={() => setShowBulkExec(false)} />

      <ConfirmDialog isOpen={showBulkDelete} onClose={() => setShowBulkDelete(false)} onConfirm={() => { bulkDeleteNodes.mutate(selectedIds, { onSuccess: (data) => { if (data.failed && data.failed > 0) { toast('warning', t('nodes.toastBulkDeletePartial', { failed: data.failed, succeeded: data.succeeded ?? data.affected })) } else { toast('success', t('nodes.toastBulkDeleteDone')) } setShowBulkDelete(false); setSelectedIds([]) }, onError: () => toast('error', t('nodes.toastDeleteFailed')) }) }} title={t('nodes.bulkDelete', 'Bulk Delete')} message={t('nodes.bulkDeleteMsg', { count: selectedIds.length })} confirmLabel={t('common.delete')} loading={bulkDeleteNodes.isPending} />

      <Modal isOpen={showBulkMetrics} onClose={() => { setShowBulkMetrics(false); setBulkMetricsResult(null) }} title={t('nodes.bulkMetrics', 'Bulk Metrics')} size="lg">
        <div className="space-y-4">
          {bulkMetricsResult ? (
            <div className="space-y-3">
              <div className="flex gap-4 text-sm">
                <span className="text-green-600 dark:text-green-400">{t('nodes.succeeded', 'Succeeded')}: {bulkMetricsResult.succeeded}</span>
                <span className="text-red-600 dark:text-red-400">{t('nodes.failed', 'Failed')}: {bulkMetricsResult.failed}</span>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {bulkMetricsResult.results.map((r) => (
                  <div key={r.node_id} className={`p-3 rounded-lg ${r.status === 'ok' ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-surface-900 dark:text-white">{r.node_name}</span>
                      <Badge variant={r.status === 'ok' ? 'success' : 'danger'}>{r.status}</Badge>
                    </div>
                    {r.metrics && (
                      <div className="mt-2 text-xs text-surface-600 dark:text-surface-400 grid grid-cols-2 gap-1">
                        <span>CPU: {r.metrics.cpu.usage_percent}%</span>
                        <span>RAM: {r.metrics.memory.percent}%</span>
                        <span>Disk: {r.metrics.disk.percent}%</span>
                        <span>Uptime since: {r.metrics.uptime_since}</span>
                      </div>
                    )}
                    {r.error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{r.error}</p>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-surface-500"><span className="animate-spin w-4 h-4 border-2 border-accent-500 border-t-transparent rounded-full" /> {t('common.loading')}</div>
          )}
          <div className="flex justify-end"><Button variant="ghost" onClick={() => { setShowBulkMetrics(false); setBulkMetricsResult(null) }}>{t('common.close')}</Button></div>
        </div>
      </Modal>

      <Modal isOpen={showBulkUpdate} onClose={() => setShowBulkUpdate(false)} title={t('nodes.bulkUpdate', 'Bulk Update')} size="lg">
        <div className="space-y-4">
          <p className="text-sm text-surface-500">{t('nodes.bulkUpdateMsg', { count: selectedIds.length })}</p>
          <Input label={t('nodes.node')} placeholder={t('common.leaveBlank', 'Leave blank to keep unchanged')} value={bulkUpdateChanges.name} onChange={(e) => setBulkUpdateChanges({ ...bulkUpdateChanges, name: e.target.value })} />
          <Input label={t('nodes.host')} placeholder={t('common.leaveBlank', 'Leave blank to keep unchanged')} value={bulkUpdateChanges.host} onChange={(e) => setBulkUpdateChanges({ ...bulkUpdateChanges, host: e.target.value })} />
          <Input label={t('nodes.port')} placeholder={t('common.leaveBlank', 'Leave blank to keep unchanged')} value={bulkUpdateChanges.port} onChange={(e) => setBulkUpdateChanges({ ...bulkUpdateChanges, port: e.target.value })} />
          <Input label={t('nodes.username', 'Username')} placeholder={t('common.leaveBlank', 'Leave blank to keep unchanged')} value={bulkUpdateChanges.username} onChange={(e) => setBulkUpdateChanges({ ...bulkUpdateChanges, username: e.target.value })} />
          <Input label={t('nodes.dockerHost', 'Docker Host')} placeholder={t('common.leaveBlank', 'Leave blank to keep unchanged')} value={bulkUpdateChanges.docker_host} onChange={(e) => setBulkUpdateChanges({ ...bulkUpdateChanges, docker_host: e.target.value })} />
          <Input label={t('nodes.tagsLabel', 'Tags')} placeholder="comma, separated" value={bulkUpdateChanges.tags} onChange={(e) => setBulkUpdateChanges({ ...bulkUpdateChanges, tags: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowBulkUpdate(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => {
              const changes: NodeUpdate = {}
              if (bulkUpdateChanges.name) changes.name = bulkUpdateChanges.name
              if (bulkUpdateChanges.host) changes.host = bulkUpdateChanges.host
              if (bulkUpdateChanges.port) changes.port = parseInt(bulkUpdateChanges.port, 10)
              if (bulkUpdateChanges.username) changes.username = bulkUpdateChanges.username
              if (bulkUpdateChanges.docker_host) changes.docker_host = bulkUpdateChanges.docker_host
              if (bulkUpdateChanges.tags) changes.tags = bulkUpdateChanges.tags.split(',').map((s) => s.trim()).filter(Boolean)
              bulkUpdateNodes.mutate({ node_ids: selectedIds, changes }, {
                onSuccess: (data) => { toast('success', t('nodes.toastBulkUpdateDone', { succeeded: data.succeeded, failed: data.failed })); setShowBulkUpdate(false); setSelectedIds([]) },
                onError: () => toast('error', t('nodes.toastBulkUpdateFailed', 'Failed to update nodes')),
              })
            }} disabled={bulkUpdateNodes.isPending}>{bulkUpdateNodes.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={t('nodes.deleteTitle')} message={t('nodes.deleteMsg', { name: deleteTarget?.name })} confirmLabel={t('common.delete')} loading={deleteNode.isPending} />

      <NodeCommandModal node={execTarget} onClose={() => setExecTarget(null)} />

      <NodeScriptModal node={scriptTarget} onClose={() => setScriptTarget(null)} />
    </div>
  )
}
