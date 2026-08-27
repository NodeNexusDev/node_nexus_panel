import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
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

export function DropdownMenu({ items, align = 'right', ariaLabel }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number; flip: boolean }>({ top: 0, left: 0, flip: false })
  const activeIndexRef = useRef(-1)

  const focusItem = (index: number) => {
    const menuItems = panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')
    if (!menuItems?.length) return
    const idx = Math.max(0, Math.min(index, menuItems.length - 1))
    activeIndexRef.current = idx
    menuItems[idx].focus()
  }

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const panelHeight = panelRef.current?.offsetHeight ?? 200
    const gap = 4
    const spaceBelow = window.innerHeight - rect.bottom
    const flip = spaceBelow < panelHeight + gap

    const top = flip
      ? rect.top - panelHeight - gap
      : rect.bottom + gap

    const left = align === 'right'
      ? rect.right - 192
      : rect.left

    setPos({ top, left, flip })
  }, [align])

  useEffect(() => {
    if (!open) {
      activeIndexRef.current = -1
      return
    }
    updatePosition()
    focusItem(0)

    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.querySelector('button')?.focus()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        focusItem(activeIndexRef.current + 1)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        focusItem(activeIndexRef.current - 1)
      }
      if (e.key === 'Home') {
        e.preventDefault()
        focusItem(0)
      }
      if (e.key === 'End') {
        e.preventDefault()
        const menuItems = panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')
        focusItem((menuItems?.length ?? 1) - 1)
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const focused = document.activeElement as HTMLElement
        if (focused?.getAttribute('role') === 'menuitem') {
          focused.click()
        }
      }
    }
    const handleScroll = () => updatePosition()

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])

  return (
    <div ref={triggerRef} className="relative inline-flex">
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className="px-2 min-w-[44px] min-h-[44px]"
      >
        <IconDots className="w-4 h-4" />
      </Button>
      {open && createPortal(
        <div
          ref={panelRef}
          role="menu"
          className="fixed z-[var(--z-dropdown)] w-48 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-lg py-1 animate-fade-in"
          style={{ top: pos.top, left: pos.left }}
        >
          {items.map((item) => (
            <div key={item.key}>
              {item.separator && <div className="my-1 border-t border-surface-200 dark:border-surface-800" />}
              <button
                role="menuitem"
                tabIndex={-1}
                onClick={(e) => { e.stopPropagation(); setOpen(false); item.onClick() }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus:bg-surface-100 dark:focus:bg-surface-800 ${
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
        </div>,
        document.body,
      )}
    </div>
  )
}
