import type { CommandParameter } from '../../api/types'
import type { CommandParameterFormValues } from '../../lib/validators/command-schema'

export function getDefaultParams(parameters: CommandParameter[] | null | undefined): Record<string, unknown> {
  if (!parameters) return {}
  return parameters.reduce((acc, param) => {
    if (param.default !== undefined && param.default !== null) {
      acc[param.name] = param.default
    } else if (param.type === 'boolean') {
      acc[param.name] = false
    } else {
      acc[param.name] = ''
    }
    return acc
  }, {} as Record<string, unknown>)
}

export function normalizeParameters(params?: CommandParameterFormValues[]): CommandParameter[] | undefined {
  if (!params || params.length === 0) return undefined
  return params.map((p) => ({
    name: p.name,
    type: p.type ?? 'string',
    required: !!p.required,
    description: p.description || null,
    default: convertDefault(p.default, p.type ?? 'string'),
  }))
}

function convertDefault(value: unknown, type: 'string' | 'integer' | 'boolean'): unknown {
  if (value === '' || value === undefined || value === null) return undefined
  if (type === 'integer') {
    const num = Number(value)
    return Number.isNaN(num) ? undefined : num
  }
  if (type === 'boolean') return !!value
  return value
}
