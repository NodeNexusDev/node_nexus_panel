import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  children: ReactNode
  content: string
  position?: 'top' | 'bottom'
}

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const tooltipId = useId()
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; flip: boolean }>({ top: 0, left: 0, flip: false })

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 28
    const gap = 8

    const spaceAbove = rect.top
    const flip = position === 'top' && spaceAbove < tooltipHeight + gap

    const top = flip
      ? rect.bottom + gap
      : position === 'top'
        ? rect.top - tooltipHeight - gap
        : rect.bottom + gap

    const left = rect.left + rect.width / 2

    setPos({ top, left, flip })
  }, [position])

  useEffect(() => {
    if (!hovered) return
    updatePosition()
  }, [hovered, updatePosition])

  useEffect(() => {
    if (!hovered) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setHovered(false) }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [hovered])

  return (
    <div
      ref={triggerRef}
      className="inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-describedby={tooltipId}
    >
      {children}
      {hovered && createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className="fixed z-[var(--z-tooltip)] px-3 py-2 text-xs font-medium text-white rounded-lg pointer-events-none animate-fade-in max-w-xs text-center shadow-lg"
          style={{
            top: pos.top,
            left: pos.left,
            transform: 'translateX(-50%)',
            background: 'var(--color-surface-900)',
          }}
        >
          {content}
        </div>,
        document.body,
      )}
    </div>
  )
}
