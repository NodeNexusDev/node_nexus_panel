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
  PackInstallationResponse,
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

  getPackStats: () => api.get<PackStatsResponse>('/templates/packs/stats'),

  getPackArchive: (packId: string) => api.get<Blob>(`/templates/packs/${packId}/archive`),

  listInstallations: (packId: string, params?: { cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<CursorPage_PackInstallationResponse_>(`/templates/packs/${packId}/installations${qs ? `?${qs}` : ''}`)
  },

  installPack: (packId: string, data?: unknown) =>
    api.post<PackInstallationResponse>(`/templates/packs/${packId}/installations`, data),

  uninstallPack: (packId: string, data?: unknown) =>
    api.post<unknown>(`/templates/packs/${packId}/uninstallations`, data),

  updatePack: (packId: string, data?: unknown) =>
    api.post<PackResponse>(`/templates/packs/${packId}/updates`, data),

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
