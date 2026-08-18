import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { IconTag } from '../components/ui/Icons'
import { useNodeTags } from '../hooks/useNodes'
import { useCommandTags } from '../hooks/useCommands'
import { useScriptTags } from '../hooks/useScripts'
import { useRenameTag, useDeleteTag } from '../hooks/useTags'
import { useToast } from '../components/ui/useToast'

interface TagSummary {
  name: string
  count: number
}

export function Tags() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: nodeTags } = useNodeTags()
  const { data: commandTags } = useCommandTags()
  const { data: scriptTags } = useScriptTags()
  const renameTag = useRenameTag()
  const deleteTag = useDeleteTag()

  const [renameTarget, setRenameTarget] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const tags = useMemo<TagSummary[]>(() => {
    const counts = new Map<string, number>()
    const add = (list?: string[]) => {
      for (const tag of list ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
    add(nodeTags)
    add(commandTags)
    add(scriptTags)
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [nodeTags, commandTags, scriptTags])

  const isLoading = nodeTags === undefined || commandTags === undefined || scriptTags === undefined

  const handleRename = () => {
    if (!renameTarget || !newName.trim()) return
    renameTag.mutate(
      { oldName: renameTarget, newName: newName.trim() },
      {
        onSuccess: () => {
          toast('success', t('tags.toastRenamed', { name: renameTarget }))
          setRenameTarget(null)
          setNewName('')
        },
        onError: () => toast('error', t('tags.toastRenameFailed')),
      },
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteTag.mutate(deleteTarget, {
      onSuccess: () => {
        toast('success', t('tags.toastDeleted', { name: deleteTarget }))
        setDeleteTarget(null)
      },
      onError: () => toast('error', t('tags.toastDeleteFailed')),
    })
  }

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold gradient-text">{t('tags.title')}</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">{t('tags.description')}</p>
      </div>

      <Card className="stagger-item">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : tags.length === 0 ? (
            <EmptyState
              icon={<IconTag className="w-10 h-10" />}
              title={t('tags.emptyTitle')}
              description={t('tags.emptyDesc')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-zebra">
                <thead className="table-sticky">
                  <tr className="border-b border-surface-200 dark:border-surface-800">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('tags.name')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('tags.usedIn')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase">{t('tags.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                  {tags.map((tag) => (
                    <tr key={tag.name} className="table-row-hover">
                      <td className="px-6 py-4">
                        <Badge variant="default">{tag.name}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-300">{tag.count}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setRenameTarget(tag.name); setNewName(tag.name) }}>{t('common.edit')}</Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(tag.name)} className="text-red-500 hover:text-red-600">{t('common.delete')}</Button>
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

      <Modal isOpen={!!renameTarget} onClose={() => { setRenameTarget(null); setNewName('') }} title={t('tags.renameTitle', { name: renameTarget || '' })} size="sm">
        <div className="space-y-4">
          <Input label={t('tags.newName')} value={newName} onChange={(e) => setNewName(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setRenameTarget(null); setNewName('') }}>{t('common.cancel')}</Button>
            <Button onClick={handleRename} disabled={renameTag.isPending || !newName.trim()}>
              {renameTag.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('tags.deleteTitle')}
        message={t('tags.deleteMsg', { name: deleteTarget || '' })}
        confirmLabel={t('common.delete')}
        loading={deleteTag.isPending}
      />
    </div>
  )
}
