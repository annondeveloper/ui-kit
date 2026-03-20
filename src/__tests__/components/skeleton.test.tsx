import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Skeleton } from '../../components/skeleton'

expect.extend(toHaveNoViolations)

describe('Skeleton', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <div> element', () => {
      const { container } = render(<Skeleton />)
      const el = container.firstElementChild!
      expect(el.tagName).toBe('DIV')
    })

    it('renders with variant="text" by default', () => {
      const { container } = render(<Skeleton />)
      expect(container.firstElementChild).toHaveAttribute('data-variant', 'text')
    })

    it('renders with variant="circular"', () => {
      const { container } = render(<Skeleton variant="circular" />)
      expect(container.firstElementChild).toHaveAttribute('data-variant', 'circular')
    })

    it('renders with variant="rectangular"', () => {
      const { container } = render(<Skeleton variant="rectangular" />)
      expect(container.firstElementChild).toHaveAttribute('data-variant', 'rectangular')
    })

    it('applies custom width as inline style (string)', () => {
      const { container } = render(<Skeleton width="200px" />)
      const el = container.firstElementChild as HTMLElement
      expect(el.style.inlineSize).toBe('200px')
    })

    it('applies custom width as inline style (number converts to px)', () => {
      const { container } = render(<Skeleton width={200} />)
      const el = container.firstElementChild as HTMLElement
      expect(el.style.inlineSize).toBe('200px')
    })

    it('applies custom height as inline style (string)', () => {
      const { container } = render(<Skeleton height="40px" />)
      const el = container.firstElementChild as HTMLElement
      expect(el.style.blockSize).toBe('40px')
    })

    it('applies custom height as inline style (number converts to px)', () => {
      const { container } = render(<Skeleton height={40} />)
      const el = container.firstElementChild as HTMLElement
      expect(el.style.blockSize).toBe('40px')
    })

    it('renders multiple lines for text variant', () => {
      const { container } = render(<Skeleton variant="text" lines={3} />)
      const lines = container.querySelectorAll('.ui-skeleton__line')
      expect(lines.length).toBe(3)
    })

    it('last line is shorter (60% width) when lines > 1', () => {
      const { container } = render(<Skeleton variant="text" lines={3} />)
      const lines = container.querySelectorAll('.ui-skeleton__line')
      const lastLine = lines[lines.length - 1] as HTMLElement
      expect(lastLine.style.inlineSize).toBe('60%')
    })

    it('single line does not get 60% width', () => {
      const { container } = render(<Skeleton variant="text" lines={1} />)
      const lines = container.querySelectorAll('.ui-skeleton__line')
      expect(lines.length).toBe(1)
      const line = lines[0] as HTMLElement
      expect(line.style.inlineSize).toBe('')
    })

    it('forwards ref to root element', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Skeleton ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards className', () => {
      const { container } = render(<Skeleton className="custom" />)
      expect(container.firstElementChild!.className).toContain('ui-skeleton')
      expect(container.firstElementChild!.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      const { container } = render(<Skeleton data-testid="skel" id="s1" />)
      const el = screen.getByTestId('skel')
      expect(el).toHaveAttribute('id', 's1')
    })
  })

  // ─── Animation tests ──────────────────────────────────────────────

  describe('animation', () => {
    it('has animate enabled by default', () => {
      const { container } = render(<Skeleton />)
      expect(container.firstElementChild).toHaveAttribute('data-animate', 'true')
    })

    it('can disable animation', () => {
      const { container } = render(<Skeleton animate={false} />)
      expect(container.firstElementChild).toHaveAttribute('data-animate', 'false')
    })

    it('sets data-motion attribute', () => {
      const { container } = render(<Skeleton motion={0} />)
      expect(container.firstElementChild).toHaveAttribute('data-motion', '0')
    })

    it('no animation at motion level 0', () => {
      const { container } = render(<Skeleton motion={0} />)
      expect(container.firstElementChild).toHaveAttribute('data-motion', '0')
      // CSS ensures [data-motion="0"] has animation: none
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has aria-hidden="true" (decorative element)', () => {
      const { container } = render(<Skeleton />)
      expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    })

    it('has no axe violations', async () => {
      const { container } = render(<Skeleton />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with lines', async () => {
      const { container } = render(<Skeleton lines={3} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Skeleton />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @layer components', () => {
      render(<Skeleton />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-skeleton)', () => {
      render(<Skeleton />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-skeleton)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Skeleton"', () => {
      expect(Skeleton.displayName).toBe('Skeleton')
    })
  })
})
