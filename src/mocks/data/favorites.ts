import type { Favorite, SearchResult } from '../../api/types'
import { mockNodes } from './nodes'
import { mockCommands } from './commands'
import { mockScripts } from './scripts'

export const mockFavorites: Favorite[] = [
  { id: '1', target_type: 'node', target_id: '1', created_at: '2025-08-18T10:00:00Z' },
  { id: '2', target_type: 'command', target_id: '1', created_at: '2025-08-17T09:00:00Z' },
]

export function getSearchResults(query: string): SearchResult[] {
  const q = query.toLowerCase()
  const results: SearchResult[] = []

  mockNodes.forEach((n) => {
    if (n.name.toLowerCase().includes(q) || n.host.toLowerCase().includes(q)) {
      results.push({ id: n.id, type: 'node', name: n.name, description: `${n.host}:${n.port}`, tags: n.tags, score: 1 })
    }
  })
  mockCommands.forEach((c) => {
    if (c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)) {
      results.push({ id: c.id, type: 'command', name: c.name, description: c.description, tags: c.tags, score: 1 })
    }
  })
  mockScripts.forEach((s) => {
    if (s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q)) {
      results.push({ id: s.id, type: 'script', name: s.name, description: s.description, tags: s.tags, score: 1 })
    }
  })

  return results
}
