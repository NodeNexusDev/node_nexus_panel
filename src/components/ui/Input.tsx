import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-surface-600 dark:text-surface-400">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-2 bg-white border rounded-lg text-surface-900 text-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white dark:placeholder-surface-500 ${
          error ? 'border-red-500' : 'border-surface-300 dark:border-surface-700'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}
