import { TableSkeleton } from '../components/ui/Skeleton'
import { Skeleton } from '../components/ui/Skeleton'

export function DockerSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <Skeleton variant="text" className="w-48 h-8" />
      <TableSkeleton rows={5} cols={6} />
    </div>
  )
}
