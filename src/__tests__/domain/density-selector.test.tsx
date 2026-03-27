import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { createRef } from 'react'
import { DensitySelector } from '../../domain/density-selector'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('DensitySelector', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<DensitySelector />)
      expect(container.querySelector('.ui-density-selector')).toBeInTheDocument()
    })

    it('renders three option buttons', () => {
      render(<DensitySelector />)
      const radios = screen.getAllByRole('radio')
      expect(radios.length).toBe(3)
    })

    it('renders option labels in md size', () => {
      render(<DensitySelector size="md" />)
      expect(screen.getByText('compact')).toBeInTheDocument()
      expect(screen.getByText('comfortable')).toBeInTheDocument()
      expect(screen.getByText('spacious')).toBeInTheDocument()
    })

    it('renders sliding indicator', () => {
      const { container } = render(<DensitySelector />)
      expect(container.querySelector('.ui-density-selector__indicator')).toBeInTheDocument()
    })

    it('defaults to comfortable', () => {
      render(<DensitySelector />)
      const comfortable = screen.getByRole('radio', { name: 'comfortable' })
      expect(comfortable).toHaveAttribute('aria-checked', 'true')
    })
  })

  // ─── Controlled / Uncontrolled ─────────────────────────────────────

  describe('controlled / uncontrolled', () => {
    it('uses controlled value', () => {
      render(<DensitySelector value="compact" />)
      const compact = screen.getByRole('radio', { name: 'compact' })
      expect(compact).toHaveAttribute('aria-checked', 'true')
    })

    it('calls onChange when option is clicked', () => {
      const onChange = vi.fn()
      render(<DensitySelector onChange={onChange} />)
      fireEvent.click(screen.getByRole('radio', { name: 'spacious' }))
      expect(onChange).toHaveBeenCalledWith('spacious')
    })

    it('uncontrolled updates internal state', () => {
      render(<DensitySelector />)
      fireEvent.click(screen.getByRole('radio', { name: 'compact' }))
      expect(screen.getByRole('radio', { name: 'compact' })).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByRole('radio', { name: 'comfortable' })).toHaveAttribute('aria-checked', 'false')
    })

    it('respects custom defaultValue', () => {
      render(<DensitySelector defaultValue="spacious" />)
      expect(screen.getByRole('radio', { name: 'spacious' })).toHaveAttribute('aria-checked', 'true')
    })
  })

  // ─── Size ─────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('renders sm size', () => {
      const { container } = render(<DensitySelector size="sm" />)
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })

    it('renders md size', () => {
      const { container } = render(<DensitySelector size="md" />)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })
  })

  // ─── Ref forwarding ───────────────────────────────────────────────

  describe('ref forwarding', () => {
    it('forwards ref to root element', () => {
      const ref = createRef<HTMLDivElement>()
      render(<DensitySelector ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current?.classList.contains('ui-density-selector')).toBe(true)
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<DensitySelector motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<DensitySelector motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ─────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<DensitySelector className="custom" />)
      expect(container.querySelector('.ui-density-selector.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<DensitySelector data-testid="density" />)
      expect(screen.getByTestId('density')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(DensitySelector.displayName).toBe('DensitySelector')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has radiogroup role', () => {
      render(<DensitySelector />)
      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })

    it('has aria-label on radiogroup', () => {
      render(<DensitySelector />)
      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'UI density')
    })

    it('options have radio role with aria-checked', () => {
      render(<DensitySelector />)
      const radios = screen.getAllByRole('radio')
      const checked = radios.filter(r => r.getAttribute('aria-checked') === 'true')
      expect(checked.length).toBe(1)
    })

    it('has no axe violations', async () => {
      const { container } = render(<DensitySelector />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with all options', async () => {
      const { container } = render(<DensitySelector value="spacious" size="sm" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
