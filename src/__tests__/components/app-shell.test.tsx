import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { AppShell } from '../../components/app-shell'

expect.extend(toHaveNoViolations)

describe('AppShell', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with ui-app-shell scope class', () => {
      const { container } = render(
        <AppShell>
          <main>Content</main>
        </AppShell>
      )
      expect(container.querySelector('.ui-app-shell')).toBeInTheDocument()
    })

    it('renders children as main content', () => {
      render(
        <AppShell>
          <p>Main content</p>
        </AppShell>
      )
      expect(screen.getByText('Main content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <AppShell className="custom-shell">Content</AppShell>
      )
      expect(container.querySelector('.ui-app-shell')).toHaveClass('custom-shell')
    })

    it('spreads additional HTML attributes', () => {
      render(<AppShell data-testid="my-shell">Content</AppShell>)
      expect(screen.getByTestId('my-shell')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(AppShell.displayName).toBe('AppShell')
    })
  })

  // ─── Navbar ───────────────────────────────────────────────────────

  describe('navbar', () => {
    it('renders navbar when provided', () => {
      render(
        <AppShell navbar={<header>Nav</header>}>Content</AppShell>
      )
      expect(screen.getByText('Nav')).toBeInTheDocument()
    })

    it('does not render navbar slot when not provided', () => {
      const { container } = render(<AppShell>Content</AppShell>)
      expect(container.querySelector('.ui-app-shell__navbar')).not.toBeInTheDocument()
    })

    it('places navbar in navbar slot', () => {
      const { container } = render(
        <AppShell navbar={<header>Nav</header>}>Content</AppShell>
      )
      expect(container.querySelector('.ui-app-shell__navbar')).toBeInTheDocument()
    })
  })

  // ─── Sidebar ──────────────────────────────────────────────────────

  describe('sidebar', () => {
    it('renders sidebar when provided', () => {
      render(
        <AppShell sidebar={<aside>Sidebar</aside>}>Content</AppShell>
      )
      expect(screen.getByText('Sidebar')).toBeInTheDocument()
    })

    it('does not render sidebar slot when not provided', () => {
      const { container } = render(<AppShell>Content</AppShell>)
      expect(container.querySelector('.ui-app-shell__sidebar')).not.toBeInTheDocument()
    })

    it('places sidebar in sidebar slot', () => {
      const { container } = render(
        <AppShell sidebar={<aside>Sidebar</aside>}>Content</AppShell>
      )
      expect(container.querySelector('.ui-app-shell__sidebar')).toBeInTheDocument()
    })
  })

  // ─── Footer ───────────────────────────────────────────────────────

  describe('footer', () => {
    it('renders footer when provided', () => {
      render(
        <AppShell footer={<footer>Footer</footer>}>Content</AppShell>
      )
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })

    it('does not render footer slot when not provided', () => {
      const { container } = render(<AppShell>Content</AppShell>)
      expect(container.querySelector('.ui-app-shell__footer')).not.toBeInTheDocument()
    })
  })

  // ─── Sidebar position ────────────────────────────────────────────

  describe('sidebar position', () => {
    it('defaults sidebar to left', () => {
      const { container } = render(
        <AppShell sidebar={<aside>Sidebar</aside>}>Content</AppShell>
      )
      expect(container.querySelector('.ui-app-shell')).toHaveAttribute(
        'data-sidebar-position',
        'left'
      )
    })

    it('applies right sidebar position', () => {
      const { container } = render(
        <AppShell sidebar={<aside>Sidebar</aside>} sidebarPosition="right">
          Content
        </AppShell>
      )
      expect(container.querySelector('.ui-app-shell')).toHaveAttribute(
        'data-sidebar-position',
        'right'
      )
    })
  })

  // ─── Sidebar collapsed ───────────────────────────────────────────

  describe('sidebar collapsed', () => {
    it('applies collapsed state', () => {
      const { container } = render(
        <AppShell sidebar={<aside>Sidebar</aside>} sidebarCollapsed>
          Content
        </AppShell>
      )
      expect(container.querySelector('.ui-app-shell')).toHaveAttribute(
        'data-sidebar-collapsed',
        'true'
      )
    })

    it('defaults to not collapsed', () => {
      const { container } = render(
        <AppShell sidebar={<aside>Sidebar</aside>}>Content</AppShell>
      )
      expect(container.querySelector('.ui-app-shell')).toHaveAttribute(
        'data-sidebar-collapsed',
        'false'
      )
    })
  })

  // ─── Full composition ─────────────────────────────────────────────

  describe('full composition', () => {
    it('renders all slots together', () => {
      render(
        <AppShell
          navbar={<header>Navbar</header>}
          sidebar={<aside>Sidebar</aside>}
          footer={<footer>Footer</footer>}
        >
          <p>Main</p>
        </AppShell>
      )
      expect(screen.getByText('Navbar')).toBeInTheDocument()
      expect(screen.getByText('Sidebar')).toBeInTheDocument()
      expect(screen.getByText('Main')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })

    it('has proper grid structure', () => {
      const { container } = render(
        <AppShell
          navbar={<header>Nav</header>}
          sidebar={<aside>Side</aside>}
          footer={<footer>Foot</footer>}
        >
          Content
        </AppShell>
      )
      const shell = container.querySelector('.ui-app-shell')
      expect(shell).toBeInTheDocument()
      expect(container.querySelector('.ui-app-shell__navbar')).toBeInTheDocument()
      expect(container.querySelector('.ui-app-shell__sidebar')).toBeInTheDocument()
      expect(container.querySelector('.ui-app-shell__main')).toBeInTheDocument()
      expect(container.querySelector('.ui-app-shell__footer')).toBeInTheDocument()
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────

  describe('edge cases', () => {
    it('renders with only children', () => {
      render(<AppShell>Just content</AppShell>)
      expect(screen.getByText('Just content')).toBeInTheDocument()
    })

    it('handles null children', () => {
      const { container } = render(<AppShell>{null}</AppShell>)
      expect(container.querySelector('.ui-app-shell')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (minimal)', async () => {
      const { container } = render(<AppShell>Content</AppShell>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (full)', async () => {
      const { container } = render(
        <AppShell
          navbar={<header>Nav</header>}
          sidebar={<nav aria-label="Sidebar">Side</nav>}
          footer={<footer>Foot</footer>}
        >
          <main>Main content</main>
        </AppShell>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('main content area is identifiable', () => {
      const { container } = render(
        <AppShell>
          <main>Content</main>
        </AppShell>
      )
      expect(container.querySelector('.ui-app-shell__main')).toBeInTheDocument()
    })
  })
})
