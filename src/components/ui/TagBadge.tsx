import { Badge } from './Badge'

interface TagBadgeProps {
  tag: string
  onClick: () => void
}

export function TagBadge({ tag, onClick }: TagBadgeProps) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick() }}
      title={tag}
      className="cursor-pointer transition-opacity hover:opacity-75"
    >
      <Badge variant="default">{tag}</Badge>
    </button>
  )
}
