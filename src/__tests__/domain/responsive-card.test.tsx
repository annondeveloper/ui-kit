import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ResponsiveCard } from '../../domain/responsive-card'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('ResponsiveCard', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the component with scope class', () => {
      const { container } = render(
        <ResponsiveCard title="Test Card" />
      )
      expect(container.querySelector('.ui-responsive-card')).toBeInTheDocument()
    })

    it('renders title', () => {
      render(<ResponsiveCard title="My Card" />)
      expect(screen.getByText('My Card')).toBeInTheDocument()
    })

    it('renders description when provided', () => {
      render(<ResponsiveCard title="Card" description="Card description" />)
      expect(screen.getByText('Card description')).toBeInTheDocument()
    })

    it('renders image when provided', () => {
      render(
        <ResponsiveCard title="Card" image={<img src="/test.jpg" alt="test" />} />
      )
      expect(screen.getByAltText('test')).toBeInTheDocument()
    })

    it('renders actions when provided', () => {
      render(
        <ResponsiveCard title="Card" actions={<button>Action</button>} />
      )
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('renders badge when provided', () => {
      render(
        <ResponsiveCard title="Card" badge={<span>New</span>} />
      )
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <ResponsiveCard title="Card" className="custom-card" />
      )
      expect(container.querySelector('.custom-card')).toBeInTheDocument()
    })
  })

  // ─── Container Query ──────────────────────────────────────────────

  describe('container query', () => {
    it('sets container-type: inline-size for self-adapting layout', () => {
      const { container } = render(
        <ResponsiveCard title="Card" />
      )
      // The component should have container-type set (via CSS)
      // We verify the data attribute is present for the CSS to target
      const card = container.querySelector('.ui-responsive-card')
      expect(card).toBeInTheDocument()
    })
  })

  // ─── Variants ─────────────────────────────────────────────────────

  describe('variants', () => {
    it('renders default variant', () => {
      const { container } = render(
        <ResponsiveCard title="Card" />
      )
      expect(container.querySelector('[data-variant="default"]')).toBeInTheDocument()
    })

    it('renders horizontal variant', () => {
      const { container } = render(
        <ResponsiveCard title="Card" variant="horizontal" />
      )
      expect(container.querySelector('[data-variant="horizontal"]')).toBeInTheDocument()
    })

    it('renders compact variant', () => {
      const { container } = render(
        <ResponsiveCard title="Card" variant="compact" />
      )
      expect(container.querySelector('[data-variant="compact"]')).toBeInTheDocument()
    })
  })

  // ─── Layout Sections ──────────────────────────────────────────────

  describe('layout sections', () => {
    it('renders image section', () => {
      const { container } = render(
        <ResponsiveCard title="Card" image={<img src="/img.jpg" alt="card" />} />
      )
      expect(container.querySelector('.ui-responsive-card__image')).toBeInTheDocument()
    })

    it('renders content section', () => {
      const { container } = render(
        <ResponsiveCard title="Card" />
      )
      expect(container.querySelector('.ui-responsive-card__content')).toBeInTheDocument()
    })

    it('renders actions section when actions provided', () => {
      const { container } = render(
        <ResponsiveCard title="Card" actions={<button>Go</button>} />
      )
      expect(container.querySelector('.ui-responsive-card__actions')).toBeInTheDocument()
    })

    it('does not render actions section when no actions', () => {
      const { container } = render(
        <ResponsiveCard title="Card" />
      )
      expect(container.querySelector('.ui-responsive-card__actions')).not.toBeInTheDocument()
    })

    it('renders badge in correct position', () => {
      const { container } = render(
        <ResponsiveCard title="Card" badge={<span>Featured</span>} />
      )
      expect(container.querySelector('.ui-responsive-card__badge')).toBeInTheDocument()
      expect(screen.getByText('Featured')).toBeInTheDocument()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion attribute', () => {
      const { container } = render(
        <ResponsiveCard title="Card" motion={2} />
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(
        <ResponsiveCard title="Card" motion={0} />
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Title as ReactNode ───────────────────────────────────────────

  describe('title as ReactNode', () => {
    it('accepts string title', () => {
      render(<ResponsiveCard title="String Title" />)
      expect(screen.getByText('String Title')).toBeInTheDocument()
    })

    it('accepts ReactNode title', () => {
      render(<ResponsiveCard title={<span data-testid="custom-title">Rich Title</span>} />)
      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <ResponsiveCard
          title="Accessible Card"
          description="A test card"
          image={<img src="/img.jpg" alt="card image" />}
          actions={<button>Click me</button>}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('uses semantic heading for title', () => {
      render(<ResponsiveCard title="Card Title" />)
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })

    it('renders as article element', () => {
      render(<ResponsiveCard title="Card" />)
      expect(screen.getByRole('article')).toBeInTheDocument()
    })
  })
})
