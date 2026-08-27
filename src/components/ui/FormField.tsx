import { useId, type ReactNode } from 'react'

interface FormFieldProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
  id?: string
}

export function FormField({ label, hint, error, required, children, id: propId }: FormFieldProps) {
  const autoId = useId()
  const id = propId ?? autoId
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-surface-600 dark:text-surface-400">
          {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        </label>
      )}
      <div aria-describedby={describedBy}>
        {/* Clone child with id/aria props if possible - consumer should pass id */}
        {children}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-surface-500 dark:text-surface-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
