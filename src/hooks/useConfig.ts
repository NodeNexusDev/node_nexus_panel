import { useMutation } from '@tanstack/react-query'
import { configApi } from '../api/config'

export function useExportConfig() {
  return useMutation({
    mutationFn: () => configApi.export(),
  })
}

export function useImportConfig() {
  return useMutation({
    mutationFn: (data: unknown) => configApi.import(data),
  })
}
