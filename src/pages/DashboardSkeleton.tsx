import { StatCardSkeleton } from '../components/ui/Skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
        <div className="h-4 w-64 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white border border-surface-200 dark:bg-surface-900 dark:border-surface-800 p-6">
          <div className="h-5 w-32 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-surface-300 dark:bg-surface-600" />
                  <div>
                    <div className="h-4 w-24 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mt-1" />
                  </div>
                </div>
                <div className="h-5 w-14 bg-surface-200 dark:bg-surface-700 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-surface-200 dark:bg-surface-900 dark:border-surface-800 p-6">
          <div className="h-5 w-32 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
                <div className="h-6 w-6 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
                <div className="h-4 w-20 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mt-2" />
                <div className="h-3 w-28 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
