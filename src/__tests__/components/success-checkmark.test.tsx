import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { SuccessCheckmark } from '../../components/success-checkmark'

expect.extend(toHaveNoViolations)

describe('SuccessCheckmark', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <div> element', () => {
      const { container } = render(<SuccessCheckmark />)
      const el = container.querySelector('.ui-success-checkmark')
      expect(el).toBeInTheDocument()
      expect(el?.tagName).toBe('DIV')
    })

    it('applies ui-success-checkmark class', () => {
      const { container } = render(<SuccessCheckmark />)
      expect(container.querySelector('.ui-success-checkmark')).toBeInTheDocument()
    })

    it('renders an SVG element', () => {
      const { container } = render(<SuccessCheckmark />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders a circle element in SVG', () => {
      const { container } = render(<SuccessCheckmark />)
      const circle = container.querySelector('circle')
      expect(circle).toBeInTheDocument()
    })

    it('renders a polyline/path for the checkmark', () => {
      const { container } = render(<SuccessCheckmark />)
      const path = container.querySelector('.ui-success-checkmark__check')
      expect(path).toBeInTheDocument()
    })

    it('renders with size="md" by default', () => {
      const { container } = render(<SuccessCheckmark />)
      expect(container.querySelector('.ui-success-checkmark')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      const { container } = render(<SuccessCheckmark size="sm" />)
      expect(container.querySelector('.ui-success-checkmark')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      const { container } = render(<SuccessCheckmark size="lg" />)
      expect(container.querySelector('.ui-success-checkmark')).toHaveAttribute('data-size', 'lg')
    })

    it('renders animated by default', () => {
      const { container } = render(<SuccessCheckmark />)
      expect(container.querySelector('.ui-success-checkmark')).toHaveAttribute('data-animated', 'true')
    })

    it('renders non-animated when animated=false', () => {
      const { container } = render(<SuccessCheckmark animated={false} />)
      expect(container.querySelector('.ui-success-checkmark')).toHaveAttribute('data-animated', 'false')
    })

    it('sets motion data attribute', () => {
      const { container } = render(<SuccessCheckmark motion={0} />)
      expect(container.querySelector('.ui-success-checkmark')).toHaveAttribute('data-motion', '0')
    })

    it('sets motion level 3 for burst particles', () => {
      const { container } = render(<SuccessCheckmark motion={3} />)
      expect(container.querySelector('.ui-success-checkmark')).toHaveAttribute('data-motion', '3')
    })

    it('renders burst particles at motion level 3', () => {
      const { container } = render(<SuccessCheckmark motion={3} />)
      const particles = container.querySelectorAll('.ui-success-checkmark__particle')
      expect(particles.length).toBeGreaterThan(0)
    })

    it('default label is "Success"', () => {
      const { container } = render(<SuccessCheckmark />)
      expect(container.querySelector('.ui-success-checkmark')).toHaveAttribute('aria-label', 'Success')
    })

    it('renders custom label', () => {
      const { container } = render(<SuccessCheckmark label="Payment complete" />)
      expect(container.querySelector('.ui-success-checkmark')).toHaveAttribute('aria-label', 'Payment complete')
    })

    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>()
      render(<SuccessCheckmark ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards className', () => {
      const { container } = render(<SuccessCheckmark className="custom" />)
      expect(container.querySelector('.ui-success-checkmark')?.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<SuccessCheckmark data-testid="my-check" id="sc-1" />)
      const el = screen.getByTestId('my-check')
      expect(el).toHaveAttribute('id', 'sc-1')
    })

    it('SVG has correct viewBox', () => {
      const { container } = render(<SuccessCheckmark />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('viewBox', '0 0 52 52')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (default)', async () => {
      const { container } = render(<SuccessCheckmark />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (with custom label)', async () => {
      const { container } = render(<SuccessCheckmark label="Done" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (non-animated)', async () => {
      const { container } = render(<SuccessCheckmark animated={false} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('SVG is aria-hidden (label is on wrapper)', () => {
      const { container } = render(<SuccessCheckmark />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<SuccessCheckmark />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @layer components', () => {
      render(<SuccessCheckmark />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-success-checkmark)', () => {
      render(<SuccessCheckmark />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-success-checkmark)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "SuccessCheckmark"', () => {
      expect(SuccessCheckmark.displayName).toBe('SuccessCheckmark')
    })
  })
})
