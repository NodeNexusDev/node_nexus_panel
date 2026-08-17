import type { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
  glass?: boolean
}

export function Card({ children, className = '', hover = false, gradient = false, glass = false, ...props }: CardProps) {
  const base = 'rounded-xl border transition-all duration-300'
  const bg = glass
    ? 'glass border-surface-200/50 dark:border-surface-700/50'
    : gradient
      ? 'gradient-subtle border-surface-200/50 dark:border-surface-700/50'
      : 'bg-white border-surface-200 dark:bg-surface-900 dark:border-surface-800'
  const hoverClass = hover ? 'card-hover' : ''
  const shadow = glass ? 'shadow-lg shadow-surface-200/20 dark:shadow-surface-900/30' : 'shadow-sm'

  return (
    <div className={`${base} ${bg} ${hoverClass} ${shadow} ${className}`} {...props}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-surface-200/50 dark:border-surface-800/50 ${className}`}>
      {children}
    </div>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}
