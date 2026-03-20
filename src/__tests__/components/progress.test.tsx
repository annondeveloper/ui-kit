import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Progress } from '../../components/progress'

expect.extend(toHaveNoViolations)

describe('Progress', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a progressbar role element', () => {
      render(<Progress label="Loading" value={50} />)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('renders with default size="md"', () => {
      render(<Progress label="Loading" value={50} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      render(<Progress label="Loading" value={50} size="sm" />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      render(<Progress label="Loading" value={50} size="lg" />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('data-size', 'lg')
    })

    it('renders with default variant="default"', () => {
      render(<Progress label="Loading" value={50} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('data-variant', 'default')
    })

    it('renders with variant="success"', () => {
      render(<Progress label="Loading" value={50} variant="success" />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('data-variant', 'success')
    })

    it('renders with variant="warning"', () => {
      render(<Progress label="Loading" value={50} variant="warning" />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('data-variant', 'warning')
    })

    it('renders with variant="danger"', () => {
      render(<Progress label="Loading" value={50} variant="danger" />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('data-variant', 'danger')
    })

    it('forwards ref to root element', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Progress ref={ref} label="Loading" value={50} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards className', () => {
      render(<Progress label="Loading" value={50} className="custom" />)
      const el = screen.getByRole('progressbar')
      expect(el.className).toContain('ui-progress')
      expect(el.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<Progress label="Loading" value={50} data-testid="prog" id="p1" />)
      expect(screen.getByTestId('prog')).toHaveAttribute('id', 'p1')
    })
  })

  // ─── Determinate tests ─────────────────────────────────────────────

  describe('determinate', () => {
    it('sets aria-valuenow to the value', () => {
      render(<Progress label="Loading" value={75} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75')
    })

    it('sets aria-valuemin to 0', () => {
      render(<Progress label="Loading" value={50} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemin', '0')
    })

    it('sets aria-valuemax to 100 by default', () => {
      render(<Progress label="Loading" value={50} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100')
    })

    it('sets aria-valuemax to custom max', () => {
      render(<Progress label="Loading" value={50} max={200} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '200')
    })

    it('clamps value to 0 minimum', () => {
      render(<Progress label="Loading" value={-10} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    })

    it('clamps value to max', () => {
      render(<Progress label="Loading" value={150} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    })

    it('renders fill bar with correct width percentage', () => {
      const { container } = render(<Progress label="Loading" value={75} />)
      const fill = container.querySelector('.ui-progress__fill') as HTMLElement
      expect(fill.style.inlineSize).toBe('75%')
    })

    it('shows percentage text when showValue is true', () => {
      render(<Progress label="Loading" value={75} showValue />)
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('does not show percentage text by default', () => {
      const { container } = render(<Progress label="Loading" value={75} />)
      expect(container.querySelector('.ui-progress__value')).toBeNull()
    })
  })

  // ─── Indeterminate tests ───────────────────────────────────────────

  describe('indeterminate', () => {
    it('is indeterminate when value is undefined', () => {
      render(<Progress label="Loading" />)
      const el = screen.getByRole('progressbar')
      expect(el).not.toHaveAttribute('aria-valuenow')
      expect(el).toHaveAttribute('data-indeterminate', '')
    })

    it('does not show value text when indeterminate even if showValue', () => {
      const { container } = render(<Progress label="Loading" showValue />)
      expect(container.querySelector('.ui-progress__value')).toBeNull()
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('sets aria-label from label prop', () => {
      render(<Progress label="Upload progress" value={50} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Upload progress')
    })

    it('has no axe violations (determinate)', async () => {
      const { container } = render(<Progress label="Loading" value={50} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (indeterminate)', async () => {
      const { container } = render(<Progress label="Loading" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (with showValue)', async () => {
      const { container } = render(<Progress label="Loading" value={75} showValue />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Motion tests ─────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      render(<Progress label="Loading" value={50} motion={2} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('data-motion', '2')
    })

    it('defaults to motion level 3', () => {
      render(<Progress label="Loading" value={50} />)
      expect(screen.getByRole('progressbar')).toHaveAttribute('data-motion', '3')
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Progress label="Loading" value={50} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-progress)', () => {
      render(<Progress label="Loading" value={50} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-progress)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Progress"', () => {
      expect(Progress.displayName).toBe('Progress')
    })
  })
})
