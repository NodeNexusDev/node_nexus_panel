// Emulated dashboard via v2 (since /dashboard removed in 2.0) — pulls real counts from v2 endpoints
import { api } from './client'
import type { DashboardResponse, DashboardMetricsResponse } from './types'

export const dashboardApi = {
  getStats: async (): Promise<DashboardResponse> => {
    try {
      const [nodesRes, auditRes, commandsRes, scriptsRes, packsRes] = await Promise.all([
        api.get<{ items: Array<{ id: string; status: string; has_docker?: boolean }>; has_more: boolean; next_cursor: string | null; total?: number }>(`/nodes/?limit=100`).catch(() => ({ items: [], has_more: false, next_cursor: null })),
        api.get<{ items: Array<{ id: string; action: string; node_id: string | null; user: string | null; details: string | null; created_at: string }> }>(`/audit/?limit=8`).catch(() => ({ items: [] })),
        api.get<{ total?: number; items?: unknown[] }>(`/commands/?limit=1`).catch(() => ({ total: 0 })),
        api.get<{ total?: number; items?: unknown[] }>(`/scripts/?limit=1`).catch(() => ({ total: 0 })),
        api.get<{ total: number; installed: number; not_installed: number }>(`/templates/packs/stats`).catch(() => ({ total: 0, installed: 0, not_installed: 0 })),
      ])
      const nodes = (nodesRes as unknown as { items: Array<{ id: string; status: string; has_docker?: boolean }> }).items || []
      const total = (nodesRes as { total?: number })?.total ?? nodes.length
      const active = nodes.filter((n) => n.status === 'active').length
      const unreachable = nodes.filter((n) => n.status === 'unreachable').length
      const recent_activity = ((auditRes as unknown as { items: unknown[] }).items || []).slice(0, 8) as DashboardResponse['recent_activity']
      const commandsTotal = (commandsRes as { total?: number })?.total ?? (commandsRes as { items?: unknown[] })?.items?.length ?? 0
      const scriptsTotal = (scriptsRes as { total?: number })?.total ?? (scriptsRes as { items?: unknown[] })?.items?.length ?? 0
      const packs = packsRes as { total: number; installed: number; not_installed: number }
      // Docker stats: aggregate where available — per-node system/info for has_docker nodes
      let docker = { total: 0, running: 0, stopped: 0 }
      const dockerNodeIds = nodes.filter((n) => n.has_docker).map((n) => n.id).slice(0, 20)
      if (dockerNodeIds.length > 0) {
        const results = await Promise.all(
          dockerNodeIds.map((id) =>
            api
              .get<{ containers_running: number; containers_stopped: number }>(`/nodes/${id}/docker/system/info`)
              .catch(() => null),
          ),
        )
        let running = 0
        let stopped = 0
        for (const r of results) {
          if (r) {
            running += r.containers_running ?? 0
            stopped += r.containers_stopped ?? 0
          }
        }
        docker = { total: running + stopped, running, stopped }
      }
      return {
        nodes: { total, active, unreachable },
        docker,
        scripts: { total: scriptsTotal },
        commands: { total: commandsTotal },
        recent_activity,
        ...(packs ? { packs } as unknown as Pick<DashboardResponse, never> : {}),
      } as DashboardResponse & { packs?: { total: number; installed: number; not_installed: number } }
    } catch {
      return { nodes: { total: 0, active: 0, unreachable: 0 }, docker: { total: 0, running: 0, stopped: 0 }, scripts: { total: 0 }, commands: { total: 0 }, recent_activity: [] }
    }
  },

  getMetrics: async (params?: { date_from?: string; date_to?: string; group_by?: string }): Promise<DashboardMetricsResponse> => {
    const query = new URLSearchParams()
    if (params?.date_from) query.set('date_from', params.date_from)
    if (params?.date_to) query.set('date_to', params.date_to)
    if (params?.group_by) query.set('group_by', params.group_by)
    const qs = query.toString()
    try {
      const [cmdStats, scriptStats] = await Promise.all([
        api.get<unknown>(`/commands/stats${qs ? `?${qs}` : ''}`).catch(() => ({ command_metrics: [] })),
        api.get<unknown>(`/scripts/stats${qs ? `?${qs}` : ''}`).catch(() => ({ script_metrics: [] })),
      ])
      // Try to shape as DashboardMetricsResponse; fallback to empty
      const cmd = (cmdStats as { command_metrics?: unknown[]; buckets?: unknown[] })?.command_metrics || (cmdStats as { buckets?: unknown[] })?.buckets || []
      const scr = (scriptStats as { script_metrics?: unknown[]; buckets?: unknown[] })?.script_metrics || (scriptStats as { buckets?: unknown[] })?.buckets || []
      return { command_metrics: cmd as DashboardMetricsResponse['command_metrics'], script_metrics: scr as DashboardMetricsResponse['script_metrics'] }
    } catch {
      return { command_metrics: [], script_metrics: [] }
    }
  },
}
