import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Ripple } from '../../domain/ripple'

expect.extend(toHaveNoViolations)

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Ripple', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<Ripple>Content</Ripple>)
      expect(container.querySelector('.ui-ripple')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(<Ripple>Ripple content</Ripple>)
      expect(screen.getByText('Ripple content')).toBeInTheDocument()
    })

    it('wraps children in content div', () => {
      const { container } = render(<Ripple>Content</Ripple>)
      expect(container.querySelector('.ui-ripple--content')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(Ripple.displayName).toBe('Ripple')
    })
  })

  // ─── Ripple effect ─────────────────────────────────────────────────

  describe('ripple effect', () => {
    it('spawns ripple circle on click', () => {
      const { container } = render(<Ripple>Content</Ripple>)
      const el = container.querySelector('.ui-ripple')!
      fireEvent.click(el, { clientX: 50, clientY: 50 })
      expect(container.querySelector('.ui-ripple--circle')).toBeInTheDocument()
    })

    it('removes ripple after duration', async () => {
      const { container } = render(<Ripple duration={300}>Content</Ripple>)
      const el = container.querySelector('.ui-ripple')!
      fireEvent.click(el, { clientX: 50, clientY: 50 })
      expect(container.querySelector('.ui-ripple--circle')).toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(300)
      })
      expect(container.querySelector('.ui-ripple--circle')).not.toBeInTheDocument()
    })

    it('spawns multiple ripples on multiple clicks', () => {
      const { container } = render(<Ripple>Content</Ripple>)
      const el = container.querySelector('.ui-ripple')!
      fireEvent.click(el, { clientX: 50, clientY: 50 })
      fireEvent.click(el, { clientX: 60, clientY: 60 })
      const circles = container.querySelectorAll('.ui-ripple--circle')
      expect(circles.length).toBe(2)
    })

    it('does not spawn ripple at motion 0', () => {
      const { container } = render(<Ripple motion={0}>Content</Ripple>)
      const el = container.querySelector('.ui-ripple')!
      fireEvent.click(el, { clientX: 50, clientY: 50 })
      expect(container.querySelector('.ui-ripple--circle')).not.toBeInTheDocument()
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Ripple className="custom">Content</Ripple>
      )
      expect(container.querySelector('.ui-ripple.custom')).toBeInTheDocument()
    })

    it('sets color as CSS variable', () => {
      const { container } = render(
        <Ripple color="oklch(70% 0.2 120 / 0.3)">Content</Ripple>
      )
      const el = container.querySelector('.ui-ripple') as HTMLElement
      expect(el.style.getPropertyValue('--ripple-effect-color')).toBe('oklch(70% 0.2 120 / 0.3)')
    })

    it('sets duration as CSS variable', () => {
      const { container } = render(
        <Ripple duration={400}>Content</Ripple>
      )
      const el = container.querySelector('.ui-ripple') as HTMLElement
      expect(el.style.getPropertyValue('--ripple-effect-duration')).toBe('400ms')
    })

    it('forwards onClick handler', () => {
      let clicked = false
      const { container } = render(
        <Ripple onClick={() => { clicked = true }}>Content</Ripple>
      )
      fireEvent.click(container.querySelector('.ui-ripple')!)
      expect(clicked).toBe(true)
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<Ripple motion={2}>Content</Ripple>)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      vi.useRealTimers()
      const { container } = render(
        <Ripple><p>Accessible content</p></Ripple>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
      vi.useFakeTimers()
    })
  })
})
