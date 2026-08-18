import { api } from './client'
import type { SearchResult } from './types'

export const searchApi = {
  search: (query: string) =>
    api.get<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`),
}
