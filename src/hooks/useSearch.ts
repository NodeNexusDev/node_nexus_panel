import { useQuery } from '@tanstack/react-query'
import { searchApi } from '../api/search'
import type { GlobalSearchResponse } from '../api/types'

export function useSearch(query: string, limit?: number) {
  return useQuery<GlobalSearchResponse>({
    queryKey: ['search', query, limit],
    queryFn: () => searchApi.search(query, limit),
    enabled: query.length >= 2,
  })
}
