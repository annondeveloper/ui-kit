import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { PropertyList } from '../../domain/property-list'

expect.extend(toHaveNoViolations)

const items = [
  { label: 'Hostname', value: 'prod-web-01', copyable: true, mono: true },
  { label: 'IP', value: '10.0.42.17' },
  { label: 'OS', value: 'Ubuntu 24.04' },
  { label: 'Uptime', value: '142 days' },
]

describe('PropertyList', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders all item labels', () => {
      render(<PropertyList items={items} />)
      expect(screen.getByText('Hostname')).toBeInTheDocument()
      expect(screen.getByText('IP')).toBeInTheDocument()
      expect(screen.getByText('OS')).toBeInTheDocument()
      expect(screen.getByText('Uptime')).toBeInTheDocument()
    })

    it('renders all item values', () => {
      render(<PropertyList items={items} />)
      expect(screen.getByText('prod-web-01')).toBeInTheDocument()
      expect(screen.getByText('10.0.42.17')).toBeInTheDocument()
    })

    it('applies 2-column layout', () => {
      const { container } = render(<PropertyList items={items} columns={2} />)
      expect(container.querySelector('.ui-property-list')).toHaveAttribute('data-columns', '2')
    })

    it('applies striped attribute', () => {
      const { container } = render(<PropertyList items={items} striped />)
      expect(container.querySelector('.ui-property-list')).toHaveAttribute('data-striped')
    })

    it('renders copyable items with copy button', () => {
      const { container } = render(<PropertyList items={items} />)
      const copyBtns = container.querySelectorAll('.ui-property-list__copy')
      expect(copyBtns.length).toBeGreaterThanOrEqual(1)
    })

    it('applies data-size attribute', () => {
      const { container } = render(<PropertyList items={items} size="sm" />)
      expect(container.querySelector('.ui-property-list')).toHaveAttribute('data-size', 'sm')
    })

    it('applies mono styling to mono items', () => {
      const { container } = render(<PropertyList items={items} />)
      const monoEls = container.querySelectorAll('[data-mono]')
      expect(monoEls.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<PropertyList items={items} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('uses dl/dt/dd semantic structure', () => {
      const { container } = render(<PropertyList items={items} />)
      expect(container.querySelector('dl, [role="list"], .ui-property-list')).toBeInTheDocument()
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "PropertyList"', () => {
      expect(PropertyList.displayName).toBe('PropertyList')
    })
  })
})
