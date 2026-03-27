import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TableOfContents, type TocItem } from '../../components/table-of-contents'

expect.extend(toHaveNoViolations)

const sampleItems: TocItem[] = [
  { id: 'intro', label: 'Introduction', level: 1 },
  { id: 'getting-started', label: 'Getting Started', level: 1 },
  { id: 'install', label: 'Installation', level: 2 },
  { id: 'config', label: 'Configuration', level: 2 },
  { id: 'api', label: 'API Reference', level: 1 },
]

const nestedItems: TocItem[] = [
  {
    id: 'intro',
    label: 'Introduction',
    level: 1,
    children: [
      { id: 'overview', label: 'Overview', level: 2 },
      { id: 'motivation', label: 'Motivation', level: 2 },
    ],
  },
  { id: 'usage', label: 'Usage', level: 1 },
]

describe('TableOfContents', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <nav> element', () => {
      render(<TableOfContents items={sampleItems} />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('applies ui-toc class', () => {
      const { container } = render(<TableOfContents items={sampleItems} />)
      expect(container.querySelector('.ui-toc')).toBeInTheDocument()
    })

    it('renders all top-level items', () => {
      render(<TableOfContents items={sampleItems} />)
      expect(screen.getByText('Introduction')).toBeInTheDocument()
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
      expect(screen.getByText('Installation')).toBeInTheDocument()
      expect(screen.getByText('Configuration')).toBeInTheDocument()
      expect(screen.getByText('API Reference')).toBeInTheDocument()
    })

    it('renders nested children', () => {
      render(<TableOfContents items={nestedItems} />)
      expect(screen.getByText('Introduction')).toBeInTheDocument()
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Motivation')).toBeInTheDocument()
      expect(screen.getByText('Usage')).toBeInTheDocument()
    })

    it('sets data-level on each link', () => {
      const { container } = render(<TableOfContents items={sampleItems} />)
      const links = container.querySelectorAll('.ui-toc__link')
      expect(links[0]).toHaveAttribute('data-level', '1')
      expect(links[2]).toHaveAttribute('data-level', '2')
    })

    it('sets aria-label on nav element', () => {
      render(<TableOfContents items={sampleItems} />)
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Table of contents')
    })

    it('renders indicator for default variant', () => {
      const { container } = render(<TableOfContents items={sampleItems} variant="default" />)
      expect(container.querySelector('.ui-toc__indicator')).toBeInTheDocument()
    })

    it('does not render indicator for filled variant', () => {
      const { container } = render(<TableOfContents items={sampleItems} variant="filled" />)
      expect(container.querySelector('.ui-toc__indicator')).not.toBeInTheDocument()
    })

    it('does not render indicator for dots variant', () => {
      const { container } = render(<TableOfContents items={sampleItems} variant="dots" />)
      expect(container.querySelector('.ui-toc__indicator')).not.toBeInTheDocument()
    })
  })

  // ─── Active state ─────────────────────────────────────────────────

  describe('active state', () => {
    it('sets data-active on the controlled activeId item', () => {
      const { container } = render(
        <TableOfContents items={sampleItems} activeId="getting-started" />
      )
      const links = container.querySelectorAll('.ui-toc__link')
      expect(links[1]).toHaveAttribute('data-active', 'true')
      expect(links[0]).not.toHaveAttribute('data-active')
    })

    it('updates active state on click (uncontrolled)', async () => {
      const { container } = render(<TableOfContents items={sampleItems} />)
      await userEvent.click(screen.getByText('API Reference'))
      const links = container.querySelectorAll('.ui-toc__link')
      const apiLink = Array.from(links).find(l => l.textContent === 'API Reference')
      expect(apiLink).toHaveAttribute('data-active', 'true')
    })

    it('calls onItemClick when item is clicked', async () => {
      const onItemClick = vi.fn()
      render(<TableOfContents items={sampleItems} onItemClick={onItemClick} />)
      await userEvent.click(screen.getByText('Configuration'))
      expect(onItemClick).toHaveBeenCalledWith('config')
    })
  })

  // ─── Data attributes ───────────────────────────────────────────────

  describe('data attributes', () => {
    it('sets data-size to default "md"', () => {
      render(<TableOfContents items={sampleItems} />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-size', 'md')
    })

    it('sets data-size to "sm"', () => {
      render(<TableOfContents items={sampleItems} size="sm" />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-size', 'sm')
    })

    it('sets data-size to "lg"', () => {
      render(<TableOfContents items={sampleItems} size="lg" />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-size', 'lg')
    })

    it('sets data-variant to default "default"', () => {
      render(<TableOfContents items={sampleItems} />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-variant', 'default')
    })

    it('sets data-variant to "filled"', () => {
      render(<TableOfContents items={sampleItems} variant="filled" />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-variant', 'filled')
    })

    it('sets data-variant to "dots"', () => {
      render(<TableOfContents items={sampleItems} variant="dots" />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-variant', 'dots')
    })
  })

  // ─── Scroll behavior ──────────────────────────────────────────────

  describe('scroll', () => {
    it('calls scrollIntoView on click', async () => {
      // Create a mock target element
      const mockEl = document.createElement('div')
      mockEl.id = 'intro'
      mockEl.scrollIntoView = vi.fn()
      document.body.appendChild(mockEl)

      render(<TableOfContents items={sampleItems} />)
      await userEvent.click(screen.getByText('Introduction'))
      expect(mockEl.scrollIntoView).toHaveBeenCalled()

      document.body.removeChild(mockEl)
    })

    it('uses smooth scroll when motion > 0', async () => {
      const mockEl = document.createElement('div')
      mockEl.id = 'intro'
      mockEl.scrollIntoView = vi.fn()
      document.body.appendChild(mockEl)

      render(<TableOfContents items={sampleItems} motion={2} />)
      await userEvent.click(screen.getByText('Introduction'))
      expect(mockEl.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })

      document.body.removeChild(mockEl)
    })
  })

  // ─── Ref forwarding ───────────────────────────────────────────────

  describe('ref', () => {
    it('forwards ref to nav element', () => {
      const ref = createRef<HTMLElement>()
      render(<TableOfContents ref={ref} items={sampleItems} />)
      expect(ref.current).toBeInstanceOf(HTMLElement)
      expect(ref.current?.tagName).toBe('NAV')
    })
  })

  // ─── Props forwarding ─────────────────────────────────────────────

  describe('props forwarding', () => {
    it('merges custom className', () => {
      render(<TableOfContents items={sampleItems} className="custom" />)
      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('ui-toc')
      expect(nav.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<TableOfContents items={sampleItems} data-testid="my-toc" id="toc-1" />)
      const el = screen.getByTestId('my-toc')
      expect(el).toHaveAttribute('id', 'toc-1')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<TableOfContents items={sampleItems} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with active item', async () => {
      const { container } = render(
        <TableOfContents items={sampleItems} activeId="intro" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('renders list elements', () => {
      render(<TableOfContents items={sampleItems} />)
      const lists = screen.getAllByRole('list')
      expect(lists.length).toBeGreaterThan(0)
    })
  })

  // ─── Style injection ─────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<TableOfContents items={sampleItems} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-toc)', () => {
      render(<TableOfContents items={sampleItems} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-toc)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "TableOfContents"', () => {
      expect(TableOfContents.displayName).toBe('TableOfContents')
    })
  })
})
