import { Component, type ReactNode, type ErrorInfo } from 'react'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode)
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: Error | null
  hasError: boolean
}

export class ComponentErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null, hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo)
    // Log to console for debugging (don't swallow errors)
    console.error('[UI Kit] Component error:', error, errorInfo)
  }

  retry = (): void => {
    this.setState({ error: null, hasError: false })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const { fallback } = this.props
      const { error } = this.state

      // Custom fallback (ReactNode or render function)
      if (typeof fallback === 'function') {
        return fallback(error!, this.retry)
      }
      if (fallback !== undefined) {
        return fallback
      }

      // Default fallback — Aurora Fluid styled error state
      return (
        <div
          role="alert"
          style={{
            padding: '1rem',
            borderRadius: '10px',
            border: '1px solid oklch(62% 0.22 25 / 0.2)',
            background: 'oklch(62% 0.22 25 / 0.05)',
            color: 'oklch(70% 0 0)',
            fontSize: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontWeight: 600, color: 'oklch(62% 0.22 25)' }}>
            Unable to display component
          </span>
          <span style={{ color: 'oklch(50% 0 0)', fontSize: '0.8125rem' }}>
            {error?.message || 'An unexpected error occurred'}
          </span>
          <button
            onClick={this.retry}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid oklch(100% 0 0 / 0.08)',
              background: 'oklch(100% 0 0 / 0.04)',
              color: 'oklch(70% 0 0)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
