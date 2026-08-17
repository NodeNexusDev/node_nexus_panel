interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, description, disabled = false }: ToggleProps) {
  return (
    <label className={`flex items-center justify-between p-3 bg-surface-50 rounded-lg dark:bg-surface-800/50 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-surface-900 dark:text-white">{label}</p>}
          {description && <p className="text-xs text-surface-500 dark:text-surface-500">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          checked ? 'bg-indigo-600' : 'bg-surface-300 dark:bg-surface-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  )
}
