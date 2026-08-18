import { api } from './client'
import type { Tag } from './types'

export const tagsApi = {
  getAll: () =>
    api.get<Tag[]>('/tags'),

  rename: (oldName: string, newName: string) =>
    api.patch<Tag>(`/tags/${encodeURIComponent(oldName)}`, { new_name: newName }),

  remove: (name: string) =>
    api.delete<void>(`/tags/${encodeURIComponent(name)}`),
}
