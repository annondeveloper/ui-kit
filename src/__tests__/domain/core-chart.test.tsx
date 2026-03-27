import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { CoreChart } from '../../domain/core-chart'

expect.extend(toHaveNoViolations)

const makeCores = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: i, usage: (i * 12) % 100 }))

describe('CoreChart', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
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

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<CoreChart cores={makeCores(8)} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "CoreChart"', () => {
      expect(CoreChart.displayName).toBe('CoreChart')
    })
  })
})
