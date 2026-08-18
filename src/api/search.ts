import { api } from './client'
import type { GlobalSearchResponse } from './types'

export const searchApi = {
  search: (query: string, limit?: number) => {
    const params = new URLSearchParams({ q: query })
    if (limit) params.set('limit', String(limit))
    return api.get<GlobalSearchResponse>(`/search?${params}`)
  },
}
