import { api } from './client'
import type { ConfigExport, ConfigImport, ImportResult, DryRunImportResult } from './types'

export const configApi = {
  export: () =>
    api.get<ConfigExport>('/config/export'),

  import: (data: ConfigImport) =>
    api.post<ImportResult | DryRunImportResult>('/config/import', data),
}
