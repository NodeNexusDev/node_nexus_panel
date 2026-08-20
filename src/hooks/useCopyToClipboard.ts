import { useCallback, useState } from 'react'

interface UseCopyToClipboardOptions {
  successDuration?: number
  onCopied?: () => void
}

export function useCopyToClipboard({ successDuration = 2000, onCopied }: UseCopyToClipboardOptions = {}) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      onCopied?.()
      setTimeout(() => setCopied(false), successDuration)
    } catch {
      setCopied(false)
    }
  }, [successDuration, onCopied])

  return { copy, copied }
}
