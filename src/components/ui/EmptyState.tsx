import type { ReactNode } from 'react'
import { IconBox } from './Icons'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <span className="text-surface-300 dark:text-surface-400 mb-4">{icon || <IconBox className="w-10 h-10" />}</span>
      <h3 className="text-lg font-medium text-surface-900 dark:text-white">{title}</h3>
      {description && <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
