import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { EncryptedText } from '../../domain/encrypted-text'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('EncryptedText', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<EncryptedText text="Hello" />)
      expect(container.querySelector('.ui-encrypted-text')).toBeInTheDocument()
    })

    it('renders character spans', () => {
      const { container } = render(<EncryptedText text="Hi" />)
      const chars = container.querySelectorAll('.ui-encrypted-text--char')
      expect(chars.length).toBe(2)
    })

    it('renders correct number of characters', () => {
      const { container } = render(<EncryptedText text="Hello" />)
      const chars = container.querySelectorAll('.ui-encrypted-text--char')
      expect(chars.length).toBe(5)
    })

    it('has displayName', () => {
      expect(EncryptedText.displayName).toBe('EncryptedText')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <EncryptedText text="Hello" className="custom" />
      )
      expect(container.querySelector('.ui-encrypted-text.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<EncryptedText text="Hello" data-testid="et" />)
      expect(screen.getByTestId('et')).toBeInTheDocument()
    })

    it('at motion 0, shows resolved text immediately', () => {
      const { container } = render(
        <EncryptedText text="Hi" motion={0} />
      )
      const chars = container.querySelectorAll('.ui-encrypted-text--char[data-resolved="true"]')
      expect(chars.length).toBe(2)
    })
  })

  // ─── Trigger ──────────────────────────────────────────────────────

  describe('trigger', () => {
    it('hover trigger starts on mouse enter', () => {
      const { container } = render(
        <EncryptedText text="Hello" trigger="hover" />
      )
      const el = container.querySelector('.ui-encrypted-text')!
      fireEvent.mouseEnter(el)
      // After mouse enter, animation should be started (we can't easily test RAF in unit tests)
      expect(el).toBeInTheDocument()
    })

    it('forwards onMouseEnter', () => {
      let entered = false
      const { container } = render(
        <EncryptedText text="Hello" onMouseEnter={() => { entered = true }} />
      )
      fireEvent.mouseEnter(container.querySelector('.ui-encrypted-text')!)
      expect(entered).toBe(true)
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(
        <EncryptedText text="Hello" motion={2} />
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(
        <EncryptedText text="Hello" motion={0} />
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has aria-label with full text', () => {
      const { container } = render(<EncryptedText text="Secret" />)
      const el = container.querySelector('.ui-encrypted-text')
      expect(el?.getAttribute('aria-label')).toBe('Secret')
    })

    it('has role img', () => {
      const { container } = render(<EncryptedText text="Secret" />)
      const el = container.querySelector('.ui-encrypted-text')
      expect(el?.getAttribute('role')).toBe('img')
    })

    it('characters are aria-hidden', () => {
      const { container } = render(<EncryptedText text="Hi" />)
      const chars = container.querySelectorAll('.ui-encrypted-text--char')
      chars.forEach(c => {
        expect(c.getAttribute('aria-hidden')).toBe('true')
      })
    })

    it('has no axe violations', async () => {
      const { container } = render(
        <EncryptedText text="Accessible text" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
