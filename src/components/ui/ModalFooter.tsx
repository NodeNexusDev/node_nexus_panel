import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

interface ModalFooterProps {
  onCancel: () => void
  children: ReactNode
}

export function ModalFooter({ onCancel, children }: ModalFooterProps) {
  const { t } = useTranslation()

  return (
    <div className="flex justify-end gap-3 pt-2">
      <Button variant="ghost" onClick={onCancel}>{t('common.cancel')}</Button>
      {children}
    </div>
  )
}
