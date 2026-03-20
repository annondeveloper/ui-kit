import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Navbar } from '../../components/navbar'

expect.extend(toHaveNoViolations)

describe('Navbar', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with ui-navbar scope class', () => {
      const { container } = render(<Navbar />)
      expect(container.querySelector('.ui-navbar')).toBeInTheDocument()
    })

    it('renders a <header> element', () => {
      render(<Navbar />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<Navbar className="custom-nav" />)
      expect(container.querySelector('.ui-navbar')).toHaveClass('custom-nav')
    })

    it('spreads additional HTML attributes', () => {
      render(<Navbar data-testid="my-navbar" />)
      expect(screen.getByTestId('my-navbar')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(Navbar.displayName).toBe('Navbar')
    })
  })

  // ─── Logo ─────────────────────────────────────────────────────────

  describe('logo', () => {
    it('renders logo content', () => {
      render(<Navbar logo={<span>MyApp</span>} />)
      expect(screen.getByText('MyApp')).toBeInTheDocument()
    })

    it('renders ReactNode logo', () => {
      render(<Navbar logo={<img alt="Logo" src="/logo.svg" />} />)
      expect(screen.getByAltText('Logo')).toBeInTheDocument()
    })

    it('places logo in navbar__logo section', () => {
      const { container } = render(<Navbar logo={<span>Logo</span>} />)
      expect(container.querySelector('.ui-navbar__logo')).toBeInTheDocument()
    })
  })

  // ─── Children (nav items) ─────────────────────────────────────────

  describe('children', () => {
    it('renders navigation children', () => {
      render(
        <Navbar>
          <a href="/">Home</a>
          <a href="/about">About</a>
        </Navbar>
      )
      // Children appear in both desktop nav and mobile nav
      expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('About').length).toBeGreaterThanOrEqual(1)
    })

    it('places children in navbar__nav section', () => {
      const { container } = render(
        <Navbar>
          <a href="/">Home</a>
        </Navbar>
      )
      expect(container.querySelector('.ui-navbar__nav')).toBeInTheDocument()
    })
  })

  // ─── Actions ──────────────────────────────────────────────────────

  describe('actions', () => {
    it('renders actions on the right', () => {
      render(<Navbar actions={<button>Sign In</button>} />)
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })

    it('places actions in navbar__actions section', () => {
      const { container } = render(
        <Navbar actions={<button>Action</button>} />
      )
      expect(container.querySelector('.ui-navbar__actions')).toBeInTheDocument()
    })
  })

  // ─── Sticky ───────────────────────────────────────────────────────

  describe('sticky', () => {
    it('is sticky by default', () => {
      const { container } = render(<Navbar />)
      expect(container.querySelector('.ui-navbar')).toHaveAttribute('data-sticky', 'true')
    })

    it('is not sticky when sticky=false', () => {
      const { container } = render(<Navbar sticky={false} />)
      expect(container.querySelector('.ui-navbar')).toHaveAttribute('data-sticky', 'false')
    })
  })

  // ─── Bordered ─────────────────────────────────────────────────────

  describe('bordered', () => {
    it('is bordered by default', () => {
      const { container } = render(<Navbar />)
      expect(container.querySelector('.ui-navbar')).toHaveAttribute('data-bordered', 'true')
    })

    it('is not bordered when bordered=false', () => {
      const { container } = render(<Navbar bordered={false} />)
      expect(container.querySelector('.ui-navbar')).toHaveAttribute('data-bordered', 'false')
    })
  })

  // ─── Transparent ──────────────────────────────────────────────────

  describe('transparent', () => {
    it('is not transparent by default', () => {
      const { container } = render(<Navbar />)
      expect(container.querySelector('.ui-navbar')).not.toHaveAttribute('data-transparent', 'true')
    })

    it('applies transparent mode', () => {
      const { container } = render(<Navbar transparent />)
      expect(container.querySelector('.ui-navbar')).toHaveAttribute('data-transparent', 'true')
    })
  })

  // ─── Height ───────────────────────────────────────────────────────

  describe('height', () => {
    it('applies custom height', () => {
      const { container } = render(<Navbar height={72} />)
      const navbar = container.querySelector('.ui-navbar') as HTMLElement
      expect(navbar.style.getPropertyValue('--navbar-height')).toBe('72px')
    })
  })

  // ─── Mobile hamburger ────────────────────────────────────────────

  describe('mobile menu', () => {
    it('renders hamburger menu button', () => {
      render(
        <Navbar>
          <a href="/">Home</a>
        </Navbar>
      )
      expect(screen.getByLabelText(/menu/i)).toBeInTheDocument()
    })

    it('toggles mobile menu on hamburger click', () => {
      const { container } = render(
        <Navbar>
          <a href="/">Home</a>
        </Navbar>
      )
      const hamburger = screen.getByLabelText(/menu/i)
      fireEvent.click(hamburger)
      expect(container.querySelector('.ui-navbar')).toHaveAttribute('data-mobile-open', 'true')
    })

    it('closes mobile menu on second click', () => {
      const { container } = render(
        <Navbar>
          <a href="/">Home</a>
        </Navbar>
      )
      const hamburger = screen.getByLabelText(/menu/i)
      fireEvent.click(hamburger)
      fireEvent.click(hamburger)
      expect(container.querySelector('.ui-navbar')).toHaveAttribute('data-mobile-open', 'false')
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────

  describe('edge cases', () => {
    it('renders without any props', () => {
      const { container } = render(<Navbar />)
      expect(container.querySelector('.ui-navbar')).toBeInTheDocument()
    })

    it('renders with all props', () => {
      render(
        <Navbar
          logo={<span>Logo</span>}
          actions={<button>Action</button>}
          sticky
          bordered
          transparent
          height={64}
        >
          <a href="/">Home</a>
        </Navbar>
      )
      expect(screen.getByText('Logo')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1)
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <Navbar logo={<span>MyApp</span>} actions={<button>Sign In</button>}>
          <a href="/">Home</a>
          <a href="/about">About</a>
        </Navbar>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (minimal)', async () => {
      const { container } = render(<Navbar />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('hamburger has aria-expanded', () => {
      render(
        <Navbar>
          <a href="/">Home</a>
        </Navbar>
      )
      const hamburger = screen.getByLabelText(/menu/i)
      expect(hamburger).toHaveAttribute('aria-expanded', 'false')
    })
  })
})
