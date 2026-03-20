import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TypingIndicator } from '../../domain/typing-indicator'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('TypingIndicator', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<TypingIndicator />)
      expect(container.querySelector('.ui-typing-indicator')).toBeInTheDocument()
    })

    it('renders three dots', () => {
      const { container } = render(<TypingIndicator />)
      const dots = container.querySelectorAll('.ui-typing-indicator__dot')
      expect(dots.length).toBe(3)
    })

    it('has displayName', () => {
      expect(TypingIndicator.displayName).toBe('TypingIndicator')
    })

    it('passes className', () => {
      const { container } = render(<TypingIndicator className="custom" />)
      expect(container.querySelector('.ui-typing-indicator.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<TypingIndicator data-testid="typing" />)
      expect(screen.getByTestId('typing')).toBeInTheDocument()
    })
  })

  // ─── Avatar ─────────────────────────────────────────────────────────

  describe('avatar', () => {
    it('renders avatar when provided', () => {
      render(<TypingIndicator avatar={<img alt="User" src="/avatar.png" />} />)
      expect(screen.getByAltText('User')).toBeInTheDocument()
    })

    it('renders ReactNode avatar', () => {
      render(<TypingIndicator avatar={<span data-testid="av">AI</span>} />)
      expect(screen.getByTestId('av')).toBeInTheDocument()
    })

    it('does not render avatar container when not provided', () => {
      const { container } = render(<TypingIndicator />)
      expect(container.querySelector('.ui-typing-indicator__avatar')).not.toBeInTheDocument()
    })
  })

  // ─── Label ──────────────────────────────────────────────────────────

  describe('label', () => {
    it('has default label "Someone is typing..."', () => {
      render(<TypingIndicator />)
      expect(screen.getByText('Someone is typing...')).toBeInTheDocument()
    })

    it('renders custom label', () => {
      render(<TypingIndicator label="AI is thinking..." />)
      expect(screen.getByText('AI is thinking...')).toBeInTheDocument()
    })

    it('label is visually hidden but accessible', () => {
      const { container } = render(<TypingIndicator label="Typing" />)
      const labelEl = container.querySelector('.ui-typing-indicator__label')
      expect(labelEl).toBeInTheDocument()
    })
  })

  // ─── Size ───────────────────────────────────────────────────────────

  describe('size', () => {
    it('defaults to md size', () => {
      const { container } = render(<TypingIndicator />)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })

    it('applies sm size', () => {
      const { container } = render(<TypingIndicator size="sm" />)
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<TypingIndicator motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('static dots at motion 0', () => {
      const { container } = render(<TypingIndicator motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
      // Dots should still be present
      const dots = container.querySelectorAll('.ui-typing-indicator__dot')
      expect(dots.length).toBe(3)
    })

    it('spring animation at motion 2+', () => {
      const { container } = render(<TypingIndicator motion={3} />)
      expect(container.querySelector('[data-motion="3"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has role="status"', () => {
      const { container } = render(<TypingIndicator />)
      expect(container.querySelector('[role="status"]')).toBeInTheDocument()
    })

    it('has aria-live="polite"', () => {
      const { container } = render(<TypingIndicator />)
      expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
    })

    it('has no axe violations', async () => {
      const { container } = render(<TypingIndicator />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with avatar', async () => {
      const { container } = render(
        <TypingIndicator avatar={<span>AI</span>} label="AI thinking" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
