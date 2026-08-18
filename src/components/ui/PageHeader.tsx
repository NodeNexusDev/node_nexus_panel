import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-4 animate-slide-up ${className}`}>
      <div className="min-w-0">
        <h1 className="text-3xl font-bold gradient-text">{title}</h1>
        {description && <p className="text-surface-500 dark:text-surface-400 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
    </div>
  )
}
