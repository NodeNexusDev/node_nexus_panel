import type { CommandParameter } from '../../api/types'

interface CommandParamInputsProps {
  parameters: CommandParameter[]
  values: Record<string, unknown>
  onChange: (name: string, value: unknown) => void
  errors?: Record<string, string>
}

export function CommandParamInputs({ parameters, values, onChange, errors }: CommandParamInputsProps) {
  return (
    <div className="space-y-2">
      {parameters.map((param) => (
        <div key={param.name}>
          <div className="flex items-center gap-2">
            <label className="text-xs text-surface-500 dark:text-surface-400 min-w-[100px]">
              {param.name}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {param.type === 'boolean' ? (
              <input type="checkbox" checked={!!values[param.name]} onChange={(e) => onChange(param.name, e.target.checked)} className="rounded border-surface-300 dark:border-surface-600" />
            ) : (
              <input
                type={param.type === 'integer' ? 'number' : 'text'}
                placeholder={param.description || `${param.type}${param.required ? ' (required)' : ''}`}
                value={String(values[param.name] ?? param.default ?? '')}
                onChange={(e) => onChange(param.name, e.target.value)}
                className={`px-3 py-1 bg-white border rounded text-sm dark:bg-surface-800 dark:text-white ${
                  errors?.[param.name] ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-surface-300 dark:border-surface-700'
                }`}
              />
            )}
            {param.description && <span className="text-xs text-surface-400">{param.description}</span>}
          </div>
          {errors?.[param.name] && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 ml-[108px]">{errors[param.name]}</p>
          )}
        </div>
      ))}
    </div>
  )
}
