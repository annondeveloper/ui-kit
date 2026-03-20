import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentErrorBoundary } from '../../../core/utils/error-boundary'

// Helper: component that throws
function ThrowOnRender({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('Test render error')
  return <div>Rendered successfully</div>
}

describe('ComponentErrorBoundary', () => {
  // Suppress console.error in tests
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('normal rendering', () => {
    it('renders children when no error', () => {
      render(
        <ComponentErrorBoundary>
          <div>Hello</div>
        </ComponentErrorBoundary>
      )
      expect(screen.getByText('Hello')).toBeDefined()
    })

    it('renders multiple children', () => {
      render(
        <ComponentErrorBoundary>
          <div>One</div>
          <div>Two</div>
        </ComponentErrorBoundary>
      )
      expect(screen.getByText('One')).toBeDefined()
      expect(screen.getByText('Two')).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('catches render errors and shows default fallback', () => {
      render(
        <ComponentErrorBoundary>
          <ThrowOnRender />
        </ComponentErrorBoundary>
      )
      expect(screen.getByText('Unable to display component')).toBeDefined()
      expect(screen.getByText('Test render error')).toBeDefined()
    })

    it('shows default fallback with role="alert"', () => {
      render(
        <ComponentErrorBoundary>
          <ThrowOnRender />
        </ComponentErrorBoundary>
      )
      expect(screen.getByRole('alert')).toBeDefined()
    })

    it('shows retry button in default fallback', () => {
      render(
        <ComponentErrorBoundary>
          <ThrowOnRender />
        </ComponentErrorBoundary>
      )
      expect(screen.getByText('Retry')).toBeDefined()
    })

    it('calls onError callback with error and errorInfo', () => {
      const onError = vi.fn()
      render(
        <ComponentErrorBoundary onError={onError}>
          <ThrowOnRender />
        </ComponentErrorBoundary>
      )
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      )
    })

    it('logs error to console', () => {
      render(
        <ComponentErrorBoundary>
          <ThrowOnRender />
        </ComponentErrorBoundary>
      )
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('custom fallback', () => {
    it('renders custom ReactNode fallback', () => {
      render(
        <ComponentErrorBoundary fallback={<div>Custom error</div>}>
          <ThrowOnRender />
        </ComponentErrorBoundary>
      )
      expect(screen.getByText('Custom error')).toBeDefined()
    })

    it('renders function fallback with error and retry', () => {
      render(
        <ComponentErrorBoundary
          fallback={(error, retry) => (
            <div>
              <span>Error: {error.message}</span>
              <button onClick={retry}>Try again</button>
            </div>
          )}
        >
          <ThrowOnRender />
        </ComponentErrorBoundary>
      )
      expect(screen.getByText('Error: Test render error')).toBeDefined()
      expect(screen.getByText('Try again')).toBeDefined()
    })
  })

  describe('retry', () => {
    it('retry button re-renders children', () => {
      let shouldThrow = true
      function MaybeThrow() {
        if (shouldThrow) throw new Error('Boom')
        return <div>Recovered!</div>
      }

      render(
        <ComponentErrorBoundary>
          <MaybeThrow />
        </ComponentErrorBoundary>
      )

      expect(screen.getByText('Unable to display component')).toBeDefined()

      // Fix the error condition
      shouldThrow = false

      // Click retry
      fireEvent.click(screen.getByText('Retry'))

      expect(screen.getByText('Recovered!')).toBeDefined()
    })

    it('shows error again if retry still throws', () => {
      render(
        <ComponentErrorBoundary>
          <ThrowOnRender shouldThrow={true} />
        </ComponentErrorBoundary>
      )

      fireEvent.click(screen.getByText('Retry'))

      // Still shows error since component always throws
      expect(screen.getByText('Unable to display component')).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('handles error with no message', () => {
      function ThrowNoMessage(): React.JSX.Element {
        throw new Error()
      }
      render(
        <ComponentErrorBoundary>
          <ThrowNoMessage />
        </ComponentErrorBoundary>
      )
      expect(screen.getByText('An unexpected error occurred')).toBeDefined()
    })
  })
})
