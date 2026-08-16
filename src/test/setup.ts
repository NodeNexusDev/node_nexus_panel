import '@testing-library/jest-dom/vitest'
import { server } from './mocks/handlers'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
