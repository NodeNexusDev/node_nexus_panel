import { useId } from 'react'

interface TabItem<T extends string> {
  key: T
  label: string
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[]
  active: T
  onChange: (key: T) => void
  className?: string
}

export function Tabs<T extends string>({ tabs, active, onChange, className = '' }: TabsProps<T>) {
  const baseId = useId()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const idx = tabs.findIndex((t) => t.key === active)
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      onChange(tabs[(idx + 1) % tabs.length].key)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onChange(tabs[(idx - 1 + tabs.length) % tabs.length].key)
    } else if (e.key === 'Home') {
      e.preventDefault()
      onChange(tabs[0].key)
    } else if (e.key === 'End') {
      e.preventDefault()
      onChange(tabs[tabs.length - 1].key)
    }
  }

  return (
    <div className={`border-b border-surface-200 dark:border-surface-800 ${className}`}>
      <nav className="flex gap-1 overflow-x-auto" role="tablist" onKeyDown={handleKeyDown}>
        {tabs.map((tab) => {
          const panelId = `${baseId}-panel-${tab.key}`
          const buttonId = `${baseId}-tab-${tab.key}`
          const isActive = active === tab.key
          return (
            <button
              key={tab.key}
              id={buttonId}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.key)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
                isActive
                  ? 'border-accent-500 text-accent-600 dark:text-accent-400'
                  : 'border-transparent text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
