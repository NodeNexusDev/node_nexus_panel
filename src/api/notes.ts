import { api } from './client'
import type { NoteResponse, NoteCreate, NoteUpdate } from './types'

export const notesApi = {
  get: (targetType: string, targetId: string) =>
    api.get<NoteResponse[]>(`/notes/${targetType}/${targetId}`),

  create: (targetType: string, targetId: string, data: NoteCreate) =>
    api.post<NoteResponse>(`/notes/${targetType}/${targetId}`, data),

  update: (noteId: string, data: NoteUpdate) =>
    api.put<NoteResponse>(`/notes/${noteId}`, data),

  remove: (noteId: string) =>
    api.delete<void>(`/notes/${noteId}`),
}
