import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dockerApi } from '../api/docker'
import type {
  DockerContainer,
  DockerCreateContainerRequest,
  DockerContainerStats,
  DockerImage,
  DockerImageBuildRequest,
  DockerImageTagRequest,
  DockerNetwork,
  DockerVolume,
  BulkDockerRequest,
} from '../api/types'

export function useDockerContainers(nodeId: string, all?: boolean) {
  return useQuery<DockerContainer[]>({
    queryKey: ['docker', nodeId, 'containers', all],
    queryFn: () => dockerApi.getContainers(nodeId, { all }),
    enabled: !!nodeId,
  })
}

export function useDockerImages(nodeId: string) {
  return useQuery<DockerImage[]>({
    queryKey: ['docker', nodeId, 'images'],
    queryFn: () => dockerApi.getImages(nodeId),
    enabled: !!nodeId,
  })
}

export function useDockerNetworks(nodeId: string) {
  return useQuery<DockerNetwork[]>({
    queryKey: ['docker', nodeId, 'networks'],
    queryFn: () => dockerApi.getNetworks(nodeId),
    enabled: !!nodeId,
  })
}

export function useDockerVolumes(nodeId: string) {
  return useQuery<DockerVolume[]>({
    queryKey: ['docker', nodeId, 'volumes'],
    queryFn: () => dockerApi.getVolumes(nodeId),
    enabled: !!nodeId,
  })
}

export function useDockerContainerLogs(nodeId: string, containerId: string, tail?: number) {
  return useQuery<string>({
    queryKey: ['docker', nodeId, 'containers', containerId, 'logs', tail],
    queryFn: () => dockerApi.getContainerLogs(nodeId, containerId, { tail }),
    enabled: !!nodeId && !!containerId,
  })
}

export function useStartContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, containerId }: { nodeId: string; containerId: string }) =>
      dockerApi.startContainer(nodeId, containerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useStopContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, containerId, timeout }: { nodeId: string; containerId: string; timeout?: number }) =>
      dockerApi.stopContainer(nodeId, containerId, timeout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useRestartContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, containerId, timeout }: { nodeId: string; containerId: string; timeout?: number }) =>
      dockerApi.restartContainer(nodeId, containerId, timeout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useDeleteContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, containerId, force }: { nodeId: string; containerId: string; force?: boolean }) =>
      dockerApi.deleteContainer(nodeId, containerId, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useExecContainer() {
  return useMutation({
    mutationFn: ({
      nodeId,
      containerId,
      data,
    }: {
      nodeId: string
      containerId: string
      data: { command: string; timeout?: number }
    }) => dockerApi.execContainer(nodeId, containerId, data),
  })
}

export function usePullImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: { image: string; timeout?: number } }) =>
      dockerApi.pullImage(nodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useDeleteImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, imageId }: { nodeId: string; imageId: string }) =>
      dockerApi.deleteImage(nodeId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useCreateContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: DockerCreateContainerRequest }) =>
      dockerApi.createContainer(nodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useDockerContainerStats(nodeId: string, containerId: string) {
  return useQuery<DockerContainerStats>({
    queryKey: ['docker', nodeId, 'containers', containerId, 'stats'],
    queryFn: () => dockerApi.getContainerStats(nodeId, containerId),
    enabled: !!nodeId && !!containerId,
    refetchInterval: 5000,
  })
}

export function useBuildImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: DockerImageBuildRequest }) =>
      dockerApi.buildImage(nodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useTagImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, imageId, data }: { nodeId: string; imageId: string; data: DockerImageTagRequest }) =>
      dockerApi.tagImage(nodeId, imageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useBulkDockerExec() {
  return useMutation({
    mutationFn: (data: BulkDockerRequest) =>
      dockerApi.bulkExec(data),
  })
}

export function useBulkDockerRestart() {
  return useMutation({
    mutationFn: (data: BulkDockerRequest) =>
      dockerApi.bulkRestart(data),
  })
}

export function useBulkDockerStart() {
  return useMutation({
    mutationFn: (data: BulkDockerRequest) =>
      dockerApi.bulkStart(data),
  })
}

export function useBulkDockerStop() {
  return useMutation({
    mutationFn: (data: BulkDockerRequest) =>
      dockerApi.bulkStop(data),
  })
}
