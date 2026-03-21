import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { OrbitingCircles } from '../../domain/orbiting-circles'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('OrbitingCircles', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(
        <OrbitingCircles>{[<span key="a">A</span>, <span key="b">B</span>]}</OrbitingCircles>
      )
      expect(container.querySelector('.ui-orbiting-circles')).toBeInTheDocument()
    })

    it('renders all children as orbit items', () => {
      const { container } = render(
        <OrbitingCircles>
          {[<span key="1">One</span>, <span key="2">Two</span>, <span key="3">Three</span>]}
        </OrbitingCircles>
      )
      const items = container.querySelectorAll('.ui-orbiting-circles--item')
      expect(items.length).toBe(3)
    })

    it('renders children content', () => {
      render(
        <OrbitingCircles>{[<span key="a">Icon A</span>]}</OrbitingCircles>
      )
      expect(screen.getByText('Icon A')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(OrbitingCircles.displayName).toBe('OrbitingCircles')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <OrbitingCircles className="custom">{[<span key="a">A</span>]}</OrbitingCircles>
      )
      expect(container.querySelector('.ui-orbiting-circles.custom')).toBeInTheDocument()
    })

    it('sets radius as CSS variable', () => {
      const { container } = render(
        <OrbitingCircles radius={150}>{[<span key="a">A</span>]}</OrbitingCircles>
      )
      const el = container.querySelector('.ui-orbiting-circles') as HTMLElement
      expect(el.style.getPropertyValue('--orbit-radius')).toBe('150px')
    })

    it('sets duration as CSS variable', () => {
      const { container } = render(
        <OrbitingCircles duration={20}>{[<span key="a">A</span>]}</OrbitingCircles>
      )
      const el = container.querySelector('.ui-orbiting-circles') as HTMLElement
      expect(el.style.getPropertyValue('--orbit-duration')).toBe('20s')
    })

    it('sets reverse direction', () => {
      const { container } = render(
        <OrbitingCircles reverse>{[<span key="a">A</span>]}</OrbitingCircles>
      )
      const el = container.querySelector('.ui-orbiting-circles') as HTMLElement
      expect(el.style.getPropertyValue('--orbit-direction')).toBe('reverse')
    })

    it('spaces items evenly around the circle', () => {
      const { container } = render(
        <OrbitingCircles>
          {[<span key="1">1</span>, <span key="2">2</span>, <span key="3">3</span>, <span key="4">4</span>]}
        </OrbitingCircles>
      )
      const items = container.querySelectorAll('.ui-orbiting-circles--item')
      const angle0 = (items[0] as HTMLElement).style.getPropertyValue('--orbit-start-angle')
      const angle1 = (items[1] as HTMLElement).style.getPropertyValue('--orbit-start-angle')
      expect(angle0).toBe('0deg')
      expect(angle1).toBe('90deg')
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(
        <OrbitingCircles motion={3}>{[<span key="a">A</span>]}</OrbitingCircles>
      )
      expect(container.querySelector('[data-motion="3"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(
        <OrbitingCircles motion={0}>{[<span key="a">A</span>]}</OrbitingCircles>
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has role="presentation" (decorative)', () => {
      const { container } = render(
        <OrbitingCircles>{[<span key="a">A</span>]}</OrbitingCircles>
      )
      expect(container.querySelector('[role="presentation"]')).toBeInTheDocument()
    })

    it('has no axe violations', async () => {
      const { container } = render(
        <OrbitingCircles>{[<span key="a">A</span>, <span key="b">B</span>]}</OrbitingCircles>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
