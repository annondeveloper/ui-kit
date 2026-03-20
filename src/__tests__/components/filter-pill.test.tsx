import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { FilterPill, FilterPillGroup } from '../../components/filter-pill'

expect.extend(toHaveNoViolations)

describe('FilterPill', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a pill button with label', () => {
      render(<FilterPill label="Status" />)
      expect(screen.getByRole('button', { name: /Status/ })).toBeInTheDocument()
    })

    it('renders with default size="md"', () => {
      const { container } = render(<FilterPill label="Status" />)
      expect(container.querySelector('.ui-filter-pill')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      const { container } = render(<FilterPill label="Status" size="sm" />)
      expect(container.querySelector('.ui-filter-pill')).toHaveAttribute('data-size', 'sm')
    })

    it('forwards className', () => {
      const { container } = render(<FilterPill label="Status" className="custom" />)
      expect(container.querySelector('.ui-filter-pill')?.className).toContain('custom')
    })

    it('renders as a button element', () => {
      render(<FilterPill label="Tag" />)
      const el = screen.getByRole('button', { name: /Tag/ })
      expect(el.tagName).toBe('BUTTON')
    })
  })

  // ─── Active/inactive state ─────────────────────────────────────────

  describe('active/inactive', () => {
    it('renders inactive by default', () => {
      const { container } = render(<FilterPill label="Status" />)
      expect(container.querySelector('.ui-filter-pill')).not.toHaveAttribute('data-active')
    })

    it('renders active state when active=true', () => {
      const { container } = render(<FilterPill label="Status" active />)
      expect(container.querySelector('.ui-filter-pill')).toHaveAttribute('data-active', '')
    })

    it('applies aria-pressed for active state', () => {
      render(<FilterPill label="Status" active />)
      expect(screen.getByRole('button', { name: /Status/ })).toHaveAttribute('aria-pressed', 'true')
    })

    it('applies aria-pressed=false for inactive state', () => {
      render(<FilterPill label="Status" />)
      expect(screen.getByRole('button', { name: /Status/ })).toHaveAttribute('aria-pressed', 'false')
    })
  })

  // ─── Remove button ─────────────────────────────────────────────────

  describe('remove button', () => {
    it('renders remove button when onRemove is provided', () => {
      render(<FilterPill label="Status" onRemove={() => {}} />)
      const removeBtn = screen.getByRole('button', { name: /remove/i })
      expect(removeBtn).toBeInTheDocument()
    })

    it('does not render remove button when onRemove is not provided', () => {
      render(<FilterPill label="Status" />)
      expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
    })

    it('calls onRemove when remove button is clicked', async () => {
      const onRemove = vi.fn()
      render(<FilterPill label="Status" onRemove={onRemove} />)
      await userEvent.click(screen.getByRole('button', { name: /remove/i }))
      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it('remove click does not propagate to pill click', async () => {
      const onClick = vi.fn()
      const onRemove = vi.fn()
      render(<FilterPill label="Status" onClick={onClick} onRemove={onRemove} />)
      await userEvent.click(screen.getByRole('button', { name: /remove/i }))
      expect(onRemove).toHaveBeenCalledTimes(1)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  // ─── Count badge ───────────────────────────────────────────────────

  describe('count badge', () => {
    it('renders count badge when count is provided', () => {
      render(<FilterPill label="Status" count={5} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('does not render count badge when count is not provided', () => {
      const { container } = render(<FilterPill label="Status" />)
      expect(container.querySelector('.ui-filter-pill__count')).not.toBeInTheDocument()
    })

    it('renders count of 0', () => {
      render(<FilterPill label="Status" count={0} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  // ─── Icon ──────────────────────────────────────────────────────────

  describe('icon', () => {
    it('renders icon when provided', () => {
      const { container } = render(
        <FilterPill label="Status" icon={<svg data-testid="icon" />} />
      )
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('does not render icon wrapper when icon is not provided', () => {
      const { container } = render(<FilterPill label="Status" />)
      expect(container.querySelector('.ui-filter-pill__icon')).not.toBeInTheDocument()
    })
  })

  // ─── Motion ────────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(<FilterPill label="Status" motion={2} />)
      expect(container.querySelector('.ui-filter-pill')).toHaveAttribute('data-motion', '2')
    })

    it('defaults to motion level 3', () => {
      const { container } = render(<FilterPill label="Status" />)
      expect(container.querySelector('.ui-filter-pill')).toHaveAttribute('data-motion', '3')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (inactive)', async () => {
      const { container } = render(<FilterPill label="Status" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (active)', async () => {
      const { container } = render(<FilterPill label="Status" active />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (with remove)', async () => {
      const { container } = render(<FilterPill label="Status" onRemove={() => {}} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<FilterPill label="Status" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "FilterPill"', () => {
      expect(FilterPill.displayName).toBe('FilterPill')
    })
  })
})

// ─── FilterPillGroup ─────────────────────────────────────────────────────────

describe('FilterPillGroup', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders children', () => {
    render(
      <FilterPillGroup>
        <FilterPill label="A" />
        <FilterPill label="B" />
      </FilterPillGroup>
    )
    expect(screen.getByRole('button', { name: /A/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /B/ })).toBeInTheDocument()
  })

  it('renders "Clear all" button when onClearAll is provided', () => {
    render(
      <FilterPillGroup onClearAll={() => {}}>
        <FilterPill label="A" />
      </FilterPillGroup>
    )
    expect(screen.getByRole('button', { name: /Clear all/i })).toBeInTheDocument()
  })

  it('calls onClearAll when "Clear all" is clicked', async () => {
    const onClearAll = vi.fn()
    render(
      <FilterPillGroup onClearAll={onClearAll}>
        <FilterPill label="A" />
      </FilterPillGroup>
    )
    await userEvent.click(screen.getByRole('button', { name: /Clear all/i }))
    expect(onClearAll).toHaveBeenCalledTimes(1)
  })

  it('uses custom clearLabel', () => {
    render(
      <FilterPillGroup onClearAll={() => {}} clearLabel="Reset">
        <FilterPill label="A" />
      </FilterPillGroup>
    )
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument()
  })

  it('does not render "Clear all" button when onClearAll is not provided', () => {
    render(
      <FilterPillGroup>
        <FilterPill label="A" />
      </FilterPillGroup>
    )
    expect(screen.queryByRole('button', { name: /Clear all/i })).not.toBeInTheDocument()
  })

  it('forwards className', () => {
    const { container } = render(
      <FilterPillGroup className="custom-group">
        <FilterPill label="A" />
      </FilterPillGroup>
    )
    expect(container.querySelector('.ui-filter-pill-group')?.className).toContain('custom-group')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <FilterPillGroup onClearAll={() => {}}>
        <FilterPill label="Active" active />
        <FilterPill label="Pending" />
      </FilterPillGroup>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has displayName set to "FilterPillGroup"', () => {
    expect(FilterPillGroup.displayName).toBe('FilterPillGroup')
  })
})
