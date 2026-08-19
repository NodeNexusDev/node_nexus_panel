import { Badge } from '../ui/Badge'

export function ContainerStatusBadge({ state }: { state: string }) {
  const lower = state.toLowerCase()
  const variant = lower === 'running' ? 'success' : lower === 'paused' ? 'warning' : 'default'
  return <Badge variant={variant}>{state}</Badge>
}
