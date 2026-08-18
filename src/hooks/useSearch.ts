import { useQuery } from '@tanstack/react-query'
import { searchApi } from '../api/search'
import type { GlobalSearchResponse } from '../api/types'

export function useSearch(query: string) {
  return useQuery<GlobalSearchResponse>({
    queryKey: ['search', query],
    queryFn: () => searchApi.search(query),
    enabled: query.length >= 2,
  })
}
