import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Highlight } from '../../components/highlight'

expect.extend(toHaveNoViolations)

describe('Highlight', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the full text', () => {
      render(<Highlight highlight="test">This is a test string</Highlight>)
      expect(screen.getByText(/This is a/)).toBeInTheDocument()
    })

    it('wraps matching text in <mark> elements', () => {
      const { container } = render(
        <Highlight highlight="world">Hello world</Highlight>
      )
      const marks = container.querySelectorAll('mark')
      expect(marks).toHaveLength(1)
      expect(marks[0].textContent).toBe('world')
    })

    it('renders with ui-highlight class', () => {
      const { container } = render(
        <Highlight highlight="x">text</Highlight>
      )
      expect(container.querySelector('.ui-highlight')).toBeInTheDocument()
    })

    it('forwards ref to span element', () => {
      const ref = createRef<HTMLSpanElement>()
      render(<Highlight ref={ref} highlight="x">text</Highlight>)
      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })

    it('forwards className', () => {
      const { container } = render(
        <Highlight highlight="x" className="custom">text</Highlight>
      )
      const el = container.querySelector('.ui-highlight')
      expect(el?.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <Highlight highlight="x" data-testid="hl" title="highlighted">text</Highlight>
      )
      expect(screen.getByTestId('hl')).toHaveAttribute('title', 'highlighted')
    })
  })

  // ─── Highlighting logic ────────────────────────────────────────────

  describe('highlighting', () => {
    it('is case-insensitive by default', () => {
      const { container } = render(
        <Highlight highlight="HELLO">hello world</Highlight>
      )
      const marks = container.querySelectorAll('mark')
      expect(marks).toHaveLength(1)
      expect(marks[0].textContent).toBe('hello')
    })

    it('supports case-sensitive matching', () => {
      const { container } = render(
        <Highlight highlight="Hello" caseSensitive>Hello hello Hello</Highlight>
      )
      const marks = container.querySelectorAll('mark')
      expect(marks).toHaveLength(2)
      marks.forEach((m) => expect(m.textContent).toBe('Hello'))
    })

    it('highlights multiple occurrences', () => {
      const { container } = render(
        <Highlight highlight="a">banana</Highlight>
      )
      const marks = container.querySelectorAll('mark')
      expect(marks).toHaveLength(3)
    })

    it('supports multiple search terms', () => {
      const { container } = render(
        <Highlight highlight={['foo', 'bar']}>foo baz bar</Highlight>
      )
      const marks = container.querySelectorAll('mark')
      expect(marks).toHaveLength(2)
    })

    it('renders no marks when highlight is empty string', () => {
      const { container } = render(
        <Highlight highlight="">some text</Highlight>
      )
      const marks = container.querySelectorAll('mark')
      expect(marks).toHaveLength(0)
    })

    it('renders no marks when highlight does not match', () => {
      const { container } = render(
        <Highlight highlight="xyz">hello world</Highlight>
      )
      const marks = container.querySelectorAll('mark')
      expect(marks).toHaveLength(0)
    })

    it('handles special regex characters in highlight', () => {
      const { container } = render(
        <Highlight highlight="(test)">This is (test) text</Highlight>
      )
      const marks = container.querySelectorAll('mark')
      expect(marks).toHaveLength(1)
      expect(marks[0].textContent).toBe('(test)')
    })

    it('handles empty array of search terms', () => {
      const { container } = render(
        <Highlight highlight={[]}>some text</Highlight>
      )
      const marks = container.querySelectorAll('mark')
      expect(marks).toHaveLength(0)
    })
  })

  // ─── Custom color ─────────────────────────────────────────────────

  describe('color', () => {
    it('sets custom highlight color via CSS variable', () => {
      const { container } = render(
        <Highlight highlight="test" color="oklch(80% 0.2 90)">test text</Highlight>
      )
      const el = container.querySelector('.ui-highlight') as HTMLElement
      expect(el.style.getPropertyValue('--ui-highlight-color')).toBe('oklch(80% 0.2 90)')
    })
  })

  // ─── highlightClassName ───────────────────────────────────────────

  describe('highlightClassName', () => {
    it('applies custom class to mark elements', () => {
      const { container } = render(
        <Highlight highlight="hello" highlightClassName="custom-mark">hello world</Highlight>
      )
      const marks = container.querySelectorAll('mark')
      expect(marks[0].className).toBe('custom-mark')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <Highlight highlight="world">Hello world</Highlight>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection ─────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Highlight highlight="x">text</Highlight>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-highlight)', () => {
      render(<Highlight highlight="x">text</Highlight>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map((s) => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-highlight)')
    })
  })

  // ─── Display name ────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Highlight"', () => {
      expect(Highlight.displayName).toBe('Highlight')
    })
  })
})
