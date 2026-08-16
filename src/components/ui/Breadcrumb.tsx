import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && (
            <svg className="w-4 h-4 text-surface-400 dark:text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href && i < items.length - 1 ? (
            <Link
              to={item.href}
              className="text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? 'text-surface-900 dark:text-white font-medium' : 'text-surface-500 dark:text-surface-400'}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
