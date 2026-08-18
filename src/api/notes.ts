import { api } from './client'
import type { Note, NoteCreate, NoteUpdate } from './types'

export const notesApi = {
  get: (targetType: string, targetId: string) =>
    api.get<Note[]>(`/notes/${targetType}/${targetId}`),

  create: (targetType: string, targetId: string, data: NoteCreate) =>
    api.post<Note>(`/notes/${targetType}/${targetId}`, data),

  update: (noteId: string, data: NoteUpdate) =>
    api.put<Note>(`/notes/${noteId}`, data),

  remove: (noteId: string) =>
    api.delete<void>(`/notes/${noteId}`),
}
