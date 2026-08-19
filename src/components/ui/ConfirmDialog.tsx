import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import { Button } from './Button'
import { Spinner } from './Spinner'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-surface-600 dark:text-surface-400 text-sm">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel ?? t('common.cancel')}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                {t('common.loading')}
              </span>
            ) : confirmLabel ?? t('common.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
