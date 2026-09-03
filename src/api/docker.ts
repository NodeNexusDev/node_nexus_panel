import { api } from './client'
import type {
  DockerContainer,
  DockerContainerInspect,
  ContainerCreateRequest,
  ContainerCreatedResponse,
  DockerExecRequest,
  DockerExecResult,
  DockerImagePullRequest,
  DockerPullResult,
  DockerImageBuildRequest,
  DockerImageBuildResponse,
  DockerImageTagRequest,
  DockerImageTagResponse,
  DockerImageInspectResponse,
  DockerNetworkCreateResponse,
  DockerVolumeCreateResponse,
  DockerVolumePruneResponse,
  ContainerRenameRequest,
  NetworkCreateRequest,
  NetworkInspectResponse,
  NetworkConnectRequest,
  NetworkDisconnectRequest,
  VolumeCreateRequest,
  VolumeInspectResponse,
  DockerPruneResponse,
  DockerTopResult,
  DockerSystemInfo,
  DockerSystemDfItem,
  DockerActionResponse,
  DockerContainerRenameResponse,
  CursorPage_DockerContainer_,
  CursorPage_DockerImage_,
  CursorPage_DockerNetwork_,
  CursorPage_DockerVolume_,
  BulkResult_ContainerBulkResult_,
  BulkResult_ContainerExecBulkResult_,
  BulkResult_ContainerInspectBulkResult_,
  BulkResult_ContainerLogsBulkResult_,
  BulkResult_ContainerStatsBulkResult_,
  BulkResult_ImageBulkResult_,
  BulkResult_NetworkBulkResult_,
  BulkResult_VolumeBulkResult_,
  ContainerExecutionsRequest,
  ContainerInspectionsRequest,
  ContainerIdsRequest,
  ContainerKillsRequest,
  ContainerLogsRequest,
  ContainerStatsRequest,
  ContainerUpdatesRequest,
  ImagePullsRequest,
  ImageRemovalsRequest,
  NetworkRemovalsRequest,
  VolumeRemovalsRequest,
} from './types'

function nodesBase(nodeId: string) {
  return `/nodes/${nodeId}/docker`
}

export const dockerApi = {
  // ── Containers list (cursor) ────────────────────────────────
  getContainers: (nodeId: string, params?: { cursor?: string | null; limit?: number; all?: boolean }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    if (params?.all) query.set('all', 'true')
    const qs = query.toString()
    return api.get<CursorPage_DockerContainer_>(`${nodesBase(nodeId)}/containers${qs ? `?${qs}` : ''}`)
  },

  // Legacy wrapper returning array (unwrap cursor)
  getContainersLegacy: async (nodeId: string, params?: { all?: boolean }) => {
    const res = await api.get<CursorPage_DockerContainer_>(`${nodesBase(nodeId)}/containers${params?.all ? '?all=true' : ''}`)
    return (res as unknown as CursorPage_DockerContainer_).items ?? (res as unknown as DockerContainer[])
  },

  createContainer: (nodeId: string, data: ContainerCreateRequest) =>
    api.post<ContainerCreatedResponse>(`${nodesBase(nodeId)}/containers`, data),

  getContainer: (nodeId: string, containerId: string) =>
    api.get<DockerContainerInspect>(`${nodesBase(nodeId)}/containers/${containerId}`),

  deleteContainer: (nodeId: string, containerId: string, force?: boolean) => {
    const qs = force ? '?force=true' : ''
    return api.delete<void>(`${nodesBase(nodeId)}/containers/${containerId}${qs}`)
  },

  startContainer: (nodeId: string, containerId: string) =>
    api.post<void>(`${nodesBase(nodeId)}/containers/${containerId}/start`),

  stopContainer: (nodeId: string, containerId: string, timeout?: number) => {
    const qs = timeout ? `?timeout=${timeout}` : ''
    return api.post<void>(`${nodesBase(nodeId)}/containers/${containerId}/stop${qs}`)
  },

  restartContainer: (nodeId: string, containerId: string, timeout?: number) => {
    const qs = timeout ? `?timeout=${timeout}` : ''
    return api.post<void>(`${nodesBase(nodeId)}/containers/${containerId}/restart${qs}`)
  },

  pauseContainer: (nodeId: string, containerId: string) =>
    api.post<DockerActionResponse>(`${nodesBase(nodeId)}/containers/${containerId}/pause`),

  unpauseContainer: (nodeId: string, containerId: string) =>
    api.post<DockerActionResponse>(`${nodesBase(nodeId)}/containers/${containerId}/unpause`),

  renameContainer: (nodeId: string, containerId: string, data: ContainerRenameRequest) =>
    api.post<DockerContainerRenameResponse>(`${nodesBase(nodeId)}/containers/${containerId}/rename`, data),

  pruneContainers: (nodeId: string) =>
    api.post<DockerPruneResponse>(`${nodesBase(nodeId)}/containers/prune`),

  getContainerTop: (nodeId: string, containerId: string) =>
    api.get<DockerTopResult>(`${nodesBase(nodeId)}/containers/${containerId}/top`),

  execContainer: (nodeId: string, containerId: string, data: DockerExecRequest) =>
    api.post<DockerExecResult>(`${nodesBase(nodeId)}/containers/${containerId}/exec`, data),

  getContainerLogs: (nodeId: string, containerId: string, params?: { tail?: number; since?: string }) => {
    const query = new URLSearchParams()
    if (params?.tail) query.set('tail', String(params.tail))
    if (params?.since) query.set('since', params.since)
    const qs = query.toString()
    return api.get<string>(`${nodesBase(nodeId)}/containers/${containerId}/logs${qs ? `?${qs}` : ''}`)
  },

  getContainerStats: (nodeId: string, containerId: string) =>
    api.get<Record<string, unknown>>(`${nodesBase(nodeId)}/containers/${containerId}/stats`),

  // ── Images ──────────────────────────────────────────────────
  getImages: (nodeId: string, params?: { cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<CursorPage_DockerImage_>(`${nodesBase(nodeId)}/images${qs ? `?${qs}` : ''}`)
  },

  pullImage: (nodeId: string, data: DockerImagePullRequest) =>
    api.post<DockerPullResult>(`${nodesBase(nodeId)}/images/pull`, data),

  buildImage: (nodeId: string, data: DockerImageBuildRequest) =>
    api.post<DockerImageBuildResponse>(`${nodesBase(nodeId)}/images/build`, data),

  getImage: (nodeId: string, imageId: string) =>
    api.get<DockerImageInspectResponse>(`${nodesBase(nodeId)}/images/${imageId}`),

  deleteImage: (nodeId: string, imageId: string) => api.delete<void>(`${nodesBase(nodeId)}/images/${imageId}`),

  tagImage: (nodeId: string, imageId: string, data: DockerImageTagRequest) =>
    api.post<DockerImageTagResponse>(`${nodesBase(nodeId)}/images/${imageId}/tag`, data),

  pruneImages: (nodeId: string) => api.post<DockerPruneResponse>(`${nodesBase(nodeId)}/images/prune`),

  // ── Networks ────────────────────────────────────────────────
  getNetworks: (nodeId: string, params?: { cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<CursorPage_DockerNetwork_>(`${nodesBase(nodeId)}/networks${qs ? `?${qs}` : ''}`)
  },

  createNetwork: (nodeId: string, data: NetworkCreateRequest) =>
    api.post<DockerNetworkCreateResponse>(`${nodesBase(nodeId)}/networks`, data),

  deleteNetwork: (nodeId: string, networkId: string) => api.delete<void>(`${nodesBase(nodeId)}/networks/${networkId}`),

  inspectNetwork: (nodeId: string, networkId: string) =>
    api.get<NetworkInspectResponse>(`${nodesBase(nodeId)}/networks/${networkId}`),

  connectNetwork: (nodeId: string, networkId: string, data: NetworkConnectRequest) =>
    api.post<DockerActionResponse>(`${nodesBase(nodeId)}/networks/${networkId}/connect`, data),

  disconnectNetwork: (nodeId: string, networkId: string, data: NetworkDisconnectRequest) =>
    api.post<DockerActionResponse>(`${nodesBase(nodeId)}/networks/${networkId}/disconnect`, data),

  // ── Volumes ─────────────────────────────────────────────────
  getVolumes: (nodeId: string, params?: { cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<CursorPage_DockerVolume_>(`${nodesBase(nodeId)}/volumes${qs ? `?${qs}` : ''}`)
  },

  createVolume: (nodeId: string, data: VolumeCreateRequest) =>
    api.post<DockerVolumeCreateResponse>(`${nodesBase(nodeId)}/volumes`, data),

  deleteVolume: (nodeId: string, volumeName: string) => api.delete<void>(`${nodesBase(nodeId)}/volumes/${volumeName}`),

  inspectVolume: (nodeId: string, volumeName: string) =>
    api.get<VolumeInspectResponse>(`${nodesBase(nodeId)}/volumes/${volumeName}`),

  pruneVolumes: (nodeId: string) => api.post<DockerVolumePruneResponse>(`${nodesBase(nodeId)}/volumes/prune`),

  getSystemInfo: (nodeId: string) => api.get<DockerSystemInfo>(`${nodesBase(nodeId)}/system/info`),

  getSystemDf: (nodeId: string) => api.get<DockerSystemDfItem[]>(`${nodesBase(nodeId)}/system/df`),

  // ── Per-node bulk (v2) ──────────────────────────────────────
  bulkExec: (nodeId: string, data: ContainerExecutionsRequest) =>
    api.post<BulkResult_ContainerExecBulkResult_>(`${nodesBase(nodeId)}/containers/executions`, data),

  bulkInspect: (nodeId: string, data: ContainerInspectionsRequest) =>
    api.post<BulkResult_ContainerInspectBulkResult_>(`${nodesBase(nodeId)}/containers/inspections`, data),

  bulkKill: (nodeId: string, data: ContainerKillsRequest) =>
    api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/kills`, data),

  bulkLogs: (nodeId: string, data: ContainerLogsRequest) =>
    api.post<BulkResult_ContainerLogsBulkResult_>(`${nodesBase(nodeId)}/containers/logs`, data),

  bulkPause: (nodeId: string, data: ContainerIdsRequest) =>
    api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/pauses`, data),

  bulkRemove: (nodeId: string, data: ContainerIdsRequest, force?: boolean) => {
    const qs = force ? '?force=true' : ''
    return api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/removals${qs}`, data)
  },

  bulkRestart: (nodeId: string, data: ContainerIdsRequest, timeout?: number) => {
    const qs = timeout ? `?timeout=${timeout}` : ''
    return api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/restarts${qs}`, data)
  },

  bulkStart: (nodeId: string, data: ContainerIdsRequest) =>
    api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/starts`, data),

  bulkStats: (nodeId: string, data: ContainerStatsRequest) =>
    api.post<BulkResult_ContainerStatsBulkResult_>(`${nodesBase(nodeId)}/containers/stats`, data),

  bulkStop: (nodeId: string, data: ContainerIdsRequest, timeout?: number) => {
    const qs = timeout ? `?timeout=${timeout}` : ''
    return api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/stops${qs}`, data)
  },

  bulkUnpause: (nodeId: string, data: ContainerIdsRequest) =>
    api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/unpauses`, data),

  bulkUpdate: (nodeId: string, data: ContainerUpdatesRequest) =>
    api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/updates`, data),

  bulkImagePulls: (nodeId: string, data: ImagePullsRequest) =>
    api.post<BulkResult_ImageBulkResult_>(`${nodesBase(nodeId)}/images/pulls`, data),

  bulkImageRemovals: (nodeId: string, data: ImageRemovalsRequest) =>
    api.post<BulkResult_ImageBulkResult_>(`${nodesBase(nodeId)}/images/removals`, data),

  bulkNetworkRemovals: (nodeId: string, data: NetworkRemovalsRequest) =>
    api.post<BulkResult_NetworkBulkResult_>(`${nodesBase(nodeId)}/networks/removals`, data),

  bulkVolumeRemovals: (nodeId: string, data: VolumeRemovalsRequest) =>
    api.post<BulkResult_VolumeBulkResult_>(`${nodesBase(nodeId)}/volumes/removals`, data),

  // ── Deprecated global bulk (pre-v2) ─────────────────────────
  // Kept for type compat, delegates to per-node for first node if available
  bulkExecLegacy: (data: { container_id: string; node_ids: string[]; command?: string; timeout?: number }) => {
    const nodeId = data.node_ids[0]
    if (!nodeId) return Promise.reject(new Error('node_ids required'))
    return api.post<BulkResult_ContainerExecBulkResult_>(`${nodesBase(nodeId)}/containers/executions`, {
      container_ids: [data.container_id],
      command: data.command || '',
      timeout: data.timeout,
    })
  },
}
