interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const base = 'animate-pulse bg-surface-200 dark:bg-surface-700'

  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return <div className={`${base} ${variants[variant]} ${className}`} />
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl bg-white border border-surface-200 dark:bg-surface-900 dark:border-surface-800 p-6">
      <Skeleton variant="text" className="w-1/3 mb-3" />
      <Skeleton variant="text" className="w-1/2 h-8" />
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} variant="text" className={j === 0 ? 'w-1/4' : 'w-1/6'} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl bg-white border border-surface-200 dark:bg-surface-900 dark:border-surface-800 p-6">
          <Skeleton variant="text" className="w-1/2 mb-2" />
          <Skeleton variant="text" className="w-3/4 mb-4" />
          <Skeleton variant="text" className="w-full" />
        </div>
      ))}
    </div>
  )
}

export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton variant="text" className="w-24 mb-2" />
          <Skeleton variant="text" className="w-full h-10" />
        </div>
      ))}
    </div>
  )
}
