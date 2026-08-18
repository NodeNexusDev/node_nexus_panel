import { api } from './client'

export const configApi = {
  export: () =>
    api.get<unknown>('/config/export'),

  import: (data: unknown) =>
    api.post<{ message: string }>('/config/import', data),
}
