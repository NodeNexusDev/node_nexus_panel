import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { TableSkeleton } from '../components/ui/Skeleton'
import { Pagination } from '../components/ui/Pagination'
import { PageHeader } from '../components/ui/PageHeader'
import { FilterBar } from '../components/ui/FilterBar'
import { SortableHeader } from '../components/ui/SortableHeader'
import { ResponsiveTable } from '../components/ui/ResponsiveTable'
import { DropdownMenu, type DropdownMenuItem } from '../components/ui/DropdownMenu'
import { IconScripts } from '../components/ui/Icons'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import { ScriptFormModal, type ScriptFormValues } from '../components/scripts/ScriptFormModal'
import { ScriptBulkNodeResultItem } from '../components/scripts/ScriptBulkNodeResultItem'
import { ExecutionResult } from '../components/commands/ExecutionResult'
import {
  useScripts,
  useScriptTags,
  useCreateScript,
  useDeleteScript,
  useRunScript,
  useUpdateScript,
  useCloneScript,
  useSetScriptSchedule,
  useRemoveScriptSchedule,
} from '../hooks/useScripts'
import { useNodes } from '../hooks/useNodes'
import { useToast } from '../components/ui/useToast'
import { TagBadge } from '../components/ui/TagBadge'
import { useSort } from '../hooks/useSort'
import type { ScriptResponse, ScriptExecutionBatchResult } from '../api/types'
import type { Column } from '../components/ui/table-types'

type SortKey = 'name' | 'steps' | 'updated_at'

function scriptSortValue(script: ScriptResponse, key: SortKey): string | number {
  if (key === 'steps') return script.steps.length
  return script[key] ?? ''
}

export function Scripts() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [page, setPage] = useState(1)
  const { sort, toggle: toggleSort } = useSort<SortKey>()
  const pageSize = 20

  const { data, isLoading } = useScripts({ page, size: pageSize, search: search || undefined, tag: tagFilter || undefined })
  const { data: tags } = useScriptTags()
  const { data: nodesData } = useNodes({ size: 100 })
  const nodes = nodesData?.items || []
  const createScript = useCreateScript()
  const deleteScript = useDeleteScript()
  const runScript = useRunScript()
  const updateScript = useUpdateScript()
  const cloneScript = useCloneScript()
  const setSchedule = useSetScriptSchedule()
  const removeSchedule = useRemoveScriptSchedule()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const [runTarget, setRunTarget] = useState<ScriptResponse | null>(null)
  const [runNodeIds, setRunNodeIds] = useState<string[]>([])
  const [runTags, setRunTags] = useState('')
  const [runResult, setRunResult] = useState<ScriptExecutionBatchResult | null>(null)
  const [editScript, setEditScript] = useState<ScriptResponse | null>(null)
  const [cloneTarget, setCloneTarget] = useState<{ id: string; name: string } | null>(null)
  const [scheduleTarget, setScheduleTarget] = useState<{ id: string; name: string } | null>(null)
  const [scheduleCron, setScheduleCron] = useState('')
  const [scheduleNodeIds, setScheduleNodeIds] = useState<string[]>([])
  const [scheduleTimezone, setScheduleTimezone] = useState('UTC')
  const [scheduleMisfireGrace, setScheduleMisfireGrace] = useState(60)
  const [confirmRemoveSchedule, setConfirmRemoveSchedule] = useState(false)

  const scripts = data?.items || []

  const sortedScripts = sort
    ? [...scripts].sort((a, b) => {
        const dir = sort.dir === 'asc' ? 1 : -1
        const av = scriptSortValue(a, sort.key)
        const bv = scriptSortValue(b, sort.key)
        return (typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))) * dir
      })
    : scripts

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteScript.mutate(deleteTarget.id, { onSuccess: () => { toast('success', t('scripts.toastDeleted', { name: deleteTarget.name })); setDeleteTarget(null) }, onError: () => toast('error', t('scripts.toastDeleteFailed')) })
  }

  const handleRun = (script: ScriptResponse) => {
    setRunTarget(script)
    setRunNodeIds([])
    setRunTags('')
    setRunResult(null)
  }

  const handleClone = () => {
    if (!cloneTarget) return
    cloneScript.mutate({ id: cloneTarget.id }, {
      onSuccess: () => { toast('success', t('scripts.toastCloned', { name: cloneTarget.name })); setCloneTarget(null) },
      onError: () => toast('error', t('scripts.toastCloneFailed')),
    })
  }

  const handleSetSchedule = () => {
    if (!scheduleTarget || !scheduleCron.trim()) return
    setSchedule.mutate({ id: scheduleTarget.id, data: { cron: scheduleCron, node_ids: scheduleNodeIds, timezone: scheduleTimezone, misfire_grace_seconds: scheduleMisfireGrace } }, {
      onSuccess: () => { toast('success', t('scripts.toastScheduleSet')); setScheduleTarget(null) },
      onError: () => toast('error', t('scripts.toastScheduleFailed')),
    })
  }

  const handleRemoveSchedule = () => {
    if (!scheduleTarget) return
    removeSchedule.mutate(scheduleTarget.id, {
      onSuccess: () => { toast('success', t('scripts.toastScheduleRemoved')); setScheduleTarget(null); setConfirmRemoveSchedule(false) },
      onError: () => toast('error', t('scripts.toastScheduleFailed')),
    })
  }

  const scriptMenu = (script: ScriptResponse): DropdownMenuItem[] => [
    { key: 'edit', label: t('common.edit'), onClick: () => setEditScript(script) },
    { key: 'clone', label: t('scripts.clone'), onClick: () => setCloneTarget({ id: script.id, name: script.name }) },
    { key: 'schedule', label: t('scripts.schedule'), onClick: () => { setScheduleTarget({ id: script.id, name: script.name }); setScheduleCron(''); setScheduleNodeIds([]); setScheduleTimezone('UTC'); setScheduleMisfireGrace(60) } },
    { key: 'sep', label: '', onClick: () => {}, separator: true },
    { key: 'delete', label: t('common.delete'), danger: true, onClick: () => setDeleteTarget({ id: script.id, name: script.name }) },
  ]

  const columns: Column<ScriptResponse>[] = [
    {
      key: 'name',
      header: <SortableHeader label={t('common.name')} sortKey="name" sort={sort} onSort={toggleSort} />,
      render: (script) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 flex items-center justify-center shrink-0">
            <IconScripts className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{script.name}</p>
            {script.description && <p className="text-xs text-surface-500 dark:text-surface-500 truncate">{script.description}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'steps',
      header: <SortableHeader label={t('scripts.steps')} sortKey="steps" sort={sort} onSort={toggleSort} />,
      render: (script) => <Badge variant="info">{script.steps.length}</Badge>,
    },
    {
      key: 'tags',
      header: t('scripts.tagsLabel'),
      render: (script) => (
        <div className="flex flex-wrap gap-1">
          {script.tags.length > 0 ? script.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} onClick={() => setTagFilter(tag)} />
          )) : <span className="text-surface-400">—</span>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (script) => (
        <div className="flex items-center gap-1">
          <FavoriteButton targetType="script" targetId={script.id} resourceName={script.name} size="sm" />
          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleRun(script) }} disabled={runScript.isPending}>
            {runScript.isPending ? <Spinner size="sm" /> : t('scripts.run')}
          </Button>
          <DropdownMenu items={scriptMenu(script)} ariaLabel={t('common.actionsFor', { name: script.name })} />
        </div>
      ),
    },
  ]

  const renderMobileScript = (script: ScriptResponse) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 flex items-center justify-center shrink-0">
            <IconScripts className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{script.name}</p>
            {script.description && <p className="text-xs text-surface-500 dark:text-surface-500 truncate">{script.description}</p>}
          </div>
        </div>
        <Badge variant="info">{script.steps.length} {t('scripts.steps')}</Badge>
      </div>
      <div className="flex flex-wrap gap-1">
        {script.tags.length > 0 ? script.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} onClick={() => setTagFilter(tag)} />
        )) : <span className="text-surface-400">—</span>}
      </div>
      <div className="flex items-center gap-1">
        <FavoriteButton targetType="script" targetId={script.id} resourceName={script.name} size="sm" />
        <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleRun(script) }} disabled={runScript.isPending}>
          {runScript.isPending ? <Spinner size="sm" /> : t('scripts.run')}
        </Button>
        <DropdownMenu items={scriptMenu(script)} ariaLabel={`${script.name} actions`} />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('scripts.title')}
        description={t('scripts.description')}
        actions={<Button onClick={() => setShowCreateModal(true)}>{t('scripts.createScript')}</Button>}
      />

      <FilterBar search={search} onSearch={setSearch} searchPlaceholder={t('scripts.searchPlaceholder', 'Search scripts...')}>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white"
        >
          <option value="">{t('scripts.allTags', 'All tags')}</option>
          {tags?.map((tag) => (<option key={tag} value={tag}>{tag}</option>))}
        </select>
      </FilterBar>

      <Card hover className="stagger-item">
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : scripts.length === 0 ? (
            <EmptyState icon={<IconScripts className="w-10 h-10" />} title={t('scripts.emptyTitle')} description={t('scripts.emptyDesc')} action={<Button onClick={() => setShowCreateModal(true)}>{t('scripts.createScript')}</Button>} />
          ) : (
            <ResponsiveTable
              data={sortedScripts}
              columns={columns}
              renderMobileItem={renderMobileScript}
              keyExtractor={(s) => s.id}
              emptyMessage={t('scripts.emptyTitle')}
              onRowClick={(script) => navigate(`/scripts/${script.id}`)}
            />
          )}
          {data && data.total > pageSize && (
            <div className="px-6 py-3 border-t border-surface-200 dark:border-surface-800">
              <Pagination page={page} totalPages={Math.ceil(data.total / pageSize)} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <ScriptFormModal
        isOpen={showCreateModal}
        title={t('scripts.createScript')}
        pending={createScript.isPending}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(values: ScriptFormValues) => {
          createScript.mutate(values, {
            onSuccess: () => { toast('success', t('scripts.toastCreated', { name: values.name })); setShowCreateModal(false) },
            onError: () => toast('error', t('scripts.toastCreateFailed')),
          })
        }}
      />

      <ScriptFormModal
        isOpen={!!editScript}
        title={`${t('scripts.edit')}: ${editScript?.name || ''}`}
        pending={updateScript.isPending}
        initial={editScript ? { name: editScript.name, description: editScript.description || '', tags: editScript.tags, steps: editScript.steps } : undefined}
        onClose={() => setEditScript(null)}
        onSubmit={(values: ScriptFormValues) => {
          if (!editScript) return
          updateScript.mutate({ id: editScript.id, data: values }, {
            onSuccess: () => { toast('success', t('scripts.toastUpdated')); setEditScript(null) },
            onError: () => toast('error', t('scripts.toastUpdateFailed')),
          })
        }}
      />

      <Modal isOpen={!!scheduleTarget} onClose={() => setScheduleTarget(null)} title={`${t('scripts.schedule')}: ${scheduleTarget?.name || ''}`}>
        <div className="space-y-4">
          <Input label={t('scripts.cronExpression')} placeholder="0 2 * * *" value={scheduleCron} onChange={(e) => setScheduleCron(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-600 dark:text-surface-400">{t('scripts.targetNodes', 'Target Nodes')}</label>
            <div className="flex flex-wrap gap-2">
              {nodes.map((n) => (
                <label key={n.id} className="flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={scheduleNodeIds.includes(n.id)} onChange={(e) => {
                    if (e.target.checked) setScheduleNodeIds((prev) => [...prev, n.id])
                    else setScheduleNodeIds((prev) => prev.filter((id) => id !== n.id))
                  }} className="rounded" />
                  {n.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="ghost" className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300" onClick={() => setConfirmRemoveSchedule(true)}>
              {t('scripts.removeSchedule', 'Remove Schedule')}
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setScheduleTarget(null)}>{t('common.cancel')}</Button>
              <Button onClick={handleSetSchedule} disabled={scheduleCron.trim() !== '' && scheduleNodeIds.length === 0}>{t('common.save')}</Button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!cloneTarget} onClose={() => setCloneTarget(null)} onConfirm={handleClone} title={t('scripts.cloneTitle')} message={t('scripts.cloneMsg', { name: cloneTarget?.name })} confirmLabel={t('scripts.clone')} />

      <ConfirmDialog isOpen={confirmRemoveSchedule} onClose={() => setConfirmRemoveSchedule(false)} onConfirm={handleRemoveSchedule} title={t('scripts.removeScheduleTitle', 'Remove Schedule')} message={t('scripts.removeScheduleMsg', 'Are you sure you want to remove the schedule?')} confirmLabel={t('common.delete')} loading={removeSchedule.isPending} />

      <Modal isOpen={!!runTarget} onClose={() => { setRunTarget(null); setRunNodeIds([]); setRunTags(''); setRunResult(null) }} title={`${t('scripts.run')}: ${runTarget?.name || ''}`}>
        {runResult ? (
          <div className="space-y-4">
            {runResult.results.length === 1 ? (
              runResult.results[0].steps.map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                      {t('scripts.step', 'Step')} {idx + 1}{step.label ? `: ${step.label}` : ''}
                    </span>
                    <Badge variant={step.exit_code === 0 ? 'success' : 'danger'}>
                      exit {step.exit_code}
                    </Badge>
                    {step.truncated && (
                      <Badge variant="warning">{t('scripts.truncated', 'Truncated')}</Badge>
                    )}
                  </div>
                  <ExecutionResult stdout={step.stdout} stderr={step.stderr} exitCode={step.exit_code} />
                </div>
              ))
            ) : (
              <>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 dark:text-green-400">{t('scripts.succeeded', 'Succeeded')}: {runResult.results.filter((r) => r.status === 'success').length}</span>
                  <span className="text-red-600 dark:text-red-400">{t('scripts.failed', 'Failed')}: {runResult.results.filter((r) => r.status === 'error').length}</span>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {runResult.results.map((r) => (
                    <ScriptBulkNodeResultItem key={r.node_id} result={r} />
                  ))}
                </div>
              </>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setRunTarget(null); setRunNodeIds([]); setRunTags(''); setRunResult(null) }}>{t('common.close')}</Button>
              <Button onClick={() => setRunResult(null)}>{t('scripts.runAgain', 'Run Again')}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{t('scripts.targetNodes', 'Target Nodes')}</p>
                <button
                  type="button"
                  onClick={() => setRunNodeIds(runNodeIds.length === nodes.length ? [] : nodes.map((n) => n.id))}
                  className="text-xs text-accent-600 dark:text-accent-400 hover:underline cursor-pointer"
                >
                  {runNodeIds.length === nodes.length ? t('common.deselectAll', 'Deselect all') : t('common.selectAll', 'Select all')}
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto border border-surface-200 dark:border-surface-700 rounded-lg divide-y divide-surface-200 dark:divide-surface-700">
                {nodes.map((node) => (
                  <label key={node.id} className="flex items-center gap-3 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={runNodeIds.includes(node.id)}
                      onChange={() => {
                        setRunNodeIds((prev) => prev.includes(node.id) ? prev.filter((id) => id !== node.id) : [...prev, node.id])
                      }}
                      className="rounded border-surface-300 dark:border-surface-600"
                    />
                    <span className="text-sm text-surface-900 dark:text-white">{node.name}</span>
                  </label>
                ))}
              </div>
              {runNodeIds.length > 0 && (
                <p className="text-xs text-surface-500">{t('scripts.selectedNodes', { count: runNodeIds.length })}</p>
              )}
            </div>
            <Input label={t('scripts.targetTags', 'Target Tags (optional, comma separated)')} placeholder="production, linux" value={runTags} onChange={(e) => setRunTags(e.target.value)} />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setRunTarget(null); setRunNodeIds([]); setRunTags(''); setRunResult(null) }}>{t('common.cancel')}</Button>
              <Button onClick={() => {
                if (runTarget) {
                  const data: { node_ids?: string[]; node_tags?: string[] } = {}
                  if (runNodeIds.length > 0) data.node_ids = runNodeIds
                  if (runTags) data.node_tags = runTags.split(',').map((s) => s.trim()).filter(Boolean)
                  runScript.mutate({ id: runTarget.id, data }, { onSuccess: (response) => { toast('success', t('scripts.toastStarted', { name: runTarget.name })); setRunResult(response) }, onError: () => toast('error', t('scripts.toastRunFailed', { name: runTarget.name })) })
                }
              }} disabled={runScript.isPending}>{runScript.isPending ? <Spinner size="sm" /> : t('scripts.run')}</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={t('scripts.deleteTitle')} message={t('scripts.deleteMsg', { name: deleteTarget?.name })} confirmLabel={t('common.delete')} loading={deleteScript.isPending} />
    </div>
  )
}
