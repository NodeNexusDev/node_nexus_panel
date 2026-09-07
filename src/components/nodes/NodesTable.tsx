import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../ui/Badge'
import { Checkbox } from '../ui/Checkbox'
import { SortableHeader } from '../ui/SortableHeader'
import { TagBadge } from '../ui/TagBadge'
import { ResponsiveTable } from '../ui/ResponsiveTable'
import { IconNodes, IconDocker } from '../ui/Icons'
import { nodeStatusVariant } from '../../lib/variants'
import type { Node, NodeStatus } from '../../api/types'
import type { Column } from '../ui/table-types'
import type { SortKey } from '../../pages/Nodes'

function statusDot(status: NodeStatus): string {
  switch (status) {
    case 'active': return 'bg-green-500 status-online'
    case 'unreachable': return 'bg-amber-500'
    case 'error': return 'bg-red-500'
    default: return 'bg-surface-400'
  }
}

type Props = {
  nodes: Node[]
  selectedIds: string[]
  sort: { key: SortKey; dir: 'asc' | 'desc' } | null
  toggleSort: (key: SortKey) => void
  toggleSelect: (id: string) => void
  toggleAll: () => void
  allSelected: boolean
  setTagFilter: React.Dispatch<React.SetStateAction<string[]>>
  onRowClick: (node: Node) => void
}

export function NodesTable({ nodes, selectedIds, sort, toggleSort, toggleSelect, toggleAll, allSelected, setTagFilter, onRowClick }: Props) {
  const { t } = useTranslation()

  const columns: Column<Node>[] = useMemo(() => [
    {
      key: 'select',
      header: <Checkbox checked={allSelected} onChange={toggleAll} ariaLabel={t('common.selectAll')} />,
      className: 'w-10',
      render: (node: Node) => <Checkbox checked={selectedIds.includes(node.id)} onChange={() => toggleSelect(node.id)} ariaLabel={t('common.selectItem', 'Select {{name}}', { name: node.name })} />,
    },
    {
      key: 'node',
      header: <SortableHeader label={t('nodes.node')} sortKey="name" sort={sort as never} onSort={toggleSort as never} />,
      render: (node: Node) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${node.status === 'active' ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' : node.status === 'unreachable' ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
            <IconNodes className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{node.name}</p>
            <p className="text-xs text-surface-500 dark:text-surface-500 font-mono truncate">{node.host}:{node.port}{node.username ? ` (${node.username})` : ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: <SortableHeader label={t('nodes.status')} sortKey="status" sort={sort as never} onSort={toggleSort as never} />,
      render: (node) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusDot(node.status)}`} />
          <Badge variant={nodeStatusVariant(node.status)}>{node.status}</Badge>
        </div>
      ),
    },
    {
      key: 'type',
      header: <SortableHeader label={t('nodes.type')} sortKey="connection_type" sort={sort as never} onSort={toggleSort as never} />,
      render: (node) => <span className="text-sm text-surface-600 dark:text-surface-300">{node.connection_type}</span>,
    },
    {
      key: 'has_docker',
      header: <SortableHeader label={t('nodes.hasDocker', 'Docker')} sortKey="has_docker" sort={sort as never} onSort={toggleSort as never} />,
      className: 'w-20 text-center',
      render: (node) => (
        <span className={`inline-flex items-center justify-center gap-1 text-xs font-medium ${node.has_docker ? 'text-green-600 dark:text-green-400' : 'text-surface-400'}`}>
          {node.has_docker ? <><IconDocker className="w-4 h-4" /> {t('common.yes')}</> : '—'}
        </span>
      ),
    },
    {
      key: 'tags',
      header: <SortableHeader label={t('nodes.tags')} sortKey="tags" sort={sort as never} onSort={toggleSort as never} />,
      render: (node) => (
        <div className="flex flex-wrap gap-1">
          {node.tags.length > 0 ? node.tags.map((tag) => <TagBadge key={tag} tag={tag} onClick={() => setTagFilter((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])} />) : <span className="text-surface-400">—</span>}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: <SortableHeader label={t('nodes.created')} sortKey="created_at" sort={sort as never} onSort={toggleSort as never} />,
      render: (node) => <span className="text-sm text-surface-600 dark:text-surface-300">{new Date(node.created_at).toLocaleDateString()}</span>,
    },
    {
      key: 'updated_at',
      header: <SortableHeader label={t('nodes.updated')} sortKey="updated_at" sort={sort as never} onSort={toggleSort as never} />,
      render: (node) => <span className="text-sm text-surface-600 dark:text-surface-300">{new Date(node.updated_at).toLocaleDateString()}</span>,
    },
  ], [allSelected, selectedIds, sort, toggleSort, toggleAll, toggleSelect, t, setTagFilter])

  const renderMobileNode = useCallback((node: Node) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${node.status === 'active' ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
            <IconNodes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-900 dark:text-white">{node.name}</p>
            <p className="text-xs text-surface-500 dark:text-surface-500 font-mono">{node.host}:{node.port}{node.username ? ` (${node.username})` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={nodeStatusVariant(node.status)}>{node.status}</Badge>
          {node.has_docker && <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><IconDocker className="w-3.5 h-3.5" /> {t('nodes.hasDockerBadge')}</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {node.tags.length > 0 ? node.tags.map((tag) => <TagBadge key={tag} tag={tag} onClick={() => setTagFilter((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])} />) : <span className="text-surface-400">—</span>}
      </div>
      <div className="flex items-center gap-3 text-xs text-surface-500">
        <span>{t('nodes.created')}: {new Date(node.created_at).toLocaleDateString()}</span>
        <span>{t('nodes.updated')}: {new Date(node.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  ), [t, setTagFilter])

  return <ResponsiveTable data={nodes} columns={columns} renderMobileItem={renderMobileNode} keyExtractor={(n) => n.id} emptyMessage={t('nodes.emptyTitle')} onRowClick={onRowClick} />
}
