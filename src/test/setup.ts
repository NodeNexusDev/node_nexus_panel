import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { server } from '../mocks/node'

vi.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: vi.fn().mockResolvedValue(undefined),
}))

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
