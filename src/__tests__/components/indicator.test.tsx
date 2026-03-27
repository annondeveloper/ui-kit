import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Indicator } from '../../components/indicator'

expect.extend(toHaveNoViolations)

describe('Indicator', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders children content', () => {
      render(<Indicator><span>Avatar</span></Indicator>)
      expect(screen.getByText('Avatar')).toBeInTheDocument()
    })

    it('renders a wrapper div with ui-indicator class', () => {
      const { container } = render(<Indicator><span>Child</span></Indicator>)
      const root = container.firstElementChild
      expect(root?.className).toContain('ui-indicator')
    })

    it('renders the indicator dot element', () => {
      const { container } = render(<Indicator><span>Child</span></Indicator>)
      const dot = container.querySelector('.ui-indicator__dot')
      expect(dot).toBeInTheDocument()
    })

    it('indicator dot is aria-hidden', () => {
      const { container } = render(<Indicator><span>Child</span></Indicator>)
      const dot = container.querySelector('.ui-indicator__dot')
      expect(dot).toHaveAttribute('aria-hidden', 'true')
    })

    it('applies default color="primary"', () => {
      const { container } = render(<Indicator><span>Child</span></Indicator>)
      expect(container.firstElementChild).toHaveAttribute('data-color', 'primary')
    })

    it('applies default position="top-end"', () => {
      const { container } = render(<Indicator><span>Child</span></Indicator>)
      expect(container.firstElementChild).toHaveAttribute('data-position', 'top-end')
    })
  })

  // ─── Colors ──────────────────────────────────────────────────────

  describe('colors', () => {
    it.each(['primary', 'success', 'warning', 'danger', 'info'] as const)(
      'renders with color="%s"',
      (color) => {
        const { container } = render(<Indicator color={color}><span>Child</span></Indicator>)
        expect(container.firstElementChild).toHaveAttribute('data-color', color)
      }
    )
  })

  // ─── Positions ─────────────────────────────────────────────────────

  describe('positions', () => {
    it.each(['top-start', 'top-end', 'bottom-start', 'bottom-end'] as const)(
      'renders with position="%s"',
      (position) => {
        const { container } = render(<Indicator position={position}><span>Child</span></Indicator>)
        expect(container.firstElementChild).toHaveAttribute('data-position', position)
      }
    )
  })

  // ─── Label ─────────────────────────────────────────────────────────

  describe('label', () => {
    it('renders label text inside indicator dot', () => {
      const { container } = render(<Indicator label="5"><span>Child</span></Indicator>)
      const dot = container.querySelector('.ui-indicator__dot')
      expect(dot?.textContent).toBe('5')
    })

    it('sets data-has-label when label is provided', () => {
      const { container } = render(<Indicator label="99+"><span>Child</span></Indicator>)
      const dot = container.querySelector('.ui-indicator__dot')
      expect(dot).toHaveAttribute('data-has-label', 'true')
    })

    it('does not set data-has-label when no label', () => {
      const { container } = render(<Indicator><span>Child</span></Indicator>)
      const dot = container.querySelector('.ui-indicator__dot')
      expect(dot).not.toHaveAttribute('data-has-label')
    })

    it('renders ReactNode labels', () => {
      render(<Indicator label={<strong data-testid="bold-label">3</strong>}><span>Child</span></Indicator>)
      expect(screen.getByTestId('bold-label')).toBeInTheDocument()
    })
  })

  // ─── Processing (pulse) ────────────────────────────────────────────

  describe('processing', () => {
    it('sets data-processing on dot when processing is true', () => {
      const { container } = render(<Indicator processing><span>Child</span></Indicator>)
      const dot = container.querySelector('.ui-indicator__dot')
      expect(dot).toHaveAttribute('data-processing', 'true')
    })

    it('does not set data-processing when processing is false', () => {
      const { container } = render(<Indicator><span>Child</span></Indicator>)
      const dot = container.querySelector('.ui-indicator__dot')
      expect(dot).not.toHaveAttribute('data-processing')
    })
  })

  // ─── Disabled ──────────────────────────────────────────────────────

  describe('disabled', () => {
    it('sets data-disabled when disabled is true', () => {
      const { container } = render(<Indicator disabled><span>Child</span></Indicator>)
      expect(container.firstElementChild).toHaveAttribute('data-disabled', 'true')
    })

    it('does not set data-disabled when disabled is false', () => {
      const { container } = render(<Indicator><span>Child</span></Indicator>)
      expect(container.firstElementChild).not.toHaveAttribute('data-disabled')
    })
  })

  // ─── Border ────────────────────────────────────────────────────────

  describe('withBorder', () => {
    it('sets data-bordered on dot when withBorder is true', () => {
      const { container } = render(<Indicator withBorder><span>Child</span></Indicator>)
      const dot = container.querySelector('.ui-indicator__dot')
      expect(dot).toHaveAttribute('data-bordered', 'true')
    })

    it('does not set data-bordered when withBorder is false', () => {
      const { container } = render(<Indicator><span>Child</span></Indicator>)
      const dot = container.querySelector('.ui-indicator__dot')
      expect(dot).not.toHaveAttribute('data-bordered')
    })
  })

  // ─── Inline ────────────────────────────────────────────────────────

  describe('inline', () => {
    it('sets data-inline when inline is true', () => {
      const { container } = render(<Indicator inline><span>Child</span></Indicator>)
      expect(container.firstElementChild).toHaveAttribute('data-inline', 'true')
    })
  })

  // ─── Size ──────────────────────────────────────────────────────────

  describe('size', () => {
    it('applies custom dot size via inline style', () => {
      const { container } = render(<Indicator size={16}><span>Child</span></Indicator>)
      const dot = container.querySelector('.ui-indicator__dot') as HTMLElement
      expect(dot.style.inlineSize).toBe('16px')
      expect(dot.style.blockSize).toBe('16px')
    })

    it('uses default 10px size', () => {
      const { container } = render(<Indicator><span>Child</span></Indicator>)
      const dot = container.querySelector('.ui-indicator__dot') as HTMLElement
      expect(dot.style.inlineSize).toBe('10px')
      expect(dot.style.blockSize).toBe('10px')
    })
  })

  // ─── Ref & className ──────────────────────────────────────────────

  describe('ref and className', () => {
    it('forwards ref to root div', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Indicator ref={ref}><span>Child</span></Indicator>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('merges custom className', () => {
      const { container } = render(<Indicator className="custom"><span>Child</span></Indicator>)
      const root = container.firstElementChild
      expect(root?.className).toContain('ui-indicator')
      expect(root?.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      const { container } = render(<Indicator data-testid="my-indicator" id="ind-1"><span>Child</span></Indicator>)
      expect(screen.getByTestId('my-indicator')).toHaveAttribute('id', 'ind-1')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<Indicator label="3"><span>Avatar</span></Indicator>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Indicator><span>Child</span></Indicator>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-indicator)', () => {
      render(<Indicator><span>Child</span></Indicator>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-indicator)')
    })
  })

  // ─── Display name ──────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Indicator"', () => {
      expect(Indicator.displayName).toBe('Indicator')
    })
  })
})
