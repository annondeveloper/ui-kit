import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { CoreChart } from '../../domain/core-chart'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const sampleCores = [
  { id: 0, usage: 15 },
  { id: 1, usage: 45 },
  { id: 2, usage: 80 },
  { id: 3, usage: 95 },
]

describe('CoreChart', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<CoreChart cores={sampleCores} />)
      expect(container.querySelector('.ui-core-chart')).toBeInTheDocument()
    })

    it('renders cells for each core', () => {
      const { container } = render(<CoreChart cores={sampleCores} />)
      const cells = container.querySelectorAll('.ui-core-chart__cell')
      expect(cells.length).toBe(4)
    })

    it('renders grid with computed columns', () => {
      const { container } = render(<CoreChart cores={sampleCores} />)
      const grid = container.querySelector('.ui-core-chart__grid')
      expect(grid).toBeInTheDocument()
    })

    it('renders with custom column count', () => {
      const { container } = render(<CoreChart cores={sampleCores} columns={4} />)
      const grid = container.querySelector('.ui-core-chart__grid') as HTMLElement
      expect(grid?.style.gridTemplateColumns).toContain('repeat(4')
    })

    it('renders labels when showLabels is true', () => {
      const { container } = render(<CoreChart cores={sampleCores} showLabels />)
      const labels = container.querySelectorAll('.ui-core-chart__cell-label')
      expect(labels.length).toBe(4)
    })

    it('does not render labels by default', () => {
      const { container } = render(<CoreChart cores={sampleCores} />)
      const labels = container.querySelectorAll('.ui-core-chart__cell-label')
      expect(labels.length).toBe(0)
    })
  })

  // ─── Size ─────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('renders sm size', () => {
      const { container } = render(<CoreChart cores={sampleCores} size="sm" />)
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })

    it('renders md size (default)', () => {
      const { container } = render(<CoreChart cores={sampleCores} />)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })

    it('renders lg size', () => {
      const { container } = render(<CoreChart cores={sampleCores} size="lg" />)
      expect(container.querySelector('[data-size="lg"]')).toBeInTheDocument()
    })
  })

  // ─── Tooltip ──────────────────────────────────────────────────────

  describe('tooltip', () => {
    it('shows tooltip on mouse enter', () => {
      const { container } = render(<CoreChart cores={sampleCores} />)
      const cells = container.querySelectorAll('.ui-core-chart__cell')
      fireEvent.mouseEnter(cells[1])
      expect(container.querySelector('.ui-core-chart__tooltip')).toBeInTheDocument()
    })

    it('hides tooltip on mouse leave', () => {
      const { container } = render(<CoreChart cores={sampleCores} />)
      const cells = container.querySelectorAll('.ui-core-chart__cell')
      fireEvent.mouseEnter(cells[1])
      fireEvent.mouseLeave(cells[1])
      expect(container.querySelector('.ui-core-chart__tooltip')).not.toBeInTheDocument()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<CoreChart cores={sampleCores} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<CoreChart cores={sampleCores} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ─────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<CoreChart cores={sampleCores} className="custom" />)
      expect(container.querySelector('.ui-core-chart.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<CoreChart cores={sampleCores} data-testid="core-chart" />)
      expect(screen.getByTestId('core-chart')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(CoreChart.displayName).toBe('CoreChart')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has img role', () => {
      const { container } = render(<CoreChart cores={sampleCores} />)
      expect(container.querySelector('[role="img"]')).toBeInTheDocument()
    })

    it('has aria-label describing cores', () => {
      const { container } = render(<CoreChart cores={sampleCores} />)
      const el = container.querySelector('[role="img"]')
      expect(el?.getAttribute('aria-label')).toContain('4 cores')
    })

    it('has no axe violations', async () => {
      const { container } = render(<CoreChart cores={sampleCores} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with labels', async () => {
      const { container } = render(<CoreChart cores={sampleCores} showLabels />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
