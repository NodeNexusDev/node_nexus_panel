import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dockerApi } from '../api/docker'
import type {
  DockerContainer,
  DockerContainerInspect,
  DockerCreateContainerRequest,
  DockerContainerStats,
  DockerImage,
  DockerImageInspectResponse,
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
    refetchInterval: 15_000,
  })
}

export function useDockerImages(nodeId: string) {
  return useQuery<DockerImage[]>({
    queryKey: ['docker', nodeId, 'images'],
    queryFn: () => dockerApi.getImages(nodeId),
    enabled: !!nodeId,
    refetchInterval: 15_000,
  })
}

export function useDockerNetworks(nodeId: string) {
  return useQuery<DockerNetwork[]>({
    queryKey: ['docker', nodeId, 'networks'],
    queryFn: () => dockerApi.getNetworks(nodeId),
    enabled: !!nodeId,
    refetchInterval: 15_000,
  })
}

export function useDockerVolumes(nodeId: string) {
  return useQuery<DockerVolume[]>({
    queryKey: ['docker', nodeId, 'volumes'],
    queryFn: () => dockerApi.getVolumes(nodeId),
    enabled: !!nodeId,
    refetchInterval: 15_000,
  })
}

export function useDockerContainerLogs(nodeId: string, containerId: string, tail?: number, since?: string) {
  return useQuery<string>({
    queryKey: ['docker', nodeId, 'containers', containerId, 'logs', tail, since],
    queryFn: () => dockerApi.getContainerLogs(nodeId, containerId, { tail, since }),
    enabled: !!nodeId && !!containerId,
  })
}

export function useDockerContainerInspect(nodeId: string, containerId: string) {
  return useQuery<DockerContainerInspect>({
    queryKey: ['docker', nodeId, 'containers', containerId, 'inspect'],
    queryFn: () => dockerApi.getContainer(nodeId, containerId),
    enabled: !!nodeId && !!containerId,
  })
}

export function useDockerImageInspect(nodeId: string, imageId: string) {
  return useQuery<DockerImageInspectResponse>({
    queryKey: ['docker', nodeId, 'images', imageId, 'inspect'],
    queryFn: () => dockerApi.getImage(nodeId, imageId),
    enabled: !!nodeId && !!imageId,
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkDockerRequest) =>
      dockerApi.bulkExec(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerRestart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkDockerRequest) =>
      dockerApi.bulkRestart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerStart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkDockerRequest) =>
      dockerApi.bulkStart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerStop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkDockerRequest) =>
      dockerApi.bulkStop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}
