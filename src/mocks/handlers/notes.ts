import { http, HttpResponse } from 'msw'
import { mockNotes } from '../data/notes'

const API = '*'

export const notesHandlers = [
  http.get(`${API}/api/v1/notes/:targetType/:targetId`, ({ params }) => {
    const notes = mockNotes.filter(
      (n) => n.target_type === params.targetType && n.target_id === params.targetId,
    )
    return HttpResponse.json(notes)
  }),

  http.post(`${API}/api/v1/notes/:targetType/:targetId`, async ({ params, request }) => {
    const body = await request.json() as { content: string }
    const note = {
      id: String(mockNotes.length + 1),
      target_type: params.targetType as 'node' | 'command' | 'script',
      target_id: params.targetId as string,
      content: body.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockNotes.push(note)
    return HttpResponse.json(note, { status: 201 })
  }),

  http.put(`${API}/api/v1/notes/:noteId`, async ({ params, request }) => {
    const idx = mockNotes.findIndex((n) => n.id === params.noteId)
    if (idx === -1) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    const body = await request.json() as { content: string }
    Object.assign(mockNotes[idx], body, { updated_at: new Date().toISOString() })
    return HttpResponse.json(mockNotes[idx])
  }),

  http.delete(`${API}/api/v1/notes/:noteId`, ({ params }) => {
    const idx = mockNotes.findIndex((n) => n.id === params.noteId)
    if (idx !== -1) mockNotes.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
