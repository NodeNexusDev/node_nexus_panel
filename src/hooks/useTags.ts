import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi } from '../api/tags'

const TAG_INVALIDATION_KEYS = [['nodes'], ['nodes', 'tags'], ['commands', 'tags'], ['scripts', 'tags']] as const

export function useRenameTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ oldName, newName }: { oldName: string; newName: string }) =>
      tagsApi.rename(oldName, newName),
    onSuccess: () => {
      for (const key of TAG_INVALIDATION_KEYS) {
        queryClient.invalidateQueries({ queryKey: [...key] })
      }
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => tagsApi.remove(name),
    onSuccess: () => {
      for (const key of TAG_INVALIDATION_KEYS) {
        queryClient.invalidateQueries({ queryKey: [...key] })
      }
    },
  })
}
