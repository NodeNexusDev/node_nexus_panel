import { api } from './client'
import type {
  DockerContainer,
  DockerContainerInspect,
  DockerCreateContainerRequest,
  ContainerCreatedResponse,
  DockerExecRequest,
  DockerExecResult,
  DockerContainerStats,
  DockerImage,
  DockerImagePullRequest,
  DockerPullResult,
  DockerImageBuildRequest,
  DockerImageBuildResponse,
  DockerImageTagRequest,
  DockerImageTagResponse,
  DockerImageInspectResponse,
  DockerNetwork,
  DockerVolume,
  BulkDockerRequest,
  BulkDockerResponse,
  BulkDockerImageBuildRequest,
  BulkDockerImageBuildResponse,
  BulkDockerImageRemoveRequest,
  BulkDockerImageRemoveResponse,
  BulkDockerPullRequest,
  BulkDockerPullResponse,
} from './types'

function nodesBase(nodeId: string) {
  return `/nodes/${nodeId}/docker`
}

export const dockerApi = {
  getContainers: (nodeId: string, params?: { all?: boolean }) => {
    const qs = params?.all ? '?all=true' : ''
    return api.get<DockerContainer[]>(`${nodesBase(nodeId)}/containers${qs}`)
  },

  createContainer: (nodeId: string, data: DockerCreateContainerRequest) =>
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
    api.get<DockerContainerStats>(`${nodesBase(nodeId)}/containers/${containerId}/stats`),

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

  getNetworks: (nodeId: string) =>
    api.get<DockerNetwork[]>(`${nodesBase(nodeId)}/networks`),

  getVolumes: (nodeId: string) =>
    api.get<DockerVolume[]>(`${nodesBase(nodeId)}/volumes`),

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
}
