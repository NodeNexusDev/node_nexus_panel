import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './Button'
import { IconWarning } from './Icons'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <IconWarning className="w-10 h-10 text-surface-400 dark:text-surface-500 mb-4" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-white">Something went wrong</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 max-w-sm">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
