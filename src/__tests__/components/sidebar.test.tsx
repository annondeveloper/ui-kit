import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
} from '../../components/sidebar'

expect.extend(toHaveNoViolations)

describe('Sidebar', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with ui-sidebar scope class', () => {
      const { container } = render(
        <Sidebar>
          <SidebarContent>Content</SidebarContent>
        </Sidebar>
      )
      expect(container.querySelector('.ui-sidebar')).toBeInTheDocument()
    })

    it('renders an <aside> element', () => {
      render(
        <Sidebar>
          <SidebarContent>Content</SidebarContent>
        </Sidebar>
      )
      expect(screen.getByRole('complementary')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(
        <Sidebar>
          <SidebarContent>My Content</SidebarContent>
        </Sidebar>
      )
      expect(screen.getByText('My Content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <Sidebar className="custom-sb">Content</Sidebar>
      )
      expect(container.querySelector('.ui-sidebar')).toHaveClass('custom-sb')
    })

    it('spreads additional HTML attributes', () => {
      render(<Sidebar data-testid="my-sidebar">Content</Sidebar>)
      expect(screen.getByTestId('my-sidebar')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(Sidebar.displayName).toBe('Sidebar')
    })
  })

  // ─── Sub-components ───────────────────────────────────────────────

  describe('sub-components', () => {
    it('renders SidebarHeader', () => {
      render(
        <Sidebar>
          <SidebarHeader>Header</SidebarHeader>
        </Sidebar>
      )
      expect(screen.getByText('Header')).toBeInTheDocument()
    })

    it('renders SidebarContent', () => {
      render(
        <Sidebar>
          <SidebarContent>Main</SidebarContent>
        </Sidebar>
      )
      expect(screen.getByText('Main')).toBeInTheDocument()
    })

    it('renders SidebarFooter', () => {
      render(
        <Sidebar>
          <SidebarFooter>Footer</SidebarFooter>
        </Sidebar>
      )
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })

    it('renders all sub-components together', () => {
      render(
        <Sidebar>
          <SidebarHeader>H</SidebarHeader>
          <SidebarContent>C</SidebarContent>
          <SidebarFooter>F</SidebarFooter>
        </Sidebar>
      )
      expect(screen.getByText('H')).toBeInTheDocument()
      expect(screen.getByText('C')).toBeInTheDocument()
      expect(screen.getByText('F')).toBeInTheDocument()
    })

    it('SidebarHeader has ui-sidebar__header class', () => {
      const { container } = render(
        <Sidebar>
          <SidebarHeader>H</SidebarHeader>
        </Sidebar>
      )
      expect(container.querySelector('.ui-sidebar__header')).toBeInTheDocument()
    })

    it('SidebarContent has ui-sidebar__content class', () => {
      const { container } = render(
        <Sidebar>
          <SidebarContent>C</SidebarContent>
        </Sidebar>
      )
      expect(container.querySelector('.ui-sidebar__content')).toBeInTheDocument()
    })

    it('SidebarFooter has ui-sidebar__footer class', () => {
      const { container } = render(
        <Sidebar>
          <SidebarFooter>F</SidebarFooter>
        </Sidebar>
      )
      expect(container.querySelector('.ui-sidebar__footer')).toBeInTheDocument()
    })
  })

  // ─── SidebarItem ──────────────────────────────────────────────────

  describe('SidebarItem', () => {
    it('renders label', () => {
      render(
        <Sidebar>
          <SidebarItem label="Dashboard" />
        </Sidebar>
      )
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('renders icon', () => {
      render(
        <Sidebar>
          <SidebarItem
            icon={<span data-testid="icon">📊</span>}
            label="Dashboard"
          />
        </Sidebar>
      )
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('renders as link when href is provided', () => {
      render(
        <Sidebar>
          <SidebarItem label="Home" href="/" />
        </Sidebar>
      )
      expect(screen.getByRole('link')).toHaveAttribute('href', '/')
    })

    it('renders active state', () => {
      const { container } = render(
        <Sidebar>
          <SidebarItem label="Active" active />
        </Sidebar>
      )
      expect(container.querySelector('[data-active="true"]')).toBeInTheDocument()
    })

    it('calls onClick when clicked', () => {
      const onClick = vi.fn()
      render(
        <Sidebar>
          <SidebarItem label="Click Me" onClick={onClick} />
        </Sidebar>
      )
      fireEvent.click(screen.getByText('Click Me'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('hides label when collapsed', () => {
      render(
        <Sidebar collapsed>
          <SidebarItem label="Hidden Label" icon={<span>📊</span>} />
        </Sidebar>
      )
      const label = screen.getByText('Hidden Label')
      // Label should still be in DOM but visually hidden (for screen readers)
      expect(label).toBeInTheDocument()
    })
  })

  // ─── Collapsed / Expanded ─────────────────────────────────────────

  describe('collapsed/expanded', () => {
    it('defaults to expanded', () => {
      const { container } = render(<Sidebar>Content</Sidebar>)
      expect(container.querySelector('.ui-sidebar')).toHaveAttribute('data-collapsed', 'false')
    })

    it('applies collapsed state', () => {
      const { container } = render(<Sidebar collapsed>Content</Sidebar>)
      expect(container.querySelector('.ui-sidebar')).toHaveAttribute('data-collapsed', 'true')
    })

    it('renders collapse toggle button', () => {
      render(<Sidebar>Content</Sidebar>)
      expect(screen.getByLabelText(/collapse/i)).toBeInTheDocument()
    })

    it('calls onCollapse when toggle is clicked', () => {
      const onCollapse = vi.fn()
      render(<Sidebar onCollapse={onCollapse}>Content</Sidebar>)
      fireEvent.click(screen.getByLabelText(/collapse/i))
      expect(onCollapse).toHaveBeenCalledWith(true)
    })

    it('calls onCollapse(false) when expanding', () => {
      const onCollapse = vi.fn()
      render(<Sidebar collapsed onCollapse={onCollapse}>Content</Sidebar>)
      fireEvent.click(screen.getByLabelText(/expand/i))
      expect(onCollapse).toHaveBeenCalledWith(false)
    })
  })

  // ─── Position ─────────────────────────────────────────────────────

  describe('position', () => {
    it('defaults to left position', () => {
      const { container } = render(<Sidebar>Content</Sidebar>)
      expect(container.querySelector('.ui-sidebar')).toHaveAttribute('data-position', 'left')
    })

    it('applies right position', () => {
      const { container } = render(<Sidebar position="right">Content</Sidebar>)
      expect(container.querySelector('.ui-sidebar')).toHaveAttribute('data-position', 'right')
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(<Sidebar motion={0}>Content</Sidebar>)
      expect(container.querySelector('.ui-sidebar')).toHaveAttribute('data-motion', '0')
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles empty sidebar', () => {
      const { container } = render(<Sidebar>{null}</Sidebar>)
      expect(container.querySelector('.ui-sidebar')).toBeInTheDocument()
    })

    it('handles custom width', () => {
      const { container } = render(<Sidebar width={300}>Content</Sidebar>)
      const sidebar = container.querySelector('.ui-sidebar') as HTMLElement
      expect(sidebar.style.getPropertyValue('--sidebar-width')).toBe('300px')
    })

    it('handles string width', () => {
      const { container } = render(<Sidebar width="20rem">Content</Sidebar>)
      const sidebar = container.querySelector('.ui-sidebar') as HTMLElement
      expect(sidebar.style.getPropertyValue('--sidebar-width')).toBe('20rem')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <Sidebar>
          <SidebarHeader>Header</SidebarHeader>
          <SidebarContent>
            <SidebarItem label="Home" href="/" />
          </SidebarContent>
          <SidebarFooter>Footer</SidebarFooter>
        </Sidebar>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations when collapsed', async () => {
      const { container } = render(
        <Sidebar collapsed>
          <SidebarContent>
            <SidebarItem label="Home" icon={<span>🏠</span>} href="/" />
          </SidebarContent>
        </Sidebar>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
