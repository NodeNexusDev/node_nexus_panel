import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSse } from './useSse'

export function useDockerContainerSse(nodeId: string) {
  const queryClient = useQueryClient()
  const { on } = useSse()

  useEffect(() => {
    if (!nodeId) return
    const unsubs = [
      on('docker:container:started', () => {
        queryClient.invalidateQueries({ queryKey: ['docker', nodeId, 'containers'] })
      }),
      on('docker:container:stopped', () => {
        queryClient.invalidateQueries({ queryKey: ['docker', nodeId, 'containers'] })
      }),
    ]
    return () => { unsubs.forEach((u) => u()) }
  }, [nodeId, on, queryClient])
}
