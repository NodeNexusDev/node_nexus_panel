import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-surface-600 dark:text-surface-400">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-4 py-2 bg-white border rounded-lg text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white ${
          error ? 'border-red-500' : 'border-surface-300 dark:border-surface-700'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}
