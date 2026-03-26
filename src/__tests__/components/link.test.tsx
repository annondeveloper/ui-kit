import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Link } from '../../components/link'

expect.extend(toHaveNoViolations)

describe('Link', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders an <a> element with text', () => {
      render(<Link href="/docs">Docs</Link>)
      const link = screen.getByText('Docs')
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
    })

    it('applies ui-link class', () => {
      render(<Link href="#">Label</Link>)
      const link = screen.getByText('Label')
      expect(link.className).toContain('ui-link')
    })

    it('renders with variant="default" by default', () => {
      render(<Link href="#">Default</Link>)
      expect(screen.getByText('Default')).toHaveAttribute('data-variant', 'default')
    })

    it('renders with variant="subtle"', () => {
      render(<Link href="#" variant="subtle">Subtle</Link>)
      expect(screen.getByText('Subtle')).toHaveAttribute('data-variant', 'subtle')
    })

    it('renders with variant="brand"', () => {
      render(<Link href="#" variant="brand">Brand</Link>)
      expect(screen.getByText('Brand')).toHaveAttribute('data-variant', 'brand')
    })

    it('renders with underline="hover" by default', () => {
      render(<Link href="#">Hover</Link>)
      expect(screen.getByText('Hover')).toHaveAttribute('data-underline', 'hover')
    })

    it('renders with underline="always"', () => {
      render(<Link href="#" underline="always">Always</Link>)
      expect(screen.getByText('Always')).toHaveAttribute('data-underline', 'always')
    })

    it('renders with underline="none"', () => {
      render(<Link href="#" underline="none">None</Link>)
      expect(screen.getByText('None')).toHaveAttribute('data-underline', 'none')
    })

    it('adds target="_blank" and rel for external links', () => {
      render(<Link href="https://example.com" external>External</Link>)
      const link = screen.getByText('External')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('sets data-external for external links', () => {
      render(<Link href="https://example.com" external>Ext</Link>)
      expect(screen.getByText('Ext')).toHaveAttribute('data-external', 'true')
    })

    it('does not set data-external for internal links', () => {
      render(<Link href="/about">Internal</Link>)
      expect(screen.getByText('Internal')).not.toHaveAttribute('data-external')
    })

    it('renders with size="md" by default', () => {
      render(<Link href="#">Medium</Link>)
      expect(screen.getByText('Medium')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="xs"', () => {
      render(<Link href="#" size="xs">Tiny</Link>)
      expect(screen.getByText('Tiny')).toHaveAttribute('data-size', 'xs')
    })

    it('renders with size="xl"', () => {
      render(<Link href="#" size="xl">Large</Link>)
      expect(screen.getByText('Large')).toHaveAttribute('data-size', 'xl')
    })

    it('forwards ref to anchor element', () => {
      const ref = createRef<HTMLAnchorElement>()
      render(<Link href="#" ref={ref}>Ref</Link>)
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
    })

    it('forwards className', () => {
      render(<Link href="#" className="custom">Custom</Link>)
      const link = screen.getByText('Custom')
      expect(link.className).toContain('ui-link')
      expect(link.className).toContain('custom')
    })

    it('passes href attribute', () => {
      render(<Link href="/about">About</Link>)
      expect(screen.getByText('About')).toHaveAttribute('href', '/about')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (default)', async () => {
      const { container } = render(<Link href="/docs">Accessible</Link>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (external)', async () => {
      const { container } = render(<Link href="https://example.com" external>External</Link>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Link href="#">Styled</Link>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-link)', () => {
      render(<Link href="#">Scoped</Link>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-link)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Link"', () => {
      expect(Link.displayName).toBe('Link')
    })
  })
})
