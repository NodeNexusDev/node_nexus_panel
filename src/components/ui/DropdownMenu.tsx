import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from './Button'
import { IconDots } from './Icons'

export interface DropdownMenuItem {
  key: string
  label: string
  icon?: ReactNode
  onClick: () => void
  danger?: boolean
  separator?: boolean
}

interface DropdownMenuProps {
  items: DropdownMenuItem[]
  align?: 'left' | 'right'
  ariaLabel?: string
}

export function DropdownMenu({ items, align = 'right', ariaLabel = 'Actions' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative inline-flex">
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className="px-2"
      >
        <IconDots className="w-4 h-4" />
      </Button>
      {open && (
        <div
          role="menu"
          className={`absolute z-40 mt-1 w-48 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-lg py-1 animate-fade-in ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {items.map((item) => (
            <div key={item.key}>
              {item.separator && <div className="my-1 border-t border-surface-200 dark:border-surface-800" />}
              <button
                role="menuitem"
                onClick={(e) => { e.stopPropagation(); setOpen(false); item.onClick() }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                  item.danger
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                    : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                }`}
              >
                {item.icon && <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>}
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
