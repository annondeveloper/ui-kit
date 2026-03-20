import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { UtilizationBar } from '../../domain/utilization-bar'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('UtilizationBar', () => {
  const segments = [
    { value: 30, color: 'oklch(65% 0.2 270)', label: 'Used' },
    { value: 20, color: 'oklch(72% 0.19 155)', label: 'Cached' },
  ]

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<UtilizationBar segments={segments} />)
      expect(container.querySelector('.ui-utilization-bar')).toBeInTheDocument()
    })

    it('renders segments', () => {
      const { container } = render(<UtilizationBar segments={segments} />)
      const segs = container.querySelectorAll('.ui-utilization-bar__segment')
      expect(segs.length).toBe(2)
    })

    it('renders single segment', () => {
      const { container } = render(
        <UtilizationBar segments={[{ value: 50 }]} />
      )
      const segs = container.querySelectorAll('.ui-utilization-bar__segment')
      expect(segs.length).toBe(1)
    })

    it('renders empty segments array', () => {
      const { container } = render(<UtilizationBar segments={[]} />)
      expect(container.querySelector('.ui-utilization-bar')).toBeInTheDocument()
    })

    it('renders track background', () => {
      const { container } = render(<UtilizationBar segments={segments} />)
      expect(container.querySelector('.ui-utilization-bar__track')).toBeInTheDocument()
    })
  })

  // ─── Segment widths ────────────────────────────────────────────────

  describe('segment widths', () => {
    it('sets width based on value and max', () => {
      const { container } = render(
        <UtilizationBar segments={[{ value: 50, label: 'A' }]} max={100} />
      )
      const seg = container.querySelector('.ui-utilization-bar__segment') as HTMLElement
      expect(seg.style.width).toBe('50%')
    })

    it('respects custom max', () => {
      const { container } = render(
        <UtilizationBar segments={[{ value: 50, label: 'A' }]} max={200} />
      )
      const seg = container.querySelector('.ui-utilization-bar__segment') as HTMLElement
      expect(seg.style.width).toBe('25%')
    })
  })

  // ─── Labels ─────────────────────────────────────────────────────────

  describe('labels', () => {
    it('shows labels when enabled', () => {
      render(<UtilizationBar segments={segments} showLabels />)
      expect(screen.getByText('Used')).toBeInTheDocument()
      expect(screen.getByText('Cached')).toBeInTheDocument()
    })

    it('hides labels by default', () => {
      const { container } = render(<UtilizationBar segments={segments} />)
      expect(container.querySelector('.ui-utilization-bar__labels')).not.toBeInTheDocument()
    })
  })

  // ─── Thresholds ─────────────────────────────────────────────────────

  describe('thresholds', () => {
    it('renders threshold markers', () => {
      const { container } = render(
        <UtilizationBar
          segments={[{ value: 70 }]}
          thresholds={{ warning: 60, critical: 85 }}
        />
      )
      const markers = container.querySelectorAll('.ui-utilization-bar__threshold')
      expect(markers.length).toBe(2)
    })

    it('positions threshold markers correctly', () => {
      const { container } = render(
        <UtilizationBar
          segments={[{ value: 70 }]}
          thresholds={{ warning: 60, critical: 85 }}
        />
      )
      const markers = container.querySelectorAll('.ui-utilization-bar__threshold') as NodeListOf<HTMLElement>
      expect(markers[0].style.insetInlineStart).toBe('60%')
      expect(markers[1].style.insetInlineStart).toBe('85%')
    })
  })

  // ─── Tooltip ────────────────────────────────────────────────────────

  describe('tooltip', () => {
    it('shows tooltip on segment hover', () => {
      const { container } = render(<UtilizationBar segments={segments} />)
      const seg = container.querySelector('.ui-utilization-bar__segment')!
      fireEvent.mouseEnter(seg)
      expect(container.querySelector('.ui-utilization-bar__tooltip')).toBeInTheDocument()
    })

    it('hides tooltip on mouse leave', () => {
      const { container } = render(<UtilizationBar segments={segments} />)
      const seg = container.querySelector('.ui-utilization-bar__segment')!
      fireEvent.mouseEnter(seg)
      fireEvent.mouseLeave(seg)
      expect(container.querySelector('.ui-utilization-bar__tooltip')).not.toBeInTheDocument()
    })
  })

  // ─── Sizes ──────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('renders sm size', () => {
      const { container } = render(<UtilizationBar segments={segments} size="sm" />)
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })

    it('renders md size', () => {
      const { container } = render(<UtilizationBar segments={segments} size="md" />)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })

    it('renders lg size', () => {
      const { container } = render(<UtilizationBar segments={segments} size="lg" />)
      expect(container.querySelector('[data-size="lg"]')).toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<UtilizationBar segments={segments} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ───────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<UtilizationBar segments={segments} className="custom" />)
      expect(container.querySelector('.ui-utilization-bar.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<UtilizationBar segments={segments} data-testid="util" />)
      expect(screen.getByTestId('util')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(UtilizationBar.displayName).toBe('UtilizationBar')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<UtilizationBar segments={segments} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no violations with thresholds and labels', async () => {
      const { container } = render(
        <UtilizationBar
          segments={segments}
          showLabels
          thresholds={{ warning: 60, critical: 85 }}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
