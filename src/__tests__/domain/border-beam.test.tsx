import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { BorderBeam } from '../../domain/border-beam'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('BorderBeam', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<BorderBeam>Content</BorderBeam>)
      expect(container.querySelector('.ui-border-beam')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(<BorderBeam>Hello beam</BorderBeam>)
      expect(screen.getByText('Hello beam')).toBeInTheDocument()
    })

    it('wraps children in content div', () => {
      const { container } = render(<BorderBeam>Content</BorderBeam>)
      expect(container.querySelector('.ui-border-beam--content')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(BorderBeam.displayName).toBe('BorderBeam')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <BorderBeam className="custom">Content</BorderBeam>
      )
      expect(container.querySelector('.ui-border-beam.custom')).toBeInTheDocument()
    })

    it('sets duration as CSS variable', () => {
      const { container } = render(
        <BorderBeam duration={10}>Content</BorderBeam>
      )
      const el = container.querySelector('.ui-border-beam') as HTMLElement
      expect(el.style.getPropertyValue('--border-beam-duration')).toBe('10s')
    })

    it('sets size as CSS variable', () => {
      const { container } = render(
        <BorderBeam size={120}>Content</BorderBeam>
      )
      const el = container.querySelector('.ui-border-beam') as HTMLElement
      expect(el.style.getPropertyValue('--border-beam-size')).toBe('120px')
    })

    it('sets color as CSS variable', () => {
      const { container } = render(
        <BorderBeam color="oklch(80% 0.2 150)">Content</BorderBeam>
      )
      const el = container.querySelector('.ui-border-beam') as HTMLElement
      expect(el.style.getPropertyValue('--border-beam-color')).toBe('oklch(80% 0.2 150)')
    })

    it('passes data attributes', () => {
      render(<BorderBeam data-testid="bb">Content</BorderBeam>)
      expect(screen.getByTestId('bb')).toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(
        <BorderBeam motion={3}>Content</BorderBeam>
      )
      expect(container.querySelector('[data-motion="3"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(
        <BorderBeam motion={0}>Content</BorderBeam>
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <BorderBeam><p>Accessible content</p></BorderBeam>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with custom color', async () => {
      const { container } = render(
        <BorderBeam color="oklch(60% 0.2 30)"><p>Content</p></BorderBeam>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
