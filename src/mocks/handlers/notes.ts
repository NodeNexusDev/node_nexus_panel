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
      target_type: params.targetType,
      target_id: params.targetId,
      content: body.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(note, { status: 201 })
  }),

  http.put(`${API}/api/v1/notes/:noteId`, async ({ params, request }) => {
    const note = mockNotes.find((n) => n.id === params.noteId)
    if (!note) return new HttpResponse(null, { status: 404 })
    const body = await request.json() as { content: string }
    return HttpResponse.json({ ...note, ...body, updated_at: new Date().toISOString() })
  }),

  http.delete(`${API}/api/v1/notes/:noteId`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
