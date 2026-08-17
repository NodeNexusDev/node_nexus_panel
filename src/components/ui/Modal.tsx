import { useEffect, useRef, type ReactNode } from 'react'

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
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      {/* Backdrop with blur */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
      {/* Modal content with spring animation */}
      <div
        className={`relative w-full ${sizeClasses[size]} spring`}
      >
        <div className="bg-white border border-surface-200 dark:bg-surface-900 dark:border-surface-800 rounded-2xl shadow-2xl overflow-hidden">
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200/50 dark:border-surface-800/50">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-all duration-200"
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
