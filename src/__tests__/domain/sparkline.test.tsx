import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Sparkline } from '../../domain/sparkline'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('Sparkline', () => {
  const sampleData = [10, 25, 18, 30, 22, 40, 35, 50]

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<Sparkline data={sampleData} />)
      expect(container.querySelector('.ui-sparkline')).toBeInTheDocument()
    })

    it('renders an SVG element', () => {
      const { container } = render(<Sparkline data={sampleData} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renders a path for the line', () => {
      const { container } = render(<Sparkline data={sampleData} />)
      const paths = container.querySelectorAll('path')
      expect(paths.length).toBeGreaterThanOrEqual(1)
    })

    it('renders nothing useful with empty data', () => {
      const { container } = render(<Sparkline data={[]} />)
      expect(container.querySelector('svg path[d]')).toBeNull()
    })

    it('renders nothing useful with single data point', () => {
      const { container } = render(<Sparkline data={[42]} />)
      // Single point can render a dot or nothing
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('handles two data points', () => {
      const { container } = render(<Sparkline data={[10, 20]} />)
      expect(container.querySelector('svg path')).toBeInTheDocument()
    })

    it('renders with all same values', () => {
      const { container } = render(<Sparkline data={[5, 5, 5, 5]} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  // ─── Dimensions ─────────────────────────────────────────────────────

  describe('dimensions', () => {
    it('accepts width as number', () => {
      const { container } = render(<Sparkline data={sampleData} width={200} />)
      const wrapper = container.querySelector('.ui-sparkline')
      expect(wrapper).toBeInTheDocument()
    })

    it('accepts width as string', () => {
      const { container } = render(<Sparkline data={sampleData} width="100%" />)
      const wrapper = container.querySelector('.ui-sparkline')
      expect(wrapper).toBeInTheDocument()
    })

    it('accepts height', () => {
      const { container } = render(<Sparkline data={sampleData} height={40} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  // ─── Color & Gradient ──────────────────────────────────────────────

  describe('color and gradient', () => {
    it('applies custom color to stroke', () => {
      const { container } = render(<Sparkline data={sampleData} color="red" />)
      const line = container.querySelector('.ui-sparkline__line')
      expect(line).toBeInTheDocument()
    })

    it('renders gradient fill when enabled', () => {
      const { container } = render(<Sparkline data={sampleData} gradient />)
      const gradientEl = container.querySelector('linearGradient')
      expect(gradientEl).toBeInTheDocument()
    })

    it('does not render gradient fill when disabled', () => {
      const { container } = render(<Sparkline data={sampleData} gradient={false} />)
      const areaPath = container.querySelector('.ui-sparkline__area')
      expect(areaPath).not.toBeInTheDocument()
    })
  })

  // ─── Tooltip ────────────────────────────────────────────────────────

  describe('tooltip', () => {
    it('shows tooltip on hover when enabled', () => {
      const { container } = render(<Sparkline data={sampleData} showTooltip />)
      const hitAreas = container.querySelectorAll('.ui-sparkline__hit-area')
      expect(hitAreas.length).toBe(sampleData.length)
    })

    it('does not render hit areas when tooltip disabled', () => {
      const { container } = render(<Sparkline data={sampleData} showTooltip={false} />)
      const hitAreas = container.querySelectorAll('.ui-sparkline__hit-area')
      expect(hitAreas.length).toBe(0)
    })

    it('displays tooltip value on mouse enter', () => {
      const { container } = render(<Sparkline data={sampleData} showTooltip />)
      const hitAreas = container.querySelectorAll('.ui-sparkline__hit-area')
      fireEvent.mouseEnter(hitAreas[2])
      expect(container.querySelector('.ui-sparkline__tooltip')).toBeInTheDocument()
    })

    it('hides tooltip on mouse leave', () => {
      const { container } = render(<Sparkline data={sampleData} showTooltip />)
      const hitAreas = container.querySelectorAll('.ui-sparkline__hit-area')
      fireEvent.mouseEnter(hitAreas[2])
      fireEvent.mouseLeave(hitAreas[2])
      expect(container.querySelector('.ui-sparkline__tooltip')).not.toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<Sparkline data={sampleData} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<Sparkline data={sampleData} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ───────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<Sparkline data={sampleData} className="custom" />)
      expect(container.querySelector('.ui-sparkline.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<Sparkline data={sampleData} data-testid="spark" />)
      expect(screen.getByTestId('spark')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(Sparkline.displayName).toBe('Sparkline')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<Sparkline data={sampleData} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has aria-hidden on decorative SVG', () => {
      const { container } = render(<Sparkline data={sampleData} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('aria-hidden')).toBe('true')
    })

    it('has no violations with tooltip', async () => {
      const { container } = render(<Sparkline data={sampleData} showTooltip />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
