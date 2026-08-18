import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { TestProviders } from './TestProviders'

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
