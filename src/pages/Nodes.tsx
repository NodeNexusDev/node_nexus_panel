import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
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
import {
  IconNodes,
  IconCommands,
  IconScripts,
  IconCheckCircle,
  IconXCircle,
  IconChart,
  IconClock,
  IconActivity,
  IconTag,
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
  useBulkExecuteNodes,
  useBulkTagsAdd,
  useBulkTagsRemove,
  useValidateCredentials,
} from '../hooks/useNodes'
import { useToast } from '../components/ui/useToast'
import { useSort } from '../hooks/useSort'
import { TagBadge } from '../components/ui/TagBadge'
import { nodeStatusVariant } from '../lib/variants'
import type { Node, NodeStatus } from '../api/types'
import type { Column } from '../components/ui/table-types'

type SortKey = 'name' | 'host' | 'status' | 'connection_type'

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
  const [tagFilter, setTagFilter] = useState('')
  const [page, setPage] = useState(1)
  const { sort, toggle: toggleSort } = useSort<SortKey>()
  const pageSize = 20

  const { data, isLoading } = useNodes({
    page,
    size: pageSize,
    search: search || undefined,
    status: statusFilter.size > 0 ? Array.from(statusFilter).join(',') : undefined,
    tags: tagFilter || undefined,
  }, { refetchInterval: 30_000 })
  const { data: allTags } = useNodeTags()
  const createNode = useCreateNode()
  const updateNode = useUpdateNode()
  const deleteNode = useDeleteNode()
  const checkNode = useCheckNode()
  const bulkCheck = useBulkCheck()
  const bulkDeleteNodes = useBulkDeleteNodes()
  const bulkExecuteNodes = useBulkExecuteNodes()
  const validateCreds = useValidateCredentials()

  const [showAddModal, setShowAddModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Node | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const defaultNode = { name: '', host: '', port: '22', connection_type: 'ssh' as 'ssh' | 'docker' | 'proxmox', username: '', password: '', ssh_key: '', passphrase: '', docker_host: '', tags: '' }
  const [newNode, setNewNode] = useState(defaultNode)
  const [editNode, setEditNode] = useState({ name: '', host: '', port: '22', connection_type: 'ssh' as 'ssh' | 'docker' | 'proxmox', username: '', password: '', ssh_key: '', passphrase: '', docker_host: '', tags: '' })

  const [execTarget, setExecTarget] = useState<Node | null>(null)
  const [scriptTarget, setScriptTarget] = useState<Node | null>(null)
  const [validateTarget, setValidateTarget] = useState<Node | null>(null)
  const [validateResult, setValidateResult] = useState<{ status: string; message: string } | null>(null)
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [showBulkExec, setShowBulkExec] = useState(false)
  const [bulkExecCmd, setBulkExecCmd] = useState('')

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkTag, setBulkTag] = useState('')
  const [showBulkTag, setShowBulkTag] = useState(false)
  const [showBulkTagRemove, setShowBulkTagRemove] = useState(false)
  const [bulkRemoveTag, setBulkRemoveTag] = useState('')

  const nodes = data?.items || []
  const allSelected = nodes.length > 0 && nodes.every((n) => selectedIds.includes(n.id))

  const sortedNodes = sort
    ? [...nodes].sort((a, b) => {
        const dir = sort.dir === 'asc' ? 1 : -1
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
  }

  const handleValidate = (node: Node) => {
    setValidateTarget(node)
    setValidateResult(null)
    validateCreds.mutate(
      { host: node.host, port: node.port, connection_type: node.connection_type, username: node.username || undefined, passphrase: undefined },
      { onSuccess: (r) => setValidateResult(r), onError: () => toast('error', t('nodes.toastValidateFailed')) },
    )
  }

  const nodeMenu = (node: Node): DropdownMenuItem[] => [
    { key: 'edit', label: t('common.edit'), onClick: () => openEdit(node) },
    { key: 'validate', label: t('nodes.validate'), onClick: () => handleValidate(node) },
    { key: 'sep-1', label: '', onClick: () => {}, separator: true },
    { key: 'metrics', label: t('nodes.metrics', 'Metrics'), icon: <IconActivity className="w-4 h-4" />, onClick: () => navigate(`/nodes/${node.id}?tab=metrics`) },
    { key: 'stats', label: t('nodes.stats', 'Stats'), icon: <IconChart className="w-4 h-4" />, onClick: () => navigate(`/nodes/${node.id}?tab=stats`) },
    { key: 'status-history', label: t('nodes.statusHistory', 'Status History'), icon: <IconClock className="w-4 h-4" />, onClick: () => navigate(`/nodes/${node.id}?tab=status-history`) },
    { key: 'command-history', label: t('nodes.cmdHistory', 'Command History'), icon: <IconCommands className="w-4 h-4" />, onClick: () => navigate(`/nodes/${node.id}?tab=command-history`) },
    { key: 'tags', label: t('nodes.manageTags', 'Manage Tags'), icon: <IconTag className="w-4 h-4" />, onClick: () => navigate(`/nodes/${node.id}?tab=tags`) },
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
          aria-label="Select all"
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
      header: t('nodes.tags'),
      render: (node) => (
        <div className="flex flex-wrap gap-1">
          {node.tags.length > 0 ? node.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} onClick={() => setTagFilter(tag)} />
          )) : <span className="text-surface-400">—</span>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('nodes.actions'),
      render: (node) => (
        <div className="flex items-center gap-1">
          <FavoriteButton targetType="node" targetId={node.id} size="sm" />
          <Tooltip content={t('nodes.checkNode')}>
            <Button variant="ghost" size="sm" className="px-2" onClick={(e) => { e.stopPropagation(); checkNode.mutate(node.id, { onSuccess: () => toast('success', t('nodes.toastNodeChecked')), onError: () => toast('error', t('nodes.toastCheckFailed')) }) }}>
              <IconCheckCircle className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content={t('nodes.execCommand')}>
            <Button variant="ghost" size="sm" className="px-2" onClick={(e) => { e.stopPropagation(); setExecTarget(node) }}>
              <IconCommands className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content={t('nodes.runScript')}>
            <Button variant="ghost" size="sm" className="px-2" onClick={(e) => { e.stopPropagation(); setScriptTarget(node) }}>
              <IconScripts className="w-4 h-4" />
            </Button>
          </Tooltip>
          <DropdownMenu items={nodeMenu(node)} ariaLabel={`${node.name} actions`} />
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
          <TagBadge key={tag} tag={tag} onClick={() => setTagFilter(tag)} />
        )) : <span className="text-surface-400">—</span>}
      </div>
      <div className="flex items-center gap-1">
        <FavoriteButton targetType="node" targetId={node.id} size="sm" />
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

  const handleAdd = () => {
    if (!newNode.name.trim()) { toast('error', t('nodes.toastNameRequired', 'Name is required')); return }
    const port = parseInt(String(newNode.port), 10)
    if (isNaN(port) || port < 1 || port > 65535) { toast('error', t('nodes.toastInvalidPort', 'Invalid port number')); return }
    createNode.mutate(
      {
        name: newNode.name,
        host: newNode.host,
        port,
        connection_type: newNode.connection_type,
        username: newNode.username || undefined,
        password: newNode.password || undefined,
        ssh_key: newNode.ssh_key || undefined,
        passphrase: newNode.passphrase || undefined,
        docker_host: newNode.docker_host || undefined,
        tags: newNode.tags ? newNode.tags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      },
      {
        onSuccess: () => { toast('success', t('nodes.toastAdded', { name: newNode.name })); setShowAddModal(false); setNewNode(defaultNode) },
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
          password: toNull(editNode.password),
          ssh_key: toNull(editNode.ssh_key),
          passphrase: toNull(editNode.passphrase),
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
            <button onClick={() => setStatusFilter(new Set())} className="px-2 py-1.5 text-xs text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 cursor-pointer">×</button>
          )}
        </div>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white"
        >
          <option value="">{t('nodes.allTags', 'All tags')}</option>
          {allTags?.map((tag) => (<option key={tag} value={tag}>{tag}</option>))}
        </select>
      </FilterBar>

      <Card hover className="stagger-item">
        <CardContent className="p-0">
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-accent-50 dark:bg-accent-900/20 border-b border-accent-200 dark:border-accent-800">
              <span className="text-sm font-medium text-accent-700 dark:text-accent-300">{t('nodes.selected', { count: selectedIds.length })}</span>
              <Button variant="ghost" size="sm" onClick={() => setShowBulkTag(true)}>{t('nodes.bulkTags')}</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowBulkTagRemove(true)}>{t('nodes.bulkRemoveTags', 'Bulk Remove Tag')}</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowBulkExec(true)}>{t('nodes.bulkExec', 'Bulk Exec')}</Button>
              <Button variant="ghost" size="sm" disabled={bulkCheck.isPending} onClick={() => {
                bulkCheck.mutate(selectedIds, {
                  onSuccess: () => { toast('success', t('nodes.toastBulkCheckDone')); setSelectedIds([]) },
                  onError: () => toast('error', t('nodes.toastBulkCheckFailed')),
                })
              }}>{bulkCheck.isPending ? t('common.loading') : t('nodes.bulkCheck')}</Button>
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
        <div className="space-y-4">
          <Input label={t('nodes.node')} placeholder="prod-server-05" value={newNode.name} onChange={(e) => setNewNode({ ...newNode, name: e.target.value })} />
          <Input label={t('nodes.host')} placeholder="192.168.1.105" value={newNode.host} onChange={(e) => setNewNode({ ...newNode, host: e.target.value })} />
          <Input label={t('nodes.port')} placeholder="22" type="number" value={newNode.port} onChange={(e) => setNewNode({ ...newNode, port: e.target.value })} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.connectionType')}</label>
            <select value={newNode.connection_type} onChange={(e) => setNewNode({ ...newNode, connection_type: e.target.value as 'ssh' | 'docker' | 'proxmox' })} className="w-full px-4 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white">
              <option value="ssh">SSH</option>
              <option value="docker">Docker</option>
              <option value="proxmox">Proxmox</option>
            </select>
          </div>
          <Input label={t('nodes.username', 'Username')} placeholder="root" value={newNode.username} onChange={(e) => setNewNode({ ...newNode, username: e.target.value })} />
          <Input label={t('nodes.password', 'Password')} type="password" placeholder="••••••" value={newNode.password} onChange={(e) => setNewNode({ ...newNode, password: e.target.value })} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.sshKey', 'SSH Key')}</label>
            <textarea placeholder="-----BEGIN OPENSSH PRIVATE KEY-----" value={newNode.ssh_key} onChange={(e) => setNewNode({ ...newNode, ssh_key: e.target.value })} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" rows={4} />
          </div>
          <Input label={t('nodes.passphrase', 'Passphrase')} type="password" placeholder="••••••" value={newNode.passphrase} onChange={(e) => setNewNode({ ...newNode, passphrase: e.target.value })} />
          <Input label={t('nodes.dockerHost', 'Docker Host')} placeholder="/var/run/docker.sock" value={newNode.docker_host} onChange={(e) => setNewNode({ ...newNode, docker_host: e.target.value })} />
          <Input label={t('nodes.tagsLabel', 'Tags')} placeholder="production, linux" value={newNode.tags} onChange={(e) => setNewNode({ ...newNode, tags: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleAdd} disabled={createNode.isPending || !newNode.name || !newNode.host}>
              {createNode.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={t('nodes.editNode', 'Edit Node')}>
        <div className="space-y-4">
          <Input label={t('nodes.node')} placeholder="prod-server-05" value={editNode.name} onChange={(e) => setEditNode({ ...editNode, name: e.target.value })} />
          <Input label={t('nodes.host')} placeholder="192.168.1.105" value={editNode.host} onChange={(e) => setEditNode({ ...editNode, host: e.target.value })} />
          <Input label={t('nodes.port')} placeholder="22" type="number" value={editNode.port} onChange={(e) => setEditNode({ ...editNode, port: e.target.value })} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.connectionType')}</label>
            <select value={editNode.connection_type} onChange={(e) => setEditNode({ ...editNode, connection_type: e.target.value as 'ssh' | 'docker' | 'proxmox' })} className="w-full px-4 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white">
              <option value="ssh">SSH</option>
              <option value="docker">Docker</option>
              <option value="proxmox">Proxmox</option>
            </select>
          </div>
          <Input label={t('nodes.username', 'Username')} placeholder="root" value={editNode.username} onChange={(e) => setEditNode({ ...editNode, username: e.target.value })} />
          <Input label={t('nodes.password', 'Password')} type="password" placeholder="Leave blank to keep unchanged" value={editNode.password} onChange={(e) => setEditNode({ ...editNode, password: e.target.value })} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.sshKey', 'SSH Key')}</label>
            <textarea placeholder={t('common.leaveBlank')} value={editNode.ssh_key} onChange={(e) => setEditNode({ ...editNode, ssh_key: e.target.value })} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" rows={4} />
          </div>
          <Input label={t('nodes.passphrase', 'Passphrase')} type="password" placeholder={t('common.leaveBlank')} value={editNode.passphrase} onChange={(e) => setEditNode({ ...editNode, passphrase: e.target.value })} />
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

      <BulkTagsModal isOpen={showBulkTag} onClose={() => { setShowBulkTag(false); setBulkTag('') }} bulkTag={bulkTag} setBulkTag={setBulkTag} selectedIds={selectedIds} onDone={() => { setShowBulkTag(false); setBulkTag(''); setSelectedIds([]) }} />

      <BulkTagsRemoveModal isOpen={showBulkTagRemove} onClose={() => { setShowBulkTagRemove(false); setBulkRemoveTag('') }} bulkTag={bulkRemoveTag} setBulkTag={setBulkRemoveTag} selectedIds={selectedIds} onDone={() => { setShowBulkTagRemove(false); setBulkRemoveTag(''); setSelectedIds([]) }} />

      <Modal isOpen={showBulkExec} onClose={() => { setShowBulkExec(false); setBulkExecCmd('') }} title={t('nodes.bulkExec', 'Bulk Execute')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-500">{t('nodes.bulkExecMsg', { count: selectedIds.length })}</p>
          <Input label={t('nodes.command')} placeholder="uptime" value={bulkExecCmd} onChange={(e) => setBulkExecCmd(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setShowBulkExec(false); setBulkExecCmd('') }}>{t('common.cancel')}</Button>
            <Button onClick={() => { if (bulkExecCmd) { bulkExecuteNodes.mutate({ command: bulkExecCmd, node_ids: selectedIds }, { onSuccess: () => { toast('success', t('nodes.toastBulkExecDone')); setShowBulkExec(false); setBulkExecCmd(''); setSelectedIds([]) }, onError: () => toast('error', t('nodes.toastExecFailed')) }) } }} disabled={!bulkExecCmd || bulkExecuteNodes.isPending}>{t('nodes.execCommand')}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={showBulkDelete} onClose={() => setShowBulkDelete(false)} onConfirm={() => { bulkDeleteNodes.mutate(selectedIds, { onSuccess: () => { toast('success', t('nodes.toastBulkDeleteDone')); setShowBulkDelete(false); setSelectedIds([]) }, onError: () => toast('error', t('nodes.toastDeleteFailed')) }) }} title={t('nodes.bulkDelete', 'Bulk Delete')} message={t('nodes.bulkDeleteMsg', { count: selectedIds.length })} confirmLabel={t('common.delete')} loading={bulkDeleteNodes.isPending} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={t('nodes.deleteTitle')} message={t('nodes.deleteMsg', { name: deleteTarget?.name })} confirmLabel={t('common.delete')} loading={deleteNode.isPending} />

      <NodeCommandModal node={execTarget} onClose={() => setExecTarget(null)} />

      <NodeScriptModal node={scriptTarget} onClose={() => setScriptTarget(null)} />
    </div>
  )
}

function BulkTagsModal({ isOpen, onClose, bulkTag, setBulkTag, selectedIds, onDone }: { isOpen: boolean; onClose: () => void; bulkTag: string; setBulkTag: (v: string) => void; selectedIds: string[]; onDone: () => void }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const bulkTagsAdd = useBulkTagsAdd()
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('nodes.bulkTags')}>
      <div className="space-y-4">
        <Input label={t('nodes.tag')} placeholder="new-tag" value={bulkTag} onChange={(e) => setBulkTag(e.target.value)} />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={() => { if (bulkTag && selectedIds.length) { bulkTagsAdd.mutate({ node_ids: selectedIds, tags: [bulkTag] }, { onSuccess: () => { toast('success', t('nodes.toastTagsAdded')); onDone() }, onError: () => toast('error', t('nodes.toastBulkTagsFailed')) }) } }} disabled={!bulkTag || !selectedIds.length || bulkTagsAdd.isPending}>{t('nodes.addTag')}</Button>
        </div>
      </div>
    </Modal>
  )
}

function BulkTagsRemoveModal({ isOpen, onClose, bulkTag, setBulkTag, selectedIds, onDone }: { isOpen: boolean; onClose: () => void; bulkTag: string; setBulkTag: (v: string) => void; selectedIds: string[]; onDone: () => void }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const bulkTagsRemove = useBulkTagsRemove()
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('nodes.bulkRemoveTags', 'Bulk Remove Tag')}>
      <div className="space-y-4">
        <Input label={t('nodes.tag')} placeholder="tag-to-remove" value={bulkTag} onChange={(e) => setBulkTag(e.target.value)} />
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="danger"
            onClick={() => { if (bulkTag && selectedIds.length) { bulkTagsRemove.mutate({ node_ids: selectedIds, tags: [bulkTag] }, { onSuccess: () => { toast('success', t('nodes.toastTagsRemoved', 'Tags removed')); onDone() }, onError: () => toast('error', t('nodes.toastBulkTagsRemoveFailed')) }) } }}
            disabled={!bulkTag || !selectedIds.length || bulkTagsRemove.isPending}
          >
            {t('nodes.removeTag', 'Remove Tag')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
