export type ConnectionType = 'ssh' | 'docker' | 'proxmox'

interface ConnectionTypeSelectProps {
  value: ConnectionType
  onChange: (value: ConnectionType) => void
  label?: string
  id?: string
}

export function ConnectionTypeSelect({ value, onChange, label, id }: ConnectionTypeSelectProps) {
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
        onChange={(e) => onChange(e.target.value as ConnectionType)}
        className="w-full px-4 py-2 bg-white border border-surface-300 rounded-lg text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white"
      >
        <option value="ssh">SSH</option>
        <option value="docker">Docker</option>
        <option value="proxmox">Proxmox</option>
      </select>
    </div>
  )
}
