import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import { ToastProvider } from '../components/ui/Toast'
import { createTestQueryClient } from './query-client'
import type { QueryClient } from '@tanstack/react-query'

interface TestProvidersProps {
  children: ReactNode
  initialEntries?: string[]
  queryClient?: QueryClient
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
