import { env } from '../lib/env'
import type { HealthResponse } from './types'

const API_URL = env.VITE_API_URL

export const healthApi = {
  getHealth: () =>
    fetch(`${API_URL}/health`).then((r) => r.json() as Promise<HealthResponse>),
}
