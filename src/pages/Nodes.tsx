import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
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
  useDeleteNode,
  useCheckNode,
  useNodeStats,
  useNodeStatusHistory,
  useValidateCredentials,
  useBulkTagsAdd,
} from '../hooks/useNodes'
import { useToast } from '../components/ui/useToast'
import type { Node } from '../api/types'
import type { Column } from '../components/ui/table-types'

export function Nodes() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data, isLoading } = useNodes()
  const createNode = useCreateNode()
  const deleteNode = useDeleteNode()
  const checkNode = useCheckNode()
  const validateCreds = useValidateCredentials()

  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [newNode, setNewNode] = useState({ name: '', host: '', port: '22', connection_type: 'ssh' as 'ssh' | 'docker' | 'proxmox' })

  const [statsNodeId, setStatsNodeId] = useState<string | null>(null)
  const [historyNodeId, setHistoryNodeId] = useState<string | null>(null)
  const [execNodeId, setExecNodeId] = useState<string | null>(null)
  const [execCmd, setExecCmd] = useState('')
  const [validateTarget, setValidateTarget] = useState<Node | null>(null)
  const [validateResult, setValidateResult] = useState<{ status: string; message: string } | null>(null)

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
        <div className="flex items-center gap-3">
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
          <Tooltip content={t('nodes.validate')}>
            <Button variant="ghost" size="sm" onClick={() => { setValidateTarget(node); setValidateResult(null); validateCreds.mutate({ host: node.host, port: node.port, connection_type: node.connection_type, username: node.username || undefined }, { onSuccess: (r) => setValidateResult(r), onError: () => toast('error', t('nodes.toastValidateFailed')) }) }}>
              {t('nodes.validate')}
            </Button>
          </Tooltip>
            <Tooltip content={t('nodes.checkNode')}>
            <Button variant="ghost" size="sm" onClick={() => checkNode.mutate(node.id, { onSuccess: () => toast('success', t('nodes.toastNodeChecked')), onError: () => toast('error', t('nodes.toastCheckFailed')) })}>
              <IconCheckCircle className="w-4 h-4" />
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
        <div className="flex items-center gap-3">
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
      <td className="px-6 py-4">
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
          <Tooltip content={t('nodes.execCommand')}><Button variant="ghost" size="sm" onClick={() => { setExecNodeId(node.id); setExecCmd('') }}><IconCommands className="w-4 h-4" /></Button></Tooltip>
          <Tooltip content={t('common.delete')}><Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: node.id, name: node.name })} className="text-red-500 hover:text-red-600">{t('common.delete')}</Button></Tooltip>
        </div>
      </td>
    </tr>
  )

  const handleAdd = () => {
    createNode.mutate(
      { name: newNode.name, host: newNode.host, port: Number(newNode.port), connection_type: newNode.connection_type },
      {
        onSuccess: () => { toast('success', t('nodes.toastAdded', { name: newNode.name })); setShowAddModal(false); setNewNode({ name: '', host: '', port: '22', connection_type: 'ssh' }) },
        onError: () => toast('error', t('nodes.toastAddFailed')),
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
              <Button variant="ghost" size="sm" onClick={() => setShowBulkTag(true)}>Bulk Tags</Button>
               <Button variant="ghost" size="sm" disabled={checkNode.isPending} onClick={() => {
                 let done = 0
                 const total = selectedIds.length
                 selectedIds.forEach((id) =>
                   checkNode.mutate(id, {
                     onSuccess: () => { done++; if (done === total) toast('success', t('nodes.toastBulkCheckDone')) },
                     onError: () => { done++; if (done === total) toast('error', t('nodes.toastBulkCheckDone')) },
                   })
                 )
               }}>{checkNode.isPending ? t('common.loading') : t('nodes.bulkCheck')}</Button>
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

      {statsNodeId && selectedNode && (
        <NodeStatsPanel nodeId={statsNodeId} node={selectedNode} onClose={() => setStatsNodeId(null)} />
      )}

      <Card hover>
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
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleAdd} disabled={createNode.isPending || !newNode.name || !newNode.host}>
              {createNode.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!execNodeId} onClose={() => setExecNodeId(null)} title={t('nodes.execCommand')}>
        <div className="space-y-4">
          <p className="text-sm text-surface-500">{t('nodes.execOnNode', { name: nodes.find((n) => n.id === execNodeId)?.name })}</p>
          <Input label="Command" placeholder="uptime" value={execCmd} onChange={(e) => setExecCmd(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setExecNodeId(null)}>{t('common.cancel')}</Button>
            <Button onClick={() => {
              if (execNodeId && execCmd) {
                import('../api/nodes').then(({ nodesApi }) =>
                  nodesApi.execute(execNodeId, { command: execCmd }).then((r) => {
                    toast('success', `Exit ${r.exit_code}: ${r.stdout.slice(0, 100)}`)
                    setExecNodeId(null)
                  }).catch(() => toast('error', t('nodes.toastExecFailed')))
                )
              }
            }} disabled={!execCmd || !execNodeId}>{t('nodes.execCommand')}</Button>
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
            <div className="text-center"><p className="text-2xl font-bold text-green-600">{stats.success_rate.toFixed(1)}%</p><p className="text-xs text-surface-500">{t('nodes.successRate')}</p></div>
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
