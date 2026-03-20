import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ViewTransitionLink } from '../../domain/view-transition-link'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('ViewTransitionLink', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders as an anchor element', () => {
      render(<ViewTransitionLink href="/about">About</ViewTransitionLink>)
      expect(screen.getByRole('link')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(<ViewTransitionLink href="/about">About Page</ViewTransitionLink>)
      expect(screen.getByText('About Page')).toBeInTheDocument()
    })

    it('renders with scope class', () => {
      const { container } = render(
        <ViewTransitionLink href="/about">About</ViewTransitionLink>
      )
      expect(container.querySelector('.ui-view-transition-link')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <ViewTransitionLink href="/about" className="custom">About</ViewTransitionLink>
      )
      expect(container.querySelector('.custom')).toBeInTheDocument()
    })
  })

  // ─── Href Forwarding ──────────────────────────────────────────────

  describe('href forwarding', () => {
    it('sets href on anchor', () => {
      render(<ViewTransitionLink href="/about">About</ViewTransitionLink>)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/about')
    })

    it('forwards target attribute', () => {
      render(
        <ViewTransitionLink href="/about" target="_blank">About</ViewTransitionLink>
      )
      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
    })

    it('forwards rel attribute', () => {
      render(
        <ViewTransitionLink href="/about" rel="noopener">About</ViewTransitionLink>
      )
      expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener')
    })

    it('forwards aria-label', () => {
      render(
        <ViewTransitionLink href="/about" aria-label="Go to about">About</ViewTransitionLink>
      )
      expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Go to about')
    })
  })

  // ─── Transition Name ──────────────────────────────────────────────

  describe('transition name', () => {
    it('sets view-transition-name CSS property', () => {
      const { container } = render(
        <ViewTransitionLink href="/about" transitionName="hero-image">About</ViewTransitionLink>
      )
      const link = container.querySelector('.ui-view-transition-link')
      expect(link).toHaveStyle({ viewTransitionName: 'hero-image' })
    })

    it('does not set view-transition-name when not provided', () => {
      const { container } = render(
        <ViewTransitionLink href="/about">About</ViewTransitionLink>
      )
      const link = container.querySelector('.ui-view-transition-link')
      // No inline style for view-transition-name
      expect(link?.getAttribute('style')).toBeNull()
    })
  })

  // ─── Click Behavior ───────────────────────────────────────────────

  describe('click behavior', () => {
    it('calls startViewTransition when API available', async () => {
      const startViewTransition = vi.fn((cb: () => void) => {
        cb()
        return { ready: Promise.resolve(), finished: Promise.resolve(), updateCallbackDone: Promise.resolve(), skipTransition: vi.fn() }
      });
      // Patch the method on the real document object
      (document as any).startViewTransition = startViewTransition

      render(<ViewTransitionLink href="/about">About</ViewTransitionLink>)
      await userEvent.click(screen.getByRole('link'))
      expect(startViewTransition).toHaveBeenCalled()

      // Cleanup
      delete (document as any).startViewTransition
    })

    it('calls onClick handler when provided', async () => {
      const onClick = vi.fn((e: any) => e.preventDefault())
      render(
        <ViewTransitionLink href="/about" onClick={onClick}>About</ViewTransitionLink>
      )
      await userEvent.click(screen.getByRole('link'))
      expect(onClick).toHaveBeenCalled()
    })
  })

  // ─── Fallback ─────────────────────────────────────────────────────

  describe('fallback without API', () => {
    it('still navigates when View Transitions API not available', () => {
      // By default in jsdom, startViewTransition is not available
      render(<ViewTransitionLink href="/about">About</ViewTransitionLink>)
      const link = screen.getByRole('link')
      // Link should still be a valid anchor that can navigate
      expect(link).toHaveAttribute('href', '/about')
    })

    it('does not throw when API not available and clicked', async () => {
      render(<ViewTransitionLink href="/about">About</ViewTransitionLink>)
      // Should not throw
      expect(() => {
        fireEvent.click(screen.getByRole('link'))
      }).not.toThrow()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <ViewTransitionLink href="/about">About</ViewTransitionLink>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('is focusable', () => {
      render(<ViewTransitionLink href="/about">About</ViewTransitionLink>)
      const link = screen.getByRole('link')
      link.focus()
      expect(document.activeElement).toBe(link)
    })
  })
})
