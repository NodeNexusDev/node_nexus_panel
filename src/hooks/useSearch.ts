import { useQuery } from '@tanstack/react-query'
import { searchApi } from '../api/search'
import type { SearchResult } from '../api/types'

export function useSearch(query: string) {
  return useQuery<SearchResult[]>({
    queryKey: ['search', query],
    queryFn: () => searchApi.search(query),
    enabled: query.length >= 2,
  })
}
