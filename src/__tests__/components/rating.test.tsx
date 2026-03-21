import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Rating } from '../../components/rating'

expect.extend(toHaveNoViolations)

describe('Rating', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a slider role element', () => {
      render(<Rating aria-label="Rating" />)
      expect(screen.getByRole('slider')).toBeInTheDocument()
    })

    it('applies ui-rating class', () => {
      const { container } = render(<Rating aria-label="Rating" />)
      expect(container.querySelector('.ui-rating')).toBeInTheDocument()
    })

    it('renders 5 stars by default', () => {
      const { container } = render(<Rating aria-label="Rating" />)
      const stars = container.querySelectorAll('.ui-rating__star')
      expect(stars.length).toBe(5)
    })

    it('renders custom number of stars', () => {
      const { container } = render(<Rating aria-label="Rating" max={10} />)
      const stars = container.querySelectorAll('.ui-rating__star')
      expect(stars.length).toBe(10)
    })

    it('renders with size="md" by default', () => {
      const { container } = render(<Rating aria-label="Rating" />)
      expect(container.querySelector('.ui-rating')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      const { container } = render(<Rating aria-label="Rating" size="sm" />)
      expect(container.querySelector('.ui-rating')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      const { container } = render(<Rating aria-label="Rating" size="lg" />)
      expect(container.querySelector('.ui-rating')).toHaveAttribute('data-size', 'lg')
    })

    it('renders filled stars based on value', () => {
      const { container } = render(<Rating aria-label="Rating" value={3} />)
      const stars = container.querySelectorAll('.ui-rating__star')
      expect(stars[0]).toHaveAttribute('data-state', 'full')
      expect(stars[1]).toHaveAttribute('data-state', 'full')
      expect(stars[2]).toHaveAttribute('data-state', 'full')
      expect(stars[3]).toHaveAttribute('data-state', 'empty')
      expect(stars[4]).toHaveAttribute('data-state', 'empty')
    })

    it('renders half-filled star for half values', () => {
      const { container } = render(<Rating aria-label="Rating" value={3.5} allowHalf />)
      const stars = container.querySelectorAll('.ui-rating__star')
      expect(stars[0]).toHaveAttribute('data-state', 'full')
      expect(stars[2]).toHaveAttribute('data-state', 'full')
      expect(stars[3]).toHaveAttribute('data-state', 'half')
      expect(stars[4]).toHaveAttribute('data-state', 'empty')
    })

    it('sets aria-valuenow to current value', () => {
      render(<Rating aria-label="Rating" value={4} />)
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '4')
    })

    it('sets aria-valuemin to 0', () => {
      render(<Rating aria-label="Rating" />)
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemin', '0')
    })

    it('sets aria-valuemax to max', () => {
      render(<Rating aria-label="Rating" max={10} />)
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemax', '10')
    })
  })

  // ─── Click interaction ────────────────────────────────────────────

  describe('click interaction', () => {
    it('calls onChange when a star is clicked', () => {
      const onChange = vi.fn()
      const { container } = render(<Rating aria-label="Rating" onChange={onChange} />)
      const stars = container.querySelectorAll('.ui-rating__star')
      fireEvent.click(stars[2])
      expect(onChange).toHaveBeenCalledWith(3)
    })

    it('calls onChange with correct value for first star', () => {
      const onChange = vi.fn()
      const { container } = render(<Rating aria-label="Rating" onChange={onChange} />)
      const stars = container.querySelectorAll('.ui-rating__star')
      fireEvent.click(stars[0])
      expect(onChange).toHaveBeenCalledWith(1)
    })

    it('calls onChange with correct value for last star', () => {
      const onChange = vi.fn()
      const { container } = render(<Rating aria-label="Rating" onChange={onChange} />)
      const stars = container.querySelectorAll('.ui-rating__star')
      fireEvent.click(stars[4])
      expect(onChange).toHaveBeenCalledWith(5)
    })

    it('does not call onChange in readOnly mode', () => {
      const onChange = vi.fn()
      const { container } = render(<Rating aria-label="Rating" onChange={onChange} readOnly />)
      const stars = container.querySelectorAll('.ui-rating__star')
      fireEvent.click(stars[2])
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── Hover preview ────────────────────────────────────────────────

  describe('hover preview', () => {
    it('shows hover preview on mouse enter', () => {
      const { container } = render(<Rating aria-label="Rating" />)
      const stars = container.querySelectorAll('.ui-rating__star')
      fireEvent.mouseEnter(stars[3])
      // Stars up to hovered should have hover state
      expect(stars[0]).toHaveAttribute('data-hover', 'true')
      expect(stars[3]).toHaveAttribute('data-hover', 'true')
      expect(stars[4]).not.toHaveAttribute('data-hover', 'true')
    })

    it('clears hover preview on mouse leave', () => {
      const { container } = render(<Rating aria-label="Rating" />)
      const root = container.querySelector('.ui-rating')!
      const stars = container.querySelectorAll('.ui-rating__star')
      fireEvent.mouseEnter(stars[2])
      fireEvent.mouseLeave(root)
      expect(stars[0]).not.toHaveAttribute('data-hover', 'true')
      expect(stars[2]).not.toHaveAttribute('data-hover', 'true')
    })

    it('does not show hover in readOnly mode', () => {
      const { container } = render(<Rating aria-label="Rating" readOnly value={3} />)
      const stars = container.querySelectorAll('.ui-rating__star')
      fireEvent.mouseEnter(stars[4])
      expect(stars[4]).not.toHaveAttribute('data-hover', 'true')
    })
  })

  // ─── Keyboard navigation ─────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('increases value on ArrowRight', () => {
      const onChange = vi.fn()
      render(<Rating aria-label="Rating" value={3} onChange={onChange} />)
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
      expect(onChange).toHaveBeenCalledWith(4)
    })

    it('increases value on ArrowUp', () => {
      const onChange = vi.fn()
      render(<Rating aria-label="Rating" value={3} onChange={onChange} />)
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowUp' })
      expect(onChange).toHaveBeenCalledWith(4)
    })

    it('decreases value on ArrowLeft', () => {
      const onChange = vi.fn()
      render(<Rating aria-label="Rating" value={3} onChange={onChange} />)
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' })
      expect(onChange).toHaveBeenCalledWith(2)
    })

    it('decreases value on ArrowDown', () => {
      const onChange = vi.fn()
      render(<Rating aria-label="Rating" value={3} onChange={onChange} />)
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowDown' })
      expect(onChange).toHaveBeenCalledWith(2)
    })

    it('sets to max on End key', () => {
      const onChange = vi.fn()
      render(<Rating aria-label="Rating" value={3} onChange={onChange} />)
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
      expect(onChange).toHaveBeenCalledWith(5)
    })

    it('sets to min (0) on Home key', () => {
      const onChange = vi.fn()
      render(<Rating aria-label="Rating" value={3} onChange={onChange} />)
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'Home' })
      expect(onChange).toHaveBeenCalledWith(0)
    })

    it('does not go below 0', () => {
      const onChange = vi.fn()
      render(<Rating aria-label="Rating" value={0} onChange={onChange} />)
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowLeft' })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not go above max', () => {
      const onChange = vi.fn()
      render(<Rating aria-label="Rating" value={5} onChange={onChange} />)
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('uses half steps when allowHalf is true', () => {
      const onChange = vi.fn()
      render(<Rating aria-label="Rating" value={3} onChange={onChange} allowHalf />)
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
      expect(onChange).toHaveBeenCalledWith(3.5)
    })
  })

  // ─── Read-only mode ───────────────────────────────────────────────

  describe('readOnly mode', () => {
    it('sets data-readonly attribute', () => {
      const { container } = render(<Rating aria-label="Rating" readOnly />)
      expect(container.querySelector('.ui-rating')).toHaveAttribute('data-readonly', 'true')
    })

    it('sets aria-readonly on slider', () => {
      render(<Rating aria-label="Rating" readOnly />)
      expect(screen.getByRole('slider')).toHaveAttribute('aria-readonly', 'true')
    })

    it('does not respond to keyboard in readOnly mode', () => {
      const onChange = vi.fn()
      render(<Rating aria-label="Rating" value={3} onChange={onChange} readOnly />)
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── Uncontrolled mode ────────────────────────────────────────────

  describe('uncontrolled mode', () => {
    it('works with defaultValue', () => {
      render(<Rating aria-label="Rating" defaultValue={3} />)
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '3')
    })

    it('updates internal value on click in uncontrolled mode', () => {
      const { container } = render(<Rating aria-label="Rating" defaultValue={1} />)
      const stars = container.querySelectorAll('.ui-rating__star')
      fireEvent.click(stars[3])
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '4')
    })
  })

  // ─── Ref and props forwarding ─────────────────────────────────────

  describe('ref and props forwarding', () => {
    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Rating ref={ref} aria-label="Rating" />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards className', () => {
      const { container } = render(<Rating aria-label="Rating" className="custom" />)
      expect(container.querySelector('.ui-rating')!.className).toContain('custom')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<Rating aria-label="Rating" value={3} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (readOnly)', async () => {
      const { container } = render(<Rating aria-label="Rating" value={4} readOnly />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Rating aria-label="Rating" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-rating)', () => {
      render(<Rating aria-label="Rating" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-rating)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Rating"', () => {
      expect(Rating.displayName).toBe('Rating')
    })
  })
})
