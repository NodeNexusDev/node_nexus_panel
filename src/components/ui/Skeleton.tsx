interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const base = 'shimmer'

  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return <div className={`${base} ${variants[variant]} ${className}`} />
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-md)] bg-white border border-surface-200 dark:bg-surface-900 dark:border-surface-800 p-6 overflow-hidden motion-reduce:animate-none">
      <Skeleton variant="text" className="w-1/3 mb-3" />
      <Skeleton variant="text" className="w-1/2 h-8" />
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
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
        <div key={i} className="rounded-[var(--radius-md)] bg-white border border-surface-200 dark:bg-surface-900 dark:border-surface-800 p-6 stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
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
        <div key={i} className="stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
          <Skeleton variant="text" className="w-24 mb-2" />
          <Skeleton variant="text" className="w-full h-10" />
        </div>
      ))}
    </div>
  )
}

export function MetricsChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-end gap-1" style={{ height: 180 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col gap-0.5">
            <Skeleton variant="rectangular" className="w-full flex-1 rounded-t" />
            <Skeleton variant="rectangular" className="w-full h-3 rounded-b" />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4">
        <Skeleton variant="text" className="w-16 h-3" />
        <Skeleton variant="text" className="w-16 h-3" />
      </div>
    </div>
  )
}
