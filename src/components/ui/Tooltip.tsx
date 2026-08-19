import { useId, type ReactNode } from 'react'

interface TooltipProps {
  children: ReactNode
  content: string
  position?: 'top' | 'bottom'
}

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const tooltipId = useId()

  return (
    <div className="tooltip-container inline-flex">
      <div aria-describedby={tooltipId}>{children}</div>
      <div
        id={tooltipId}
        role="tooltip"
        className={`tooltip ${position === 'top' ? 'tooltip-top' : 'tooltip-bottom'}`}
      >
        {content}
      </div>
    </div>
  )
}
