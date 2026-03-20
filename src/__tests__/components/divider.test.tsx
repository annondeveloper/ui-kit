import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Divider } from '../../components/divider'

expect.extend(toHaveNoViolations)

describe('Divider', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with ui-divider scope class', () => {
      const { container } = render(<Divider />)
      expect(container.querySelector('.ui-divider')).toBeInTheDocument()
    })

    it('renders an <hr> element for horizontal orientation', () => {
      const { container } = render(<Divider />)
      expect(container.querySelector('hr')).toBeInTheDocument()
    })

    it('renders role="separator"', () => {
      render(<Divider />)
      expect(screen.getByRole('separator')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<Divider className="custom-div" />)
      expect(container.querySelector('.ui-divider')).toHaveClass('custom-div')
    })

    it('spreads additional HTML attributes', () => {
      render(<Divider data-testid="my-divider" />)
      expect(screen.getByTestId('my-divider')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(Divider.displayName).toBe('Divider')
    })
  })

  // ─── Orientation ──────────────────────────────────────────────────

  describe('orientation', () => {
    it('defaults to horizontal', () => {
      const { container } = render(<Divider />)
      expect(container.querySelector('.ui-divider')).toHaveAttribute('data-orientation', 'horizontal')
    })

    it('renders horizontal orientation', () => {
      const { container } = render(<Divider orientation="horizontal" />)
      expect(container.querySelector('.ui-divider')).toHaveAttribute('data-orientation', 'horizontal')
    })

    it('renders vertical orientation', () => {
      const { container } = render(<Divider orientation="vertical" />)
      expect(container.querySelector('.ui-divider')).toHaveAttribute('data-orientation', 'vertical')
    })

    it('sets aria-orientation="vertical" for vertical', () => {
      render(<Divider orientation="vertical" />)
      expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
    })

    it('does not set aria-orientation for horizontal (default)', () => {
      render(<Divider orientation="horizontal" />)
      // horizontal is the default for separator, so aria-orientation not needed
      expect(screen.getByRole('separator')).not.toHaveAttribute('aria-orientation')
    })
  })

  // ─── Variants ─────────────────────────────────────────────────────

  describe('variants', () => {
    it('defaults to solid variant', () => {
      const { container } = render(<Divider />)
      expect(container.querySelector('.ui-divider')).toHaveAttribute('data-variant', 'solid')
    })

    it.each(['solid', 'dashed', 'dotted'] as const)('applies variant="%s"', (variant) => {
      const { container } = render(<Divider variant={variant} />)
      expect(container.querySelector('.ui-divider')).toHaveAttribute('data-variant', variant)
    })
  })

  // ─── Label ────────────────────────────────────────────────────────

  describe('label', () => {
    it('renders label text', () => {
      render(<Divider label="or" />)
      expect(screen.getByText('or')).toBeInTheDocument()
    })

    it('renders ReactNode label', () => {
      render(<Divider label={<strong>OR</strong>} />)
      expect(screen.getByText('OR')).toBeInTheDocument()
    })

    it('uses div instead of hr when label is present', () => {
      const { container } = render(<Divider label="or" />)
      // With label, we need a container for the lines + text
      expect(container.querySelector('.ui-divider__label')).toBeInTheDocument()
    })
  })

  // ─── Spacing ──────────────────────────────────────────────────────

  describe('spacing', () => {
    it('defaults to md spacing', () => {
      const { container } = render(<Divider />)
      expect(container.querySelector('.ui-divider')).toHaveAttribute('data-spacing', 'md')
    })

    it.each(['sm', 'md', 'lg'] as const)('applies spacing="%s"', (spacing) => {
      const { container } = render(<Divider spacing={spacing} />)
      expect(container.querySelector('.ui-divider')).toHaveAttribute('data-spacing', spacing)
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (horizontal)', async () => {
      const { container } = render(<Divider />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (vertical)', async () => {
      const { container } = render(<Divider orientation="vertical" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with label', async () => {
      const { container } = render(<Divider label="or" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
