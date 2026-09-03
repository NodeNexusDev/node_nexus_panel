import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { composeApi } from '../api/compose'
import type {
  ComposeResponse,
  ComposeCreate,
  ComposeUpdate,
  CursorPage_ComposeResponse_,
  ComposePsResponse,
  ComposeLogsResponse,
  ComposeConfigResponse,
} from '../api/types'

export function useComposeProjects(nodeId: string, params?: { cursor?: string | null; limit?: number }) {
  return useQuery<CursorPage_ComposeResponse_>({
    queryKey: ['compose', nodeId, 'projects', params],
    queryFn: () => composeApi.list(nodeId, params),
    enabled: !!nodeId,
  })
}

export function useInfiniteComposeProjects(nodeId: string, params?: { limit?: number }) {
  return useInfiniteQuery({
    queryKey: ['compose', nodeId, 'projects', 'infinite', params],
    queryFn: ({ pageParam }) => composeApi.list(nodeId, { cursor: pageParam as string | null, limit: params?.limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
    enabled: !!nodeId,
  })
}

export function useComposeProject(nodeId: string, projectName: string) {
  return useQuery<ComposeResponse>({
    queryKey: ['compose', nodeId, 'project', projectName],
    queryFn: () => composeApi.get(nodeId, projectName),
    enabled: !!nodeId && !!projectName,
  })
}

export function useCreateComposeProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: ComposeCreate }) => composeApi.create(nodeId, data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['compose', vars.nodeId] }),
  })
}

export function useUpdateComposeProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, projectName, data }: { nodeId: string; projectName: string; data: ComposeUpdate }) => composeApi.update(nodeId, projectName, data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['compose', vars.nodeId] }),
  })
}

export function useDeleteComposeProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, projectName }: { nodeId: string; projectName: string }) => composeApi.remove(nodeId, projectName),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['compose', vars.nodeId] }),
  })
}

export function useComposePs(nodeId: string, projectName: string, enabled = true) {
  return useQuery<ComposePsResponse>({
    queryKey: ['compose', nodeId, projectName, 'ps'],
    queryFn: () => composeApi.ps(nodeId, projectName),
    enabled: !!nodeId && !!projectName && enabled,
  })
}

export function useComposeLogs(nodeId: string, projectName: string, enabled = true) {
  return useQuery<ComposeLogsResponse>({
    queryKey: ['compose', nodeId, projectName, 'logs'],
    queryFn: () => composeApi.logs(nodeId, projectName),
    enabled: !!nodeId && !!projectName && enabled,
  })
}

export function useComposeConfig(nodeId: string, projectName: string, enabled = true) {
  return useQuery<ComposeConfigResponse>({
    queryKey: ['compose', nodeId, projectName, 'config'],
    queryFn: () => composeApi.config(nodeId, projectName),
    enabled: !!nodeId && !!projectName && enabled,
  })
}

export function useComposeUp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ nodeId, projectName }: { nodeId: string; projectName: string }) => composeApi.ups(nodeId, projectName),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['compose'] }),
  })
}
export function useComposeDown() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ nodeId, projectName }: { nodeId: string; projectName: string }) => composeApi.downs(nodeId, projectName), onSuccess: () => qc.invalidateQueries({ queryKey: ['compose'] }) })
}
export function useComposeStart() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ nodeId, projectName }: { nodeId: string; projectName: string }) => composeApi.starts(nodeId, projectName), onSuccess: () => qc.invalidateQueries({ queryKey: ['compose'] }) })
}
export function useComposeStop() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ nodeId, projectName }: { nodeId: string; projectName: string }) => composeApi.stops(nodeId, projectName), onSuccess: () => qc.invalidateQueries({ queryKey: ['compose'] }) })
}
export function useComposeRestart() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ nodeId, projectName }: { nodeId: string; projectName: string }) => composeApi.restarts(nodeId, projectName), onSuccess: () => qc.invalidateQueries({ queryKey: ['compose'] }) })
}
export function useComposeBuild() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ nodeId, projectName }: { nodeId: string; projectName: string }) => composeApi.builds(nodeId, projectName), onSuccess: () => qc.invalidateQueries({ queryKey: ['compose'] }) })
}
export function useComposePull() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ nodeId, projectName }: { nodeId: string; projectName: string }) => composeApi.pulls(nodeId, projectName), onSuccess: () => qc.invalidateQueries({ queryKey: ['compose'] }) })
}
