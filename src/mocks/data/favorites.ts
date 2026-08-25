import type { GlobalSearchResponse, SearchResultItem, Favorite } from '../../api/types'
import { mockNodes } from './nodes'
import { mockCommands } from './commands'
import { mockScripts } from './scripts'

export const mockFavorites: Favorite[] = [
  { id: '1', target_type: 'node', target_id: '1', name: 'prod-server-01', note: 'Production server', created_at: '2025-08-18T10:00:00Z' },
  { id: '2', target_type: 'command', target_id: '1', name: 'Check Disk Space', note: null, created_at: '2025-08-17T09:00:00Z' },
]

export function getSearchResults(query: string): GlobalSearchResponse {
  const q = query.toLowerCase()
  const nodes: SearchResultItem[] = []
  const commands: SearchResultItem[] = []
  const scripts: SearchResultItem[] = []
  const tags: string[] = []

  mockNodes.forEach((n) => {
    if (n.name.toLowerCase().includes(q) || n.host.toLowerCase().includes(q)) {
      nodes.push({ id: n.id, name: n.name, entity_type: 'node' })
    }
  })
  mockCommands.forEach((c) => {
    if (c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)) {
      commands.push({ id: c.id, name: c.name, entity_type: 'command' })
    }
  })
  mockScripts.forEach((s) => {
    if (s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q)) {
      scripts.push({ id: s.id, name: s.name, entity_type: 'script' })
    }
  })

  const allTags = new Set<string>()
  mockNodes.forEach((n) => n.tags.forEach((t) => allTags.add(t)))
  mockCommands.forEach((c) => c.tags.forEach((t) => allTags.add(t)))
  mockScripts.forEach((s) => s.tags.forEach((t) => allTags.add(t)))
  allTags.forEach((t) => { if (t.toLowerCase().includes(q)) tags.push(t) })

  return { nodes, commands, scripts, tags }
}
