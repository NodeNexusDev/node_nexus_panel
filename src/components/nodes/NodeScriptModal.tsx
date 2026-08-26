import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { SearchInput } from '../ui/SearchInput'
import { Spinner } from '../ui/Spinner'
import { IconScripts } from '../ui/Icons'
import { useScripts, useRunScript } from '../../hooks/useScripts'
import { useToast } from '../ui/useToast'
import type { Node, ScriptResponse } from '../../api/types'

interface NodeScriptModalProps {
  node: Node | null
  onClose: () => void
}

export function NodeScriptModal({ node, onClose }: NodeScriptModalProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: scriptsData } = useScripts({ size: 100 })
  const scripts = scriptsData?.items || []
  const runScript = useRunScript()

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ScriptResponse | null>(null)

  useEffect(() => {
    if (node) {
      setSearch('')
      setSelected(null)
    }
  }, [node])

  const filtered = scripts.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  const handleRun = () => {
    if (!node || !selected) return
    runScript.mutate(
      { id: selected.id, data: { node_ids: [node.id] } },
      {
        onSuccess: () => { toast('success', t('scripts.toastStarted', { name: selected.name })); onClose() },
        onError: () => toast('error', t('scripts.toastRunFailed', { name: selected.name })),
      },
    )
  }

  return (
    <Modal isOpen={!!node} onClose={onClose} title={node ? `${t('nodes.runScript', 'Run Script')}: ${node.name}` : t('nodes.runScript', 'Run Script')} size="lg">
      <div className="space-y-3">
        <SearchInput value={search} onChange={setSearch} placeholder={t('nodes.selectScript', 'Search scripts...')} />
        <div className="max-h-64 overflow-y-auto divide-y divide-surface-200 dark:divide-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg">
          {filtered.length === 0 ? (
            <p className="text-sm text-surface-500 text-center py-4">{t('nodes.noScripts', 'No scripts')}</p>
          ) : filtered.map((script) => (
            <button
              key={script.id}
              type="button"
              onClick={() => setSelected(script)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                selected?.id === script.id ? 'bg-accent-50 dark:bg-accent-900/20' : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'
              }`}
            >
              <IconScripts className="w-4 h-4 text-surface-400 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-surface-900 dark:text-white truncate">{script.name}</p>
                {script.description && <p className="text-xs text-surface-500 truncate">{script.description}</p>}
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={handleRun} disabled={!selected || runScript.isPending}>{runScript.isPending ? <Spinner size="sm" /> : t('scripts.run')}</Button>
        </div>
      </div>
    </Modal>
  )
}
