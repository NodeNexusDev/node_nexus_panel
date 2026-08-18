import { api } from './client'
import type {
  DockerContainer,
  DockerCreateContainerRequest,
  DockerExecRequest,
  DockerExecResponse,
  DockerLogsResponse,
  DockerImage,
  DockerPullImageRequest,
  DockerBuildImageRequest,
  DockerTagImageRequest,
  DockerNetwork,
  DockerVolume,
} from './types'

function nodesBase(nodeId: string) {
  return `/nodes/${nodeId}/docker`
}

export const dockerApi = {
  getContainers: (nodeId: string) =>
    api.get<DockerContainer[]>(`${nodesBase(nodeId)}/containers`),

  createContainer: (nodeId: string, data: DockerCreateContainerRequest) =>
    api.post<DockerContainer>(`${nodesBase(nodeId)}/containers`, data),

  getContainer: (nodeId: string, containerId: string) =>
    api.get<DockerContainer>(`${nodesBase(nodeId)}/containers/${containerId}`),

  deleteContainer: (nodeId: string, containerId: string) =>
    api.delete<void>(`${nodesBase(nodeId)}/containers/${containerId}`),

  startContainer: (nodeId: string, containerId: string) =>
    api.post<void>(`${nodesBase(nodeId)}/containers/${containerId}/start`),

  stopContainer: (nodeId: string, containerId: string) =>
    api.post<void>(`${nodesBase(nodeId)}/containers/${containerId}/stop`),

  restartContainer: (nodeId: string, containerId: string) =>
    api.post<void>(`${nodesBase(nodeId)}/containers/${containerId}/restart`),

  execContainer: (nodeId: string, containerId: string, data: DockerExecRequest) =>
    api.post<DockerExecResponse>(`${nodesBase(nodeId)}/containers/${containerId}/exec`, data),

  getContainerLogs: (nodeId: string, containerId: string, tail?: number) => {
    const qs = tail ? `?tail=${tail}` : ''
    return api.get<DockerLogsResponse>(`${nodesBase(nodeId)}/containers/${containerId}/logs${qs}`)
  },

  getContainerStats: (nodeId: string, containerId: string) =>
    api.get<Record<string, unknown>>(`${nodesBase(nodeId)}/containers/${containerId}/stats`),

  getImages: (nodeId: string) =>
    api.get<DockerImage[]>(`${nodesBase(nodeId)}/images`),

  pullImage: (nodeId: string, data: DockerPullImageRequest) =>
    api.post<DockerImage>(`${nodesBase(nodeId)}/images/pull`, data),

  buildImage: (nodeId: string, data: DockerBuildImageRequest) =>
    api.post<DockerImage>(`${nodesBase(nodeId)}/images/build`, data),

  getImage: (nodeId: string, imageId: string) =>
    api.get<DockerImage>(`${nodesBase(nodeId)}/images/${imageId}`),

  deleteImage: (nodeId: string, imageId: string) =>
    api.delete<void>(`${nodesBase(nodeId)}/images/${imageId}`),

  tagImage: (nodeId: string, imageId: string, data: DockerTagImageRequest) =>
    api.post<void>(`${nodesBase(nodeId)}/images/${imageId}/tag`, data),

  getNetworks: (nodeId: string) =>
    api.get<DockerNetwork[]>(`${nodesBase(nodeId)}/networks`),

  getVolumes: (nodeId: string) =>
    api.get<DockerVolume[]>(`${nodesBase(nodeId)}/volumes`),

  bulkExec: (data: { command: string[]; container_ids: string[] }) =>
    api.post<unknown>('/docker/bulk/exec', data),

  bulkRestart: (data: { container_ids: string[] }) =>
    api.post<unknown>('/docker/bulk/restart', data),

  bulkStart: (data: { container_ids: string[] }) =>
    api.post<unknown>('/docker/bulk/start', data),

  bulkStop: (data: { container_ids: string[] }) =>
    api.post<unknown>('/docker/bulk/stop', data),
}
