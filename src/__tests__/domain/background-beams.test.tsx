import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { BackgroundBeams } from '../../domain/background-beams'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('BackgroundBeams', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<BackgroundBeams />)
      expect(container.querySelector('.ui-background-beams')).toBeInTheDocument()
    })

    it('renders children in content wrapper', () => {
      render(<BackgroundBeams><p>Hello</p></BackgroundBeams>)
      expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    it('renders beam elements', () => {
      const { container } = render(<BackgroundBeams count={4} />)
      const beams = container.querySelectorAll('.ui-background-beams--beam')
      expect(beams.length).toBe(4)
    })

    it('renders default 6 beams', () => {
      const { container } = render(<BackgroundBeams />)
      const beams = container.querySelectorAll('.ui-background-beams--beam')
      expect(beams.length).toBe(6)
    })

    it('has displayName', () => {
      expect(BackgroundBeams.displayName).toBe('BackgroundBeams')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(<BackgroundBeams className="custom" />)
      expect(container.querySelector('.ui-background-beams.custom')).toBeInTheDocument()
    })

    it('applies color as CSS variable', () => {
      const { container } = render(
        <BackgroundBeams color="oklch(70% 0.2 120)" />
      )
      const el = container.querySelector('.ui-background-beams') as HTMLElement
      expect(el.style.getPropertyValue('--beam-color')).toBe('oklch(70% 0.2 120)')
    })

    it('passes data attributes', () => {
      render(<BackgroundBeams data-testid="bb" />)
      expect(screen.getByTestId('bb')).toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<BackgroundBeams motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<BackgroundBeams motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Beam elements ────────────────────────────────────────────────

  describe('beam elements', () => {
    it('beams are aria-hidden', () => {
      const { container } = render(<BackgroundBeams count={2} />)
      const beams = container.querySelectorAll('.ui-background-beams--beam')
      beams.forEach(beam => {
        expect(beam.getAttribute('aria-hidden')).toBe('true')
      })
    })

    it('beams have inline style variables', () => {
      const { container } = render(<BackgroundBeams count={1} />)
      const beam = container.querySelector('.ui-background-beams--beam') as HTMLElement
      expect(beam.style.getPropertyValue('--beam-angle')).toBeTruthy()
      expect(beam.style.getPropertyValue('--beam-delay')).toBeTruthy()
      expect(beam.style.getPropertyValue('--beam-duration')).toBeTruthy()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <BackgroundBeams><p>Content</p></BackgroundBeams>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
