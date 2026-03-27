import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ActionIcon } from '../../components/action-icon'

expect.extend(toHaveNoViolations)

describe('ActionIcon', () => {
  afterEach(() => {
    cleanup()
  })

  const icon = <svg data-testid="test-icon"><path d="M0 0" /></svg>

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a button element', () => {
      render(<ActionIcon aria-label="Close">{icon}</ActionIcon>)
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('applies ui-action-icon class', () => {
      render(<ActionIcon aria-label="Close">{icon}</ActionIcon>)
      const button = screen.getByRole('button', { name: 'Close' })
      expect(button.className).toContain('ui-action-icon')
    })

    it('has type="button" by default', () => {
      render(<ActionIcon aria-label="Close">{icon}</ActionIcon>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('renders children (icon) inside button', () => {
      render(<ActionIcon aria-label="Close">{icon}</ActionIcon>)
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })

    it('applies default variant="subtle"', () => {
      render(<ActionIcon aria-label="Close">{icon}</ActionIcon>)
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'subtle')
    })

    it('applies default color="default"', () => {
      render(<ActionIcon aria-label="Close">{icon}</ActionIcon>)
      expect(screen.getByRole('button')).toHaveAttribute('data-color', 'default')
    })

    it('applies default size="md"', () => {
      render(<ActionIcon aria-label="Close">{icon}</ActionIcon>)
      expect(screen.getByRole('button')).toHaveAttribute('data-size', 'md')
    })

    it('applies default radius="md"', () => {
      render(<ActionIcon aria-label="Close">{icon}</ActionIcon>)
      expect(screen.getByRole('button')).toHaveAttribute('data-radius', 'md')
    })
  })

  // ─── Variants ──────────────────────────────────────────────────────

  describe('variants', () => {
    it.each(['filled', 'light', 'outline', 'subtle', 'transparent'] as const)(
      'renders with variant="%s"',
      (variant) => {
        render(<ActionIcon aria-label="Close" variant={variant}>{icon}</ActionIcon>)
        expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant)
      }
    )
  })

  // ─── Colors ────────────────────────────────────────────────────────

  describe('colors', () => {
    it.each(['default', 'primary', 'success', 'warning', 'danger'] as const)(
      'renders with color="%s"',
      (color) => {
        render(<ActionIcon aria-label="Close" color={color}>{icon}</ActionIcon>)
        expect(screen.getByRole('button')).toHaveAttribute('data-color', color)
      }
    )
  })

  // ─── Sizes ─────────────────────────────────────────────────────────

  describe('sizes', () => {
    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
      'renders with size="%s"',
      (size) => {
        render(<ActionIcon aria-label="Close" size={size}>{icon}</ActionIcon>)
        expect(screen.getByRole('button')).toHaveAttribute('data-size', size)
      }
    )
  })

  // ─── Radius ────────────────────────────────────────────────────────

  describe('radius', () => {
    it.each(['sm', 'md', 'lg', 'full'] as const)(
      'renders with radius="%s"',
      (radius) => {
        render(<ActionIcon aria-label="Close" radius={radius}>{icon}</ActionIcon>)
        expect(screen.getByRole('button')).toHaveAttribute('data-radius', radius)
      }
    )
  })

  // ─── Loading ───────────────────────────────────────────────────────

  describe('loading', () => {
    it('sets data-loading when loading is true', () => {
      render(<ActionIcon aria-label="Close" loading>{icon}</ActionIcon>)
      expect(screen.getByRole('button')).toHaveAttribute('data-loading', 'true')
    })

    it('sets aria-busy when loading', () => {
      render(<ActionIcon aria-label="Close" loading>{icon}</ActionIcon>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })

    it('does not set data-loading when loading is false', () => {
      render(<ActionIcon aria-label="Close">{icon}</ActionIcon>)
      expect(screen.getByRole('button')).not.toHaveAttribute('data-loading')
    })
  })

  // ─── Disabled ──────────────────────────────────────────────────────

  describe('disabled', () => {
    it('sets disabled attribute on button', () => {
      render(<ActionIcon aria-label="Close" disabled>{icon}</ActionIcon>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('sets aria-disabled when disabled', () => {
      render(<ActionIcon aria-label="Close" disabled>{icon}</ActionIcon>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
    })
  })

  // ─── Click ─────────────────────────────────────────────────────────

  describe('click', () => {
    it('calls onClick handler', async () => {
      const onClick = vi.fn()
      render(<ActionIcon aria-label="Close" onClick={onClick}>{icon}</ActionIcon>)
      await userEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Motion ────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion attribute', () => {
      render(<ActionIcon aria-label="Close" motion={2}>{icon}</ActionIcon>)
      expect(screen.getByRole('button')).toHaveAttribute('data-motion', '2')
    })
  })

  // ─── Ref & className ──────────────────────────────────────────────

  describe('ref and className', () => {
    it('forwards ref to button element', () => {
      const ref = createRef<HTMLButtonElement>()
      render(<ActionIcon ref={ref} aria-label="Close">{icon}</ActionIcon>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it('merges custom className', () => {
      render(<ActionIcon aria-label="Close" className="custom">{icon}</ActionIcon>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('ui-action-icon')
      expect(button.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<ActionIcon aria-label="Close" data-testid="my-icon" id="icon-1">{icon}</ActionIcon>)
      expect(screen.getByTestId('my-icon')).toHaveAttribute('id', 'icon-1')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (default)', async () => {
      const { container } = render(<ActionIcon aria-label="Close">{icon}</ActionIcon>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (loading)', async () => {
      const { container } = render(<ActionIcon aria-label="Close" loading>{icon}</ActionIcon>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<ActionIcon aria-label="Close">{icon}</ActionIcon>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-action-icon)', () => {
      render(<ActionIcon aria-label="Close">{icon}</ActionIcon>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-action-icon)')
    })
  })

  // ─── Display name ──────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "ActionIcon"', () => {
      expect(ActionIcon.displayName).toBe('ActionIcon')
    })
  })
})
