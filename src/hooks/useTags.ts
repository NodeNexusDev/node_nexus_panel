import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi } from '../api/tags'

export function useRenameTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ oldName, newName }: { oldName: string; newName: string }) =>
      tagsApi.rename(oldName, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
      queryClient.invalidateQueries({ queryKey: ['nodes', 'tags'] })
      queryClient.invalidateQueries({ queryKey: ['commands', 'tags'] })
      queryClient.invalidateQueries({ queryKey: ['scripts', 'tags'] })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => tagsApi.remove(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
      queryClient.invalidateQueries({ queryKey: ['nodes', 'tags'] })
      queryClient.invalidateQueries({ queryKey: ['commands', 'tags'] })
      queryClient.invalidateQueries({ queryKey: ['scripts', 'tags'] })
    },
  })
}
