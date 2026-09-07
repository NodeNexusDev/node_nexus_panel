// oxlint-disable react-hooks/exhaustive-deps
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Checkbox } from '../ui/Checkbox'
import { Tabs } from '../ui/Tabs'
import { FavoriteButton } from '../ui/FavoriteButton'
import { Spinner } from '../ui/Spinner'
import { nodeStatusVariant } from '../../lib/variants'
import { useToast } from '../ui/useToast'
import { IconNodes, IconDocker, IconCheckCircle, IconXCircle } from '../ui/Icons'
import { useCheckNode, useUpdateNode, useDeleteNode } from '../../hooks/useNodes'
import { CONNECTION_TYPE_OPTIONS, type ConnectionType } from './connection-types'
import type { Node } from '../../api/types'

import { DrawerOverview } from './drawer/DrawerOverview'
import { DrawerMetrics } from './drawer/DrawerMetrics'
import { DrawerStats } from './drawer/DrawerStats'
import { DrawerHistory } from './drawer/DrawerHistory'
import { DrawerExec } from './drawer/DrawerExec'
import { DrawerScript } from './drawer/DrawerScript'
type DrawerTab = 'overview' | 'metrics' | 'stats' | 'history' | 'edit' | 'exec' | 'script'

interface NodeDrawerProps {
  node: Node
  onClose: () => void
  onDelete?: (node: Node) => void
}

export function NodeDrawer({ node, onClose, onDelete }: NodeDrawerProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const checkNode = useCheckNode()
  const [active, setActive] = useState<DrawerTab>('overview')
  const [validateResult, setValidateResult] = useState<{ status: string; message: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteNode = useDeleteNode()
  const updateNode = useUpdateNode()

  const [editNode, setEditNode] = useState({ name: node.name, host: node.host, port: String(node.port), connection_type: node.connection_type as ConnectionType, description: node.description || '', username: node.username || '', password: '', ssh_key: '', passphrase: '', docker_host: node.docker_host || '', has_docker: node.has_docker ?? false, tags: node.tags.join(', ') })
  const [clearFields, setClearFields] = useState<Record<string, boolean>>({})

  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setEditNode({ name: node.name, host: node.host, port: String(node.port), connection_type: node.connection_type as ConnectionType, description: node.description || '', username: node.username || '', password: '', ssh_key: '', passphrase: '', docker_host: node.docker_host || '', has_docker: node.has_docker ?? false, tags: node.tags.join(', ') })
    setClearFields({})
    setValidateResult(null)
    setShowDeleteConfirm(false)
  }, [node.id])

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
        tags: [...new Set(editNode.tags.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean))],
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
        {node.has_docker && <Badge variant="info">{t('nodes.hasDockerBadge')}</Badge>}
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

