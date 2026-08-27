import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Badge } from './Badge'

interface TagFilterProps {
  available: string[]
  selected: string[]
  onChange: (tags: string[]) => void
}

export function TagFilter({ available, selected, onChange }: TagFilterProps) {
  const { t } = useTranslation()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [pos, setPos] = useState<{ top: number; left: number; width: number; flip: boolean }>({ top: 0, left: 0, width: 0, flip: false })

  const filtered = available.filter((tag) => tag.toLowerCase().includes(search.toLowerCase()))

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
      width: Math.max(rect.width, 200),
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
        setSearch('')
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setSearch('') }
    }
    const handleScroll = () => { setOpen(false); setSearch('') }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open, updatePosition])

  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  const remove = (tag: string) => {
    onChange(selected.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-1">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { setOpen((v) => !v); setSearch('') }}
        className={`flex items-center gap-2 px-4 py-2.5 bg-white border border-surface-300 rounded-xl text-sm transition-all duration-200 dark:bg-surface-800 dark:border-surface-700 dark:text-white cursor-pointer hover:border-surface-400 dark:hover:border-surface-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent ${selected.length > 0 ? 'border-accent-300 dark:border-accent-700' : ''}`}
      >
        <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span className={selected.length > 0 ? 'text-surface-900 dark:text-white' : 'text-surface-400 dark:text-surface-500'}>
          {t('common.tagsFilter', 'Tags')}
        </span>
        {selected.length > 0 && (
          <Badge variant="info">{selected.length}</Badge>
        )}
        <svg className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[9999] rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-lg animate-fade-in"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
        >
          <div className="p-2 border-b border-surface-200 dark:border-surface-700">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search', 'Search') + '...'}
              className="w-full px-3 py-1.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-sm dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-accent-500"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-2 text-sm text-surface-400 text-center">{t('common.noResults')}</p>
            ) : filtered.map((tag) => (
              <label
                key={tag}
                className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(tag)}
                  onChange={() => toggle(tag)}
                  className="w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-accent-500 focus:ring-accent-500"
                />
                <span className="text-surface-700 dark:text-surface-300">{tag}</span>
              </label>
            ))}
          </div>
          {selected.length > 0 && (
            <div className="px-2 py-1.5 border-t border-surface-200 dark:border-surface-700">
              <button
                type="button"
                onClick={() => { onChange([]); setSearch('') }}
                className="w-full px-3 py-1.5 text-xs text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 cursor-pointer rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                {t('common.clearAll', 'Clear all')}
              </button>
            </div>
          )}
        </div>,
        document.body,
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-50 text-accent-700 border border-accent-200 rounded-full text-xs font-medium dark:bg-accent-500/10 dark:text-accent-400 dark:border-accent-500/20"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="ml-0.5 hover:text-accent-900 dark:hover:text-accent-200 cursor-pointer"
                aria-label={t('common.remove')}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300 cursor-pointer px-1"
          >
            {t('common.clearAll', 'Clear all')}
          </button>
        </div>
      )}
    </div>
  )
}
