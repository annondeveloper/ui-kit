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

const makeCores = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: i, usage: (i * 12) % 100 }))

describe('CoreChart', () => {
  // ─── Rendering (ours) ──────────────────────────────────────────────

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

  // ─── Accessibility (ours) ──────────────────────────────────────────

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

  // ─── Rendering (origin/main) ───────────────────────────────────────

  describe('rendering (origin/main)', () => {
    it('renders with role="img"', () => {
      render(<CoreChart cores={makeCores(8)} />)
      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('renders correct number of core cells', () => {
      const { container } = render(<CoreChart cores={makeCores(8)} />)
      const cells = container.querySelectorAll('.ui-core-chart__cell')
      expect(cells).toHaveLength(8)
    })

    it('renders 32 cores in a large grid', () => {
      const { container } = render(<CoreChart cores={makeCores(32)} columns={8} />)
      const cells = container.querySelectorAll('.ui-core-chart__cell')
      expect(cells).toHaveLength(32)
    })

    it('has aria-label with core count', () => {
      render(<CoreChart cores={makeCores(16)} />)
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'CPU core utilization: 16 cores')
    })

    it('renders with each color scale', () => {
      for (const scale of ['green-red', 'blue-red', 'brand'] as const) {
        const { container, unmount } = render(<CoreChart cores={makeCores(4)} colorScale={scale} />)
        const cells = container.querySelectorAll('.ui-core-chart__cell')
        expect(cells).toHaveLength(4)
        unmount()
      }
    })

    it('shows labels when showLabels is true', () => {
      const { container } = render(<CoreChart cores={makeCores(4)} showLabels />)
      const labels = container.querySelectorAll('.ui-core-chart__cell-label')
      expect(labels).toHaveLength(4)
    })

    it('does not show labels by default', () => {
      const { container } = render(<CoreChart cores={makeCores(4)} />)
      const labels = container.querySelectorAll('.ui-core-chart__cell-label')
      expect(labels).toHaveLength(0)
    })

    it('applies data-size attribute', () => {
      const { container } = render(<CoreChart cores={makeCores(4)} size="lg" />)
      expect(container.querySelector('.ui-core-chart')).toHaveAttribute('data-size', 'lg')
    })
  })

  // ─── Accessibility (origin/main) ───────────────────────────────────

  describe('accessibility (origin/main)', () => {
    it('has no axe violations', async () => {
      const { container } = render(<CoreChart cores={makeCores(8)} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name (origin/main) ────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "CoreChart"', () => {
      expect(CoreChart.displayName).toBe('CoreChart')
    })
  })
})
