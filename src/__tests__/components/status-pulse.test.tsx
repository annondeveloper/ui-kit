import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { StatusPulse } from '../../components/status-pulse'

expect.extend(toHaveNoViolations)

describe('StatusPulse', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <span> element', () => {
      const { container } = render(<StatusPulse status="ok" label="OK" />)
      const el = container.querySelector('.ui-status-pulse')
      expect(el).toBeInTheDocument()
      expect(el?.tagName).toBe('SPAN')
    })

    it('applies ui-status-pulse class', () => {
      const { container } = render(<StatusPulse status="ok" label="OK" />)
      expect(container.querySelector('.ui-status-pulse')).toBeInTheDocument()
    })

    it('renders with status="ok"', () => {
      const { container } = render(<StatusPulse status="ok" label="OK" />)
      expect(container.querySelector('.ui-status-pulse')).toHaveAttribute('data-status', 'ok')
    })

    it('renders with status="warning"', () => {
      const { container } = render(<StatusPulse status="warning" label="Warning" />)
      expect(container.querySelector('.ui-status-pulse')).toHaveAttribute('data-status', 'warning')
    })

    it('renders with status="critical"', () => {
      const { container } = render(<StatusPulse status="critical" label="Critical" />)
      expect(container.querySelector('.ui-status-pulse')).toHaveAttribute('data-status', 'critical')
    })

    it('renders with status="info"', () => {
      const { container } = render(<StatusPulse status="info" label="Info" />)
      expect(container.querySelector('.ui-status-pulse')).toHaveAttribute('data-status', 'info')
    })

    it('renders the central dot', () => {
      const { container } = render(<StatusPulse status="ok" label="OK" />)
      expect(container.querySelector('.ui-status-pulse__dot')).toBeInTheDocument()
    })

    it('renders three ring elements for radiating animation', () => {
      const { container } = render(<StatusPulse status="ok" label="OK" />)
      const rings = container.querySelectorAll('.ui-status-pulse__ring')
      expect(rings.length).toBe(3)
    })

    it('renders with size="sm"', () => {
      const { container } = render(<StatusPulse status="ok" size="sm" label="OK" />)
      expect(container.querySelector('.ui-status-pulse')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="md" by default', () => {
      const { container } = render(<StatusPulse status="ok" label="OK" />)
      expect(container.querySelector('.ui-status-pulse')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="lg"', () => {
      const { container } = render(<StatusPulse status="ok" size="lg" label="OK" />)
      expect(container.querySelector('.ui-status-pulse')).toHaveAttribute('data-size', 'lg')
    })

    it('applies aria-label from label prop', () => {
      const { container } = render(<StatusPulse status="ok" label="System OK" />)
      expect(container.querySelector('.ui-status-pulse')).toHaveAttribute('aria-label', 'System OK')
    })

    it('sets motion data attribute', () => {
      const { container } = render(<StatusPulse status="ok" label="OK" motion={0} />)
      expect(container.querySelector('.ui-status-pulse')).toHaveAttribute('data-motion', '0')
    })

    it('sets motion level 1', () => {
      const { container } = render(<StatusPulse status="ok" label="OK" motion={1} />)
      expect(container.querySelector('.ui-status-pulse')).toHaveAttribute('data-motion', '1')
    })

    it('forwards ref to span element', () => {
      const ref = createRef<HTMLSpanElement>()
      render(<StatusPulse ref={ref} status="ok" label="OK" />)
      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })

    it('forwards className', () => {
      const { container } = render(<StatusPulse status="ok" label="OK" className="custom" />)
      expect(container.querySelector('.ui-status-pulse')?.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<StatusPulse status="ok" label="OK" data-testid="my-pulse" id="sp-1" />)
      const el = screen.getByTestId('my-pulse')
      expect(el).toHaveAttribute('id', 'sp-1')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<StatusPulse status="ok" label="System OK" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (critical status)', async () => {
      const { container } = render(<StatusPulse status="critical" label="System Down" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('rings are aria-hidden', () => {
      const { container } = render(<StatusPulse status="ok" label="OK" />)
      const rings = container.querySelectorAll('.ui-status-pulse__ring')
      rings.forEach(ring => {
        expect(ring).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<StatusPulse status="ok" label="OK" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @layer components', () => {
      render(<StatusPulse status="ok" label="OK" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-status-pulse)', () => {
      render(<StatusPulse status="ok" label="OK" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-status-pulse)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "StatusPulse"', () => {
      expect(StatusPulse.displayName).toBe('StatusPulse')
    })
  })
})
