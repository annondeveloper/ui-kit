import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Badge } from '../../components/badge'

expect.extend(toHaveNoViolations)

describe('Badge', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <span> element with badge text', () => {
      render(<Badge>New</Badge>)
      const badge = screen.getByText('New')
      expect(badge).toBeInTheDocument()
      expect(badge.tagName).toBe('SPAN')
    })

    it('applies ui-badge class', () => {
      render(<Badge>Label</Badge>)
      const badge = screen.getByText('Label')
      expect(badge.className).toContain('ui-badge')
    })

    it('renders with variant="default" by default', () => {
      render(<Badge>Default</Badge>)
      expect(screen.getByText('Default')).toHaveAttribute('data-variant', 'default')
    })

    it('renders with variant="primary"', () => {
      render(<Badge variant="primary">Primary</Badge>)
      expect(screen.getByText('Primary')).toHaveAttribute('data-variant', 'primary')
    })

    it('renders with variant="success"', () => {
      render(<Badge variant="success">Success</Badge>)
      expect(screen.getByText('Success')).toHaveAttribute('data-variant', 'success')
    })

    it('renders with variant="warning"', () => {
      render(<Badge variant="warning">Warning</Badge>)
      expect(screen.getByText('Warning')).toHaveAttribute('data-variant', 'warning')
    })

    it('renders with variant="danger"', () => {
      render(<Badge variant="danger">Danger</Badge>)
      expect(screen.getByText('Danger')).toHaveAttribute('data-variant', 'danger')
    })

    it('renders with variant="info"', () => {
      render(<Badge variant="info">Info</Badge>)
      expect(screen.getByText('Info')).toHaveAttribute('data-variant', 'info')
    })

    it('renders with size="md" by default', () => {
      render(<Badge>Medium</Badge>)
      expect(screen.getByText('Medium')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      render(<Badge size="sm">Small</Badge>)
      expect(screen.getByText('Small')).toHaveAttribute('data-size', 'sm')
    })

    it('renders dot indicator when dot prop is true', () => {
      const { container } = render(<Badge dot>Status</Badge>)
      const dot = container.querySelector('.ui-badge__dot')
      expect(dot).toBeInTheDocument()
    })

    it('does not render dot when dot prop is false or absent', () => {
      const { container } = render(<Badge>No Dot</Badge>)
      const dot = container.querySelector('.ui-badge__dot')
      expect(dot).not.toBeInTheDocument()
    })

    it('renders pulse animation data attribute when pulse is true', () => {
      const { container } = render(<Badge dot pulse>Pulse</Badge>)
      const dot = container.querySelector('.ui-badge__dot')
      expect(dot).toHaveAttribute('data-pulse', 'true')
    })

    it('renders count value', () => {
      render(<Badge count={5} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('renders maxCount overflow as "99+" by default', () => {
      render(<Badge count={150} />)
      expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('renders custom maxCount overflow', () => {
      render(<Badge count={15} maxCount={10} />)
      expect(screen.getByText('10+')).toBeInTheDocument()
    })

    it('renders exact count when under maxCount', () => {
      render(<Badge count={50} maxCount={99} />)
      expect(screen.getByText('50')).toBeInTheDocument()
    })

    it('renders count=0 as "0"', () => {
      render(<Badge count={0} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('renders icon prop', () => {
      const icon = <svg data-testid="badge-icon" />
      render(<Badge icon={icon}>With Icon</Badge>)
      expect(screen.getByTestId('badge-icon')).toBeInTheDocument()
      const wrapper = screen.getByTestId('badge-icon').parentElement
      expect(wrapper).toHaveClass('ui-badge__icon')
    })

    it('forwards ref to span element', () => {
      const ref = createRef<HTMLSpanElement>()
      render(<Badge ref={ref}>Ref</Badge>)
      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })

    it('forwards className', () => {
      render(<Badge className="custom">Custom</Badge>)
      const badge = screen.getByText('Custom')
      expect(badge.className).toContain('ui-badge')
      expect(badge.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<Badge data-testid="my-badge" id="badge-1">Attrs</Badge>)
      const badge = screen.getByTestId('my-badge')
      expect(badge).toHaveAttribute('id', 'badge-1')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (default)', async () => {
      const { container } = render(<Badge>Accessible</Badge>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (with count)', async () => {
      const { container } = render(<Badge count={5} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (with dot)', async () => {
      const { container } = render(<Badge dot>Status</Badge>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Badge>Styled</Badge>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @layer components', () => {
      render(<Badge>Layered</Badge>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-badge)', () => {
      render(<Badge>Scoped</Badge>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-badge)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Badge"', () => {
      expect(Badge.displayName).toBe('Badge')
    })
  })
})
