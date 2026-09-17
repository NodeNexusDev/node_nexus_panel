import type { TFunction } from 'i18next'
import type { ToastContextValue, ToastType } from '../components/ui/useToast'

export interface BulkSummary {
  total: number
  succeeded: number
  failed: number
}

type Toast = ToastContextValue['toast']

/**
 * Unified toast for BulkResult (200 all-ok / 207 partial / 422 all-failed):
 * success when nothing failed, warning on partial, error on total failure.
 */
export function bulkToast(
  t: TFunction,
  toast: Toast,
  actionLabel: string,
  res: BulkSummary,
): void {
  let type: ToastType = 'success'
  let message = actionLabel
  if (res.failed > 0) {
    message = `${actionLabel}${t('common.failedSuffix', { count: res.failed })}`
    type = res.succeeded > 0 ? 'warning' : 'error'
  }
  toast(type, message)
}
