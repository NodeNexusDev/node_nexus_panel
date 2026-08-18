import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi } from '../api/tags'
import type { Tag } from '../api/types'

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getAll(),
  })
}

export function useRenameTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ oldName, newName }: { oldName: string; newName: string }) =>
      tagsApi.rename(oldName, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => tagsApi.remove(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}
