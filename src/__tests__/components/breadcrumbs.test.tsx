import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Breadcrumbs } from '../../components/breadcrumbs'

expect.extend(toHaveNoViolations)

const defaultItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Widget', href: '/products/widget' },
]

describe('Breadcrumbs', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with ui-breadcrumbs scope class', () => {
      const { container } = render(<Breadcrumbs items={defaultItems} />)
      expect(container.querySelector('.ui-breadcrumbs')).toBeInTheDocument()
    })

    it('renders a <nav> element', () => {
      render(<Breadcrumbs items={defaultItems} />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('has aria-label="Breadcrumb"', () => {
      render(<Breadcrumbs items={defaultItems} />)
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Breadcrumb')
    })

    it('renders an ordered list', () => {
      render(<Breadcrumbs items={defaultItems} />)
      expect(screen.getByRole('list')).toBeInTheDocument()
    })

    it('renders all items', () => {
      render(<Breadcrumbs items={defaultItems} />)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('Widget')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <Breadcrumbs items={defaultItems} className="custom-bc" />
      )
      expect(container.querySelector('.ui-breadcrumbs')).toHaveClass('custom-bc')
    })

    it('spreads additional HTML attributes', () => {
      render(<Breadcrumbs items={defaultItems} data-testid="my-bc" />)
      expect(screen.getByTestId('my-bc')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(Breadcrumbs.displayName).toBe('Breadcrumbs')
    })
  })

  // ─── Links ────────────────────────────────────────────────────────

  describe('links', () => {
    it('renders links for non-last items', () => {
      render(<Breadcrumbs items={defaultItems} />)
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(2) // Home and Products, not Widget
    })

    it('last item is not a link', () => {
      render(<Breadcrumbs items={defaultItems} />)
      const widget = screen.getByText('Widget')
      expect(widget.tagName).not.toBe('A')
    })

    it('last item has aria-current="page"', () => {
      render(<Breadcrumbs items={defaultItems} />)
      const widget = screen.getByText('Widget')
      expect(widget).toHaveAttribute('aria-current', 'page')
    })

    it('links have correct href', () => {
      render(<Breadcrumbs items={defaultItems} />)
      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveAttribute('href', '/')
      expect(links[1]).toHaveAttribute('href', '/products')
    })

    it('renders item without href as text', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Current' },
      ]
      render(<Breadcrumbs items={items} />)
      expect(screen.getByText('Current')).toHaveAttribute('aria-current', 'page')
    })
  })

  // ─── Separator ────────────────────────────────────────────────────

  describe('separator', () => {
    it('renders separators between items', () => {
      const { container } = render(<Breadcrumbs items={defaultItems} />)
      const separators = container.querySelectorAll('.ui-breadcrumbs__separator')
      expect(separators).toHaveLength(2) // Between 3 items = 2 separators
    })

    it('renders default chevron-right separator', () => {
      const { container } = render(<Breadcrumbs items={defaultItems} />)
      const svgs = container.querySelectorAll('.ui-breadcrumbs__separator svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('renders custom separator', () => {
      render(<Breadcrumbs items={defaultItems} separator="/" />)
      // There should be 2 separators with "/" text
      const separators = screen.getAllByText('/')
      expect(separators).toHaveLength(2)
    })

    it('separators are aria-hidden', () => {
      const { container } = render(<Breadcrumbs items={defaultItems} />)
      const separators = container.querySelectorAll('.ui-breadcrumbs__separator')
      separators.forEach((sep) => {
        expect(sep).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  // ─── Icons ────────────────────────────────────────────────────────

  describe('icons', () => {
    it('renders item icon when provided', () => {
      const items = [
        { label: 'Home', href: '/', icon: <span data-testid="home-icon">🏠</span> },
        { label: 'Current' },
      ]
      render(<Breadcrumbs items={items} />)
      expect(screen.getByTestId('home-icon')).toBeInTheDocument()
    })
  })

  // ─── Max visible / collapse ───────────────────────────────────────

  describe('maxVisible', () => {
    const manyItems = [
      { label: 'Home', href: '/' },
      { label: 'Cat A', href: '/a' },
      { label: 'Cat B', href: '/b' },
      { label: 'Cat C', href: '/c' },
      { label: 'Current' },
    ]

    it('collapses middle items to ellipsis when exceeding maxVisible', () => {
      render(<Breadcrumbs items={manyItems} maxVisible={3} />)
      // Should show: Home, ..., Current (first + ellipsis + last)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Current')).toBeInTheDocument()
      expect(screen.getByText('…')).toBeInTheDocument()
    })

    it('hides collapsed items', () => {
      render(<Breadcrumbs items={manyItems} maxVisible={3} />)
      expect(screen.queryByText('Cat A')).not.toBeInTheDocument()
      expect(screen.queryByText('Cat B')).not.toBeInTheDocument()
    })

    it('does not collapse when items <= maxVisible', () => {
      render(<Breadcrumbs items={defaultItems} maxVisible={5} />)
      expect(screen.queryByText('…')).not.toBeInTheDocument()
    })

    it('does not collapse when maxVisible not specified', () => {
      render(<Breadcrumbs items={manyItems} />)
      expect(screen.queryByText('…')).not.toBeInTheDocument()
      expect(screen.getByText('Cat A')).toBeInTheDocument()
    })
  })

  // ─── onNavigate ───────────────────────────────────────────────────

  describe('onNavigate', () => {
    it('calls onNavigate when clicking a link', () => {
      const onNavigate = vi.fn()
      render(<Breadcrumbs items={defaultItems} onNavigate={onNavigate} />)
      fireEvent.click(screen.getByText('Home'))
      expect(onNavigate).toHaveBeenCalledWith('/')
    })

    it('prevents default navigation when onNavigate is provided', () => {
      const onNavigate = vi.fn()
      render(<Breadcrumbs items={defaultItems} onNavigate={onNavigate} />)
      const link = screen.getByText('Home')
      const event = new MouseEvent('click', { bubbles: true })
      const preventDefault = vi.fn()
      Object.defineProperty(event, 'preventDefault', { value: preventDefault })
      link.dispatchEvent(event)
      // onNavigate should have been called
      expect(onNavigate).toHaveBeenCalled()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<Breadcrumbs items={defaultItems} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with collapsed items', async () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'A', href: '/a' },
        { label: 'B', href: '/b' },
        { label: 'C', href: '/c' },
        { label: 'Current' },
      ]
      const { container } = render(<Breadcrumbs items={items} maxVisible={3} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
