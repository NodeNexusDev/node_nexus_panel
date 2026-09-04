import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  footer?: ReactNode
}

const sizeClasses = {
  sm: 'max-w-sm w-[min(400px,85vw)]',
  md: 'max-w-md w-[min(560px,90vw)]',
  lg: 'max-w-3xl w-[min(740px,92vw)]',
}

let openDrawerCount = 0

export function Drawer({ isOpen, onClose, title, description, children, size = 'lg', footer }: DrawerProps) {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  const initialFocusRef = useRef(false)

  onCloseRef.current = onClose

  useEffect(() => {
    if (!isOpen) {
      initialFocusRef.current = false
      return
    }
    previousFocusRef.current = document.activeElement as HTMLElement | null
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null || el.getAttribute('aria-hidden') !== 'true')
        if (focusable.length === 0) {
          e.preventDefault()
          return
        }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement as HTMLElement | null
        const isInside = active ? panelRef.current.contains(active) : false
        if (!isInside) {
          e.preventDefault()
          ;(e.shiftKey ? last : first).focus()
          return
        }
        if (e.shiftKey) {
          if (active === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (active === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    if (openDrawerCount === 0) {
      document.body.style.overflow = 'hidden'
    }
    openDrawerCount++

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      openDrawerCount = Math.max(0, openDrawerCount - 1)
      if (openDrawerCount === 0) {
        document.body.style.overflow = ''
      }
      if (openDrawerCount === 0) {
        const prev = previousFocusRef.current
        if (prev && document.contains(prev)) prev.focus()
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || initialFocusRef.current) return
    initialFocusRef.current = true
    requestAnimationFrame(() => {
      const closeBtn = panelRef.current?.querySelector<HTMLElement>('[data-drawer-close]')
      if (closeBtn) {
        closeBtn.focus()
        return
      }
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      firstFocusable?.focus()
    })
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      aria-labelledby={title ? 'drawer-title' : undefined}
      aria-describedby={description ? 'drawer-desc' : undefined}
      className="fixed inset-0 z-[var(--z-modal)] flex justify-end"
    >
      <div
        role="presentation"
        aria-hidden="true"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        data-drawer-backdrop
        onClick={() => onCloseRef.current()}
      />
      <div
        ref={panelRef}
        className={`relative h-full ${sizeClasses[size]} bg-white dark:bg-surface-900 shadow-[var(--shadow-2xl)] border-l border-surface-200 dark:border-surface-800 flex flex-col animate-slide-in-right overflow-hidden`}
        style={{ animation: 'slide-in-right 0.28s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {title && (
          <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-surface-200/70 dark:border-surface-800/70 shrink-0">
            <div className="min-w-0">
              <h2 id="drawer-title" className="text-base font-semibold text-surface-900 dark:text-white truncate">{title}</h2>
              {description && <p id="drawer-desc" className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 truncate">{description}</p>}
            </div>
            <button
              onClick={() => onCloseRef.current()}
              aria-label={t('common.close')}
              data-drawer-close
              className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 overscroll-contain">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-surface-200/70 dark:border-surface-800/70 bg-surface-50/50 dark:bg-surface-800/20 shrink-0">
            {footer}
          </div>
        )}
      </div>
      <style>{`@keyframes slide-in-right { from { transform: translateX(100%); opacity: 0.98 } to { transform: translateX(0); opacity: 1 } }`}</style>
    </div>
  )
}
