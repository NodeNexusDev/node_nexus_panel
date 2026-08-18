import { api } from './client'
import type { ConfigExport, ConfigImport, ImportResult } from './types'

export const configApi = {
  export: () =>
    api.get<ConfigExport>('/config/export'),

  import: (data: ConfigImport) =>
    api.post<ImportResult>('/config/import', data),
}
