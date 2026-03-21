import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Card3D } from '../../domain/card-3d'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('Card3D', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<Card3D>Content</Card3D>)
      expect(container.querySelector('.ui-card-3d')).toBeInTheDocument()
    })

    it('renders inner wrapper', () => {
      const { container } = render(<Card3D>Content</Card3D>)
      expect(container.querySelector('.ui-card-3d--inner')).toBeInTheDocument()
    })

    it('renders children in content div', () => {
      render(<Card3D>Card content</Card3D>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('renders glare element by default', () => {
      const { container } = render(<Card3D>Content</Card3D>)
      expect(container.querySelector('.ui-card-3d--glare')).toBeInTheDocument()
    })

    it('hides glare when glare=false', () => {
      const { container } = render(<Card3D glare={false}>Content</Card3D>)
      expect(container.querySelector('.ui-card-3d--glare')).not.toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(Card3D.displayName).toBe('Card3D')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Card3D className="custom">Content</Card3D>
      )
      expect(container.querySelector('.ui-card-3d.custom')).toBeInTheDocument()
    })

    it('applies perspective as CSS variable', () => {
      const { container } = render(
        <Card3D perspective={500}>Content</Card3D>
      )
      const el = container.querySelector('.ui-card-3d') as HTMLElement
      expect(el.style.getPropertyValue('--card-3d-perspective')).toBe('500px')
    })

    it('passes data attributes', () => {
      render(<Card3D data-testid="c3d">Content</Card3D>)
      expect(screen.getByTestId('c3d')).toBeInTheDocument()
    })

    it('forwards onMouseMove', () => {
      let moved = false
      const { container } = render(
        <Card3D onMouseMove={() => { moved = true }}>Content</Card3D>
      )
      fireEvent.mouseMove(container.querySelector('.ui-card-3d')!)
      expect(moved).toBe(true)
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<Card3D motion={2}>Content</Card3D>)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<Card3D motion={0}>Content</Card3D>)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Glare ────────────────────────────────────────────────────────

  describe('glare', () => {
    it('glare is aria-hidden', () => {
      const { container } = render(<Card3D>Content</Card3D>)
      const glare = container.querySelector('.ui-card-3d--glare')
      expect(glare?.getAttribute('aria-hidden')).toBe('true')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <Card3D><p>Accessible content</p></Card3D>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
