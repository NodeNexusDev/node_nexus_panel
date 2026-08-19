import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import { Spinner } from './Spinner'
import { ConfirmDialog } from './ConfirmDialog'
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '../../hooks/useNotes'
import type { Note } from '../../api/types'

interface NotesPanelProps {
  targetType: 'node' | 'command' | 'script'
  targetId: string
}

export function NotesPanel({ targetType, targetId }: NotesPanelProps) {
  const { t } = useTranslation()
  const { data: notes, isLoading } = useNotes(targetType, targetId)
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

  const [newContent, setNewContent] = useState('')
  const [editTarget, setEditTarget] = useState<Note | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null)
  const editDialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const handleCreate = () => {
    createNote.mutate(
      { targetType, targetId, data: { target_type: targetType, target_id: targetId, content: newContent } },
      { onSuccess: () => setNewContent('') },
    )
  }

  const handleSaveEdit = () => {
    if (!editTarget) return
    updateNote.mutate(
      { noteId: editTarget.id, data: { content: editContent } },
      { onSuccess: () => setEditTarget(null) },
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteNote.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const closeEditDialog = useCallback(() => {
    setEditTarget(null)
  }, [])

  useEffect(() => {
    if (!editTarget) return
    previousFocusRef.current = document.activeElement as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeEditDialog()
        return
      }
      if (e.key === 'Tab' && editDialogRef.current) {
        const focusable = editDialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus() }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    requestAnimationFrame(() => {
      editDialogRef.current?.querySelector<HTMLElement>('textarea')?.focus()
    })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [editTarget, closeEditDialog])

  if (isLoading) return <Spinner size="sm" className="my-4" />

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300">{t('notes.title')}</h4>

      {notes && notes.length > 0 ? (
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="p-2 bg-surface-50 rounded-lg dark:bg-surface-800/50 group">
              <p className="text-sm text-surface-700 dark:text-surface-300 whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-surface-500">{new Date(note.updated_at).toLocaleDateString()}</p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setEditTarget(note); setEditContent(note.content) }}>{t('common.edit')}</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(note)} className="text-red-500">{t('common.delete')}</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-surface-500">{t('notes.empty')}</p>
      )}

      <div className="flex gap-2">
        <textarea
          rows={2}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder={t('notes.placeholder')}
          className="flex-1 px-3 py-2 border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white resize-none"
        />
        <Button size="sm" onClick={handleCreate} disabled={createNote.isPending || !newContent.trim()}>
          {createNote.isPending ? <Spinner size="sm" /> : t('common.save')}
        </Button>
      </div>

      {editTarget && (
        <div
          ref={editDialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('notes.editTitle')}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div className="bg-white dark:bg-surface-900 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">{t('notes.editTitle')}</h3>
            <textarea
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="ghost" onClick={closeEditDialog}>{t('common.cancel')}</Button>
              <Button onClick={handleSaveEdit} disabled={updateNote.isPending}>{t('common.save')}</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('notes.deleteTitle')}
        message={t('notes.deleteMsg')}
        confirmLabel={t('common.delete')}
        loading={deleteNote.isPending}
      />
    </div>
  )
}
