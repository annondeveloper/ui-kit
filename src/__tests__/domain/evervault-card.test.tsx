import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { EvervaultCard } from '../../domain/evervault-card'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('EvervaultCard', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<EvervaultCard>Content</EvervaultCard>)
      expect(container.querySelector('.ui-evervault-card')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(<EvervaultCard>Card content</EvervaultCard>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('renders matrix overlay', () => {
      const { container } = render(<EvervaultCard>Content</EvervaultCard>)
      expect(container.querySelector('.ui-evervault-card--matrix')).toBeInTheDocument()
    })

    it('renders content wrapper', () => {
      const { container } = render(<EvervaultCard>Content</EvervaultCard>)
      expect(container.querySelector('.ui-evervault-card--content')).toBeInTheDocument()
    })

    it('renders scrambled characters', () => {
      const { container } = render(<EvervaultCard>Content</EvervaultCard>)
      const chars = container.querySelectorAll('.ui-evervault-card--char')
      expect(chars.length).toBeGreaterThan(0)
    })

    it('has displayName', () => {
      expect(EvervaultCard.displayName).toBe('EvervaultCard')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <EvervaultCard className="custom">Content</EvervaultCard>
      )
      expect(container.querySelector('.ui-evervault-card.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<EvervaultCard data-testid="ec">Content</EvervaultCard>)
      expect(screen.getByTestId('ec')).toBeInTheDocument()
    })
  })

  // ─── Mouse tracking ──────────────────────────────────────────────

  describe('mouse tracking', () => {
    it('sets data-hovering on mouse enter', () => {
      const { container } = render(<EvervaultCard>Content</EvervaultCard>)
      const el = container.querySelector('.ui-evervault-card')!
      fireEvent.mouseEnter(el)
      expect(el.getAttribute('data-hovering')).toBe('true')
    })

    it('removes data-hovering on mouse leave', () => {
      const { container } = render(<EvervaultCard>Content</EvervaultCard>)
      const el = container.querySelector('.ui-evervault-card')!
      fireEvent.mouseEnter(el)
      fireEvent.mouseLeave(el)
      expect(el.getAttribute('data-hovering')).toBeNull()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(
        <EvervaultCard motion={2}>Content</EvervaultCard>
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(
        <EvervaultCard motion={0}>Content</EvervaultCard>
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('matrix is aria-hidden', () => {
      const { container } = render(<EvervaultCard>Content</EvervaultCard>)
      const matrix = container.querySelector('.ui-evervault-card--matrix')
      expect(matrix?.getAttribute('aria-hidden')).toBe('true')
    })

    it('has no axe violations', async () => {
      const { container } = render(
        <EvervaultCard><p>Accessible content</p></EvervaultCard>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
