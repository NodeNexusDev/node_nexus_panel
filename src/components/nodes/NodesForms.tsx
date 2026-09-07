import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Checkbox } from '../ui/Checkbox'
import { Modal } from '../ui/Modal'
import { CONNECTION_TYPE_OPTIONS, type ConnectionType } from './connection-types'
import { useToast } from '../ui/useToast'
import type { Node, NodeUpdate } from '../../api/types'
import type { UseFormReturn } from 'react-hook-form'
import type { NodeCreateFormValues } from '../../lib/validators/node-schema'
import type { UseMutationResult } from '@tanstack/react-query'

type Props = {
  showAddModal: boolean
  setShowAddModal: (v: boolean) => void
  addForm: UseFormReturn<NodeCreateFormValues>
  handleAdd: (values: NodeCreateFormValues) => void
  createNode: UseMutationResult<any, any, any, any>
  editTarget: Node | null
  setEditTarget: (v: Node | null) => void
  editNode: { name: string; host: string; port: string; connection_type: ConnectionType; description: string; username: string; password: string; ssh_key: string; passphrase: string; docker_host: string; has_docker: boolean; tags: string }
  setEditNode: (v: Props['editNode']) => void
  clearFields: Record<string, boolean>
  toggleClear: (field: string) => void
  handleEdit: () => void
  updateNode: UseMutationResult<any, any, any, any>
  showBulkUpdate: boolean
  setShowBulkUpdate: (v: boolean) => void
  bulkUpdateChanges: { name: string; host: string; port: string; description: string; username: string; docker_host: string; has_docker: boolean | undefined; tags: string }
  setBulkUpdateChanges: (v: Props['bulkUpdateChanges']) => void
  bulkUpdateNodes: UseMutationResult<any, any, any, any>
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
}

export function NodesForms({ showAddModal, setShowAddModal, addForm, handleAdd, createNode, editTarget, setEditTarget, editNode, setEditNode, clearFields, toggleClear, handleEdit, updateNode, showBulkUpdate, setShowBulkUpdate, bulkUpdateChanges, setBulkUpdateChanges, bulkUpdateNodes, selectedIds, setSelectedIds }: Props) {
  const { t } = useTranslation()
  const { toast } = useToast()
  return (
    <>
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('nodes.addNode')}>
        <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4">
          <Input label={t('nodes.node')} placeholder="prod-server-05" {...addForm.register('name')} error={addForm.formState.errors.name?.message} />
          <Input label={t('nodes.host')} placeholder="192.168.1.105" {...addForm.register('host')} error={addForm.formState.errors.host?.message} />
          <Controller name="port" control={addForm.control} render={({ field }) => <Input label={t('nodes.port')} placeholder="22" type="number" value={String(field.value ?? 22)} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} error={addForm.formState.errors.port?.message} />} />
          <Controller name="connection_type" control={addForm.control} render={({ field }) => <Select label={t('nodes.connectionType')} value={field.value} onChange={field.onChange} options={CONNECTION_TYPE_OPTIONS} />} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.descriptionLabel', 'Description')}</label>
            <textarea placeholder={t('nodes.descriptionPlaceholder', 'Main production node')} {...addForm.register('description')} maxLength={1000} rows={3} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
            {addForm.formState.errors.description && <p className="text-xs text-red-500 mt-1">{addForm.formState.errors.description.message}</p>}
            <p className="text-xs text-surface-400 text-right">{(addForm.watch('description')?.length ?? 0)}/1000</p>
          </div>
          <div className="pt-2 border-t border-surface-200 dark:border-surface-800">
            <p className="text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wide mb-2">{t('nodes.credentialsSection','Credentials')} {t('common.requiredMark','*')}</p>
            <div className="space-y-3 p-3 bg-surface-50 dark:bg-surface-800/30 rounded-lg border border-surface-200 dark:border-surface-800">
              <Input label={`${t('nodes.username', 'Username')}`} placeholder="root" {...addForm.register('username')} error={addForm.formState.errors.username?.message} />
              <Input label={t('nodes.password', 'Password')} type="password" placeholder="••••••" {...addForm.register('password')} error={addForm.formState.errors.password?.message} />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.sshKey', 'SSH Key')}</label>
                <textarea placeholder="-----BEGIN OPENSSH PRIVATE KEY-----" {...addForm.register('ssh_key')} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" rows={4} />
                {addForm.formState.errors.ssh_key && <p className="text-xs text-red-500 mt-1">{addForm.formState.errors.ssh_key.message}</p>}
              </div>
              <Input label={t('nodes.passphrase', 'Passphrase')} type="password" placeholder="••••••" {...addForm.register('passphrase')} error={addForm.formState.errors.passphrase?.message} />
              <p className="text-xs text-surface-500">{t('nodes.credentialsHint','Provide password or SSH key, leave others blank')}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-surface-200 dark:border-surface-800">
            <p className="text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wide mb-2">{t('nodes.dockerSection','Docker')}</p>
            <Input label={t('nodes.dockerHost', 'Docker Host')} placeholder="/var/run/docker.sock" {...addForm.register('docker_host')} error={addForm.formState.errors.docker_host?.message} />
            <Controller name="has_docker" control={addForm.control} render={({ field }) => <Checkbox checked={field.value ?? false} onChange={field.onChange} label={t('nodes.hasDocker', 'Has Docker')} />} />
          </div>
          <Controller name="tags" control={addForm.control} render={({ field }) => <Input label={t('nodes.tagsLabel', 'Tags')} placeholder="production, linux" value={(field.value ?? []).join(', ')} onChange={(e) => field.onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} error={addForm.formState.errors.tags?.message} />} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={createNode.isPending}>{createNode.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={t('nodes.editNode', 'Edit Node')}>
        <div className="space-y-4">
          <Input label={t('nodes.node')} placeholder="prod-server-05" value={editNode.name} onChange={(e) => setEditNode({ ...editNode, name: e.target.value })} />
          <Input label={t('nodes.host')} placeholder="192.168.1.105" value={editNode.host} onChange={(e) => setEditNode({ ...editNode, host: e.target.value })} />
          <Input label={t('nodes.port')} placeholder="22" type="number" value={editNode.port} onChange={(e) => setEditNode({ ...editNode, port: e.target.value })} />
          <Select label={t('nodes.connectionType')} value={editNode.connection_type} onChange={(val) => setEditNode({ ...editNode, connection_type: val as ConnectionType })} options={CONNECTION_TYPE_OPTIONS} />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.descriptionLabel', 'Description')}</label>
              <Button variant="ghost" size="sm" onClick={() => setEditNode({ ...editNode, description: '' })} className="h-6 px-2 text-xs">{t('common.clear', 'Clear')}</Button>
            </div>
            <textarea placeholder={t('nodes.descriptionPlaceholder', 'Main production node')} value={editNode.description} onChange={(e) => setEditNode({ ...editNode, description: e.target.value })} maxLength={1000} rows={3} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
            <p className="text-xs text-surface-400 text-right">{editNode.description.length}/1000</p>
          </div>
          <div className="pt-2 border-t border-surface-200 dark:border-surface-800">
            <p className="text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wide mb-2">{t('nodes.credentialsSection', 'Credentials')} {t('common.requiredMark', '*')}</p>
            <div className="space-y-3 p-3 bg-surface-50 dark:bg-surface-800/30 rounded-lg border border-surface-200 dark:border-surface-800">
              <Input label={t('nodes.username', 'Username')} placeholder="root" value={editNode.username} onChange={(e) => setEditNode({ ...editNode, username: e.target.value })} />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.password', 'Password')}</label>
                  <Button variant="ghost" size="sm" onClick={() => toggleClear('password')} className="h-6 px-2 text-xs">{clearFields.password ? t('common.cancel') : t('common.clear', 'Clear')}</Button>
                </div>
                <Input type="password" placeholder={clearFields.password ? t('common.willBeCleared') : t('common.leaveBlank')} value={editNode.password} onChange={(e) => setEditNode({ ...editNode, password: e.target.value })} disabled={clearFields.password} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.sshKey', 'SSH Key')}</label>
                  <Button variant="ghost" size="sm" onClick={() => toggleClear('ssh_key')} className="h-6 px-2 text-xs">{clearFields.ssh_key ? t('common.cancel') : t('common.clear', 'Clear')}</Button>
                </div>
                <textarea placeholder={clearFields.ssh_key ? t('common.willBeCleared') : t('common.leaveBlank')} value={editNode.ssh_key} onChange={(e) => setEditNode({ ...editNode, ssh_key: e.target.value })} disabled={clearFields.ssh_key} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed dark:bg-surface-800 dark:border-surface-700 dark:text-white" rows={4} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.passphrase', 'Passphrase')}</label>
                  <Button variant="ghost" size="sm" onClick={() => toggleClear('passphrase')} className="h-6 px-2 text-xs">{clearFields.passphrase ? t('common.cancel') : t('common.clear', 'Clear')}</Button>
                </div>
                <Input type="password" placeholder={clearFields.passphrase ? t('common.willBeCleared') : t('common.leaveBlank')} value={editNode.passphrase} onChange={(e) => setEditNode({ ...editNode, passphrase: e.target.value })} disabled={clearFields.passphrase} />
              </div>
              <p className="text-xs text-surface-500">{t('nodes.credentialsHint', 'Provide password or SSH key, leave others blank')}</p>
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
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditTarget(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleEdit} disabled={updateNode.isPending || !editNode.name || !editNode.host}>{updateNode.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBulkUpdate} onClose={() => setShowBulkUpdate(false)} title={t('nodes.bulkUpdate', 'Bulk Update')} size="lg">
        <div className="space-y-4">
          <p className="text-sm text-surface-500">{t('nodes.bulkUpdateMsg', { count: selectedIds.length })}</p>
          <Input label={t('nodes.node')} placeholder={t('common.leaveBlank', 'Leave blank to keep unchanged')} value={bulkUpdateChanges.name} onChange={(e) => setBulkUpdateChanges({ ...bulkUpdateChanges, name: e.target.value })} />
          <Input label={t('nodes.host')} placeholder={t('common.leaveBlank', 'Leave blank to keep unchanged')} value={bulkUpdateChanges.host} onChange={(e) => setBulkUpdateChanges({ ...bulkUpdateChanges, host: e.target.value })} />
          <Input label={t('nodes.port')} placeholder={t('common.leaveBlank', 'Leave blank to keep unchanged')} value={bulkUpdateChanges.port} onChange={(e) => setBulkUpdateChanges({ ...bulkUpdateChanges, port: e.target.value })} />
          <Input label={t('nodes.descriptionLabel', 'Description')} placeholder={t('common.leaveBlank', 'Leave blank to keep unchanged')} value={bulkUpdateChanges.description ?? ''} onChange={(e) => setBulkUpdateChanges({ ...bulkUpdateChanges, description: e.target.value })} />
          <Input label={t('nodes.username', 'Username')} placeholder={t('common.leaveBlank', 'Leave blank to keep unchanged')} value={bulkUpdateChanges.username} onChange={(e) => setBulkUpdateChanges({ ...bulkUpdateChanges, username: e.target.value })} />
          <Input label={t('nodes.dockerHost', 'Docker Host')} placeholder={t('common.leaveBlank', 'Leave blank to keep unchanged')} value={bulkUpdateChanges.docker_host} onChange={(e) => setBulkUpdateChanges({ ...bulkUpdateChanges, docker_host: e.target.value })} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('nodes.hasDocker', 'Has Docker')}</label>
            <Select value={bulkUpdateChanges.has_docker === undefined ? 'keep' : bulkUpdateChanges.has_docker ? 'yes' : 'no'} onChange={(v)=> setBulkUpdateChanges({ ...bulkUpdateChanges, has_docker: v==='keep'? undefined : v==='yes' })} options={[{value:'keep',label:t('common.keep','Keep')},{value:'yes',label:t('common.yes','Yes')},{value:'no',label:t('common.no','No')}]} />
          </div>
          <Input label={t('nodes.tagsLabel', 'Tags')} placeholder={t('common.commaSeparated')} value={bulkUpdateChanges.tags} onChange={(e) => setBulkUpdateChanges({ ...bulkUpdateChanges, tags: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowBulkUpdate(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => {
              const changes: NodeUpdate = {}
              if (bulkUpdateChanges.name) changes.name = bulkUpdateChanges.name
              if (bulkUpdateChanges.host) changes.host = bulkUpdateChanges.host
              if (bulkUpdateChanges.port) changes.port = parseInt(bulkUpdateChanges.port, 10)
              if (bulkUpdateChanges.description) changes.description = bulkUpdateChanges.description
              if (bulkUpdateChanges.username) changes.username = bulkUpdateChanges.username
              if (bulkUpdateChanges.docker_host) changes.docker_host = bulkUpdateChanges.docker_host
              if (bulkUpdateChanges.has_docker !== undefined) changes.has_docker = bulkUpdateChanges.has_docker
              if (bulkUpdateChanges.tags) changes.tags = bulkUpdateChanges.tags.split(',').map((s) => s.trim()).filter(Boolean)
              bulkUpdateNodes.mutate({ updates: selectedIds.map((id) => ({ id, changes })) }, {
                onSuccess: (data: unknown) => { const d = data as { succeeded: number; failed: number }; if (d.failed > 0) toast('warning', t('nodes.toastBulkUpdateDone', { succeeded: d.succeeded, failed: d.failed })); else toast('success', t('nodes.toastBulkUpdateDone', { succeeded: d.succeeded, failed: d.failed })); setShowBulkUpdate(false); setSelectedIds([]) },
                onError: () => toast('error', t('nodes.toastBulkUpdateFailed', 'Failed to update nodes')),
              })
            }} disabled={bulkUpdateNodes.isPending}>{bulkUpdateNodes.isPending ? t('common.loading') : t('common.save')}</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
