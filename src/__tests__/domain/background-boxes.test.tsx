import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { BackgroundBoxes } from '../../domain/background-boxes'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('BackgroundBoxes', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<BackgroundBoxes />)
      expect(container.querySelector('.ui-background-boxes')).toBeInTheDocument()
    })

    it('renders children in content wrapper', () => {
      render(<BackgroundBoxes><p>Hello</p></BackgroundBoxes>)
      expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    it('renders grid container', () => {
      const { container } = render(<BackgroundBoxes />)
      expect(container.querySelector('.ui-background-boxes--grid')).toBeInTheDocument()
    })

    it('renders correct number of boxes', () => {
      const { container } = render(<BackgroundBoxes rows={3} cols={4} />)
      const boxes = container.querySelectorAll('.ui-background-boxes--box')
      expect(boxes.length).toBe(12)
    })

    it('renders default 225 boxes (15x15)', () => {
      const { container } = render(<BackgroundBoxes />)
      const boxes = container.querySelectorAll('.ui-background-boxes--box')
      expect(boxes.length).toBe(225)
    })

    it('has displayName', () => {
      expect(BackgroundBoxes.displayName).toBe('BackgroundBoxes')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(<BackgroundBoxes className="custom" />)
      expect(container.querySelector('.ui-background-boxes.custom')).toBeInTheDocument()
    })

    it('sets grid template CSS variables', () => {
      const { container } = render(<BackgroundBoxes rows={5} cols={8} />)
      const el = container.querySelector('.ui-background-boxes') as HTMLElement
      expect(el.style.getPropertyValue('--boxes-rows')).toBe('repeat(5, 1fr)')
      expect(el.style.getPropertyValue('--boxes-cols')).toBe('repeat(8, 1fr)')
    })

    it('passes data attributes', () => {
      render(<BackgroundBoxes data-testid="bb" />)
      expect(screen.getByTestId('bb')).toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<BackgroundBoxes motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<BackgroundBoxes motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Grid structure ───────────────────────────────────────────────

  describe('grid', () => {
    it('grid is aria-hidden', () => {
      const { container } = render(<BackgroundBoxes />)
      const grid = container.querySelector('.ui-background-boxes--grid')
      expect(grid?.getAttribute('aria-hidden')).toBe('true')
    })

    it('boxes have inline style variables', () => {
      const { container } = render(<BackgroundBoxes rows={1} cols={1} />)
      const box = container.querySelector('.ui-background-boxes--box') as HTMLElement
      expect(box.style.getPropertyValue('--box-delay')).toBeTruthy()
      expect(box.style.getPropertyValue('--box-duration')).toBeTruthy()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <BackgroundBoxes rows={2} cols={2}><p>Content</p></BackgroundBoxes>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
