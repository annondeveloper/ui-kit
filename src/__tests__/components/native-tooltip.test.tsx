import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { NativeTooltip } from '../../components/native-tooltip'

expect.extend(toHaveNoViolations)

describe('NativeTooltip', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the child element', () => {
      render(
        <NativeTooltip content="Help text">
          <button>Hover me</button>
        </NativeTooltip>
      )
      expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument()
    })

    it('sets title attribute on the child', () => {
      render(
        <NativeTooltip content="Help text">
          <button>Hover me</button>
        </NativeTooltip>
      )
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Help text')
    })

    it('renders child with its existing props intact', () => {
      render(
        <NativeTooltip content="Help text">
          <button className="my-btn" data-testid="my-button">Click</button>
        </NativeTooltip>
      )
      const btn = screen.getByTestId('my-button')
      expect(btn).toHaveClass('my-btn')
      expect(btn).toHaveAttribute('title', 'Help text')
    })

    it('updates title when content changes', () => {
      const { rerender } = render(
        <NativeTooltip content="First">
          <button>Hover me</button>
        </NativeTooltip>
      )
      expect(screen.getByRole('button')).toHaveAttribute('title', 'First')

      rerender(
        <NativeTooltip content="Second">
          <button>Hover me</button>
        </NativeTooltip>
      )
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Second')
    })

    it('renders with empty string content', () => {
      render(
        <NativeTooltip content="">
          <button>Hover me</button>
        </NativeTooltip>
      )
      expect(screen.getByRole('button')).toHaveAttribute('title', '')
    })

    it('handles span element as child', () => {
      render(
        <NativeTooltip content="Info">
          <span data-testid="span-child">Some text</span>
        </NativeTooltip>
      )
      expect(screen.getByTestId('span-child')).toHaveAttribute('title', 'Info')
    })

    it('handles anchor element as child', () => {
      render(
        <NativeTooltip content="Link info">
          <a href="#test">Link</a>
        </NativeTooltip>
      )
      expect(screen.getByRole('link')).toHaveAttribute('title', 'Link info')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <NativeTooltip content="Help text">
          <button>Hover me</button>
        </NativeTooltip>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
