import { TableSkeleton } from '../components/ui/Skeleton'
import { Skeleton } from '../components/ui/Skeleton'

export function AuditSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <Skeleton variant="text" className="w-48 h-8" />
      <TableSkeleton rows={10} cols={5} />
    </div>
  )
}
