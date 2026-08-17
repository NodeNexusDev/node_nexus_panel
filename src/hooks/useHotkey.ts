import { useEffect, useRef } from 'react'

interface UseHotkeyOptions {
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  preventDefault?: boolean
}

export function useHotkey(
  key: string,
  callback: () => void,
  { ctrl = false, shift = false, alt = false, preventDefault = true }: UseHotkeyOptions = {},
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (ctrl && !e.ctrlKey && !e.metaKey) return
      if (shift && !e.shiftKey) return
      if (alt && !e.altKey) return
      if (e.key.toLowerCase() !== key.toLowerCase()) return

      if (preventDefault) {
        e.preventDefault()
      }
      callbackRef.current()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, ctrl, shift, alt, preventDefault])
}
