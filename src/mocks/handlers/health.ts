import { http, HttpResponse } from 'msw'

export const healthHandlers = [
  http.get('*/health', () => {
    return HttpResponse.json({ status: 'healthy', version: '0.17.1' })
  }),
  http.get('*/ready', () => {
    return HttpResponse.json({ status: 'ready' })
  }),
]
