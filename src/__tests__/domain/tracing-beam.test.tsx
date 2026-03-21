import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TracingBeam } from '../../domain/tracing-beam'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('TracingBeam', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<TracingBeam>Content</TracingBeam>)
      expect(container.querySelector('.ui-tracing-beam')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(<TracingBeam><p>Article content</p></TracingBeam>)
      expect(screen.getByText('Article content')).toBeInTheDocument()
    })

    it('renders track element', () => {
      const { container } = render(<TracingBeam>Content</TracingBeam>)
      expect(container.querySelector('.ui-tracing-beam--track')).toBeInTheDocument()
    })

    it('renders progress element', () => {
      const { container } = render(<TracingBeam>Content</TracingBeam>)
      expect(container.querySelector('.ui-tracing-beam--progress')).toBeInTheDocument()
    })

    it('renders dot element', () => {
      const { container } = render(<TracingBeam>Content</TracingBeam>)
      expect(container.querySelector('.ui-tracing-beam--dot')).toBeInTheDocument()
    })

    it('renders content wrapper', () => {
      const { container } = render(<TracingBeam>Content</TracingBeam>)
      expect(container.querySelector('.ui-tracing-beam--content')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(TracingBeam.displayName).toBe('TracingBeam')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <TracingBeam className="custom">Content</TracingBeam>
      )
      expect(container.querySelector('.ui-tracing-beam.custom')).toBeInTheDocument()
    })

    it('applies color as CSS variable', () => {
      const { container } = render(
        <TracingBeam color="oklch(70% 0.2 120)">Content</TracingBeam>
      )
      const el = container.querySelector('.ui-tracing-beam') as HTMLElement
      expect(el.style.getPropertyValue('--tracing-beam-color')).toBe('oklch(70% 0.2 120)')
    })

    it('passes data attributes', () => {
      render(<TracingBeam data-testid="tb">Content</TracingBeam>)
      expect(screen.getByTestId('tb')).toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(
        <TracingBeam motion={2}>Content</TracingBeam>
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(
        <TracingBeam motion={0}>Content</TracingBeam>
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Track ────────────────────────────────────────────────────────

  describe('track', () => {
    it('track is aria-hidden', () => {
      const { container } = render(<TracingBeam>Content</TracingBeam>)
      const track = container.querySelector('.ui-tracing-beam--track')
      expect(track?.getAttribute('aria-hidden')).toBe('true')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <TracingBeam><p>Accessible content</p></TracingBeam>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
