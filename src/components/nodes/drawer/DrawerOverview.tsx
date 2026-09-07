// oxlint-disable react/set-state-in-effect, react/exhaustive-effect-dependencies, react/no-array-index-key, react-hooks/exhaustive-deps
import { useTranslation } from 'react-i18next'
import { Badge } from '../../ui/Badge'
import { IconCopy } from '../../ui/Icons'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard'
import { nodeStatusVariant } from '../../../lib/variants'
import type { Node } from '../../../api/types'

export function DrawerOverview({ node }: { node: Node }) {
  const { t } = useTranslation()
  const { copy } = useCopyToClipboard()
  const rows: [string, React.ReactNode][] = [
    [t('nodes.host'), (
      <span key="host" className="inline-flex items-center gap-2 font-mono text-xs">
        {node.host}:{node.port}
        <button onClick={() => copy(`${node.host}:${node.port}`)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 cursor-pointer"><IconCopy className="w-3 h-3 text-surface-400" /></button>
      </span>
    )],
    [t('nodes.descriptionLabel', 'Description'), (node as unknown as { description?: string | null }).description ? <span key="desc" className="text-xs">{(node as unknown as { description: string }).description}</span> : '—'],
    [t('nodes.connectionType'), <Badge key="ct" variant="info">{node.connection_type}</Badge>],
    [t('nodes.status'), <Badge key="s" variant={nodeStatusVariant(node.status)}>{node.status}</Badge>],
    [t('nodes.username', 'Username'), node.username ? <span key="u" className="inline-flex items-center gap-1 text-xs">{node.username}<button onClick={() => copy(node.username!)} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 cursor-pointer"><IconCopy className="w-3 h-3 text-surface-400" /></button></span> : '—'],
    [t('nodes.dockerHost', 'Docker Host'), node.docker_host ? <span key="d" className="font-mono text-xs truncate max-w-[160px]">{node.docker_host}</span> : '—'],
    [t('nodes.hasDocker', 'Has Docker'), node.has_docker ? <Badge key="hd" variant="success">{t('common.yes')}</Badge> : <Badge key="hd2" variant="default">{t('common.no')}</Badge>],
    [t('nodes.tags', 'Tags'), node.tags.length ? (
      <span key="tags" className="flex flex-wrap gap-1">
        {node.tags.map((tag) => <Badge key={tag} variant="default">{tag}</Badge>)}
      </span>
    ) : '—'],
    [t('nodes.created', 'Created'), new Date(node.created_at).toLocaleString()],
    [t('nodes.updated', 'Updated'), new Date(node.updated_at).toLocaleString()],
  ]
  return (
    <div className="grid grid-cols-1 gap-3">
      {rows.map(([label, value]) => (
        <div key={label} className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
          <p className="text-[11px] uppercase tracking-wide text-surface-500 dark:text-surface-400">{label}</p>
          <div className="text-sm font-medium text-surface-900 dark:text-white mt-1">{value}</div>
        </div>
      ))}
    </div>
  )
}
