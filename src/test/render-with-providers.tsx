import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/handlers'
import { TestProviders } from './TestProviders'

const API_URL = 'http://localhost:8000'

const testHandlers = [
  http.get(`${API_URL}/api/command-history`, () => {
    return HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 20 })
  }),
  http.get(`${API_URL}/api/settings/profile`, () => {
    return HttpResponse.json({ data: { name: 'Admin', email: 'admin@example.com' } })
  }),
  http.get(`${API_URL}/api/settings/api-keys`, () => {
    return HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 20 })
  }),
  http.get(`${API_URL}/api/settings/notifications`, () => {
    return HttpResponse.json({ data: { nodeOfflineAlerts: true, commandNotifications: true } })
  }),
  http.put(`${API_URL}/api/settings/profile`, () => {
    return HttpResponse.json({ data: { name: 'Admin', email: 'admin@example.com' } })
  }),
  http.post(`${API_URL}/api/settings/api-keys`, () => {
    return HttpResponse.json({ data: { id: '1', name: 'test', key: 'sk-xxx', createdAt: new Date().toISOString() } })
  }),
  http.delete(`${API_URL}/api/settings/api-keys/:id`, () => {
    return HttpResponse.json({ data: { success: true } })
  }),
  http.put(`${API_URL}/api/settings/notifications`, () => {
    return HttpResponse.json({ data: { nodeOfflineAlerts: true, commandNotifications: true } })
  }),
  http.post(`${API_URL}/api/settings/reset`, () => {
    return HttpResponse.json({ data: { success: true } })
  }),
  http.post(`${API_URL}/api/scripts`, () => {
    return HttpResponse.json({ data: { id: '1', name: 'test.sh', description: 'Test', status: 'manual', schedule: 'Manual', lastRun: 'Never' } })
  }),
  http.delete(`${API_URL}/api/scripts/:id`, () => {
    return HttpResponse.json({ data: { success: true } })
  }),
  http.post(`${API_URL}/api/scripts/:id/run`, () => {
    return HttpResponse.json({ data: { success: true } })
  }),
]

server.use(...testHandlers)

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

export function renderWithProviders(
  ui: React.ReactNode,
  options: Omit<RenderOptions, 'wrapper'> & { initialEntries?: string[] } = {},
) {
  const { initialEntries, ...renderOptions } = options
  return {
    ...render(ui, {
      wrapper: ({ children }: { children: React.ReactNode }) => <TestProviders initialEntries={initialEntries}>{children}</TestProviders>,
      ...renderOptions,
    }),
    queryClient: createTestQueryClient(),
  }
}
