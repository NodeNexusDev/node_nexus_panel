import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  children: ReactNode
  className?: string
}

const variants = {
  success: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 shadow-sm shadow-green-500/10',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20 shadow-sm shadow-yellow-500/10',
  danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 shadow-sm shadow-red-500/10',
  info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 shadow-sm shadow-blue-500/10',
  default: 'bg-surface-100 text-surface-600 border-surface-200 dark:bg-surface-500/10 dark:text-surface-400 dark:border-surface-500/20',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all duration-200 ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
