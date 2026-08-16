import { Skeleton } from '../components/ui/Skeleton'

export function CommandsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-40 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
        <div className="h-4 w-56 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mt-2" />
      </div>

      <div className="rounded-xl bg-white border border-surface-200 dark:bg-surface-900 dark:border-surface-800 p-6">
        <div className="h-5 w-40 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mb-4" />
        <div className="flex gap-4">
          <Skeleton variant="text" className="w-40 h-10" />
          <Skeleton variant="text" className="flex-1 h-10" />
          <Skeleton variant="text" className="w-24 h-10" />
        </div>
      </div>

      <div className="rounded-xl bg-white border border-surface-200 dark:bg-surface-900 dark:border-surface-800 p-6">
        <div className="h-5 w-36 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
                </div>
                <div className="h-3 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
              </div>
              <Skeleton variant="text" className="w-full h-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
