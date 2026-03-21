import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { SpotlightCard } from '../../domain/spotlight-card'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('SpotlightCard', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<SpotlightCard>Content</SpotlightCard>)
      expect(container.querySelector('.ui-spotlight-card')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(<SpotlightCard>Card content</SpotlightCard>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('wraps children in content div', () => {
      const { container } = render(<SpotlightCard>Content</SpotlightCard>)
      expect(container.querySelector('.ui-spotlight-card--content')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(SpotlightCard.displayName).toBe('SpotlightCard')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <SpotlightCard className="custom">Content</SpotlightCard>
      )
      expect(container.querySelector('.ui-spotlight-card.custom')).toBeInTheDocument()
    })

    it('applies spotlightColor as CSS variable', () => {
      const { container } = render(
        <SpotlightCard spotlightColor="oklch(70% 0.2 120 / 0.3)">Content</SpotlightCard>
      )
      const el = container.querySelector('.ui-spotlight-card') as HTMLElement
      expect(el.style.getPropertyValue('--spotlight-card-color')).toBe('oklch(70% 0.2 120 / 0.3)')
    })

    it('passes data attributes', () => {
      render(<SpotlightCard data-testid="sc">Content</SpotlightCard>)
      expect(screen.getByTestId('sc')).toBeInTheDocument()
    })
  })

  // ─── Mouse tracking ──────────────────────────────────────────────

  describe('mouse tracking', () => {
    it('sets data-hovering on mouse enter', () => {
      const { container } = render(<SpotlightCard>Content</SpotlightCard>)
      const el = container.querySelector('.ui-spotlight-card')!
      fireEvent.mouseEnter(el)
      expect(el.getAttribute('data-hovering')).toBe('true')
    })

    it('removes data-hovering on mouse leave', () => {
      const { container } = render(<SpotlightCard>Content</SpotlightCard>)
      const el = container.querySelector('.ui-spotlight-card')!
      fireEvent.mouseEnter(el)
      fireEvent.mouseLeave(el)
      expect(el.getAttribute('data-hovering')).toBeNull()
    })

    it('forwards onMouseMove handler', () => {
      let moved = false
      const { container } = render(
        <SpotlightCard onMouseMove={() => { moved = true }}>Content</SpotlightCard>
      )
      fireEvent.mouseMove(container.querySelector('.ui-spotlight-card')!)
      expect(moved).toBe(true)
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(
        <SpotlightCard motion={2}>Content</SpotlightCard>
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(
        <SpotlightCard motion={0}>Content</SpotlightCard>
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <SpotlightCard><p>Accessible content</p></SpotlightCard>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
