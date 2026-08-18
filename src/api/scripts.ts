import { api } from './client'
import type {
  Script,
  ScriptCreate,
  ScriptUpdate,
  ScriptExecuteRequest,
  PaginatedResponse,
} from './types'

export const scriptsApi = {
  getAll: (params?: { page?: number; size?: number; tag?: string }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.size) query.set('size', String(params.size))
    if (params?.tag) query.set('tag', params.tag)
    const qs = query.toString()
    return api.get<PaginatedResponse<Script>>(`/scripts/${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) =>
    api.get<Script>(`/scripts/${id}`),

  create: (data: ScriptCreate) =>
    api.post<Script>('/scripts/', data),

  update: (id: string, data: ScriptUpdate) =>
    api.put<Script>(`/scripts/${id}`, data),

  remove: (id: string) =>
    api.delete<void>(`/scripts/${id}`),

  execute: (id: string, data: ScriptExecuteRequest) =>
    api.post<unknown>(`/scripts/${id}/execute`, data),

  clone: (id: string) =>
    api.post<Script>(`/scripts/${id}/clone`),

  getStats: (id: string) =>
    api.get<unknown>(`/scripts/${id}/stats`),

  getTags: () =>
    api.get<string[]>('/scripts/tags'),

  getSchedule: (id: string) =>
    api.get<unknown>(`/scripts/${id}/schedule`),

  setSchedule: (id: string, data: unknown) =>
    api.post<void>(`/scripts/${id}/schedule`, data),

  removeSchedule: (id: string) =>
    api.delete<void>(`/scripts/${id}/schedule`),
}
