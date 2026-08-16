import type { ReactNode } from 'react'

interface TimelineItem {
  id: string
  title: string
  description?: string
  time: string
  icon?: ReactNode
}

interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

export function Timeline({ items, className = '' }: TimelineProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item) => (
        <div key={item.id} className="timeline-item">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-white">{item.title}</p>
              {item.description && (
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{item.description}</p>
              )}
            </div>
            <span className="text-xs text-surface-400 dark:text-surface-500 shrink-0 ml-2">{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
