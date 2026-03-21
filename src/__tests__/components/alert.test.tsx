import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Alert } from '../../components/alert'

expect.extend(toHaveNoViolations)

describe('Alert', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a div element with alert content', () => {
      render(<Alert variant="info">Hello world</Alert>)
      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })

    it('applies ui-alert class', () => {
      const { container } = render(<Alert variant="info">Content</Alert>)
      const alert = container.querySelector('.ui-alert')
      expect(alert).toBeInTheDocument()
    })

    it('renders with variant="info"', () => {
      const { container } = render(<Alert variant="info">Info</Alert>)
      expect(container.querySelector('.ui-alert')).toHaveAttribute('data-variant', 'info')
    })

    it('renders with variant="success"', () => {
      const { container } = render(<Alert variant="success">Success</Alert>)
      expect(container.querySelector('.ui-alert')).toHaveAttribute('data-variant', 'success')
    })

    it('renders with variant="warning"', () => {
      const { container } = render(<Alert variant="warning">Warning</Alert>)
      expect(container.querySelector('.ui-alert')).toHaveAttribute('data-variant', 'warning')
    })

    it('renders with variant="error"', () => {
      const { container } = render(<Alert variant="error">Error</Alert>)
      expect(container.querySelector('.ui-alert')).toHaveAttribute('data-variant', 'error')
    })

    it('renders title when provided', () => {
      render(<Alert variant="info" title="Alert Title">Body</Alert>)
      expect(screen.getByText('Alert Title')).toBeInTheDocument()
      expect(screen.getByText('Alert Title').className).toContain('ui-alert__title')
    })

    it('does not render title element when title not provided', () => {
      const { container } = render(<Alert variant="info">Body</Alert>)
      expect(container.querySelector('.ui-alert__title')).not.toBeInTheDocument()
    })

    it('renders body content in a body element', () => {
      const { container } = render(<Alert variant="info">Body text</Alert>)
      expect(container.querySelector('.ui-alert__body')).toBeInTheDocument()
      expect(screen.getByText('Body text')).toBeInTheDocument()
    })

    it('renders auto icon based on variant', () => {
      const { container } = render(<Alert variant="error">Error</Alert>)
      const icon = container.querySelector('.ui-alert__icon')
      expect(icon).toBeInTheDocument()
      expect(icon!.querySelector('svg')).toBeInTheDocument()
    })

    it('renders custom icon when provided', () => {
      const customIcon = <svg data-testid="custom-icon" />
      render(<Alert variant="info" icon={customIcon}>Content</Alert>)
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })

    it('renders auto icons for all variants', () => {
      const variants = ['info', 'success', 'warning', 'error'] as const
      variants.forEach((variant) => {
        const { container, unmount } = render(<Alert variant={variant}>Content</Alert>)
        const icon = container.querySelector('.ui-alert__icon svg')
        expect(icon).toBeInTheDocument()
        unmount()
      })
    })
  })

  // ─── Dismiss tests ────────────────────────────────────────────────

  describe('dismissible', () => {
    it('renders dismiss button when dismissible is true', () => {
      render(<Alert variant="info" dismissible>Content</Alert>)
      const dismissBtn = screen.getByRole('button', { name: /dismiss/i })
      expect(dismissBtn).toBeInTheDocument()
    })

    it('does not render dismiss button when dismissible is false', () => {
      render(<Alert variant="info">Content</Alert>)
      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument()
    })

    it('calls onDismiss when dismiss button is clicked', () => {
      const onDismiss = vi.fn()
      render(<Alert variant="info" dismissible onDismiss={onDismiss}>Content</Alert>)
      fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Action button tests ──────────────────────────────────────────

  describe('action button', () => {
    it('renders action button when action prop is provided', () => {
      const action = { label: 'Retry', onClick: vi.fn() }
      render(<Alert variant="error" action={action}>Error</Alert>)
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    })

    it('does not render action button when action is not provided', () => {
      render(<Alert variant="info">Info</Alert>)
      const buttons = screen.queryAllByRole('button')
      expect(buttons).toHaveLength(0)
    })

    it('calls action onClick when action button is clicked', () => {
      const onClick = vi.fn()
      const action = { label: 'Undo', onClick }
      render(<Alert variant="success" action={action}>Success</Alert>)
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('renders action button in footer area', () => {
      const action = { label: 'Fix', onClick: vi.fn() }
      const { container } = render(<Alert variant="error" action={action}>Error</Alert>)
      const footer = container.querySelector('.ui-alert__actions')
      expect(footer).toBeInTheDocument()
      expect(footer!.querySelector('button')).toBeInTheDocument()
    })
  })

  // ─── ARIA roles tests ─────────────────────────────────────────────

  describe('ARIA roles', () => {
    it('uses role="alert" for error variant', () => {
      const { container } = render(<Alert variant="error">Error</Alert>)
      expect(container.querySelector('.ui-alert')).toHaveAttribute('role', 'alert')
    })

    it('uses role="alert" for warning variant', () => {
      const { container } = render(<Alert variant="warning">Warning</Alert>)
      expect(container.querySelector('.ui-alert')).toHaveAttribute('role', 'alert')
    })

    it('uses role="status" for info variant', () => {
      const { container } = render(<Alert variant="info">Info</Alert>)
      expect(container.querySelector('.ui-alert')).toHaveAttribute('role', 'status')
    })

    it('uses role="status" for success variant', () => {
      const { container } = render(<Alert variant="success">Success</Alert>)
      expect(container.querySelector('.ui-alert')).toHaveAttribute('role', 'status')
    })
  })

  // ─── Ref and props forwarding ─────────────────────────────────────

  describe('ref and props forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Alert ref={ref} variant="info">Content</Alert>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards className', () => {
      const { container } = render(<Alert variant="info" className="custom">Content</Alert>)
      expect(container.querySelector('.ui-alert')!.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      const { container } = render(
        <Alert variant="info" data-testid="my-alert" id="alert-1">Content</Alert>
      )
      expect(screen.getByTestId('my-alert')).toHaveAttribute('id', 'alert-1')
    })

    it('sets data-motion attribute', () => {
      const { container } = render(<Alert variant="info" motion={2}>Content</Alert>)
      expect(container.querySelector('.ui-alert')).toHaveAttribute('data-motion', '2')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (info)', async () => {
      const { container } = render(<Alert variant="info">Info alert</Alert>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (error with dismiss and action)', async () => {
      const { container } = render(
        <Alert variant="error" dismissible action={{ label: 'Retry', onClick: vi.fn() }}>
          Error alert
        </Alert>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('dismiss button has accessible label', () => {
      render(<Alert variant="info" dismissible>Content</Alert>)
      const btn = screen.getByRole('button', { name: /dismiss/i })
      expect(btn).toBeInTheDocument()
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Alert variant="info">Styled</Alert>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @layer components', () => {
      render(<Alert variant="info">Layered</Alert>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-alert)', () => {
      render(<Alert variant="info">Scoped</Alert>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-alert)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Alert"', () => {
      expect(Alert.displayName).toBe('Alert')
    })
  })
})
