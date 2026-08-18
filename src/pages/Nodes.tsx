import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Tooltip } from '../components/ui/Tooltip'
import { DragDropList } from '../components/ui/DragDropList'
import { ResponsiveTable } from '../components/ui/ResponsiveTable'
import { TableSkeleton } from '../components/ui/Skeleton'
import { IconNodes, IconGrip, IconCommands, IconCheckCircle, IconSearch } from '../components/ui/Icons'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import {
  useNodes,
  useCreateNode,
  useUpdateNode,
  useDeleteNode,
  useCheckNode,
  useBulkCheck,
  useExecuteNode,
  useNodeStats,
  useNodeStatusHistory,
  useNodeMetrics,
  useNodeCommandHistory,
  useNodeTags,
  useBulkDeleteNodes,
  useBulkExecuteNodes,
  useBulkTagsAdd,
  useRetryNodeCommand,
  useValidateCredentials,
  useNode,
  useAddNodeTag,
  useRemoveNodeTag,
} from '../hooks/useNodes'
import { useToast } from '../components/ui/useToast'
import type { Node } from '../api/types'
import type { Column } from '../components/ui/table-types'

export function Nodes() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set())
  const [tagFilter, setTagFilter] = useState('')
  const { data, isLoading } = useNodes({ search: search || undefined, status: statusFilter.size > 0 ? Array.from(statusFilter).join(',') : undefined, tags: tagFilter || undefined })
  const { data: allTags } = useNodeTags()
  const createNode = useCreateNode()
  const updateNode = useUpdateNode()
  const deleteNode = useDeleteNode()
  const checkNode = useCheckNode()
  const bulkCheck = useBulkCheck()
  const bulkDeleteNodes = useBulkDeleteNodes()
  const bulkExecuteNodes = useBulkExecuteNodes()
  const executeNode = useExecuteNode()
  const validateCreds = useValidateCredentials()
  const retryNodeCommand = useRetryNodeCommand()

  const [showAddModal, setShowAddModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Node | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const defaultNode = { name: '', host: '', port: '22', connection_type: 'ssh' as 'ssh' | 'docker' | 'proxmox', username: '', docker_host: '', tags: '' }
  const [newNode, setNewNode] = useState(defaultNode)
  const [editNode, setEditNode] = useState({ name: '', host: '', port: '22', connection_type: 'ssh' as 'ssh' | 'docker' | 'proxmox', username: '', docker_host: '', tags: '' })

  const [statsNodeId, setStatsNodeId] = useState<string | null>(null)
  const [historyNodeId, setHistoryNodeId] = useState<string | null>(null)
  const [metricsNodeId, setMetricsNodeId] = useState<string | null>(null)
  const [cmdHistoryNodeId, setCmdHistoryNodeId] = useState<string | null>(null)
  const [execNodeId, setExecNodeId] = useState<string | null>(null)
  const [execCmd, setExecCmd] = useState('')
  const [execTimeout, setExecTimeout] = useState('')
  const [validateTarget, setValidateTarget] = useState<Node | null>(null)
  const [validateResult, setValidateResult] = useState<{ status: string; message: string } | null>(null)
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [showBulkExec, setShowBulkExec] = useState(false)
  const [bulkExecCmd, setBulkExecCmd] = useState('')
  const [tagManageNodeId, setTagManageNodeId] = useState<string | null>(null)
  const [newTagInput, setNewTagInput] = useState('')

  const nodes = data?.items || []
  const [orderedNodes, setOrderedNodes] = useState<Node[]>([])
  const displayNodes = orderedNodes.length > 0 ? orderedNodes : nodes
  const [dragMode, setDragMode] = useState(false)

  useEffect(() => {
    if (orderedNodes.length > 0 && nodes.length > 0) {
      const nodeIds = new Set(nodes.map((n) => n.id))
      const validOrdered = orderedNodes.filter((n) => nodeIds.has(n.id))
      if (validOrdered.length !== orderedNodes.length) {
        setOrderedNodes(validOrdered)
      }
    }
  }, [nodes, orderedNodes])

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkTag, setBulkTag] = useState('')
  const [showBulkTag, setShowBulkTag] = useState(false)

  const handleReorder = useCallback((reordered: Node[]) => {
    setOrderedNodes(reordered)
  }, [])

  const statusVariant = (status: Node['status']) => {
    switch (status) {
      case 'active': return 'success'
      case 'unreachable': return 'warning'
      case 'error': return 'danger'
      default: return 'default'
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const openEdit = (node: Node) => {
    setEditTarget(node)
    setEditNode({
      name: node.name,
      host: node.host,
      port: String(node.port),
      connection_type: node.connection_type,
      username: node.username || '',
      docker_host: node.docker_host || '',
      tags: node.tags.join(', '),
    })
  }

  const columns: Column<Node>[] = [
    {
      key: 'select',
      header: '',
      render: (node) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(node.id)}
          onChange={() => toggleSelect(node.id)}
          className="w-4 h-4 rounded border-surface-300 dark:border-surface-600"
        />
      ),
    },
    {
      key: 'node',
      header: t('nodes.node'),
      render: (node) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/nodes/${node.id}`)}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            node.status === 'active'
              ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
          }`}>
            <IconNodes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-900 dark:text-white">{node.name}</p>
            <p className="text-xs text-surface-500 dark:text-surface-500 font-mono">{node.host}:{node.port}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('nodes.status'),
      render: (node) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${node.status === 'active' ? 'bg-green-500 status-online' : 'bg-red-500'}`} />
          <Badge variant={statusVariant(node.status)}>{node.status}</Badge>
        </div>
      ),
    },
    {
      key: 'type',
      header: t('nodes.type'),
      render: (node) => <span className="text-sm text-surface-600 dark:text-surface-300">{node.connection_type}</span>,
    },
    {
      key: 'tags',
      header: t('nodes.tags'),
      render: (node) => (
        <div className="flex flex-wrap gap-1">
          {node.tags.map((tag) => (
            <Badge key={tag} variant="default">{tag}</Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('nodes.actions'),
      render: (node) => (
        <div className="flex items-center gap-1 flex-wrap">
          <FavoriteButton targetType="node" targetId={node.id} size="sm" />
          <Tooltip content={t('nodes.stats')}>
            <Button variant="ghost" size="sm" onClick={() => setStatsNodeId(statsNodeId === node.id ? null : node.id)}>
              <IconSearch className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content={t('nodes.statusHistory')}>
            <Button variant="ghost" size="sm" onClick={() => setHistoryNodeId(node.id)}>
              <IconCheckCircle className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content={t('common.edit')}>
            <Button variant="ghost" size="sm" onClick={() => openEdit(node)}>
              {t('common.edit')}
            </Button>
          </Tooltip>
          <Tooltip content={t('nodes.checkNode')}>
            <Button variant="ghost" size="sm" onClick={() => checkNode.mutate(node.id, { onSuccess: () => toast('success', t('nodes.toastNodeChecked')), onError: () => toast('error', t('nodes.toastCheckFailed')) })}>
              <IconCheckCircle className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content={t('nodes.validate')}>
            <Button variant="ghost" size="sm" onClick={() => { setValidateTarget(node); setValidateResult(null); validateCreds.mutate({ host: node.host, port: node.port, connection_type: node.connection_type, username: node.username || undefined }, { onSuccess: (r) => setValidateResult(r), onError: () => toast('error', t('nodes.toastValidateFailed')) }) }}>
              {t('nodes.validate')}
            </Button>
          </Tooltip>
          <Tooltip content={t('nodes.execCommand')}>
            <Button variant="ghost" size="sm" onClick={() => { setExecNodeId(node.id); setExecCmd('') }}>
              <IconCommands className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content={t('common.delete')}>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: node.id, name: node.name })} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
              {t('common.delete')}
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ]

  const renderMobileNode = (node: Node) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/nodes/${node.id}`)}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            node.status === 'active'
              ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
          }`}>
            <IconNodes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-900 dark:text-white">{node.name}</p>
            <p className="text-xs text-surface-500 dark:text-surface-500 font-mono">{node.host}:{node.port}</p>
          </div>
        </div>
        <Badge variant={statusVariant(node.status)}>{node.status}</Badge>
      </div>
      <div className="flex flex-wrap gap-1">
        {node.tags.map((tag) => (
          <Badge key={tag} variant="default">{tag}</Badge>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <FavoriteButton targetType="node" targetId={node.id} size="sm" />
        <Button variant="ghost" size="sm" onClick={() => setStatsNodeId(statsNodeId === node.id ? null : node.id)}>{t('nodes.stats')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setHistoryNodeId(node.id)}>{t('nodes.statusHistory')}</Button>
        <Button variant="ghost" size="sm" onClick={() => openEdit(node)}>{t('common.edit')}</Button>
        <Button variant="ghost" size="sm" onClick={() => { setExecNodeId(node.id); setExecCmd('') }}>
          <IconCommands className="w-4 h-4 mr-1" /> {t('nodes.execCommand')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: node.id, name: node.name })} className="text-red-500">
          {t('common.delete')}
        </Button>
      </div>
    </div>
  )

  const renderNodeRow = (node: Node, index: number) => (
    <tr key={node.id} className="table-row-hover stagger-item" style={{ animationDelay: `${index * 50}ms` }}>
      {dragMode && (
        <td className="px-2 py-4 w-8">
          <div className="flex items-center justify-center text-surface-400 dark:text-surface-500">
            <IconGrip className="w-4 h-4" />
          </div>
        </td>
      )}
      <td className="px-6 py-4">
        <input type="checkbox" checked={selectedIds.includes(node.id)} onChange={() => toggleSelect(node.id)} className="w-4 h-4 rounded border-surface-300 dark:border-surface-600" />
      </td>
      <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/nodes/${node.id}`)}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${node.status === 'active' ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
            <IconNodes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-900 dark:text-white">{node.name}</p>
            <p className="text-xs text-surface-500 dark:text-surface-500 font-mono">{node.host}:{node.port}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${node.status === 'active' ? 'bg-green-500 status-online' : 'bg-red-500'}`} />
          <Badge variant={statusVariant(node.status)}>{node.status}</Badge>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{node.connection_type}</td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {node.tags.map((tag) => (<Badge key={tag} variant="default">{tag}</Badge>))}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1 flex-wrap">
          <FavoriteButton targetType="node" targetId={node.id} size="sm" />
          <Tooltip content={t('nodes.stats')}><Button variant="ghost" size="sm" onClick={() => setStatsNodeId(statsNodeId === node.id ? null : node.id)}><IconSearch className="w-4 h-4" /></Button></Tooltip>
          <Tooltip content={t('nodes.statusHistory')}><Button variant="ghost" size="sm" onClick={() => setHistoryNodeId(node.id)}><IconCheckCircle className="w-4 h-4" /></Button></Tooltip>
          <Tooltip content={t('nodes.metrics', 'Metrics')}><Button variant="ghost" size="sm" onClick={() => setMetricsNodeId(node.id)}>M</Button></Tooltip>
          <Tooltip content={t('nodes.cmdHistory', 'Command History')}><Button variant="ghost" size="sm" onClick={() => setCmdHistoryNodeId(node.id)}>CH</Button></Tooltip>
          <Tooltip content={t('nodes.manageTags', 'Manage Tags')}><Button variant="ghost" size="sm" onClick={() => { setTagManageNodeId(node.id); setNewTagInput('') }}>T</Button></Tooltip>
          <Tooltip content={t('common.edit')}><Button variant="ghost" size="sm" onClick={() => openEdit(node)}>{t('common.edit')}</Button></Tooltip>
          <Tooltip content={t('nodes.execCommand')}><Button variant="ghost" size="sm" onClick={() => { setExecNodeId(node.id); setExecCmd(''); setExecTimeout('') }}><IconCommands className="w-4 h-4" /></Button></Tooltip>
          <Tooltip content={t('common.delete')}><Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: node.id, name: node.name })} className="text-red-500 hover:text-red-600">{t('common.delete')}</Button></Tooltip>
        </div>
      </td>
    </tr>
  )

  const handleAdd = () => {
    createNode.mutate(
      {
        name: newNode.name,
        host: newNode.host,
        port: Number(newNode.port),
        connection_type: newNode.connection_type,
        username: newNode.username || undefined,
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
    updateNode.mutate(
      {
        id: editTarget.id,
        data: {
          name: editNode.name,
          host: editNode.host,
          port: Number(editNode.port),
          connection_type: editNode.connection_type,
          username: editNode.username || undefined,
          docker_host: editNode.docker_host || undefined,
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

  const selectedNode = nodes.find((n) => n.id === statsNodeId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('nodes.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{t('nodes.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-surface-500">{selectedIds.length} selected</span>
              <Button variant="ghost" size="sm" onClick={() => setShowBulkTag(true)}>{t('nodes.bulkTags')}</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowBulkExec(true)}>{t('nodes.bulkExec', 'Bulk Exec')}</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowBulkDelete(true)} className="text-red-500">{t('nodes.bulkDelete', 'Bulk Delete')}</Button>
              <Button variant="ghost" size="sm" disabled={bulkCheck.isPending} onClick={() => {
                bulkCheck.mutate(selectedIds, {
                  onSuccess: () => { toast('success', t('nodes.toastBulkCheckDone')); setSelectedIds([]) },
                  onError: () => toast('error', t('nodes.toastBulkCheckDone')),
                })
              }}>{bulkCheck.isPending ? t('common.loading') : t('nodes.bulkCheck')}</Button>
            </div>
          )}
          {nodes.length > 1 && (
            <Tooltip content={dragMode ? t('nodes.exitReorder') : t('nodes.reorder')}>
              <Button variant={dragMode ? 'secondary' : 'ghost'} size="sm" onClick={() => { setDragMode(!dragMode); if (dragMode) setOrderedNodes([]) }}>
                <IconGrip className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
          <Button onClick={() => setShowAddModal(true)}>{t('nodes.addNode')}</Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder={t('nodes.searchPlaceholder', 'Search nodes...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>
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
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
            <button onClick={() => setStatusFilter(new Set())} className="px-2 py-1.5 text-xs text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200">×</button>
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
      </div>

      {statsNodeId && selectedNode && (
        <NodeStatsPanel nodeId={statsNodeId} node={selectedNode} onClose={() => setStatsNodeId(null)} />
      )}

      <Card hover className="stagger-item">
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : nodes.length === 0 ? (
            <EmptyState
              icon={<IconNodes className="w-10 h-10" />}
              title={t('nodes.emptyTitle')}
              description={t('nodes.emptyDesc')}
              action={<Button onClick={() => setShowAddModal(true)}>{t('nodes.addNode')}</Button>}
            />
          ) : dragMode ? (
            <div className="overflow-x-auto">
              <table className="w-full table-zebra">
                <thead className="table-sticky">
                  <tr className="border-b border-surface-200 dark:border-surface-800">
                    <th className="px-2 py-3 w-8" />
                    <th className="px-6 py-3 w-10" />
                    {[t('nodes.node'), t('nodes.status'), t('nodes.type'), t('nodes.tags'), t('nodes.actions')].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                  <DragDropList items={displayNodes} onReorder={handleReorder} keyExtractor={(n) => n.id} renderItem={(node, index) => renderNodeRow(node, index)} />
                </tbody>
              </table>
            </div>
          ) : (
            <ResponsiveTable data={displayNodes} columns={columns} renderMobileItem={renderMobileNode} keyExtractor={(n) => n.id} emptyMessage={t('nodes.emptyTitle')} />
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

      <Modal isOpen={!!execNodeId} onClose={() => setExecNodeId(null)} title={t('nodes.execCommand')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-500">{t('nodes.execOnNode', { name: nodes.find((n) => n.id === execNodeId)?.name })}</p>
          <Input label="Command" placeholder="uptime" value={execCmd} onChange={(e) => setExecCmd(e.target.value)} />
          <Input label={t('nodes.timeout', 'Timeout (seconds)')} placeholder="30" type="number" value={execTimeout} onChange={(e) => setExecTimeout(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setExecNodeId(null)}>{t('common.cancel')}</Button>
            <Button onClick={() => {
              if (execNodeId && execCmd) {
                executeNode.mutate(
                  { id: execNodeId, command: execCmd, timeout: execTimeout ? Number(execTimeout) : undefined },
                  {
                    onSuccess: (r) => { toast('success', `Exit ${r.exit_code}: ${r.stdout.slice(0, 100)}`); setExecNodeId(null) },
                    onError: () => toast('error', t('nodes.toastExecFailed')),
                  },
                )
              }
            }} disabled={!execCmd || !execNodeId || executeNode.isPending}>{executeNode.isPending ? t('common.loading') : t('nodes.execCommand')}</Button>
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

      <Modal isOpen={!!historyNodeId} onClose={() => setHistoryNodeId(null)} title={t('nodes.statusHistory')}>
        <NodeStatusHistoryContent nodeId={historyNodeId || ''} />
      </Modal>

      <BulkTagsModal isOpen={showBulkTag} onClose={() => { setShowBulkTag(false); setBulkTag('') }} bulkTag={bulkTag} setBulkTag={setBulkTag} selectedIds={selectedIds} onDone={() => { setShowBulkTag(false); setBulkTag(''); setSelectedIds([]) }} />

      <Modal isOpen={showBulkExec} onClose={() => { setShowBulkExec(false); setBulkExecCmd('') }} title={t('nodes.bulkExec', 'Bulk Execute')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-500">{t('nodes.bulkExecMsg', { count: selectedIds.length })}</p>
          <Input label="Command" placeholder="uptime" value={bulkExecCmd} onChange={(e) => setBulkExecCmd(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setShowBulkExec(false); setBulkExecCmd('') }}>{t('common.cancel')}</Button>
            <Button onClick={() => { if (bulkExecCmd) { bulkExecuteNodes.mutate({ command: bulkExecCmd, node_ids: selectedIds }, { onSuccess: () => { toast('success', t('nodes.toastBulkExecDone')); setShowBulkExec(false); setBulkExecCmd(''); setSelectedIds([]) } }) } }} disabled={!bulkExecCmd || bulkExecuteNodes.isPending}>{t('nodes.execCommand')}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={showBulkDelete} onClose={() => setShowBulkDelete(false)} onConfirm={() => { bulkDeleteNodes.mutate(selectedIds, { onSuccess: () => { toast('success', t('nodes.toastBulkDeleteDone')); setShowBulkDelete(false); setSelectedIds([]) } }) }} title={t('nodes.bulkDelete', 'Bulk Delete')} message={t('nodes.bulkDeleteMsg', { count: selectedIds.length })} confirmLabel={t('common.delete')} loading={bulkDeleteNodes.isPending} />

      <Modal isOpen={!!metricsNodeId} onClose={() => setMetricsNodeId(null)} title={t('nodes.metrics', 'Metrics')}>
        {metricsNodeId && <NodeMetricsContent nodeId={metricsNodeId} />}
      </Modal>

      <Modal isOpen={!!cmdHistoryNodeId} onClose={() => setCmdHistoryNodeId(null)} title={t('nodes.cmdHistory', 'Command History')} size="lg">
        {cmdHistoryNodeId && <NodeCommandHistoryContent nodeId={cmdHistoryNodeId} onRetry={(executionId) => retryNodeCommand.mutate({ nodeId: cmdHistoryNodeId, executionId }, { onSuccess: () => toast('success', t('nodes.toastRetried')) })} />}
      </Modal>

      <Modal isOpen={!!tagManageNodeId} onClose={() => setTagManageNodeId(null)} title={t('nodes.manageTags', 'Manage Tags')}>
        {tagManageNodeId && <NodeTagManagement nodeId={tagManageNodeId} newTagInput={newTagInput} setNewTagInput={setNewTagInput} onClose={() => setTagManageNodeId(null)} />}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={t('nodes.deleteTitle')} message={t('nodes.deleteMsg', { name: deleteTarget?.name })} confirmLabel={t('common.delete')} loading={deleteNode.isPending} />
    </div>
  )
}

function NodeStatsPanel({ nodeId, node, onClose }: { nodeId: string; node: Node; onClose: () => void }) {
  const { t } = useTranslation()
  const { data: stats, isLoading } = useNodeStats(nodeId)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white">{t('nodes.stats')} — {node.name}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <TableSkeleton rows={1} cols={4} /> : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center"><p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.total}</p><p className="text-xs text-surface-500">{t('nodes.totalExecutions')}</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-green-600">{stats.success_rate != null ? `${stats.success_rate.toFixed(1)}%` : '—'}</p><p className="text-xs text-surface-500">{t('nodes.successRate')}</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.avg_duration_ms ? `${(stats.avg_duration_ms / 1000).toFixed(1)}s` : '—'}</p><p className="text-xs text-surface-500">{t('nodes.avgDuration')}</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-red-500">{stats.failed}</p><p className="text-xs text-surface-500">{t('nodes.failed')}</p></div>
          </div>
        ) : <p className="text-sm text-surface-500">{t('nodes.emptyTitle')}</p>}
      </CardContent>
    </Card>
  )
}

function NodeStatusHistoryContent({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { data, isLoading } = useNodeStatusHistory(nodeId, { size: 20 })
  const items = data?.items || []
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {isLoading ? <TableSkeleton rows={5} cols={4} /> : items.length === 0 ? (
        <p className="text-sm text-surface-500 text-center py-4">{t('nodes.emptyTitle')}</p>
      ) : items.map((item) => (
        <div key={item.id} className="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-800 last:border-0">
          <div className="flex items-center gap-3">
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
          <Button onClick={() => { if (bulkTag && selectedIds.length) { bulkTagsAdd.mutate({ node_ids: selectedIds, tags: [bulkTag] }, { onSuccess: () => { toast('success', t('nodes.toastTagsAdded')); onDone() } }) } }} disabled={!bulkTag || !selectedIds.length || bulkTagsAdd.isPending}>{t('nodes.addTag')}</Button>
        </div>
      </div>
    </Modal>
  )
}

function NodeMetricsContent({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation()
  const { data: metrics, isLoading } = useNodeMetrics(nodeId)
  if (isLoading) return <Spinner size="lg" className="mx-auto my-8" />
  if (!metrics) return <p className="text-sm text-surface-500 text-center py-4">{t('nodes.noMetrics', 'No metrics available')}</p>
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }
  return (
    <div className="space-y-3">
      {[
        [t('nodes.cpu', 'CPU'), `${metrics.cpu.usage_percent?.toFixed(1) ?? '—'}% (${metrics.cpu.cores} cores)`],
        [t('nodes.memory', 'Memory'), `${formatBytes(metrics.memory.used_bytes)} / ${formatBytes(metrics.memory.total_bytes)} (${metrics.memory.percent?.toFixed(1)}%)`],
        [t('nodes.disk', 'Disk'), `${formatBytes(metrics.disk.used_bytes)} / ${formatBytes(metrics.disk.total_bytes)} (${metrics.disk.percent?.toFixed(1)}%)`],
        [t('nodes.uptimeSince', 'Uptime Since'), metrics.uptime_since ? new Date(metrics.uptime_since).toLocaleString() : '—'],
      ].map(([key, value]) => (
        <div key={key} className="flex justify-between py-2 border-b border-surface-200 dark:border-surface-800 last:border-0">
          <span className="text-sm text-surface-600 dark:text-surface-400">{key}</span>
          <span className="text-sm font-medium text-surface-900 dark:text-white">{value}</span>
        </div>
      ))}
    </div>
  )
}

function NodeCommandHistoryContent({ nodeId, onRetry }: { nodeId: string; onRetry: (executionId: string) => void }) {
  const { t } = useTranslation()
  const { data, isLoading } = useNodeCommandHistory(nodeId, { size: 20 })
  const items = data?.items || []
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {isLoading ? <TableSkeleton rows={5} cols={3} /> : items.length === 0 ? (
        <p className="text-sm text-surface-500 text-center py-4">{t('nodes.noCmdHistory', 'No command history')}</p>
      ) : items.map((item) => (
        <div key={item.id} className="flex items-center justify-between py-3 border-b border-surface-200 dark:border-surface-800 last:border-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono text-surface-900 dark:text-white truncate">{item.command_fingerprint}</p>
            <p className="text-xs text-surface-500">{item.node_id || '—'} · {new Date(item.created_at).toLocaleString()}</p>
            <Badge variant={item.exit_code === 0 ? 'success' : 'danger'}>exit {item.exit_code}</Badge>
          </div>
          <div className="flex items-center gap-1 ml-2">
            {item.exit_code !== 0 && <Button variant="ghost" size="sm" onClick={() => onRetry(item.id)}>{t('common.retry')}</Button>}
          </div>
        </div>
      ))}
    </div>
  )
}

function NodeTagManagement({ nodeId, newTagInput, setNewTagInput, onClose }: { nodeId: string; newTagInput: string; setNewTagInput: (v: string) => void; onClose: () => void }) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: node } = useNode(nodeId)
  const addTag = useAddNodeTag()
  const removeTag = useRemoveNodeTag()
  const tags = node?.tags || []
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="default" className="gap-1">
            {tag}
            <button onClick={() => removeTag.mutate({ id: nodeId, tag }, { onSuccess: () => toast('success', t('nodes.toastTagRemoved')) })} className="ml-1 text-surface-400 hover:text-red-500">×</button>
          </Badge>
        ))}
        {tags.length === 0 && <p className="text-sm text-surface-500">{t('nodes.noTags', 'No tags')}</p>}
      </div>
      <div className="flex gap-2">
        <Input placeholder={t('nodes.newTag', 'New tag')} value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)} />
        <Button onClick={() => { if (newTagInput.trim()) { addTag.mutate({ id: nodeId, tag: newTagInput.trim() }, { onSuccess: () => { toast('success', t('nodes.toastTagAdded')); setNewTagInput('') } }) } }} disabled={!newTagInput.trim() || addTag.isPending}>{t('nodes.addTag')}</Button>
      </div>
      <div className="flex justify-end"><Button variant="ghost" onClick={onClose}>{t('common.close')}</Button></div>
    </div>
  )
}
