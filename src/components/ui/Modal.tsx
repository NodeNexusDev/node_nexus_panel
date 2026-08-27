import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const { t } = useTranslation()
  const contentRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  const initialFocusRef = useRef(false)

  onCloseRef.current = onClose

  useEffect(() => {
    if (!isOpen) {
      initialFocusRef.current = false
      return
    }

    previousFocusRef.current = document.activeElement as HTMLElement
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }

      if (e.key === 'Tab' && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || initialFocusRef.current) return
    initialFocusRef.current = true
    requestAnimationFrame(() => {
      const closeBtn = contentRef.current?.querySelector<HTMLElement>('[data-modal-close]')
      closeBtn?.focus()
    })
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        role="presentation"
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer"
        data-modal-backdrop
        onClick={() => onCloseRef.current()}
      />
      <div
        ref={contentRef}
        className={`relative w-full ${sizeClasses[size]} spring max-h-[calc(100vh-2rem)] overflow-y-auto`}
      >
        <div className="bg-white border border-surface-200 dark:bg-surface-900 dark:border-surface-800 rounded-2xl shadow-2xl overflow-hidden">
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200/50 dark:border-surface-800/50">
              <h2 id="modal-title" className="text-lg font-semibold text-surface-900 dark:text-white">{title}</h2>
              <button
                onClick={() => onCloseRef.current()}
                aria-label={t('common.close')}
                data-modal-close
                className="w-8 h-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-all duration-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
