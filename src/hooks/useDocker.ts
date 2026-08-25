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
  BulkDockerImageBuildRequest,
  BulkDockerImageRemoveRequest,
  BulkDockerPullRequest,
  DockerExecRequest,
  ContainerRenameRequest,
  NetworkCreateRequest,
  NetworkInspectResponse,
  NetworkConnectRequest,
  NetworkDisconnectRequest,
  VolumeCreateRequest,
  VolumeInspectResponse,
  DockerTopResult,
  DockerSystemInfo,
  DockerSystemDfItem,
} from '../api/types'

export function useDockerContainers(nodeId: string, all?: boolean) {
  return useQuery<DockerContainer[]>({
    queryKey: ['docker', nodeId, 'containers', all],
    queryFn: () => dockerApi.getContainers(nodeId, { all }),
    enabled: !!nodeId,
    refetchInterval: 60_000,
  })
}

export function useDockerImages(nodeId: string) {
  return useQuery<DockerImage[]>({
    queryKey: ['docker', nodeId, 'images'],
    queryFn: () => dockerApi.getImages(nodeId),
    enabled: !!nodeId,
    refetchInterval: 60_000,
  })
}

export function useDockerNetworks(nodeId: string) {
  return useQuery<DockerNetwork[]>({
    queryKey: ['docker', nodeId, 'networks'],
    queryFn: () => dockerApi.getNetworks(nodeId),
    enabled: !!nodeId,
    refetchInterval: 60_000,
  })
}

export function useDockerVolumes(nodeId: string) {
  return useQuery<DockerVolume[]>({
    queryKey: ['docker', nodeId, 'volumes'],
    queryFn: () => dockerApi.getVolumes(nodeId),
    enabled: !!nodeId,
    refetchInterval: 60_000,
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
      data: DockerExecRequest
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

export function useBulkDockerRemove() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkDockerRequest) =>
      dockerApi.bulkRemove(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerImageBuild() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkDockerImageBuildRequest) =>
      dockerApi.bulkImageBuild(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerImageRemove() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkDockerImageRemoveRequest) =>
      dockerApi.bulkImageRemove(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerPull() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkDockerPullRequest) =>
      dockerApi.bulkPull(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerInspect() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkDockerRequest) =>
      dockerApi.bulkInspect(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerLogs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkDockerRequest) =>
      dockerApi.bulkLogs(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerStats() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkDockerRequest) =>
      dockerApi.bulkStats(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function usePauseContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, containerId }: { nodeId: string; containerId: string }) =>
      dockerApi.pauseContainer(nodeId, containerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useUnpauseContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, containerId }: { nodeId: string; containerId: string }) =>
      dockerApi.unpauseContainer(nodeId, containerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useRenameContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, containerId, data }: { nodeId: string; containerId: string; data: ContainerRenameRequest }) =>
      dockerApi.renameContainer(nodeId, containerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function usePruneContainers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nodeId: string) => dockerApi.pruneContainers(nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function usePruneImages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nodeId: string) => dockerApi.pruneImages(nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useCreateNetwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: NetworkCreateRequest }) =>
      dockerApi.createNetwork(nodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useDeleteNetwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, networkId }: { nodeId: string; networkId: string }) =>
      dockerApi.deleteNetwork(nodeId, networkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useInspectNetwork(nodeId: string | null, networkId: string | null) {
  return useQuery<NetworkInspectResponse>({
    queryKey: ['docker', nodeId, 'networks', networkId, 'inspect'],
    queryFn: () => dockerApi.inspectNetwork(nodeId!, networkId!),
    enabled: !!nodeId && !!networkId,
  })
}

export function useConnectNetwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, networkId, data }: { nodeId: string; networkId: string; data: NetworkConnectRequest }) =>
      dockerApi.connectNetwork(nodeId, networkId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useDisconnectNetwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, networkId, data }: { nodeId: string; networkId: string; data: NetworkDisconnectRequest }) =>
      dockerApi.disconnectNetwork(nodeId, networkId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useCreateVolume() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: VolumeCreateRequest }) =>
      dockerApi.createVolume(nodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useDeleteVolume() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, volumeName }: { nodeId: string; volumeName: string }) =>
      dockerApi.deleteVolume(nodeId, volumeName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useInspectVolume(nodeId: string | null, volumeName: string | null) {
  return useQuery<VolumeInspectResponse>({
    queryKey: ['docker', nodeId, 'volumes', volumeName, 'inspect'],
    queryFn: () => dockerApi.inspectVolume(nodeId!, volumeName!),
    enabled: !!nodeId && !!volumeName,
  })
}

export function usePruneVolumes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nodeId: string) => dockerApi.pruneVolumes(nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
    },
  })
}

export function useDockerSystemInfo(nodeId: string) {
  return useQuery<DockerSystemInfo>({
    queryKey: ['docker', nodeId, 'system', 'info'],
    queryFn: () => dockerApi.getSystemInfo(nodeId),
    enabled: !!nodeId,
  })
}

export function useDockerSystemDf(nodeId: string) {
  return useQuery<DockerSystemDfItem[]>({
    queryKey: ['docker', nodeId, 'system', 'df'],
    queryFn: () => dockerApi.getSystemDf(nodeId),
    enabled: !!nodeId,
  })
}

export function useDockerContainerTop(nodeId: string, containerId: string) {
  return useQuery<DockerTopResult>({
    queryKey: ['docker', nodeId, 'containers', containerId, 'top'],
    queryFn: () => dockerApi.getContainerTop(nodeId, containerId),
    enabled: !!nodeId && !!containerId,
  })
}
