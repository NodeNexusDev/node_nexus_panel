import { api } from './client'
import type {
  PackResponse,
  PackDetailWithAssetsResponse,
  PackLocalCreateRequest,
  PackStatsResponse,
  RegistryResponse,
  RegistryCreate,
  RegistrySyncResult,
  CursorPage_PackResponse_,
  CursorPage_RegistryResponse_,
  CursorPage_PackInstallationResponse_,
  BulkResult_PackInstallResult_,
} from './types'

export const templatesApi = {
  // ── Packs ───────────────────────────────────────────────────
  listPacks: (params?: {
    cursor?: string | null
    limit?: number
    registry_id?: string | null
    tag?: string | null
    installed?: boolean | null
    search?: string | null
  }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    if (params?.registry_id) query.set('registry_id', params.registry_id)
    if (params?.tag) query.set('tag', params.tag)
    if (params?.installed != null) query.set('installed', String(params.installed))
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return api.get<CursorPage_PackResponse_>(`/templates/packs${qs ? `?${qs}` : ''}`)
  },

  getPack: (packId: string) => api.get<PackDetailWithAssetsResponse>(`/templates/packs/${packId}`),

  createPack: (data: PackLocalCreateRequest) => api.post<PackResponse>('/templates/packs', data),

  getPackStats: (params?: { group_by?: string | null }) => {
    const qs = params?.group_by ? `?group_by=${encodeURIComponent(params.group_by)}` : ''
    return api.get<PackStatsResponse>(`/templates/packs/stats${qs}`)
  },

  getPackArchive: (packId: string) => api.getBlob(`/templates/packs/${packId}/archive`),

  listInstallations: (packId: string, params?: { cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<CursorPage_PackInstallationResponse_>(`/templates/packs/${packId}/installations${qs ? `?${qs}` : ''}`)
  },

  installPack: (packId: string, params?: { on_conflict?: 'fail' | 'rename' }) => {
    const qs = params?.on_conflict ? `?on_conflict=${params.on_conflict}` : ''
    return api.post<BulkResult_PackInstallResult_>(`/templates/packs/${packId}/installations${qs}`)
  },

  uninstallPack: (packId: string) =>
    api.post<void>(`/templates/packs/${packId}/uninstallations`),

  updatePack: (packId: string, params?: { on_conflict?: 'fail' | 'rename' }) => {
    const qs = params?.on_conflict ? `?on_conflict=${params.on_conflict}` : ''
    return api.post<BulkResult_PackInstallResult_>(`/templates/packs/${packId}/updates${qs}`)
  },

  // ── Registries ──────────────────────────────────────────────
  listRegistries: (params?: { cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<CursorPage_RegistryResponse_>(`/templates/registries${qs ? `?${qs}` : ''}`)
  },

  getRegistry: (registryId: string) => api.get<RegistryResponse>(`/templates/registries/${registryId}`),

  createRegistry: (data: RegistryCreate) => api.post<RegistryResponse>('/templates/registries', data),

  deleteRegistry: (registryId: string) => api.delete<void>(`/templates/registries/${registryId}`),

  syncRegistry: (registryId: string) =>
    api.post<RegistrySyncResult>(`/templates/registries/${registryId}/syncs`),
}
