import { api } from './client'
import { runBulkChunks } from '../lib/chunks'
import type {
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
  DockerStats,
  DockerSystemInfo,
  DockerSystemDfItem,
  DockerActionResponse,
  DockerArchiveResponse,
  DockerImageHistoryResponse,
  DockerPortResponse,
  DockerVersionResponse,
  DockerWaitResponse,
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
    api.get<DockerStats>(`${nodesBase(nodeId)}/containers/${containerId}/stats`),

  // ── Images ──────────────────────────────────────────────────
  getImages: (nodeId: string, params?: { cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<CursorPage_DockerImage_>(`${nodesBase(nodeId)}/images${qs ? `?${qs}` : ''}`)
  },

  pullImage: (nodeId: string, data: DockerImagePullRequest) =>
    api.post<DockerPullResult>(`${nodesBase(nodeId)}/images/pull`, data, { timeoutMs: 300_000 }),

  buildImage: (nodeId: string, data: DockerImageBuildRequest) =>
    api.post<DockerImageBuildResponse>(`${nodesBase(nodeId)}/images/build`, data, { timeoutMs: 300_000 }),

  getImage: (nodeId: string, imageId: string) =>
    api.get<DockerImageInspectResponse>(`${nodesBase(nodeId)}/images/${encodeURIComponent(imageId)}`),

  deleteImage: (nodeId: string, imageId: string) => api.delete<void>(`${nodesBase(nodeId)}/images/${encodeURIComponent(imageId)}`),

  tagImage: (nodeId: string, imageId: string, data: DockerImageTagRequest) =>
    api.post<DockerImageTagResponse>(`${nodesBase(nodeId)}/images/${encodeURIComponent(imageId)}/tag`, data),

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

  deleteNetwork: (nodeId: string, networkId: string) => api.delete<void>(`${nodesBase(nodeId)}/networks/${encodeURIComponent(networkId)}`),

  inspectNetwork: (nodeId: string, networkId: string) =>
    api.get<NetworkInspectResponse>(`${nodesBase(nodeId)}/networks/${encodeURIComponent(networkId)}`),

  connectNetwork: (nodeId: string, networkId: string, data: NetworkConnectRequest) =>
    api.post<DockerActionResponse>(`${nodesBase(nodeId)}/networks/${encodeURIComponent(networkId)}/connect`, data),

  disconnectNetwork: (nodeId: string, networkId: string, data: NetworkDisconnectRequest) =>
    api.post<DockerActionResponse>(`${nodesBase(nodeId)}/networks/${encodeURIComponent(networkId)}/disconnect`, data),

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

  deleteVolume: (nodeId: string, volumeName: string) => api.delete<void>(`${nodesBase(nodeId)}/volumes/${encodeURIComponent(volumeName)}`),

  inspectVolume: (nodeId: string, volumeName: string) =>
    api.get<VolumeInspectResponse>(`${nodesBase(nodeId)}/volumes/${encodeURIComponent(volumeName)}`),

  pruneVolumes: (nodeId: string) => api.post<DockerVolumePruneResponse>(`${nodesBase(nodeId)}/volumes/prune`),

  getSystemInfo: (nodeId: string) => api.get<DockerSystemInfo>(`${nodesBase(nodeId)}/system/info`),

  getSystemDf: (nodeId: string) => api.get<DockerSystemDfItem[]>(`${nodesBase(nodeId)}/system/df`),

  getSystemVersion: (nodeId: string) => api.get<DockerVersionResponse>(`${nodesBase(nodeId)}/system/version`),

  pruneSystem: (nodeId: string, volumes?: boolean) => {
    const qs = volumes ? '?volumes=true' : ''
    return api.post<DockerPruneResponse>(`${nodesBase(nodeId)}/system/prune${qs}`)
  },

  pruneNetworks: (nodeId: string) => api.post<DockerVolumePruneResponse>(`${nodesBase(nodeId)}/networks/prune`),

  // ── Singular container/image ops (v2) ───────────────────────
  getContainerArchive: (nodeId: string, containerId: string, path?: string) => {
    const qs = path ? `?path=${encodeURIComponent(path)}` : ''
    return api.get<DockerArchiveResponse>(`${nodesBase(nodeId)}/containers/${containerId}/archive${qs}`)
  },

  putContainerArchive: (nodeId: string, containerId: string, data: unknown, path?: string) => {
    const qs = path ? `?path=${encodeURIComponent(path)}` : ''
    return api.put<DockerActionResponse>(`${nodesBase(nodeId)}/containers/${containerId}/archive${qs}`, data)
  },

  killContainer: (nodeId: string, containerId: string, signal?: string) => {
    return api.post<DockerActionResponse>(`${nodesBase(nodeId)}/containers/${containerId}/kill`, { signal: signal ?? 'SIGTERM' })
  },

  getContainerPort: (nodeId: string, containerId: string, privatePort?: string) => {
    const qs = privatePort ? `?private_port=${encodeURIComponent(privatePort)}` : ''
    return api.get<DockerPortResponse>(`${nodesBase(nodeId)}/containers/${containerId}/port${qs}`)
  },

  updateContainer: (nodeId: string, containerId: string, data: unknown) => api.post<DockerActionResponse>(`${nodesBase(nodeId)}/containers/${containerId}/update`, data),

  waitContainer: (nodeId: string, containerId: string, timeout?: number) => {
    const qs = timeout ? `?timeout=${timeout}` : ''
    return api.post<DockerWaitResponse>(`${nodesBase(nodeId)}/containers/${containerId}/wait${qs}`)
  },

  pushImage: (nodeId: string, data: { image: string }) => api.post<DockerPullResult>(`${nodesBase(nodeId)}/images/push`, data),

  getImageHistory: (nodeId: string, imageId: string) => api.get<DockerImageHistoryResponse>(`${nodesBase(nodeId)}/images/${encodeURIComponent(imageId)}/history`),

  pushImageById: (nodeId: string, imageId: string) => api.post<DockerPullResult>(`${nodesBase(nodeId)}/images/${encodeURIComponent(imageId)}/push`),

  // ── Per-node bulk (v2; id-lists auto-chunked to the server max of 100) ──
  bulkExec: (nodeId: string, data: ContainerExecutionsRequest) =>
    runBulkChunks(data.container_ids, 100, (container_ids) =>
      api.post<BulkResult_ContainerExecBulkResult_>(`${nodesBase(nodeId)}/containers/executions`, { ...data, container_ids })),

  bulkInspect: (nodeId: string, data: ContainerInspectionsRequest) =>
    runBulkChunks(data.container_ids, 100, (container_ids) =>
      api.post<BulkResult_ContainerInspectBulkResult_>(`${nodesBase(nodeId)}/containers/inspections`, { ...data, container_ids })),

  bulkKill: (nodeId: string, data: ContainerKillsRequest) =>
    runBulkChunks(data.container_ids, 100, (container_ids) =>
      api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/kills`, { ...data, container_ids })),

  bulkLogs: (nodeId: string, data: ContainerLogsRequest) =>
    runBulkChunks(data.container_ids, 100, (container_ids) =>
      api.post<BulkResult_ContainerLogsBulkResult_>(`${nodesBase(nodeId)}/containers/logs`, { ...data, container_ids })),

  bulkPause: (nodeId: string, data: ContainerIdsRequest) =>
    runBulkChunks(data.container_ids, 100, (container_ids) =>
      api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/pauses`, { ...data, container_ids })),

  bulkRemove: (nodeId: string, data: ContainerIdsRequest, force?: boolean) => {
    const qs = force ? '?force=true' : ''
    return runBulkChunks(data.container_ids, 100, (container_ids) =>
      api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/removals${qs}`, { ...data, container_ids }))
  },

  bulkRestart: (nodeId: string, data: ContainerIdsRequest, timeout?: number) => {
    const qs = timeout ? `?timeout=${timeout}` : ''
    return runBulkChunks(data.container_ids, 100, (container_ids) =>
      api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/restarts${qs}`, { ...data, container_ids }))
  },

  bulkStart: (nodeId: string, data: ContainerIdsRequest) =>
    runBulkChunks(data.container_ids, 100, (container_ids) =>
      api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/starts`, { ...data, container_ids })),

  bulkStats: (nodeId: string, data: ContainerStatsRequest) =>
    runBulkChunks(data.container_ids, 100, (container_ids) =>
      api.post<BulkResult_ContainerStatsBulkResult_>(`${nodesBase(nodeId)}/containers/stats`, { ...data, container_ids })),

  bulkStop: (nodeId: string, data: ContainerIdsRequest, timeout?: number) => {
    const qs = timeout ? `?timeout=${timeout}` : ''
    return runBulkChunks(data.container_ids, 100, (container_ids) =>
      api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/stops${qs}`, { ...data, container_ids }))
  },

  bulkUnpause: (nodeId: string, data: ContainerIdsRequest) =>
    runBulkChunks(data.container_ids, 100, (container_ids) =>
      api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/unpauses`, { ...data, container_ids })),

  bulkUpdate: (nodeId: string, data: ContainerUpdatesRequest) =>
    runBulkChunks(data.container_ids, 100, (container_ids) =>
      api.post<BulkResult_ContainerBulkResult_>(`${nodesBase(nodeId)}/containers/updates`, { ...data, container_ids })),

  bulkImagePulls: (nodeId: string, data: ImagePullsRequest) =>
    runBulkChunks(data.images, 100, (images) =>
      api.post<BulkResult_ImageBulkResult_>(`${nodesBase(nodeId)}/images/pulls`, { ...data, images })),

  bulkImageRemovals: (nodeId: string, data: ImageRemovalsRequest) =>
    runBulkChunks(data.image_ids, 100, (image_ids) =>
      api.post<BulkResult_ImageBulkResult_>(`${nodesBase(nodeId)}/images/removals`, { ...data, image_ids })),

  bulkNetworkRemovals: (nodeId: string, data: NetworkRemovalsRequest) =>
    runBulkChunks(data.network_ids, 100, (network_ids) =>
      api.post<BulkResult_NetworkBulkResult_>(`${nodesBase(nodeId)}/networks/removals`, { ...data, network_ids })),

  bulkVolumeRemovals: (nodeId: string, data: VolumeRemovalsRequest) =>
    runBulkChunks(data.volume_names, 100, (volume_names) =>
      api.post<BulkResult_VolumeBulkResult_>(`${nodesBase(nodeId)}/volumes/removals`, { ...data, volume_names })),
}
