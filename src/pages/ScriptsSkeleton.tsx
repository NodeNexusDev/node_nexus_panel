export function ScriptsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
          <div className="h-4 w-48 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-36 bg-surface-200 dark:bg-surface-700 rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white border border-surface-200 dark:bg-surface-900 dark:border-surface-800 p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="h-5 w-28 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
              <div className="h-5 w-16 bg-surface-200 dark:bg-surface-700 rounded-full animate-pulse" />
            </div>
            <div className="h-4 w-48 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mb-4" />
            <div className="border-t border-surface-200 dark:border-surface-800 pt-4">
              <div className="flex items-center justify-between">
                <div className="h-3 w-40 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-8 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
