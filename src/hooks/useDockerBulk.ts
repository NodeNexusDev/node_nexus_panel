import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dockerApi } from '../api/docker'

async function aggregateBulkResults<T extends { total: number; succeeded: number; failed: number; results: unknown[] }>(calls: Promise<T>[], nodeIds?: string[]): Promise<T> {
  const settled = await Promise.allSettled(calls)
  const results: unknown[] = []
  let total = 0
  let succeeded = 0
  let failed = 0
  for (let i = 0; i < settled.length; i++) {
    const s = settled[i]
    if (s.status === 'fulfilled') {
      const v = s.value as T
      total += v.total ?? 0
      succeeded += v.succeeded ?? 0
      failed += v.failed ?? 0
      results.push(...(v.results ?? []))
    } else {
      failed += 1
      total += 1
      const reason = (s.reason as { message?: string; error?: { message?: string } })?.message ?? (s.reason as Error)?.message ?? String(s.reason)
      const nodeId = nodeIds?.[i] ?? `unknown-${i}`
      results.push({ node_id: nodeId, container_id: nodeId, image: nodeId, network_id: nodeId, volume_name: nodeId, status: 'error', error: reason } as T['results'][number])
    }
  }
  return { total, succeeded, failed, results } as T
}

function invalidateDocker(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['docker'] })
  qc.invalidateQueries({ queryKey: ['nodes'] })
}

// Per-node bulk wrappers (v2) — supports multi-node by aggregating per-node calls
export function useBulkDockerExec() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { container_id: string; node_ids: string[]; command?: string; timeout?: number } | { nodeId: string; container_ids: string[]; command: string }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[]; command?: string; timeout?: number }
      const nodeIds = d.nodeId ? [d.nodeId] : d.node_ids ?? []
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      const command = d.command || ''
      const timeout = d.timeout ?? 30
      if (nodeIds.length === 0) throw new Error('nodeIds required')
      if (nodeIds.length === 1) return dockerApi.bulkExec(nodeIds[0], { container_ids, command, timeout } as Parameters<typeof dockerApi.bulkExec>[1])
      return aggregateBulkResults(nodeIds.map((id) => dockerApi.bulkExec(id, { container_ids, command, timeout } as Parameters<typeof dockerApi.bulkExec>[1])), nodeIds)
    },
    onSuccess: () => invalidateDocker(queryClient),
  })
}

export function useBulkDockerRestart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { container_id: string; node_ids: string[] } | { nodeId: string; container_ids: string[] }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[] }
      const nodeIds = d.nodeId ? [d.nodeId] : d.node_ids ?? []
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      if (nodeIds.length === 0) throw new Error('nodeIds required')
      if (nodeIds.length === 1) return dockerApi.bulkRestart(nodeIds[0], { container_ids })
      return aggregateBulkResults(nodeIds.map((id) => dockerApi.bulkRestart(id, { container_ids })), nodeIds)
    },
    onSuccess: () => invalidateDocker(queryClient),
  })
}

export function useBulkDockerStart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { container_id: string; node_ids: string[] } | { nodeId: string; container_ids: string[] }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[] }
      const nodeIds = d.nodeId ? [d.nodeId] : d.node_ids ?? []
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      if (nodeIds.length === 0) throw new Error('nodeIds required')
      if (nodeIds.length === 1) return dockerApi.bulkStart(nodeIds[0], { container_ids })
      return aggregateBulkResults(nodeIds.map((id) => dockerApi.bulkStart(id, { container_ids })), nodeIds)
    },
    onSuccess: () => invalidateDocker(queryClient),
  })
}

export function useBulkDockerStop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { container_id: string; node_ids: string[]; timeout?: number } | { nodeId: string; container_ids: string[]; timeout?: number }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[]; timeout?: number }
      const nodeIds = d.nodeId ? [d.nodeId] : d.node_ids ?? []
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      if (nodeIds.length === 0) throw new Error('nodeIds required')
      if (nodeIds.length === 1) return dockerApi.bulkStop(nodeIds[0], { container_ids }, d.timeout)
      return aggregateBulkResults(nodeIds.map((id) => dockerApi.bulkStop(id, { container_ids }, d.timeout)), nodeIds)
    },
    onSuccess: () => invalidateDocker(queryClient),
  })
}

export function useBulkDockerRemove() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { container_id: string; node_ids: string[] } | { nodeId: string; container_ids: string[] }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[] }
      const nodeIds = d.nodeId ? [d.nodeId] : d.node_ids ?? []
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      if (nodeIds.length === 0) throw new Error('nodeIds required')
      if (nodeIds.length === 1) return dockerApi.bulkRemove(nodeIds[0], { container_ids })
      return aggregateBulkResults(nodeIds.map((id) => dockerApi.bulkRemove(id, { container_ids })), nodeIds)
    },
    onSuccess: () => invalidateDocker(queryClient),
  })
}

export function useBulkDockerImageBuild() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { node_ids?: string[]; node_tags?: string[]; dockerfile: string; tag: string } | { nodeId: string; dockerfile: string; tag: string }) => {
      const d = data as { node_ids?: string[]; nodeId?: string; dockerfile: string; tag: string; no_cache?: boolean }
      const nodeIds = d.nodeId ? [d.nodeId] : d.node_ids ?? []
      if (nodeIds.length === 0) throw new Error('nodeIds required')
      if (nodeIds.length === 1) return dockerApi.buildImage(nodeIds[0], { dockerfile: d.dockerfile, tag: d.tag, no_cache: d.no_cache })
      const settled = await Promise.allSettled(nodeIds.map((id) => dockerApi.buildImage(id, { dockerfile: d.dockerfile, tag: d.tag, no_cache: d.no_cache })))
      let succeeded = 0
      let failed = 0
      for (const s of settled) if (s.status === 'fulfilled') succeeded++; else failed++
      return { total: nodeIds.length, succeeded, failed, results: settled.map((s, i) => ({ node_id: nodeIds[i], status: s.status === 'fulfilled' ? 'success' : 'failed' })) } as unknown as ReturnType<typeof dockerApi.buildImage> extends Promise<infer T> ? T : never
    },
    onSuccess: () => invalidateDocker(queryClient),
  })
}

export function useBulkDockerImageRemove() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { image_id: string; node_ids: string[] } | { nodeId: string; image_ids: string[] }) => {
      const d = data as { image_id?: string; node_ids?: string[]; nodeId?: string; image_ids?: string[] }
      const nodeIds = d.nodeId ? [d.nodeId] : d.node_ids ?? []
      const image_ids = d.image_ids || (d.image_id ? [d.image_id] : [])
      if (nodeIds.length === 0) throw new Error('nodeIds required')
      if (nodeIds.length === 1) return dockerApi.bulkImageRemovals(nodeIds[0], { image_ids })
      return aggregateBulkResults(nodeIds.map((id) => dockerApi.bulkImageRemovals(id, { image_ids })), nodeIds)
    },
    onSuccess: () => invalidateDocker(queryClient),
  })
}

export function useBulkDockerPull() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { image: string; node_ids: string[] } | { nodeId: string; images: string[] }) => {
      const d = data as { image?: string; node_ids?: string[]; nodeId?: string; images?: string[] }
      const nodeIds = d.nodeId ? [d.nodeId] : d.node_ids ?? []
      const images = d.images || (d.image ? [d.image] : [])
      if (nodeIds.length === 0) throw new Error('nodeIds required')
      if (nodeIds.length === 1) return dockerApi.bulkImagePulls(nodeIds[0], { images, timeout: 300 } as Parameters<typeof dockerApi.bulkImagePulls>[1])
      return aggregateBulkResults(nodeIds.map((id) => dockerApi.bulkImagePulls(id, { images, timeout: 300 } as Parameters<typeof dockerApi.bulkImagePulls>[1])), nodeIds)
    },
    onSuccess: () => invalidateDocker(queryClient),
  })
}

export function useBulkDockerInspect() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { container_id: string; node_ids: string[] } | { nodeId: string; container_ids: string[] }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[] }
      const nodeIds = d.nodeId ? [d.nodeId] : d.node_ids ?? []
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      if (nodeIds.length === 0) throw new Error('nodeIds required')
      if (nodeIds.length === 1) return dockerApi.bulkInspect(nodeIds[0], { container_ids })
      return aggregateBulkResults(nodeIds.map((id) => dockerApi.bulkInspect(id, { container_ids })), nodeIds)
    },
    onSuccess: () => invalidateDocker(queryClient),
  })
}

export function useBulkDockerLogs() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { container_id: string; node_ids: string[] } | { nodeId: string; container_ids: string[] }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[] }
      const nodeIds = d.nodeId ? [d.nodeId] : d.node_ids ?? []
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      if (nodeIds.length === 0) throw new Error('nodeIds required')
      if (nodeIds.length === 1) return dockerApi.bulkLogs(nodeIds[0], { container_ids, tail: 100 } as Parameters<typeof dockerApi.bulkLogs>[1])
      return aggregateBulkResults(nodeIds.map((id) => dockerApi.bulkLogs(id, { container_ids, tail: 100 } as Parameters<typeof dockerApi.bulkLogs>[1])), nodeIds)
    },
    onSuccess: () => invalidateDocker(queryClient),
  })
}

export function useBulkDockerStats() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { container_id: string; node_ids: string[] } | { nodeId: string; container_ids: string[] }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[] }
      const nodeIds = d.nodeId ? [d.nodeId] : d.node_ids ?? []
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      if (nodeIds.length === 0) throw new Error('nodeIds required')
      if (nodeIds.length === 1) return dockerApi.bulkStats(nodeIds[0], { container_ids })
      return aggregateBulkResults(nodeIds.map((id) => dockerApi.bulkStats(id, { container_ids })), nodeIds)
    },
    onSuccess: () => invalidateDocker(queryClient),
  })
}

export function useBulkNetworkRemovals() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { network_ids: string[]; nodeId: string } | { nodeId: string; network_ids: string[] }) => {
      const d = data as { network_ids?: string[]; nodeId?: string; node_id?: string }
      const nodeId = d.nodeId ?? d.node_id ?? ''
      const network_ids = d.network_ids ?? []
      if (!nodeId) throw new Error('nodeId required')
      return dockerApi.bulkNetworkRemovals(nodeId, { network_ids })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useBulkVolumeRemovals() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { volume_names: string[]; nodeId: string } | { nodeId: string; volume_names: string[] }) => {
      const d = data as { volume_names?: string[]; nodeId?: string; node_id?: string }
      const nodeId = d.nodeId ?? d.node_id ?? ''
      const volume_names = d.volume_names ?? []
      if (!nodeId) throw new Error('nodeId required')
      return dockerApi.bulkVolumeRemovals(nodeId, { volume_names })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useBulkContainerKill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { container_ids: string[]; nodeId: string; signal?: string }) => {
      const { nodeId, container_ids, signal } = data as { nodeId: string; container_ids: string[]; signal?: string }
      return dockerApi.bulkKill(nodeId, { container_ids, signal } as unknown as Parameters<typeof dockerApi.bulkKill>[1])
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}
