import { useState, useEffect } from 'react'

interface TypewriterProps {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
}

export function Typewriter({ text, speed = 30, className = '', onComplete }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  /* oxlint-disable react/set-state-in-effect -- typewriter animation intentionally writes state from an interval effect */
  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)

    if (!text) return

    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
        setIsComplete(true)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, onComplete])
  /* oxlint-enable react/set-state-in-effect */

  return (
    <span className={`font-mono ${className}`}>
      {displayedText}
      {!isComplete && <span className="text-accent-500 animate-blink">|</span>}
    </span>
  )
}
