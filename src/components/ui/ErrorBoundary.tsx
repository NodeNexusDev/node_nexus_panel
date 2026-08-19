import { Component, type ErrorInfo, type ReactNode } from 'react'
import { withTranslation, type WithTranslation } from 'react-i18next'
import { Button } from './Button'
import { IconWarning } from './Icons'

interface Props extends WithTranslation {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryBase extends Component<Props, State> {
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

      const { t } = this.props

      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <IconWarning className="w-10 h-10 text-surface-400 dark:text-surface-300 mb-4" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-white">{t('errorBoundary.title')}</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 max-w-sm">
            {this.state.error?.message || t('errorBoundary.fallback')}
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            {t('errorBoundary.retry')}
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase)
