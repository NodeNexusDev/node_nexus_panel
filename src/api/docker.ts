import { api } from './client'
import type {
  DockerContainer,
  DockerContainerInspect,
  ContainerCreateRequest,
  ContainerCreatedResponse,
  DockerExecRequest,
  DockerExecResult,
  DockerContainerStatsResponse,
  DockerImage,
  DockerImagePullRequest,
  DockerPullResult,
  DockerImageBuildRequest,
  DockerImageBuildResponse,
  DockerImageTagRequest,
  DockerImageTagResponse,
  DockerImageInspectResponse,
  DockerNetwork,
  DockerNetworkCreateResponse,
  DockerVolume,
  DockerVolumeCreateResponse,
  DockerVolumePruneResponse,
  BulkDockerRequest,
  BulkDockerResponse,
  BulkDockerImageBuildRequest,
  BulkDockerImageBuildResponse,
  BulkDockerImageRemoveRequest,
  BulkDockerImageRemoveResponse,
  BulkDockerPullRequest,
  BulkDockerPullResponse,
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
} from './types'

function nodesBase(nodeId: string) {
  return `/nodes/${nodeId}/docker`
}

export const dockerApi = {
  getContainers: (nodeId: string, params?: { all?: boolean }) => {
    const qs = params?.all ? '?all=true' : ''
    return api.get<DockerContainer[]>(`${nodesBase(nodeId)}/containers${qs}`)
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
    api.get<DockerContainerStatsResponse>(`${nodesBase(nodeId)}/containers/${containerId}/stats`),

  getImages: (nodeId: string) =>
    api.get<DockerImage[]>(`${nodesBase(nodeId)}/images`),

  pullImage: (nodeId: string, data: DockerImagePullRequest) =>
    api.post<DockerPullResult>(`${nodesBase(nodeId)}/images/pull`, data),

  buildImage: (nodeId: string, data: DockerImageBuildRequest) =>
    api.post<DockerImageBuildResponse>(`${nodesBase(nodeId)}/images/build`, data),

  getImage: (nodeId: string, imageId: string) =>
    api.get<DockerImageInspectResponse>(`${nodesBase(nodeId)}/images/${imageId}`),

  deleteImage: (nodeId: string, imageId: string) =>
    api.delete<void>(`${nodesBase(nodeId)}/images/${imageId}`),

  tagImage: (nodeId: string, imageId: string, data: DockerImageTagRequest) =>
    api.post<DockerImageTagResponse>(`${nodesBase(nodeId)}/images/${imageId}/tag`, data),

  pruneImages: (nodeId: string) =>
    api.post<DockerPruneResponse>(`${nodesBase(nodeId)}/images/prune`),

  getNetworks: (nodeId: string) =>
    api.get<DockerNetwork[]>(`${nodesBase(nodeId)}/networks`),

  createNetwork: (nodeId: string, data: NetworkCreateRequest) =>
    api.post<DockerNetworkCreateResponse>(`${nodesBase(nodeId)}/networks`, data),

  deleteNetwork: (nodeId: string, networkId: string) =>
    api.delete<void>(`${nodesBase(nodeId)}/networks/${networkId}`),

  inspectNetwork: (nodeId: string, networkId: string) =>
    api.get<NetworkInspectResponse>(`${nodesBase(nodeId)}/networks/${networkId}`),

  connectNetwork: (nodeId: string, networkId: string, data: NetworkConnectRequest) =>
    api.post<DockerActionResponse>(`${nodesBase(nodeId)}/networks/${networkId}/connect`, data),

  disconnectNetwork: (nodeId: string, networkId: string, data: NetworkDisconnectRequest) =>
    api.post<DockerActionResponse>(`${nodesBase(nodeId)}/networks/${networkId}/disconnect`, data),

  getVolumes: (nodeId: string) =>
    api.get<DockerVolume[]>(`${nodesBase(nodeId)}/volumes`),

  createVolume: (nodeId: string, data: VolumeCreateRequest) =>
    api.post<DockerVolumeCreateResponse>(`${nodesBase(nodeId)}/volumes`, data),

  deleteVolume: (nodeId: string, volumeName: string) =>
    api.delete<void>(`${nodesBase(nodeId)}/volumes/${volumeName}`),

  inspectVolume: (nodeId: string, volumeName: string) =>
    api.get<VolumeInspectResponse>(`${nodesBase(nodeId)}/volumes/${volumeName}`),

  pruneVolumes: (nodeId: string) =>
    api.post<DockerVolumePruneResponse>(`${nodesBase(nodeId)}/volumes/prune`),

  getSystemInfo: (nodeId: string) =>
    api.get<DockerSystemInfo>(`${nodesBase(nodeId)}/system/info`),

  getSystemDf: (nodeId: string) =>
    api.get<DockerSystemDfItem[]>(`${nodesBase(nodeId)}/system/df`),

  bulkExec: (data: BulkDockerRequest) =>
    api.post<BulkDockerResponse>('/docker/bulk/exec', data),

  bulkRestart: (data: BulkDockerRequest) =>
    api.post<BulkDockerResponse>('/docker/bulk/restart', data),

  bulkStart: (data: BulkDockerRequest) =>
    api.post<BulkDockerResponse>('/docker/bulk/start', data),

  bulkStop: (data: BulkDockerRequest) =>
    api.post<BulkDockerResponse>('/docker/bulk/stop', data),

  bulkRemove: (data: BulkDockerRequest) =>
    api.post<BulkDockerResponse>('/docker/bulk/remove', data),

  bulkImageBuild: (data: BulkDockerImageBuildRequest) =>
    api.post<BulkDockerImageBuildResponse>('/docker/bulk/images/build', data),

  bulkImageRemove: (data: BulkDockerImageRemoveRequest) =>
    api.post<BulkDockerImageRemoveResponse>('/docker/bulk/images/remove', data),

  bulkPull: (data: BulkDockerPullRequest) =>
    api.post<BulkDockerPullResponse>('/docker/bulk/pull', data),

  bulkInspect: (data: BulkDockerRequest) =>
    api.post<BulkDockerResponse>('/docker/bulk/inspect', data),

  bulkLogs: (data: BulkDockerRequest) =>
    api.post<BulkDockerResponse>('/docker/bulk/logs', data),

  bulkStats: (data: BulkDockerRequest) =>
    api.post<BulkDockerResponse>('/docker/bulk/stats', data),
}
