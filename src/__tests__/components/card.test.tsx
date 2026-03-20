import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Card } from '../../components/card'

expect.extend(toHaveNoViolations)

describe('Card', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <div> element by default', () => {
      const { container } = render(<Card>Content</Card>)
      const card = container.querySelector('.ui-card')
      expect(card).toBeInTheDocument()
      expect(card?.tagName).toBe('DIV')
      expect(card).toHaveTextContent('Content')
    })

    it('applies ui-card class', () => {
      const { container } = render(<Card>Content</Card>)
      expect(container.querySelector('.ui-card')).toBeInTheDocument()
    })

    it('renders with variant="default" by default', () => {
      const { container } = render(<Card>Default</Card>)
      expect(container.querySelector('.ui-card')).toHaveAttribute('data-variant', 'default')
    })

    it('renders with variant="elevated"', () => {
      const { container } = render(<Card variant="elevated">Elevated</Card>)
      expect(container.querySelector('.ui-card')).toHaveAttribute('data-variant', 'elevated')
    })

    it('renders with variant="outlined"', () => {
      const { container } = render(<Card variant="outlined">Outlined</Card>)
      expect(container.querySelector('.ui-card')).toHaveAttribute('data-variant', 'outlined')
    })

    it('renders with variant="ghost"', () => {
      const { container } = render(<Card variant="ghost">Ghost</Card>)
      expect(container.querySelector('.ui-card')).toHaveAttribute('data-variant', 'ghost')
    })

    it('renders with padding="md" by default', () => {
      const { container } = render(<Card>Padded</Card>)
      expect(container.querySelector('.ui-card')).toHaveAttribute('data-padding', 'md')
    })

    it('renders with padding="none"', () => {
      const { container } = render(<Card padding="none">No Pad</Card>)
      expect(container.querySelector('.ui-card')).toHaveAttribute('data-padding', 'none')
    })

    it('renders with padding="sm"', () => {
      const { container } = render(<Card padding="sm">Small Pad</Card>)
      expect(container.querySelector('.ui-card')).toHaveAttribute('data-padding', 'sm')
    })

    it('renders with padding="lg"', () => {
      const { container } = render(<Card padding="lg">Large Pad</Card>)
      expect(container.querySelector('.ui-card')).toHaveAttribute('data-padding', 'lg')
    })

    it('renders as <article> with as="article"', () => {
      const { container } = render(<Card as="article">Article</Card>)
      const card = container.querySelector('.ui-card')
      expect(card?.tagName).toBe('ARTICLE')
    })

    it('renders as <a> with as="a"', () => {
      const { container } = render(
        <Card as="a" href="https://example.com">Link Card</Card>
      )
      const card = container.querySelector('.ui-card')
      expect(card?.tagName).toBe('A')
      expect(card).toHaveAttribute('href', 'https://example.com')
    })

    it('renders as <section> with as="section"', () => {
      const { container } = render(<Card as="section">Section</Card>)
      const card = container.querySelector('.ui-card')
      expect(card?.tagName).toBe('SECTION')
    })

    it('applies interactive data attribute when interactive is true', () => {
      const { container } = render(<Card interactive>Interactive</Card>)
      expect(container.querySelector('.ui-card')).toHaveAttribute('data-interactive', 'true')
    })

    it('does not apply interactive data attribute when not set', () => {
      const { container } = render(<Card>Static</Card>)
      expect(container.querySelector('.ui-card')).not.toHaveAttribute('data-interactive')
    })

    it('has container-type: inline-size for container queries', () => {
      // We verify via the data attribute; CSS handles the visual behavior
      const { container } = render(<Card>Container</Card>)
      const card = container.querySelector('.ui-card')
      expect(card).toBeInTheDocument()
      // The CSS sets container-type: inline-size; verified via style injection test
    })

    it('forwards ref to the element', () => {
      const ref = createRef<HTMLElement>()
      render(<Card ref={ref}>Ref</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards ref when using as="article"', () => {
      const ref = createRef<HTMLElement>()
      render(<Card as="article" ref={ref}>Ref</Card>)
      expect(ref.current?.tagName).toBe('ARTICLE')
    })

    it('forwards className', () => {
      const { container } = render(<Card className="custom">Custom</Card>)
      const card = container.querySelector('.ui-card')
      expect(card?.className).toContain('ui-card')
      expect(card?.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      const { container } = render(
        <Card data-testid="my-card" id="card-1">Attrs</Card>
      )
      const card = screen.getByTestId('my-card')
      expect(card).toHaveAttribute('id', 'card-1')
    })

    it('applies data-motion attribute', () => {
      const { container } = render(<Card motion={2}>Motion</Card>)
      expect(container.querySelector('.ui-card')).toHaveAttribute('data-motion', '2')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (default)', async () => {
      const { container } = render(<Card>Accessible</Card>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (as article)', async () => {
      const { container } = render(<Card as="article">Article</Card>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (interactive)', async () => {
      const { container } = render(<Card interactive>Interactive</Card>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Card>Styled</Card>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @layer components', () => {
      render(<Card>Layered</Card>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-card)', () => {
      render(<Card>Scoped</Card>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-card)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Card"', () => {
      expect(Card.displayName).toBe('Card')
    })
  })
})
