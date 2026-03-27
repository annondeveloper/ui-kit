import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { BackToTop } from '../../components/back-to-top'

expect.extend(toHaveNoViolations)

describe('BackToTop', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a button element', () => {
      render(<BackToTop />)
      const button = screen.getByRole('button', { name: 'Back to top' })
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })

    it('applies ui-back-to-top class', () => {
      render(<BackToTop />)
      const button = screen.getByRole('button', { name: 'Back to top' })
      expect(button.className).toContain('ui-back-to-top')
    })

    it('has type="button"', () => {
      render(<BackToTop />)
      const button = screen.getByRole('button', { name: 'Back to top' })
      expect(button).toHaveAttribute('type', 'button')
    })

    it('has aria-label="Back to top"', () => {
      render(<BackToTop />)
      expect(screen.getByLabelText('Back to top')).toBeInTheDocument()
    })

    it('renders the arrow-up icon SVG', () => {
      const { container } = render(<BackToTop />)
      const svg = container.querySelector('.ui-back-to-top__icon svg')
      expect(svg).toBeInTheDocument()
    })

    it('starts hidden (data-visible="false") when scroll is at top', () => {
      render(<BackToTop />)
      const button = screen.getByRole('button', { name: 'Back to top' })
      expect(button).toHaveAttribute('data-visible', 'false')
    })
  })

  // ─── Size ──────────────────────────────────────────────────────────

  describe('size', () => {
    it('applies sm size dimensions (36px)', () => {
      render(<BackToTop size="sm" />)
      const button = screen.getByRole('button', { name: 'Back to top' })
      expect(button.style.inlineSize).toBe('36px')
      expect(button.style.blockSize).toBe('36px')
    })

    it('applies md size dimensions (44px) by default', () => {
      render(<BackToTop />)
      const button = screen.getByRole('button', { name: 'Back to top' })
      expect(button.style.inlineSize).toBe('44px')
      expect(button.style.blockSize).toBe('44px')
    })

    it('applies lg size dimensions (56px)', () => {
      render(<BackToTop size="lg" />)
      const button = screen.getByRole('button', { name: 'Back to top' })
      expect(button.style.inlineSize).toBe('56px')
      expect(button.style.blockSize).toBe('56px')
    })
  })

  // ─── Progress ring ─────────────────────────────────────────────────

  describe('progress ring', () => {
    it('does not render progress SVG by default', () => {
      const { container } = render(<BackToTop />)
      expect(container.querySelector('.ui-back-to-top__progress')).not.toBeInTheDocument()
    })

    it('renders progress SVG when showProgress is true', () => {
      const { container } = render(<BackToTop showProgress />)
      expect(container.querySelector('.ui-back-to-top__progress')).toBeInTheDocument()
    })

    it('renders progress track and fill circles', () => {
      const { container } = render(<BackToTop showProgress />)
      expect(container.querySelector('.ui-back-to-top__progress-track')).toBeInTheDocument()
      expect(container.querySelector('.ui-back-to-top__progress-fill')).toBeInTheDocument()
    })
  })

  // ─── Click handler ─────────────────────────────────────────────────

  describe('click', () => {
    it('calls window.scrollTo on click', async () => {
      const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
      render(<BackToTop />)
      const button = screen.getByRole('button', { name: 'Back to top' })
      await userEvent.click(button)
      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
      scrollToSpy.mockRestore()
    })

    it('uses instant behavior when smooth is false', async () => {
      const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
      render(<BackToTop smooth={false} />)
      const button = screen.getByRole('button', { name: 'Back to top' })
      await userEvent.click(button)
      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
      scrollToSpy.mockRestore()
    })

    it('calls custom onClick handler', async () => {
      const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
      const onClick = vi.fn()
      render(<BackToTop onClick={onClick} />)
      const button = screen.getByRole('button', { name: 'Back to top' })
      await userEvent.click(button)
      expect(onClick).toHaveBeenCalledTimes(1)
      scrollToSpy.mockRestore()
    })
  })

  // ─── Motion ────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion attribute', () => {
      render(<BackToTop motion={0} />)
      const button = screen.getByRole('button', { name: 'Back to top' })
      expect(button).toHaveAttribute('data-motion', '0')
    })
  })

  // ─── Ref & className ──────────────────────────────────────────────

  describe('ref and className', () => {
    it('forwards ref to button element', () => {
      const ref = createRef<HTMLButtonElement>()
      render(<BackToTop ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it('merges custom className', () => {
      render(<BackToTop className="custom" />)
      const button = screen.getByRole('button', { name: 'Back to top' })
      expect(button.className).toContain('ui-back-to-top')
      expect(button.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<BackToTop data-testid="my-btt" id="btt-1" />)
      expect(screen.getByTestId('my-btt')).toHaveAttribute('id', 'btt-1')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<BackToTop />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<BackToTop />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-back-to-top)', () => {
      render(<BackToTop />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-back-to-top)')
    })
  })

  // ─── Display name ──────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "BackToTop"', () => {
      expect(BackToTop.displayName).toBe('BackToTop')
    })
  })
})
