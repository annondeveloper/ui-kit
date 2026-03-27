import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DensitySelector } from '../../domain/density-selector'

expect.extend(toHaveNoViolations)

describe('DensitySelector', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders 3 radio options', () => {
      render(<DensitySelector />)
      const radios = screen.getAllByRole('radio')
      expect(radios).toHaveLength(3)
    })

    it('renders compact, comfortable, and spacious options', () => {
      render(<DensitySelector />)
      expect(screen.getByRole('radio', { name: 'compact' })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: 'comfortable' })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: 'spacious' })).toBeInTheDocument()
    })

    it('defaults to comfortable', () => {
      render(<DensitySelector />)
      expect(screen.getByRole('radio', { name: 'comfortable' })).toHaveAttribute('aria-checked', 'true')
    })

    it('respects defaultValue prop', () => {
      render(<DensitySelector defaultValue="compact" />)
      expect(screen.getByRole('radio', { name: 'compact' })).toHaveAttribute('aria-checked', 'true')
    })

    it('renders with size="sm"', () => {
      const { container } = render(<DensitySelector size="sm" />)
      expect(container.firstElementChild).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="md" by default', () => {
      const { container } = render(<DensitySelector />)
      expect(container.firstElementChild).toHaveAttribute('data-size', 'md')
    })

    it('applies radiogroup role', () => {
      render(<DensitySelector />)
      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })
  })

  // ─── Interaction tests ─────────────────────────────────────────────

  describe('interactions', () => {
    it('calls onChange when an option is clicked', () => {
      const onChange = vi.fn()
      render(<DensitySelector onChange={onChange} />)
      fireEvent.click(screen.getByRole('radio', { name: 'compact' }))
      expect(onChange).toHaveBeenCalledWith('compact')
    })

    it('updates internal state in uncontrolled mode', () => {
      render(<DensitySelector />)
      fireEvent.click(screen.getByRole('radio', { name: 'spacious' }))
      expect(screen.getByRole('radio', { name: 'spacious' })).toHaveAttribute('aria-checked', 'true')
    })

    it('respects controlled value prop', () => {
      render(<DensitySelector value="compact" />)
      fireEvent.click(screen.getByRole('radio', { name: 'spacious' }))
      expect(screen.getByRole('radio', { name: 'compact' })).toHaveAttribute('aria-checked', 'true')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<DensitySelector />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "DensitySelector"', () => {
      expect(DensitySelector.displayName).toBe('DensitySelector')
    })
  })
})
