import { Skeleton } from '../components/ui/Skeleton'

export function ScriptDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <Skeleton variant="text" className="w-64 h-8" />
      <Skeleton variant="rectangular" className="w-full h-32" />
      <Skeleton variant="rectangular" className="w-full h-48" />
    </div>
  )
}
