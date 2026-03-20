import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ConfidenceBar } from '../../domain/confidence-bar'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('ConfidenceBar', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<ConfidenceBar value={0.5} />)
      expect(container.querySelector('.ui-confidence-bar')).toBeInTheDocument()
    })

    it('renders fill bar', () => {
      const { container } = render(<ConfidenceBar value={0.7} />)
      expect(container.querySelector('.ui-confidence-bar__fill')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(ConfidenceBar.displayName).toBe('ConfidenceBar')
    })

    it('passes className', () => {
      const { container } = render(<ConfidenceBar value={0.5} className="custom" />)
      expect(container.querySelector('.ui-confidence-bar.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<ConfidenceBar value={0.5} data-testid="conf" />)
      expect(screen.getByTestId('conf')).toBeInTheDocument()
    })
  })

  // ─── Value display ──────────────────────────────────────────────────

  describe('value display', () => {
    it('shows percentage by default', () => {
      render(<ConfidenceBar value={0.75} />)
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('hides percentage when showValue=false', () => {
      const { container } = render(<ConfidenceBar value={0.75} showValue={false} />)
      expect(container.querySelector('.ui-confidence-bar__value')).not.toBeInTheDocument()
    })

    it('shows 0% for zero value', () => {
      render(<ConfidenceBar value={0} />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('shows 100% for value=1', () => {
      render(<ConfidenceBar value={1} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('rounds percentage display', () => {
      render(<ConfidenceBar value={0.333} />)
      expect(screen.getByText('33%')).toBeInTheDocument()
    })
  })

  // ─── Label ──────────────────────────────────────────────────────────

  describe('label', () => {
    it('renders label when provided', () => {
      render(<ConfidenceBar value={0.5} label="Confidence" />)
      expect(screen.getByText('Confidence')).toBeInTheDocument()
    })

    it('renders ReactNode label', () => {
      render(<ConfidenceBar value={0.5} label={<strong>Score</strong>} />)
      expect(screen.getByText('Score')).toBeInTheDocument()
    })

    it('does not render label container when not provided', () => {
      const { container } = render(<ConfidenceBar value={0.5} />)
      expect(container.querySelector('.ui-confidence-bar__label')).not.toBeInTheDocument()
    })
  })

  // ─── Thresholds & colors ────────────────────────────────────────────

  describe('thresholds', () => {
    it('applies critical level below low threshold', () => {
      const { container } = render(<ConfidenceBar value={0.2} />)
      expect(container.querySelector('[data-level="low"]')).toBeInTheDocument()
    })

    it('applies warning level between low and medium threshold', () => {
      const { container } = render(<ConfidenceBar value={0.5} />)
      expect(container.querySelector('[data-level="medium"]')).toBeInTheDocument()
    })

    it('applies ok level above medium threshold', () => {
      const { container } = render(<ConfidenceBar value={0.8} />)
      expect(container.querySelector('[data-level="high"]')).toBeInTheDocument()
    })

    it('supports custom thresholds', () => {
      const { container } = render(
        <ConfidenceBar value={0.5} thresholds={{ low: 0.6, medium: 0.9 }} />
      )
      expect(container.querySelector('[data-level="low"]')).toBeInTheDocument()
    })

    it('handles edge case at exact threshold boundary', () => {
      const { container } = render(<ConfidenceBar value={0.3} />)
      // 0.3 is at the boundary - should be medium (>= low)
      expect(container.querySelector('[data-level="medium"]')).toBeInTheDocument()
    })
  })

  // ─── Size ───────────────────────────────────────────────────────────

  describe('size', () => {
    it('defaults to md', () => {
      const { container } = render(<ConfidenceBar value={0.5} />)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })

    it('applies sm size', () => {
      const { container } = render(<ConfidenceBar value={0.5} size="sm" />)
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })

    it('applies lg size', () => {
      const { container } = render(<ConfidenceBar value={0.5} size="lg" />)
      expect(container.querySelector('[data-size="lg"]')).toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<ConfidenceBar value={0.5} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<ConfidenceBar value={0.5} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has role="meter"', () => {
      const { container } = render(<ConfidenceBar value={0.5} />)
      expect(container.querySelector('[role="meter"]')).toBeInTheDocument()
    })

    it('has aria-valuenow', () => {
      const { container } = render(<ConfidenceBar value={0.75} />)
      const meter = container.querySelector('[role="meter"]')
      expect(meter?.getAttribute('aria-valuenow')).toBe('0.75')
    })

    it('has aria-valuemin=0', () => {
      const { container } = render(<ConfidenceBar value={0.5} />)
      const meter = container.querySelector('[role="meter"]')
      expect(meter?.getAttribute('aria-valuemin')).toBe('0')
    })

    it('has aria-valuemax=1', () => {
      const { container } = render(<ConfidenceBar value={0.5} />)
      const meter = container.querySelector('[role="meter"]')
      expect(meter?.getAttribute('aria-valuemax')).toBe('1')
    })

    it('has no axe violations', async () => {
      const { container } = render(<ConfidenceBar value={0.5} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with label', async () => {
      const { container } = render(<ConfidenceBar value={0.8} label="Score" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
