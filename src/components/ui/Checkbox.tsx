import { useCallback, type KeyboardEvent } from 'react'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  ariaLabel?: string
  disabled?: boolean
  variant?: 'default' | 'accent' | 'ghost'
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
}

const checkSizes = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
}

const uncheckedClasses = {
  default: 'border-surface-300 dark:border-surface-600 bg-transparent',
  accent: 'border-accent-300 dark:border-accent-700 bg-accent-50 dark:bg-accent-500/10',
  ghost: 'border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-800',
}

const checkedClasses = {
  default: 'border-accent-500 bg-accent-500',
  accent: 'border-accent-500 bg-accent-500',
  ghost: 'border-surface-700 dark:border-surface-300 bg-surface-700 dark:bg-surface-300',
}

export function Checkbox({ checked, onChange, label, ariaLabel, disabled, variant = 'default', size = 'sm', className = '' }: CheckboxProps) {
  const toggle = useCallback(() => {
    if (!disabled) onChange(!checked)
  }, [checked, disabled, onChange])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      toggle()
    }
  }, [toggle])

  const box = (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      onClick={(e) => { e.stopPropagation(); toggle() }}
      onKeyDown={handleKeyDown}
      className={`
        ${sizeClasses[size]} rounded-lg border-2 flex items-center justify-center
        transition-all duration-200 cursor-pointer select-none shrink-0 relative
        focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:ring-offset-0
        before:absolute before:inset-[-8px] before:content-['']
        ${checked ? checkedClasses[variant] : uncheckedClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className={`${checkSizes[size]} transition-colors duration-200 ${checked ? (variant === 'ghost' ? 'text-surface-900 dark:text-surface-900' : 'text-white') : 'text-transparent'}`}
      >
        <path
          d="M3 8.5l3.5 3.5 6.5-7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={checked ? 'checkmark-path' : ''}
        />
      </svg>
    </div>
  )

  if (label) {
    return (
      <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300 cursor-pointer select-none">
        {box}
        {label}
      </label>
    )
  }

  return box
}
