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
  ComposeImagesResponse,
  ComposeTopResponse,
  ComposePortResponse,
  ComposeVersionResponse,
  ComposeExecRequest,
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
export function useComposeCreate() { const qc=useQueryClient(); return useMutation({ mutationFn: ({nodeId,projectName}:{nodeId:string;projectName:string})=> composeApi.creates(nodeId,projectName), onSuccess:()=>qc.invalidateQueries({queryKey:['compose']}) })}
export function useComposeKill() { const qc=useQueryClient(); return useMutation({ mutationFn: ({nodeId,projectName}:{nodeId:string;projectName:string})=> composeApi.kills(nodeId,projectName), onSuccess:()=>qc.invalidateQueries({queryKey:['compose']}) })}
export function useComposePause() { const qc=useQueryClient(); return useMutation({ mutationFn: ({nodeId,projectName}:{nodeId:string;projectName:string})=> composeApi.pauses(nodeId,projectName), onSuccess:()=>qc.invalidateQueries({queryKey:['compose']}) })}
export function useComposeUnpause() { const qc=useQueryClient(); return useMutation({ mutationFn: ({nodeId,projectName}:{nodeId:string;projectName:string})=> composeApi.unpauses(nodeId,projectName), onSuccess:()=>qc.invalidateQueries({queryKey:['compose']}) })}
export function useComposePort(nodeId:string,projectName:string,service:string,port:string,enabled=true){ return useQuery<ComposePortResponse>({ queryKey:['compose',nodeId,projectName,'port',service,port], queryFn:()=> composeApi.port(nodeId,projectName,{service,private_port:port}), enabled: !!nodeId && !!projectName && enabled })}
export function useComposeImages(nodeId:string,projectName:string,enabled=true){ return useQuery<ComposeImagesResponse>({ queryKey:['compose',nodeId,projectName,'images'], queryFn:()=> composeApi.images(nodeId,projectName), enabled: !!nodeId && !!projectName && enabled })}
export function useComposeTop(nodeId:string,projectName:string,enabled=true){ return useQuery<ComposeTopResponse>({ queryKey:['compose',nodeId,projectName,'top'], queryFn:()=> composeApi.top(nodeId,projectName), enabled: !!nodeId && !!projectName && enabled })}
export function useComposeVersion(nodeId:string,projectName:string,enabled=true){ return useQuery<ComposeVersionResponse>({ queryKey:['compose',nodeId,projectName,'version'], queryFn:()=> composeApi.version(nodeId,projectName), enabled: !!nodeId && !!projectName && enabled })}
export function useComposePush() { const qc=useQueryClient(); return useMutation({ mutationFn: ({nodeId,projectName}:{nodeId:string;projectName:string})=> composeApi.pushs(nodeId,projectName), onSuccess:()=>qc.invalidateQueries({queryKey:['compose']}) })}
export function useComposeRm() { const qc=useQueryClient(); return useMutation({ mutationFn: ({nodeId,projectName}:{nodeId:string;projectName:string})=> composeApi.rms(nodeId,projectName), onSuccess:()=>qc.invalidateQueries({queryKey:['compose']}) })}
export function useComposeRun() { const qc=useQueryClient(); return useMutation({ mutationFn: ({nodeId,projectName,data}:{nodeId:string;projectName:string;data:import('../api/types').ComposeRunRequest})=> composeApi.runs(nodeId,projectName,data), onSuccess:()=>qc.invalidateQueries({queryKey:['compose']}) })}
export function useComposeExec() { const qc=useQueryClient(); return useMutation({ mutationFn: ({nodeId,projectName,data}:{nodeId:string;projectName:string;data:ComposeExecRequest})=> composeApi.executions(nodeId,projectName,data), onSuccess:()=>qc.invalidateQueries({queryKey:['compose']}) })}
