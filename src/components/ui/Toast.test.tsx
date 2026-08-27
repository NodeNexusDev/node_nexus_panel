import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ToastProvider } from './Toast'
import { useToast } from './useToast'

function TestComponent() {
  const { toast } = useToast()
  return (
    <div>
      <button onClick={() => toast('success', 'It worked!')}>Success</button>
      <button onClick={() => toast('error', 'Failed!')}>Error</button>
    </div>
  )
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows toast when triggered', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    act(() => {
      screen.getByText('Success').click()
    })
    expect(screen.getByText('It worked!')).toBeInTheDocument()
  })

  it('shows different toast types', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    act(() => {
      screen.getByText('Error').click()
    })
    expect(screen.getByText('Failed!')).toBeInTheDocument()
  })

  it('auto-dismisses after timeout', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    act(() => {
      screen.getByText('Success').click()
    })
    expect(screen.getByText('It worked!')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(4000)
    })
    // Toast should have exiting class
    expect(screen.getByText('It worked!').closest('div')).toHaveClass('opacity-0')

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(screen.queryByText('It worked!')).not.toBeInTheDocument()
  })

  it('can be manually dismissed', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    act(() => {
      screen.getByText('Success').click()
    })
    act(() => {
      screen.getByLabelText(/close/i).click()
    })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(screen.queryByText('It worked!')).not.toBeInTheDocument()
  })

  it('limits toasts to max 5', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    act(() => {
      for (let i = 0; i < 7; i++) {
        screen.getByText('Success').click()
      }
    })
    const toasts = screen.getAllByText('It worked!')
    expect(toasts.length).toBe(5)
  })
})
