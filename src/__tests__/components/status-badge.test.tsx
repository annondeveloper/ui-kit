import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { StatusBadge } from '../../components/status-badge'

expect.extend(toHaveNoViolations)

describe('StatusBadge', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <span> element', () => {
      render(<StatusBadge status="ok" label="Healthy" />)
      const el = screen.getByText('Healthy')
      expect(el.closest('.ui-status-badge')).toBeInTheDocument()
    })

    it('applies ui-status-badge class', () => {
      const { container } = render(<StatusBadge status="ok" />)
      const el = container.querySelector('.ui-status-badge')
      expect(el).toBeInTheDocument()
    })

    it('renders with status="ok"', () => {
      const { container } = render(<StatusBadge status="ok" />)
      const el = container.querySelector('.ui-status-badge')
      expect(el).toHaveAttribute('data-status', 'ok')
    })

    it('renders with status="warning"', () => {
      const { container } = render(<StatusBadge status="warning" />)
      const el = container.querySelector('.ui-status-badge')
      expect(el).toHaveAttribute('data-status', 'warning')
    })

    it('renders with status="critical"', () => {
      const { container } = render(<StatusBadge status="critical" />)
      const el = container.querySelector('.ui-status-badge')
      expect(el).toHaveAttribute('data-status', 'critical')
    })

    it('renders with status="info"', () => {
      const { container } = render(<StatusBadge status="info" />)
      const el = container.querySelector('.ui-status-badge')
      expect(el).toHaveAttribute('data-status', 'info')
    })

    it('renders with status="unknown"', () => {
      const { container } = render(<StatusBadge status="unknown" />)
      const el = container.querySelector('.ui-status-badge')
      expect(el).toHaveAttribute('data-status', 'unknown')
    })

    it('renders with status="maintenance"', () => {
      const { container } = render(<StatusBadge status="maintenance" />)
      const el = container.querySelector('.ui-status-badge')
      expect(el).toHaveAttribute('data-status', 'maintenance')
    })

    it('renders label text', () => {
      render(<StatusBadge status="ok" label="Healthy" />)
      expect(screen.getByText('Healthy')).toBeInTheDocument()
    })

    it('renders status dot', () => {
      const { container } = render(<StatusBadge status="ok" />)
      const dot = container.querySelector('.ui-status-badge__dot')
      expect(dot).toBeInTheDocument()
    })

    it('renders icon when provided', () => {
      const icon = <svg data-testid="status-icon" />
      render(<StatusBadge status="ok" icon={icon} label="Healthy" />)
      expect(screen.getByTestId('status-icon')).toBeInTheDocument()
    })

    it('renders icon in icon wrapper', () => {
      const icon = <svg data-testid="status-icon" />
      const { container } = render(<StatusBadge status="ok" icon={icon} />)
      const wrapper = container.querySelector('.ui-status-badge__icon')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper?.querySelector('[data-testid="status-icon"]')).toBeInTheDocument()
    })

    it('renders pulse data attribute when pulse is true', () => {
      const { container } = render(<StatusBadge status="ok" pulse />)
      const dot = container.querySelector('.ui-status-badge__dot')
      expect(dot).toHaveAttribute('data-pulse', 'true')
    })

    it('does not render pulse when pulse is false', () => {
      const { container } = render(<StatusBadge status="ok" />)
      const dot = container.querySelector('.ui-status-badge__dot')
      expect(dot).not.toHaveAttribute('data-pulse', 'true')
    })

    it('renders with size="sm" by default', () => {
      const { container } = render(<StatusBadge status="ok" />)
      const el = container.querySelector('.ui-status-badge')
      expect(el).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="md"', () => {
      const { container } = render(<StatusBadge status="ok" size="md" />)
      const el = container.querySelector('.ui-status-badge')
      expect(el).toHaveAttribute('data-size', 'md')
    })

    it('forwards ref to span element', () => {
      const ref = createRef<HTMLSpanElement>()
      render(<StatusBadge ref={ref} status="ok" />)
      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })

    it('forwards className', () => {
      const { container } = render(<StatusBadge status="ok" className="custom" />)
      const el = container.querySelector('.ui-status-badge')
      expect(el?.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      const { container } = render(<StatusBadge status="ok" data-testid="my-badge" id="sb-1" />)
      const el = screen.getByTestId('my-badge')
      expect(el).toHaveAttribute('id', 'sb-1')
    })

    it('sets motion data attribute', () => {
      const { container } = render(<StatusBadge status="ok" motion={0} />)
      const el = container.querySelector('.ui-status-badge')
      expect(el).toHaveAttribute('data-motion', '0')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations with label', async () => {
      const { container } = render(<StatusBadge status="ok" label="Healthy" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations without label', async () => {
      const { container } = render(<StatusBadge status="ok" aria-label="Status: OK" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with icon', async () => {
      const icon = <svg aria-hidden="true" />
      const { container } = render(<StatusBadge status="critical" icon={icon} label="Down" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<StatusBadge status="ok" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @layer components', () => {
      render(<StatusBadge status="ok" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-status-badge)', () => {
      render(<StatusBadge status="ok" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-status-badge)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "StatusBadge"', () => {
      expect(StatusBadge.displayName).toBe('StatusBadge')
    })
  })
})
