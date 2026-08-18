import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000'

export const configHandlers = [
  http.get(`${API}/api/v1/config/export`, () => {
    return HttpResponse.json({ version: '0.11.1', nodes: [], commands: [], scripts: [] })
  }),

  http.post(`${API}/api/v1/config/import`, () => {
    return HttpResponse.json({ message: 'Configuration imported successfully' })
  }),
]
