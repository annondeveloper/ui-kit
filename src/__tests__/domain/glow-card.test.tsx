import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { GlowCard } from '../../domain/glow-card'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('GlowCard', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<GlowCard>Content</GlowCard>)
      expect(container.querySelector('.ui-glow-card')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(<GlowCard>Card content</GlowCard>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('wraps children in content div', () => {
      const { container } = render(<GlowCard>Content</GlowCard>)
      expect(container.querySelector('.ui-glow-card--content')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(GlowCard.displayName).toBe('GlowCard')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <GlowCard className="custom">Content</GlowCard>
      )
      expect(container.querySelector('.ui-glow-card.custom')).toBeInTheDocument()
    })

    it('applies glowColor as CSS variable', () => {
      const { container } = render(
        <GlowCard glowColor="oklch(70% 0.2 120 / 0.3)">Content</GlowCard>
      )
      const el = container.querySelector('.ui-glow-card') as HTMLElement
      expect(el.style.getPropertyValue('--glow-card-color')).toBe('oklch(70% 0.2 120 / 0.3)')
    })

    it('passes data attributes', () => {
      render(<GlowCard data-testid="gc">Content</GlowCard>)
      expect(screen.getByTestId('gc')).toBeInTheDocument()
    })
  })

  // ─── Mouse tracking ────────────────────────────────────────────────

  describe('mouse tracking', () => {
    it('sets data-hovering on mouse enter', () => {
      const { container } = render(<GlowCard>Content</GlowCard>)
      const el = container.querySelector('.ui-glow-card')!
      fireEvent.mouseEnter(el)
      expect(el.getAttribute('data-hovering')).toBe('true')
    })

    it('removes data-hovering on mouse leave', () => {
      const { container } = render(<GlowCard>Content</GlowCard>)
      const el = container.querySelector('.ui-glow-card')!
      fireEvent.mouseEnter(el)
      fireEvent.mouseLeave(el)
      expect(el.getAttribute('data-hovering')).toBeNull()
    })

    it('forwards onMouseMove handler', () => {
      let moved = false
      const { container } = render(
        <GlowCard onMouseMove={() => { moved = true }}>Content</GlowCard>
      )
      fireEvent.mouseMove(container.querySelector('.ui-glow-card')!)
      expect(moved).toBe(true)
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(
        <GlowCard motion={2}>Content</GlowCard>
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(
        <GlowCard motion={0}>Content</GlowCard>
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <GlowCard><p>Accessible content</p></GlowCard>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
