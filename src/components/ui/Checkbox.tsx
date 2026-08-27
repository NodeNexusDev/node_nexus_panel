import { useId, type InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  ariaLabel?: string
}

export function Checkbox({ checked, onChange, label, ariaLabel, disabled, className = '', id: propId, ...props }: CheckboxProps) {
  const autoId = useId()
  const id = propId ?? autoId

  const input = (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-accent-500 focus:ring-accent-500 focus:ring-2 focus:ring-offset-0 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    />
  )

  if (label) {
    return (
      <label htmlFor={id} className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300 cursor-pointer">
        {input}
        {label}
      </label>
    )
  }

  return input
}
