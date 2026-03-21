import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ShimmerButton } from '../../domain/shimmer-button'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('ShimmerButton', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<ShimmerButton>Click me</ShimmerButton>)
      expect(container.querySelector('.ui-shimmer-button')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(<ShimmerButton>Click me</ShimmerButton>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('renders as a button element', () => {
      render(<ShimmerButton>Click me</ShimmerButton>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(ShimmerButton.displayName).toBe('ShimmerButton')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ShimmerButton className="custom">Click</ShimmerButton>
      )
      expect(container.querySelector('.ui-shimmer-button.custom')).toBeInTheDocument()
    })

    it('sets size data attribute', () => {
      const { container } = render(
        <ShimmerButton size="lg">Click</ShimmerButton>
      )
      expect(container.querySelector('[data-size="lg"]')).toBeInTheDocument()
    })

    it('defaults to md size', () => {
      const { container } = render(<ShimmerButton>Click</ShimmerButton>)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })

    it('applies shimmerColor as CSS variable', () => {
      const { container } = render(
        <ShimmerButton shimmerColor="oklch(70% 0.2 120)">Click</ShimmerButton>
      )
      const el = container.querySelector('.ui-shimmer-button') as HTMLElement
      expect(el.style.getPropertyValue('--shimmer-button-color')).toBe('oklch(70% 0.2 120)')
    })

    it('supports disabled state', () => {
      render(<ShimmerButton disabled>Click</ShimmerButton>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('forwards onClick handler', () => {
      let clicked = false
      render(<ShimmerButton onClick={() => { clicked = true }}>Click</ShimmerButton>)
      fireEvent.click(screen.getByRole('button'))
      expect(clicked).toBe(true)
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(
        <ShimmerButton motion={2}>Click</ShimmerButton>
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(
        <ShimmerButton motion={0}>Click</ShimmerButton>
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<ShimmerButton>Accessible</ShimmerButton>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations when disabled', async () => {
      const { container } = render(<ShimmerButton disabled>Disabled</ShimmerButton>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
