import { FormSkeleton } from '../components/ui/Skeleton'

export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-40 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
        <div className="h-4 w-56 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white border border-surface-200 dark:bg-surface-900 dark:border-surface-800">
            <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-800">
              <div className="h-5 w-32 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
            </div>
            <div className="p-6">
              <FormSkeleton fields={i === 0 ? 3 : i === 1 ? 4 : 2} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
