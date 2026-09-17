import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BulkResultPanel } from './BulkResultPanel'
import { bulkToast } from '../../lib/bulk-toast'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, fallback?: string) => fallback ?? key }),
}))

describe('BulkResultPanel', () => {
  it('renders totals and per-item rows', () => {
    render(
      <BulkResultPanel
        result={{
          total: 2,
          succeeded: 1,
          failed: 1,
          results: [
            { container_id: 'c1', status: 'success' },
            { container_id: 'c2', status: 'error', error: 'boom' },
          ],
        }}
      />,
    )
    expect(screen.getByText('c1')).toBeInTheDocument()
    expect(screen.getByText('c2')).toBeInTheDocument()
    expect(screen.getByText('boom')).toBeInTheDocument()
  })

  it('renders nothing without result and skeleton while loading', () => {
    const { container, rerender } = render(<BulkResultPanel result={null} />)
    expect(container.textContent).toBe('')
    rerender(<BulkResultPanel result={null} isLoading />)
    expect(container.firstChild).not.toBeNull()
  })

  it('supports custom view mapping', () => {
    render(
      <BulkResultPanel
        result={{ total: 1, succeeded: 1, failed: 0, results: [{ foo: 'bar' }] }}
        toView={(_r, idx) => ({ key: `k${idx}`, label: 'custom', status: 'success' })}
      />,
    )
    expect(screen.getByText('custom')).toBeInTheDocument()
  })
})

describe('bulkToast', () => {
  const t = ((key: string, opts?: { count?: number }) =>
    `${key}${opts?.count !== undefined ? `:${opts.count}` : ''}`) as never
  it('maps all-ok to success, partial to warning, total failure to error', () => {
    const calls: Array<[string, string]> = []
    const toast = ((type: string, message: string) => {
      calls.push([type, message])
    }) as never
    bulkToast(t, toast, 'Restart', { total: 2, succeeded: 2, failed: 0 })
    bulkToast(t, toast, 'Restart', { total: 2, succeeded: 1, failed: 1 })
    bulkToast(t, toast, 'Restart', { total: 2, succeeded: 0, failed: 2 })
    expect(calls).toEqual([
      ['success', 'Restart'],
      ['warning', 'Restartcommon.failedSuffix:1'],
      ['error', 'Restartcommon.failedSuffix:2'],
    ])
  })
})
