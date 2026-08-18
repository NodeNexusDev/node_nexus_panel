import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notesApi } from '../api/notes'
import type { Note, NoteCreate, NoteUpdate } from '../api/types'

export function useNotes(targetType: string, targetId: string) {
  return useQuery<Note[]>({
    queryKey: ['notes', targetType, targetId],
    queryFn: () => notesApi.get(targetType, targetId),
    enabled: !!targetType && !!targetId,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetType,
      targetId,
      data,
    }: {
      targetType: string
      targetId: string
      data: NoteCreate
    }) => notesApi.create(targetType, targetId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.targetType, variables.targetId] })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: NoteUpdate }) =>
      notesApi.update(noteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (noteId: string) => notesApi.remove(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}
