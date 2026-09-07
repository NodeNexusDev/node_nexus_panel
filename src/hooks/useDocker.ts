import { getNextCursor } from '../lib/pagination'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
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

export function useInfiniteDockerContainers(nodeId: string, params?: { limit?: number; all?: boolean }) {
  return useInfiniteQuery<CursorPage_DockerContainer_>({
    queryKey: ['docker', nodeId, 'containers', 'infinite', params],
    queryFn: ({ pageParam }) => dockerApi.getContainers(nodeId, { cursor: pageParam as string | null, limit: params?.limit, all: params?.all }),
    initialPageParam: null as string | null,
    getNextPageParam: getNextCursor,
    enabled: !!nodeId,
    refetchInterval: 60_000,
  })
}

export function useInfiniteDockerImages(nodeId: string, params?: { limit?: number }) {
  return useInfiniteQuery<CursorPage_DockerImage_>({
    queryKey: ['docker', nodeId, 'images', 'infinite', params],
    queryFn: ({ pageParam }) => dockerApi.getImages(nodeId, { cursor: pageParam as string | null, limit: params?.limit }),
    initialPageParam: null as string | null,
    getNextPageParam: getNextCursor,
    enabled: !!nodeId,
    refetchInterval: 60_000,
  })
}

export function useInfiniteDockerNetworks(nodeId: string, params?: { limit?: number }) {
  return useInfiniteQuery<CursorPage_DockerNetwork_>({
    queryKey: ['docker', nodeId, 'networks', 'infinite', params],
    queryFn: ({ pageParam }) => dockerApi.getNetworks(nodeId, { cursor: pageParam as string | null, limit: params?.limit }),
    initialPageParam: null as string | null,
    getNextPageParam: getNextCursor,
    enabled: !!nodeId,
    refetchInterval: 60_000,
  })
}

export function useInfiniteDockerVolumes(nodeId: string, params?: { limit?: number }) {
  return useInfiniteQuery<CursorPage_DockerVolume_>({
    queryKey: ['docker', nodeId, 'volumes', 'infinite', params],
    queryFn: ({ pageParam }) => dockerApi.getVolumes(nodeId, { cursor: pageParam as string | null, limit: params?.limit }),
    initialPageParam: null as string | null,
    getNextPageParam: getNextCursor,
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

export function useDockerContainerArchive(nodeId: string, containerId: string) {
  return useQuery<{ data: string }>({
    queryKey: ['docker', nodeId, 'containers', containerId, 'archive'],
    queryFn: () => dockerApi.getContainerArchive(nodeId, containerId),
    enabled: !!nodeId && !!containerId,
  })
}

export function useKillContainer() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ nodeId, containerId, signal }: { nodeId: string; containerId: string; signal?: string }) => dockerApi.killContainer(nodeId, containerId, signal), onSuccess: ()=> qc.invalidateQueries({ queryKey:['docker'] }) })
}

export function useUpdateContainer() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ nodeId, containerId, data }: { nodeId: string; containerId: string; data: unknown }) => dockerApi.updateContainer(nodeId, containerId, data), onSuccess: ()=> qc.invalidateQueries({ queryKey:['docker'] }) })
}

export function useWaitContainer() {
  return useMutation({ mutationFn: ({ nodeId, containerId }: { nodeId: string; containerId: string }) => dockerApi.waitContainer(nodeId, containerId) })
}

export function usePushImage() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ nodeId, data }: { nodeId: string; data: { image: string } }) => dockerApi.pushImage(nodeId, data), onSuccess: ()=> qc.invalidateQueries({ queryKey:['docker'] }) })
}

export function useImageHistory(nodeId: string, imageId: string) {
  return useQuery<unknown[]>({ queryKey:['docker',nodeId,'images',imageId,'history'], queryFn:()=> dockerApi.getImageHistory(nodeId, imageId), enabled: !!nodeId && !!imageId })
}

export function usePushImageById() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ nodeId, imageId }: { nodeId: string; imageId: string }) => dockerApi.pushImageById(nodeId, imageId), onSuccess: ()=> qc.invalidateQueries({ queryKey:['docker'] }) })
}

export function usePruneNetworks() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (nodeId: string) => dockerApi.pruneNetworks(nodeId), onSuccess: ()=> qc.invalidateQueries({ queryKey:['docker'] }) })
}

export function usePruneSystem() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (nodeId: string) => dockerApi.pruneSystem(nodeId), onSuccess: ()=> qc.invalidateQueries({ queryKey:['docker'] }) })
}

export function useDockerSystemVersion(nodeId: string) {
  return useQuery<{ version: string; api_version: string }>({ queryKey:['docker',nodeId,'system','version'], queryFn:()=> dockerApi.getSystemVersion(nodeId), enabled: !!nodeId })
}
export * from './useDockerBulk'
