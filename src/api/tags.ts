import { api } from './client'

export const tagsApi = {
  rename: (oldName: string, newName: string) =>
    api.patch<Record<string, unknown>>(`/tags/${encodeURIComponent(oldName)}`, { new_name: newName }),

  remove: (name: string) =>
    api.delete<void>(`/tags/${encodeURIComponent(name)}`),
}
