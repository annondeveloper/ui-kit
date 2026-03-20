import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { EmptyState } from '../../domain/empty-state'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('EmptyState', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<EmptyState title="No items" />)
      expect(container.querySelector('.ui-empty-state')).toBeInTheDocument()
    })

    it('renders title', () => {
      render(<EmptyState title="Nothing here" />)
      expect(screen.getByText('Nothing here')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <EmptyState title="No items" className="custom" />
      )
      expect(container.querySelector('.custom')).toBeInTheDocument()
    })

    it('passes through HTML attributes', () => {
      render(<EmptyState title="No items" data-testid="empty" />)
      expect(screen.getByTestId('empty')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(EmptyState.displayName).toBe('EmptyState')
    })
  })

  // ─── Icon ───────────────────────────────────────────────────────────

  describe('icon', () => {
    it('renders icon when provided', () => {
      const { container } = render(
        <EmptyState title="No items" icon={<svg data-testid="icon" />} />
      )
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(container.querySelector('.ui-empty-state__icon')).toBeInTheDocument()
    })

    it('does not render icon area when no icon', () => {
      const { container } = render(<EmptyState title="No items" />)
      expect(container.querySelector('.ui-empty-state__icon')).not.toBeInTheDocument()
    })
  })

  // ─── Description ────────────────────────────────────────────────────

  describe('description', () => {
    it('renders description when provided', () => {
      render(
        <EmptyState title="No items" description="Try adding some items" />
      )
      expect(screen.getByText('Try adding some items')).toBeInTheDocument()
    })

    it('does not render description area when not provided', () => {
      const { container } = render(<EmptyState title="No items" />)
      expect(container.querySelector('.ui-empty-state__description')).not.toBeInTheDocument()
    })

    it('supports ReactNode description', () => {
      render(
        <EmptyState
          title="No items"
          description={<span data-testid="desc-node">Custom desc</span>}
        />
      )
      expect(screen.getByTestId('desc-node')).toBeInTheDocument()
    })
  })

  // ─── Actions ────────────────────────────────────────────────────────

  describe('actions', () => {
    it('renders primary action', () => {
      render(
        <EmptyState
          title="No items"
          action={<button>Add Item</button>}
        />
      )
      expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument()
    })

    it('renders secondary action', () => {
      render(
        <EmptyState
          title="No items"
          secondaryAction={<button>Learn More</button>}
        />
      )
      expect(screen.getByRole('button', { name: 'Learn More' })).toBeInTheDocument()
    })

    it('renders both actions', () => {
      render(
        <EmptyState
          title="No items"
          action={<button>Create</button>}
          secondaryAction={<button>Import</button>}
        />
      )
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument()
    })

    it('does not render actions area when no actions', () => {
      const { container } = render(<EmptyState title="No items" />)
      expect(container.querySelector('.ui-empty-state__actions')).not.toBeInTheDocument()
    })
  })

  // ─── Sizes ──────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('defaults to md size', () => {
      const { container } = render(<EmptyState title="No items" />)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })

    it('renders sm size', () => {
      const { container } = render(<EmptyState title="No items" size="sm" />)
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })

    it('renders lg size', () => {
      const { container } = render(<EmptyState title="No items" size="lg" />)
      expect(container.querySelector('[data-size="lg"]')).toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion attribute', () => {
      const { container } = render(<EmptyState title="No items" motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <EmptyState
          title="No items found"
          description="Try adjusting your search"
          icon={<svg aria-hidden="true"><circle cx="24" cy="24" r="20" /></svg>}
          action={<button>Reset filters</button>}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with minimal props', async () => {
      const { container } = render(<EmptyState title="Empty" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('title is rendered as heading', () => {
      render(<EmptyState title="No results" />)
      expect(screen.getByRole('heading', { name: 'No results' })).toBeInTheDocument()
    })
  })
})
