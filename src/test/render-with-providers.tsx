import { render, type RenderOptions } from '@testing-library/react'
import { TestProviders } from './TestProviders'
import { createTestQueryClient } from './query-client'

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
