import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Kbd } from '../../components/kbd'

expect.extend(toHaveNoViolations)

describe('Kbd', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <kbd> element with text', () => {
      render(<Kbd>Ctrl</Kbd>)
      const kbd = screen.getByText('Ctrl')
      expect(kbd).toBeInTheDocument()
      expect(kbd.tagName).toBe('KBD')
    })

    it('applies ui-kbd class', () => {
      render(<Kbd>Shift</Kbd>)
      const kbd = screen.getByText('Shift')
      expect(kbd.className).toContain('ui-kbd')
    })

    it('renders with variant="default" by default', () => {
      render(<Kbd>Enter</Kbd>)
      expect(screen.getByText('Enter')).toHaveAttribute('data-variant', 'default')
    })

    it('renders with variant="ghost"', () => {
      render(<Kbd variant="ghost">Esc</Kbd>)
      expect(screen.getByText('Esc')).toHaveAttribute('data-variant', 'ghost')
    })

    it('renders with size="sm" by default', () => {
      render(<Kbd>Tab</Kbd>)
      expect(screen.getByText('Tab')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="xs"', () => {
      render(<Kbd size="xs">A</Kbd>)
      expect(screen.getByText('A')).toHaveAttribute('data-size', 'xs')
    })

    it('renders with size="md"', () => {
      render(<Kbd size="md">Space</Kbd>)
      expect(screen.getByText('Space')).toHaveAttribute('data-size', 'md')
    })

    it('forwards ref to kbd element', () => {
      const ref = createRef<HTMLElement>()
      render(<Kbd ref={ref}>Ref</Kbd>)
      expect(ref.current).toBeInstanceOf(HTMLElement)
      expect(ref.current?.tagName).toBe('KBD')
    })

    it('forwards className', () => {
      render(<Kbd className="custom">K</Kbd>)
      const kbd = screen.getByText('K')
      expect(kbd.className).toContain('ui-kbd')
      expect(kbd.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<Kbd data-testid="my-kbd" id="kbd-1">Alt</Kbd>)
      const kbd = screen.getByTestId('my-kbd')
      expect(kbd).toHaveAttribute('id', 'kbd-1')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (default)', async () => {
      const { container } = render(<Kbd>Ctrl</Kbd>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (ghost variant)', async () => {
      const { container } = render(<Kbd variant="ghost">Esc</Kbd>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Kbd>Styled</Kbd>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @layer components', () => {
      render(<Kbd>Layered</Kbd>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-kbd)', () => {
      render(<Kbd>Scoped</Kbd>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-kbd)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Kbd"', () => {
      expect(Kbd.displayName).toBe('Kbd')
    })
  })
})
