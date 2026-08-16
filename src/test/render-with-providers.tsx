import type { ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import { ToastProvider } from '../components/ui/Toast'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/handlers'

const API_URL = 'http://localhost:8000'

// Add missing handlers for tests
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

// Setup additional handlers
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

interface TestProvidersProps {
  children: ReactNode
  initialEntries?: string[]
  queryClient?: QueryClient
}

function TestProviders({ children, initialEntries = ['/'], queryClient }: TestProvidersProps) {
  const client = queryClient || createTestQueryClient()
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={client}>
        <I18nextProvider i18n={i18n}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </I18nextProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

export function renderWithProviders(
  ui: ReactNode,
  options: Omit<RenderOptions, 'wrapper'> & { initialEntries?: string[] } = {},
) {
  const { initialEntries, ...renderOptions } = options
  return {
    ...render(ui, {
      wrapper: ({ children }) => <TestProviders initialEntries={initialEntries}>{children}</TestProviders>,
      ...renderOptions,
    }),
    queryClient: createTestQueryClient(),
  }
}
