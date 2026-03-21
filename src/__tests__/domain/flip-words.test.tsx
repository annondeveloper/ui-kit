import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { FlipWords } from '../../domain/flip-words'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('FlipWords', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<FlipWords words={['Hello']} />)
      expect(container.querySelector('.ui-flip-words')).toBeInTheDocument()
    })

    it('renders first word', () => {
      render(<FlipWords words={['Hello', 'World']} />)
      expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    it('renders word element', () => {
      const { container } = render(<FlipWords words={['Test']} />)
      expect(container.querySelector('.ui-flip-words--word')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(FlipWords.displayName).toBe('FlipWords')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <FlipWords words={['Hello']} className="custom" />
      )
      expect(container.querySelector('.ui-flip-words.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<FlipWords words={['Hello']} data-testid="fw" />)
      expect(screen.getByTestId('fw')).toBeInTheDocument()
    })

    it('handles empty words array gracefully', () => {
      const { container } = render(<FlipWords words={[]} />)
      expect(container.querySelector('.ui-flip-words')).toBeInTheDocument()
    })

    it('handles single word', () => {
      render(<FlipWords words={['Only']} />)
      expect(screen.getByText('Only')).toBeInTheDocument()
    })
  })

  // ─── Animation state ─────────────────────────────────────────────

  describe('animation state', () => {
    it('word starts in visible state', () => {
      const { container } = render(<FlipWords words={['Hello']} />)
      const word = container.querySelector('.ui-flip-words--word')
      expect(word?.getAttribute('data-state')).toBe('visible')
    })

    it('at motion 0, word is always visible', () => {
      const { container } = render(
        <FlipWords words={['Hello', 'World']} motion={0} />
      )
      const word = container.querySelector('.ui-flip-words--word')
      expect(word?.getAttribute('data-state')).toBe('visible')
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(
        <FlipWords words={['Hello']} motion={2} />
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(
        <FlipWords words={['Hello']} motion={0} />
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has aria-live polite', () => {
      const { container } = render(<FlipWords words={['Hello']} />)
      const el = container.querySelector('.ui-flip-words')
      expect(el?.getAttribute('aria-live')).toBe('polite')
    })

    it('has aria-atomic true', () => {
      const { container } = render(<FlipWords words={['Hello']} />)
      const el = container.querySelector('.ui-flip-words')
      expect(el?.getAttribute('aria-atomic')).toBe('true')
    })

    it('has no axe violations', async () => {
      const { container } = render(
        <FlipWords words={['Hello', 'World']} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
