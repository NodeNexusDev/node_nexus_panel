import type { NodeStatus } from '../api/types'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default'

export function nodeStatusVariant(status: NodeStatus): BadgeVariant {
  switch (status) {
    case 'active': return 'success'
    case 'unreachable': return 'warning'
    case 'error': return 'danger'
    default: return 'default'
  }
}

export function activityVariant(action: string): BadgeVariant {
  if (action.includes('create') || action.includes('add') || action.includes('online')) return 'success'
  if (action.includes('delete') || action.includes('remove') || action.includes('offline')) return 'danger'
  if (action.includes('update') || action.includes('edit')) return 'warning'
  return 'default'
}
