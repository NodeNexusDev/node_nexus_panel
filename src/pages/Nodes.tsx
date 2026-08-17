import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
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
import { IconNodes, IconGrip, IconCommands, IconFileText } from '../components/ui/Icons'
import { useNodes, useCreateNode, useDeleteNode } from '../hooks/useNodes'
import { useToast } from '../components/ui/useToast'
import type { Node } from '../api/types'
import type { Column } from '../components/ui/table-types'

export function Nodes() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data, isLoading } = useNodes()
  const createNode = useCreateNode()
  const deleteNode = useDeleteNode()

  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [newNode, setNewNode] = useState({ name: '', ip: '', port: '' })

  const nodes = data?.data || []
  const [orderedNodes, setOrderedNodes] = useState<Node[]>([])
  const displayNodes = orderedNodes.length > 0 ? orderedNodes : nodes
  const [dragMode, setDragMode] = useState(false)

  const handleReorder = useCallback((reordered: Node[]) => {
    setOrderedNodes(reordered)
  }, [])

  const columns: Column<Node>[] = [
    {
      key: 'node',
      header: t('nodes.node'),
      render: (node) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            node.status === 'online'
              ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
          }`}>
            <IconNodes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-900 dark:text-white">{node.name}</p>
            <p className="text-xs text-surface-500 dark:text-surface-500 font-mono">{node.ip}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('nodes.status'),
      render: (node) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-green-500 status-online' : 'bg-red-500'}`} />
          <Badge variant={node.status === 'online' ? 'success' : 'danger'}>{node.status}</Badge>
        </div>
      ),
    },
    {
      key: 'os',
      header: t('nodes.os'),
      render: (node) => <span className="text-sm text-surface-600 dark:text-surface-300">{node.os}</span>,
    },
    {
      key: 'cpu',
      header: t('nodes.cpu'),
      render: (node) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: node.cpu }} />
          </div>
          <span className="text-sm text-surface-600 dark:text-surface-300 font-mono">{node.cpu}</span>
        </div>
      ),
    },
    {
      key: 'memory',
      header: t('nodes.memory'),
      render: (node) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: node.memory }} />
          </div>
          <span className="text-sm text-surface-600 dark:text-surface-300 font-mono">{node.memory}</span>
        </div>
      ),
    },
    {
      key: 'lastSeen',
      header: t('nodes.lastSeen'),
      render: (node) => <span className="text-sm text-surface-500 dark:text-surface-500">{node.lastSeen}</span>,
    },
    {
      key: 'actions',
      header: t('nodes.actions'),
      render: (node) => (
        <div className="flex items-center gap-1">
          <Tooltip content={t('nodes.terminal')}>
            <Button variant="ghost" size="sm"><IconCommands className="w-4 h-4" /></Button>
          </Tooltip>
          <Tooltip content={t('nodes.logs')}>
            <Button variant="ghost" size="sm"><IconFileText className="w-4 h-4" /></Button>
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
            node.status === 'online'
              ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
          }`}>
            <IconNodes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-900 dark:text-white">{node.name}</p>
            <p className="text-xs text-surface-500 dark:text-surface-500 font-mono">{node.ip}</p>
          </div>
        </div>
        <Badge variant={node.status === 'online' ? 'success' : 'danger'}>{node.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-surface-500 dark:text-surface-400">{t('nodes.os')}</span>
          <p className="text-surface-700 dark:text-surface-300">{node.os}</p>
        </div>
        <div>
          <span className="text-surface-500 dark:text-surface-400">{t('nodes.lastSeen')}</span>
          <p className="text-surface-700 dark:text-surface-300">{node.lastSeen}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500 dark:text-surface-400 w-10">{t('nodes.cpu')}</span>
          <div className="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: node.cpu }} />
          </div>
          <span className="text-xs text-surface-600 dark:text-surface-300 font-mono w-10 text-right">{node.cpu}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500 dark:text-surface-400 w-10">{t('nodes.memory')}</span>
          <div className="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: node.memory }} />
          </div>
          <span className="text-xs text-surface-600 dark:text-surface-300 font-mono w-10 text-right">{node.memory}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button variant="ghost" size="sm" className="flex-1">
          <IconCommands className="w-4 h-4 mr-1" /> {t('nodes.terminal')}
        </Button>
        <Button variant="ghost" size="sm" className="flex-1">
          <IconFileText className="w-4 h-4 mr-1" /> {t('nodes.logs')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: node.id, name: node.name })} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
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
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            node.status === 'online'
              ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
              : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
          }`}>
            <IconNodes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-900 dark:text-white">{node.name}</p>
            <p className="text-xs text-surface-500 dark:text-surface-500 font-mono">{node.ip}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-green-500 status-online' : 'bg-red-500'}`} />
          <Badge variant={node.status === 'online' ? 'success' : 'danger'}>{node.status}</Badge>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{node.os}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: node.cpu }} />
          </div>
          <span className="text-sm text-surface-600 dark:text-surface-300 font-mono">{node.cpu}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: node.memory }} />
          </div>
          <span className="text-sm text-surface-600 dark:text-surface-300 font-mono">{node.memory}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-surface-500 dark:text-surface-500">{node.lastSeen}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <Tooltip content={t('nodes.terminal')}>
            <Button variant="ghost" size="sm"><IconCommands className="w-4 h-4" /></Button>
          </Tooltip>
          <Tooltip content={t('nodes.logs')}>
            <Button variant="ghost" size="sm"><IconFileText className="w-4 h-4" /></Button>
          </Tooltip>
          <Tooltip content={t('common.delete')}>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: node.id, name: node.name })} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
              {t('common.delete')}
            </Button>
          </Tooltip>
        </div>
      </td>
    </tr>
  )

  const handleAdd = () => {
    createNode.mutate(
      { name: newNode.name, ip: newNode.ip, port: newNode.port ? Number(newNode.port) : undefined },
      {
        onSuccess: () => {
          toast('success', t('nodes.toastAdded', { name: newNode.name }))
          setShowAddModal(false)
          setNewNode({ name: '', ip: '', port: '' })
        },
        onError: () => toast('error', t('nodes.toastAddFailed')),
      },
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteNode.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast('success', t('nodes.toastDeleted', { name: deleteTarget.name }))
        setDeleteTarget(null)
      },
      onError: () => toast('error', t('nodes.toastDeleteFailed')),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t('nodes.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">{t('nodes.description')}</p>
        </div>
        <div className="flex items-center gap-2">
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

      <Card hover>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={5} cols={7} />
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
                    {[t('nodes.node'), t('nodes.status'), t('nodes.os'), t('nodes.cpu'), t('nodes.memory'), t('nodes.lastSeen'), t('nodes.actions')].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                  <DragDropList
                    items={displayNodes}
                    onReorder={handleReorder}
                    keyExtractor={(n) => n.id}
                    renderItem={(node, index) => renderNodeRow(node, index)}
                  />
                </tbody>
              </table>
            </div>
          ) : (
            <ResponsiveTable
              data={displayNodes}
              columns={columns}
              renderMobileItem={renderMobileNode}
              keyExtractor={(n) => n.id}
              emptyMessage={t('nodes.emptyTitle')}
            />
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('nodes.addNode')}>
        <div className="space-y-4">
          <Input label={t('nodes.node')} placeholder="prod-server-05" value={newNode.name} onChange={(e) => setNewNode({ ...newNode, name: e.target.value })} />
          <Input label={t('nodes.ip')} placeholder="192.168.1.105" value={newNode.ip} onChange={(e) => setNewNode({ ...newNode, ip: e.target.value })} />
          <Input label={t('nodes.port')} placeholder="22" type="number" value={newNode.port} onChange={(e) => setNewNode({ ...newNode, port: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleAdd} disabled={createNode.isPending || !newNode.name || !newNode.ip}>
              {createNode.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('nodes.deleteTitle')}
        message={t('nodes.deleteMsg', { name: deleteTarget?.name })}
        confirmLabel={t('common.delete')}
        loading={deleteNode.isPending}
      />
    </div>
  )
}
