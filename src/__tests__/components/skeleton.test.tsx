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

    it('renders with variant="rounded"', () => {
      const { container } = render(<Skeleton variant="rounded" />)
      expect(container.firstElementChild).toHaveAttribute('data-variant', 'rounded')
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

    it('last line has a shorter width when lines > 1', () => {
      const { container } = render(<Skeleton variant="text" lines={3} />)
      const lines = container.querySelectorAll('.ui-skeleton__line')
      const lastLine = lines[lines.length - 1] as HTMLElement
      // Last line should have a percentage width between 45-70%
      expect(lastLine.style.inlineSize).toMatch(/^\d+%$/)
      const pct = parseInt(lastLine.style.inlineSize)
      expect(pct).toBeGreaterThanOrEqual(45)
      expect(pct).toBeLessThanOrEqual(70)
    })

    it('second-to-last line has moderate width when lines > 2', () => {
      const { container } = render(<Skeleton variant="text" lines={4} />)
      const lines = container.querySelectorAll('.ui-skeleton__line')
      const secondToLast = lines[lines.length - 2] as HTMLElement
      // Second-to-last should have a percentage width between 70-90%
      expect(secondToLast.style.inlineSize).toMatch(/^\d+%$/)
      const pct = parseInt(secondToLast.style.inlineSize)
      expect(pct).toBeGreaterThanOrEqual(70)
      expect(pct).toBeLessThanOrEqual(90)
    })

    it('single line does not get reduced width', () => {
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

    it('defaults to shimmer animation', () => {
      const { container } = render(<Skeleton />)
      expect(container.firstElementChild).toHaveAttribute('data-animation', 'shimmer')
    })

    it('supports pulse animation type', () => {
      const { container } = render(<Skeleton animation="pulse" />)
      expect(container.firstElementChild).toHaveAttribute('data-animation', 'pulse')
    })

    it('supports wave animation type', () => {
      const { container } = render(<Skeleton animation="wave" />)
      expect(container.firstElementChild).toHaveAttribute('data-animation', 'wave')
    })

    it('sets data-speed attribute', () => {
      const { container } = render(<Skeleton speed="fast" />)
      expect(container.firstElementChild).toHaveAttribute('data-speed', 'fast')
    })

    it('defaults to normal speed', () => {
      const { container } = render(<Skeleton />)
      expect(container.firstElementChild).toHaveAttribute('data-speed', 'normal')
    })

    it('supports slow speed', () => {
      const { container } = render(<Skeleton speed="slow" />)
      expect(container.firstElementChild).toHaveAttribute('data-speed', 'slow')
    })
  })

  // ─── Radius tests ─────────────────────────────────────────────────

  describe('radius', () => {
    it('applies radius as string', () => {
      const { container } = render(<Skeleton radius="1rem" />)
      const el = container.firstElementChild as HTMLElement
      expect(el.style.borderRadius).toBe('1rem')
    })

    it('applies radius as number (px)', () => {
      const { container } = render(<Skeleton radius={16} />)
      const el = container.firstElementChild as HTMLElement
      expect(el.style.borderRadius).toBe('16px')
    })
  })

  // ─── Count tests ──────────────────────────────────────────────────

  describe('count', () => {
    it('renders multiple skeletons when count > 1', () => {
      const { container } = render(<Skeleton count={3} variant="rectangular" width={60} height={60} />)
      const wrapper = container.firstElementChild!
      expect(wrapper.className).toContain('ui-skeleton__count-wrapper')
      const skeletons = wrapper.querySelectorAll('[data-variant="rectangular"]')
      expect(skeletons.length).toBe(3)
    })

    it('renders single skeleton when count is not set', () => {
      const { container } = render(<Skeleton variant="rectangular" width={60} height={60} />)
      const el = container.firstElementChild!
      expect(el.className).toContain('ui-skeleton')
      expect(el.className).not.toContain('ui-skeleton__count-wrapper')
    })

    it('does not use wrapper when count is 1', () => {
      const { container } = render(<Skeleton count={1} variant="rectangular" />)
      const el = container.firstElementChild!
      expect(el.className).toContain('ui-skeleton')
      expect(el.className).not.toContain('ui-skeleton__count-wrapper')
    })

    it('applies direction="row" by default on count wrapper', () => {
      const { container } = render(<Skeleton count={2} variant="rectangular" width={60} height={60} />)
      const wrapper = container.firstElementChild!
      expect(wrapper).toHaveAttribute('data-direction', 'row')
    })

    it('applies direction="column" on count wrapper', () => {
      const { container } = render(<Skeleton count={2} direction="column" variant="rectangular" width={60} height={60} />)
      const wrapper = container.firstElementChild!
      expect(wrapper).toHaveAttribute('data-direction', 'column')
    })
  })

  // ─── lineHeight / lineGap tests ───────────────────────────────────

  describe('lineHeight and lineGap', () => {
    it('applies custom lineHeight as CSS variable (string)', () => {
      const { container } = render(<Skeleton lines={2} lineHeight="1.5rem" />)
      const el = container.firstElementChild as HTMLElement
      expect(el.style.getPropertyValue('--skeleton-line-height')).toBe('1.5rem')
    })

    it('applies custom lineHeight as CSS variable (number)', () => {
      const { container } = render(<Skeleton lines={2} lineHeight={20} />)
      const el = container.firstElementChild as HTMLElement
      expect(el.style.getPropertyValue('--skeleton-line-height')).toBe('20px')
    })

    it('applies custom lineGap as CSS variable (string)', () => {
      const { container } = render(<Skeleton lines={2} lineGap="1rem" />)
      const el = container.firstElementChild as HTMLElement
      expect(el.style.getPropertyValue('--skeleton-line-gap')).toBe('1rem')
    })

    it('applies custom lineGap as CSS variable (number)', () => {
      const { container } = render(<Skeleton lines={2} lineGap={12} />)
      const el = container.firstElementChild as HTMLElement
      expect(el.style.getPropertyValue('--skeleton-line-gap')).toBe('12px')
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

    it('count wrapper has aria-hidden', () => {
      const { container } = render(<Skeleton count={3} variant="rectangular" width={60} height={60} />)
      const wrapper = container.firstElementChild!
      expect(wrapper).toHaveAttribute('aria-hidden', 'true')
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

    it('CSS includes pulse keyframes', () => {
      render(<Skeleton />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('ui-skeleton-pulse')
    })

    it('CSS includes wave keyframes', () => {
      render(<Skeleton />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('ui-skeleton-wave')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Skeleton"', () => {
      expect(Skeleton.displayName).toBe('Skeleton')
    })
  })
})
