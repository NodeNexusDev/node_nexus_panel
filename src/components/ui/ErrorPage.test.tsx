import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorPage } from './ErrorPage'

describe('ErrorPage', () => {
  it('renders 404 page', () => {
    render(<ErrorPage statusCode={404} />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders 403 page', () => {
    render(<ErrorPage statusCode={403} />)
    expect(screen.getByText('403')).toBeInTheDocument()
  })

  it('renders custom title and message', () => {
    render(<ErrorPage title="Custom Error" message="Something broke" />)
    expect(screen.getByText('Custom Error')).toBeInTheDocument()
    expect(screen.getByText('Something broke')).toBeInTheDocument()
  })

  it('renders retry button when onRetry provided', () => {
    const onRetry = vi.fn()
    render(<ErrorPage onRetry={onRetry} />)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('does not render retry button when onRetry not provided', () => {
    render(<ErrorPage />)
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
  })

  it('renders back to home button', () => {
    render(<ErrorPage />)
    expect(screen.getByRole('button', { name: /notFound.backToHome/i })).toBeInTheDocument()
  })
})
