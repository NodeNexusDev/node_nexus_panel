import { TableSkeleton } from '../components/ui/Skeleton'

export function NodesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
          <div className="h-4 w-48 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-32 bg-surface-200 dark:bg-surface-700 rounded-lg animate-pulse" />
      </div>
      <div className="rounded-xl bg-white border border-surface-200 dark:bg-surface-900 dark:border-surface-800">
        <TableSkeleton rows={5} cols={7} />
      </div>
    </div>
  )
}
