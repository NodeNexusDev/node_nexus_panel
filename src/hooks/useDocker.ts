import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dockerApi } from '../api/docker'
import type {
  DockerContainer,
  DockerImage,
  DockerNetwork,
  DockerVolume,
} from '../api/types'

export function useDockerContainers(nodeId: string) {
  return useQuery<DockerContainer[]>({
    queryKey: ['docker', nodeId, 'containers'],
    queryFn: () => dockerApi.getContainers(nodeId),
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
  return useQuery({
    queryKey: ['docker', nodeId, 'containers', containerId, 'logs', tail],
    queryFn: () => dockerApi.getContainerLogs(nodeId, containerId, tail),
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
    mutationFn: ({ nodeId, containerId }: { nodeId: string; containerId: string }) =>
      dockerApi.stopContainer(nodeId, containerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useRestartContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, containerId }: { nodeId: string; containerId: string }) =>
      dockerApi.restartContainer(nodeId, containerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useDeleteContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, containerId }: { nodeId: string; containerId: string }) =>
      dockerApi.deleteContainer(nodeId, containerId),
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
      data: { command: string[]; working_dir?: string; user?: string }
    }) => dockerApi.execContainer(nodeId, containerId, data),
  })
}

export function usePullImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: { image: string; tag?: string } }) =>
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
