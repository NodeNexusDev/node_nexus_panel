import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dockerApi } from '../api/docker'
import type {
  DockerContainerInspect,
  ContainerCreateRequest,
  DockerImageInspectResponse,
  DockerImageBuildRequest,
  DockerImageTagRequest,
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
  CursorPage_DockerContainer_,
  CursorPage_DockerImage_,
  CursorPage_DockerNetwork_,
  CursorPage_DockerVolume_,
} from '../api/types'

export function useDockerContainers(nodeId: string, all?: boolean) {
  return useQuery<CursorPage_DockerContainer_>({
    queryKey: ['docker', nodeId, 'containers', all],
    queryFn: () => dockerApi.getContainers(nodeId, { all }),
    enabled: !!nodeId,
    refetchInterval: 60_000,
  })
}

export function useDockerImages(nodeId: string) {
  return useQuery<CursorPage_DockerImage_>({
    queryKey: ['docker', nodeId, 'images'],
    queryFn: () => dockerApi.getImages(nodeId),
    enabled: !!nodeId,
    refetchInterval: 60_000,
  })
}

export function useDockerNetworks(nodeId: string) {
  return useQuery<CursorPage_DockerNetwork_>({
    queryKey: ['docker', nodeId, 'networks'],
    queryFn: () => dockerApi.getNetworks(nodeId),
    enabled: !!nodeId,
    refetchInterval: 60_000,
  })
}

export function useDockerVolumes(nodeId: string) {
  return useQuery<CursorPage_DockerVolume_>({
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
    mutationFn: ({ nodeId, containerId }: { nodeId: string; containerId: string }) => dockerApi.startContainer(nodeId, containerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useStopContainer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, containerId, timeout }: { nodeId: string; containerId: string; timeout?: number }) => dockerApi.stopContainer(nodeId, containerId, timeout),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useRestartContainer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, containerId, timeout }: { nodeId: string; containerId: string; timeout?: number }) => dockerApi.restartContainer(nodeId, containerId, timeout),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useDeleteContainer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, containerId, force }: { nodeId: string; containerId: string; force?: boolean }) => dockerApi.deleteContainer(nodeId, containerId, force),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useExecContainer() {
  return useMutation({
    mutationFn: ({ nodeId, containerId, data }: { nodeId: string; containerId: string; data: DockerExecRequest }) => dockerApi.execContainer(nodeId, containerId, data),
  })
}

export function usePullImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: { image: string; timeout?: number } }) => dockerApi.pullImage(nodeId, data as Parameters<typeof dockerApi.pullImage>[1]),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useDeleteImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, imageId }: { nodeId: string; imageId: string }) => dockerApi.deleteImage(nodeId, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useCreateContainer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: ContainerCreateRequest }) => dockerApi.createContainer(nodeId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useDockerContainerStats(nodeId: string, containerId: string) {
  return useQuery<Record<string, unknown>>({
    queryKey: ['docker', nodeId, 'containers', containerId, 'stats'],
    queryFn: () => dockerApi.getContainerStats(nodeId, containerId),
    enabled: !!nodeId && !!containerId,
    refetchInterval: 5000,
  })
}

export function useBuildImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: DockerImageBuildRequest }) => dockerApi.buildImage(nodeId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useTagImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, imageId, data }: { nodeId: string; imageId: string; data: DockerImageTagRequest }) => dockerApi.tagImage(nodeId, imageId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

// Per-node bulk wrappers (v2) — legacy global bulk via first node
export function useBulkDockerExec() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { container_id: string; node_ids: string[]; command?: string; timeout?: number } | { nodeId: string; container_ids: string[]; command: string }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[]; command?: string }
      const nodeId = d.nodeId || d.node_ids?.[0] || ''
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      const command = d.command || ''
      return dockerApi.bulkExec(nodeId, { container_ids, command, timeout: 30 } as Parameters<typeof dockerApi.bulkExec>[1])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerRestart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { container_id: string; node_ids: string[] } | { nodeId: string; container_ids: string[] }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[] }
      const nodeId = d.nodeId || d.node_ids?.[0] || ''
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      return dockerApi.bulkRestart(nodeId, { container_ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerStart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { container_id: string; node_ids: string[] } | { nodeId: string; container_ids: string[] }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[] }
      const nodeId = d.nodeId || d.node_ids?.[0] || ''
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      return dockerApi.bulkStart(nodeId, { container_ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerStop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { container_id: string; node_ids: string[]; timeout?: number } | { nodeId: string; container_ids: string[]; timeout?: number }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[]; timeout?: number }
      const nodeId = d.nodeId || d.node_ids?.[0] || ''
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      return dockerApi.bulkStop(nodeId, { container_ids }, d.timeout)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerRemove() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { container_id: string; node_ids: string[] } | { nodeId: string; container_ids: string[] }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[] }
      const nodeId = d.nodeId || d.node_ids?.[0] || ''
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      return dockerApi.bulkRemove(nodeId, { container_ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerImageBuild() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { node_ids?: string[]; node_tags?: string[]; dockerfile: string; tag: string } | { nodeId: string; dockerfile: string; tag: string }) => {
      const d = data as { node_ids?: string[]; nodeId?: string; dockerfile: string; tag: string; no_cache?: boolean }
      const nodeId = d.nodeId || d.node_ids?.[0] || ''
      return dockerApi.buildImage(nodeId, { dockerfile: d.dockerfile, tag: d.tag, no_cache: d.no_cache })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerImageRemove() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { image_id: string; node_ids: string[] } | { nodeId: string; image_ids: string[] }) => {
      const d = data as { image_id?: string; node_ids?: string[]; nodeId?: string; image_ids?: string[] }
      const nodeId = d.nodeId || d.node_ids?.[0] || ''
      const image_ids = d.image_ids || (d.image_id ? [d.image_id] : [])
      return dockerApi.bulkImageRemovals(nodeId, { image_ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerPull() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { image: string; node_ids: string[] } | { nodeId: string; images: string[] }) => {
      const d = data as { image?: string; node_ids?: string[]; nodeId?: string; images?: string[] }
      const nodeId = d.nodeId || d.node_ids?.[0] || ''
      const images = d.images || (d.image ? [d.image] : [])
      return dockerApi.bulkImagePulls(nodeId, { images, timeout: 300 } as Parameters<typeof dockerApi.bulkImagePulls>[1])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerInspect() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { container_id: string; node_ids: string[] } | { nodeId: string; container_ids: string[] }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[] }
      const nodeId = d.nodeId || d.node_ids?.[0] || ''
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      return dockerApi.bulkInspect(nodeId, { container_ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerLogs() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { container_id: string; node_ids: string[] } | { nodeId: string; container_ids: string[] }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[] }
      const nodeId = d.nodeId || d.node_ids?.[0] || ''
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      return dockerApi.bulkLogs(nodeId, { container_ids, tail: 100 } as Parameters<typeof dockerApi.bulkLogs>[1])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkDockerStats() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { container_id: string; node_ids: string[] } | { nodeId: string; container_ids: string[] }) => {
      const d = data as { container_id?: string; node_ids?: string[]; nodeId?: string; container_ids?: string[] }
      const nodeId = d.nodeId || d.node_ids?.[0] || ''
      const container_ids = d.container_ids || (d.container_id ? [d.container_id] : [])
      return dockerApi.bulkStats(nodeId, { container_ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docker'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function usePauseContainer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, containerId }: { nodeId: string; containerId: string }) => dockerApi.pauseContainer(nodeId, containerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useUnpauseContainer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, containerId }: { nodeId: string; containerId: string }) => dockerApi.unpauseContainer(nodeId, containerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useRenameContainer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, containerId, data }: { nodeId: string; containerId: string; data: ContainerRenameRequest }) => dockerApi.renameContainer(nodeId, containerId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function usePruneContainers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nodeId: string) => dockerApi.pruneContainers(nodeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function usePruneImages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nodeId: string) => dockerApi.pruneImages(nodeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useCreateNetwork() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: NetworkCreateRequest }) => dockerApi.createNetwork(nodeId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useDeleteNetwork() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, networkId }: { nodeId: string; networkId: string }) => dockerApi.deleteNetwork(nodeId, networkId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
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
    mutationFn: ({ nodeId, networkId, data }: { nodeId: string; networkId: string; data: NetworkConnectRequest }) => dockerApi.connectNetwork(nodeId, networkId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useDisconnectNetwork() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, networkId, data }: { nodeId: string; networkId: string; data: NetworkDisconnectRequest }) => dockerApi.disconnectNetwork(nodeId, networkId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useCreateVolume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: VolumeCreateRequest }) => dockerApi.createVolume(nodeId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
  })
}

export function useDeleteVolume() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, volumeName }: { nodeId: string; volumeName: string }) => dockerApi.deleteVolume(nodeId, volumeName),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docker'] }),
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
