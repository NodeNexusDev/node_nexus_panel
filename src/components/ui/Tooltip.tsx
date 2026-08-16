import type { ReactNode } from 'react'

interface TooltipProps {
  children: ReactNode
  content: string
  position?: 'top' | 'bottom'
}

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  return (
    <div className="tooltip-container inline-flex">
      {children}
      <div className={`tooltip ${position === 'top' ? 'tooltip-top' : 'tooltip-bottom'}`}>
        {content}
      </div>
    </div>
  )
}
