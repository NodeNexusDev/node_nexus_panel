interface NodeSelectProps {
  nodes: { id: string; name: string }[]
  value: string
  onChange: (value: string) => void
  label?: string
  id?: string
  placeholder?: string
}

export function NodeSelect({ nodes, value, onChange, label, id, placeholder }: NodeSelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-surface-600 dark:text-surface-400">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {nodes.map((n) => (
          <option key={n.id} value={n.id}>{n.name}</option>
        ))}
      </select>
    </div>
  )
}
