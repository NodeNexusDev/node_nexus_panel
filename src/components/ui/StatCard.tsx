import type { ReactNode } from 'react'

interface Trend {
  value: number
  direction: 'up' | 'down' | 'flat'
}

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  sub?: ReactNode
  tone?: 'default' | 'success' | 'danger' | 'warning' | 'info'
  trend?: Trend
  className?: string
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-surface-900 dark:text-white',
  success: 'text-green-600 dark:text-green-400',
  danger: 'text-red-500 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
}

const trendColors: Record<Trend['direction'], string> = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-500 dark:text-red-400',
  flat: 'text-surface-400 dark:text-surface-500',
}

const trendIcons: Record<Trend['direction'], string> = {
  up: '\u2191',
  down: '\u2193',
  flat: '\u2014',
}

export function StatCard({ label, value, icon, sub, tone = 'default', trend, className = '' }: StatCardProps) {
  return (
    <div className={`text-center p-4 bg-surface-50 dark:bg-surface-800 rounded-lg ${className}`}>
      <div className="flex items-center justify-center gap-1.5">
        {icon && <span className="text-surface-400 dark:text-surface-500">{icon}</span>}
        <p className={`text-2xl font-bold ${toneClasses[tone]}`}>{value}</p>
      </div>
      <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">{label}</p>
      {trend && (
        <p className={`text-xs font-medium mt-0.5 ${trendColors[trend.direction]}`}>
          {trendIcons[trend.direction]} {trend.direction !== 'flat' ? `${Math.abs(trend.value)}%` : ''}
        </p>
      )}
      {sub && <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{sub}</p>}
    </div>
  )
}

interface StatsGridProps {
  children: ReactNode
  cols?: 2 | 3 | 4
  className?: string
}

export function StatsGrid({ children, cols = 4, className = '' }: StatsGridProps) {
  const colClass = cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'
  return <div className={`grid ${colClass} gap-4 ${className}`}>{children}</div>
}
