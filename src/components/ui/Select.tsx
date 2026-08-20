import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  id?: string
  disabled?: boolean
}

export function Select({ options, value, onChange, label, placeholder, error, id: propId, disabled }: SelectProps) {
  const autoId = useId()
  const id = propId ?? autoId
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; width: number; flip: boolean }>({ top: 0, left: 0, width: 0, flip: false })

  const selected = options.find((o) => o.value === value)

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const panelHeight = panelRef.current?.offsetHeight ?? 200
    const gap = 4
    const spaceBelow = window.innerHeight - rect.bottom
    const flip = spaceBelow < panelHeight + gap

    setPos({
      top: flip ? rect.top - panelHeight - gap : rect.bottom + gap,
      left: rect.left,
      width: rect.width,
      flip,
    })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()

    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const items = panelRef.current?.querySelectorAll<HTMLElement>('[role="option"]')
        if (!items?.length) return
        const current = document.activeElement as HTMLElement
        const idx = Array.from(items).indexOf(current)
        const next = e.key === 'ArrowDown'
          ? idx < items.length - 1 ? idx + 1 : 0
          : idx > 0 ? idx - 1 : items.length - 1
        items[next].focus()
      }
    }
    const handleScroll = () => setOpen(false)

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open, updatePosition])

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
  }

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-surface-600 dark:text-surface-400">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-xl text-sm text-left transition-all duration-200 dark:bg-surface-800 dark:text-white ${
          error ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-surface-300 dark:border-surface-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-surface-400 dark:hover:border-surface-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent'}`}
      >
        <span className={selected ? 'text-surface-900 dark:text-white' : 'text-surface-400 dark:text-surface-500'}>
          {selected?.label ?? placeholder ?? 'Select...'}
        </span>
        <svg className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      {open && createPortal(
        <div
          ref={panelRef}
          role="listbox"
          className="fixed z-[9999] rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-lg py-1 animate-fade-in max-h-60 overflow-y-auto"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full flex items-center px-4 py-2 text-sm text-left transition-colors cursor-pointer ${
                opt.value === value
                  ? 'bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400'
                  : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}
