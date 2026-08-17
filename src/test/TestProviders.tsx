import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import { ToastProvider } from '../components/ui/Toast'

interface TestProvidersProps {
  children: ReactNode
  initialEntries?: string[]
  queryClient?: QueryClient
}

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

export function TestProviders({ children, initialEntries = ['/'], queryClient }: TestProvidersProps) {
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
