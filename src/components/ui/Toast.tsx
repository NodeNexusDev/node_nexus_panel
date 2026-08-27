import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ToastContext, type ToastType, type ToastAction } from './useToast'

export type { ToastType, ToastContextValue } from './useToast'

interface Toast {
  id: string
  type: ToastType
  message: string
  exiting: boolean
  action?: ToastAction
}

const MAX_TOASTS = 5
const DISMISS_DURATION = 4000
const EXIT_DURATION = 300

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach(clearTimeout)
      timers.clear()
    }
  }, [])

  const startTimer = useCallback((id: string) => {
    const timer = setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t))
      const exitTimer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
        timersRef.current.delete(id)
      }, EXIT_DURATION)
      timersRef.current.set(`${id}-exit`, exitTimer)
    }, DISMISS_DURATION)
    timersRef.current.set(id, timer)
  }, [])

  const toast = useCallback((type: ToastType, message: string, action?: ToastAction) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => {
      const next = [...prev, { id, type, message, exiting: false, action }]
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next
    })
    startTimer(id)
  }, [startTimer])

  const pauseToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const resumeToast = useCallback((id: string) => {
    startTimer(id)
  }, [startTimer])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, EXIT_DURATION)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 max-w-[calc(100vw-2rem)] left-4 sm:left-auto" role="status" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            toast={t}
            onRemove={() => removeToast(t.id)}
            onPause={() => pauseToast(t.id)}
            onResume={() => resumeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400',
  error: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
  info: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-400',
}

const typeProgressColors: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
}

const typeIcons: Record<ToastType, ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
}

function ToastItem({ toast, onRemove, onPause, onResume }: { toast: Toast; onRemove: () => void; onPause: () => void; onResume: () => void }) {
  const { t } = useTranslation()
  const isError = toast.type === 'error' || toast.type === 'warning'
  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
      tabIndex={0}
      onFocus={onPause}
      onBlur={onResume}
      onKeyDown={(e) => { if (e.key === 'Escape') onRemove() }}
      className={`relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-current ${
        toast.exiting ? 'opacity-0 translate-x-4 scale-95' : 'spring'
      } ${typeStyles[toast.type]}`}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
    >
      <span className="text-current shrink-0">{typeIcons[toast.type]}</span>
      <span className="text-sm flex-1 font-medium">{toast.message}</span>
      {toast.action && (
        <button
          onClick={() => { toast.action!.onClick(); onRemove() }}
          className="text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity shrink-0 cursor-pointer"
        >
          {toast.action.label}
        </button>
      )}
      <button onClick={onRemove} aria-label={t('common.close')} className="text-current opacity-60 hover:opacity-100 transition-opacity shrink-0 cursor-pointer">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {/* Progress bar */}
      <div className={`absolute bottom-0 left-0 h-1 ${typeProgressColors[toast.type]} progress-bar opacity-50`} />
    </div>
  )
}
