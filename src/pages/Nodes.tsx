import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useNodes, useCreateNode, useDeleteNode } from '../hooks/useNodes'
import { useToast } from '../components/ui/Toast'

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

  const handleAdd = () => {
    createNode.mutate(
      { name: newNode.name, ip: newNode.ip, port: newNode.port ? Number(newNode.port) : undefined },
      {
        onSuccess: () => {
          toast('success', `Node "${newNode.name}" added`)
          setShowAddModal(false)
          setNewNode({ name: '', ip: '', port: '' })
        },
        onError: () => toast('error', 'Failed to add node'),
      },
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteNode.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast('success', `Node "${deleteTarget.name}" deleted`)
        setDeleteTarget(null)
      },
      onError: () => toast('error', 'Failed to delete node'),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t('nodes.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400">{t('nodes.description')}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>{t('nodes.addNode')}</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Spinner /></div>
          ) : nodes.length === 0 ? (
            <EmptyState
              icon="🖥️"
              title="No nodes"
              description="Add your first node to start monitoring"
              action={<Button onClick={() => setShowAddModal(true)}>{t('nodes.addNode')}</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-800">
                    {[t('nodes.node'), t('nodes.status'), t('nodes.os'), t('nodes.cpu'), t('nodes.memory'), t('nodes.lastSeen'), t('nodes.actions')].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                  {nodes.map((node) => (
                    <tr key={node.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{node.name}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-500">{node.ip}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={node.status === 'online' ? 'success' : 'danger'}>{node.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{node.os}</td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{node.cpu}</td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{node.memory}</td>
                      <td className="px-6 py-4 text-sm text-surface-500 dark:text-surface-500">{node.lastSeen}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">{t('nodes.terminal')}</Button>
                          <Button variant="ghost" size="sm">{t('nodes.logs')}</Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: node.id, name: node.name })}>
                            {t('common.delete')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('nodes.addNode')}>
        <div className="space-y-4">
          <Input label={t('nodes.node')} placeholder="prod-server-05" value={newNode.name} onChange={(e) => setNewNode({ ...newNode, name: e.target.value })} />
          <Input label="IP" placeholder="192.168.1.105" value={newNode.ip} onChange={(e) => setNewNode({ ...newNode, ip: e.target.value })} />
          <Input label="Port (optional)" placeholder="22" type="number" value={newNode.port} onChange={(e) => setNewNode({ ...newNode, port: e.target.value })} />
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
        title="Delete Node"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel={t('common.delete')}
        loading={deleteNode.isPending}
      />
    </div>
  )
}
