import { http, HttpResponse } from 'msw'
import { mockNodes } from '../data/nodes'
import { mockCommands } from '../data/commands'
import { mockScripts } from '../data/scripts'

const API = '*'

export const configHandlers = [
  http.get(`${API}/api/v2/config/export`, () => {
    return HttpResponse.json({
      exported_at: new Date().toISOString(),
      format_version: '1.0',
      version: '0.14.0',
      application_version: '0.14.0',
      nodes: mockNodes.map((n) => ({ name: n.name, host: n.host, port: n.port, connection_type: n.connection_type, tags: n.tags, username: n.username })),
      commands: mockCommands.map((c) => ({ name: c.name, description: c.description, command: c.command, parameters: c.parameters, tags: c.tags })),
      scripts: mockScripts.map((s) => ({ name: s.name, description: s.description, steps: s.steps, tags: s.tags })),
    })
  }),

  http.post(`${API}/api/v2/config/import`, async ({ request }) => {
    const body = await request.json() as { nodes?: Record<string, unknown>[]; commands?: Record<string, unknown>[]; scripts?: Record<string, unknown>[]; dry_run?: boolean }
    if (body.dry_run) {
      return HttpResponse.json({
        dry_run: true,
        would_create: {
          nodes: (body.nodes || []).map((n) => ({ name: n.name, host: n.host, port: n.port || 22, connection_type: n.connection_type || 'ssh', tags: n.tags || [], username: n.username || null })),
          commands: (body.commands || []).map((c) => ({ name: c.name, command: c.command, description: c.description || null, tags: c.tags || [] })),
          scripts: (body.scripts || []).map((s) => ({ name: s.name, description: s.description || null, tags: s.tags || [] })),
        },
        duplicates: [],
        errors: [],
      })
    }
    return HttpResponse.json({
      nodes_created: (body.nodes || []).length,
      commands_created: (body.commands || []).length,
      scripts_created: (body.scripts || []).length,
      errors: [],
    })
  }),
]
