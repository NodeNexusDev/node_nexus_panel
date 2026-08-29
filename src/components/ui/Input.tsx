import { forwardRef, useId, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id: propId, ...props }, ref) => {
    const autoId = useId()
    const id = propId ?? autoId
    const errorId = `${id}-error`

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-surface-600 dark:text-surface-400">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`w-full px-4 py-2.5 bg-white border rounded-[var(--radius-md)] text-surface-900 text-sm placeholder-surface-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:border-transparent hover:border-surface-400 dark:hover:border-surface-600 transition-all duration-200 dark:bg-surface-800 dark:border-surface-700 dark:text-white dark:placeholder-surface-500 ${
            error ? 'border-red-500 focus-visible:ring-red-500' : 'border-surface-300 dark:border-surface-700'
          } ${className}`}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
