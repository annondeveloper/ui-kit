import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ServiceStrip } from '../../domain/service-strip'

expect.extend(toHaveNoViolations)

const services = [
  { name: 'nginx', status: 'running' as const },
  { name: 'postgres', status: 'running' as const },
  { name: 'redis', status: 'stopped' as const },
  { name: 'cron', status: 'error' as const },
]

describe('ServiceStrip', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders all service names', () => {
      render(<ServiceStrip services={services} />)
      expect(screen.getByText('nginx')).toBeInTheDocument()
      expect(screen.getByText('postgres')).toBeInTheDocument()
      expect(screen.getByText('redis')).toBeInTheDocument()
      expect(screen.getByText('cron')).toBeInTheDocument()
    })

    it('respects maxVisible and shows overflow count', () => {
      render(<ServiceStrip services={services} maxVisible={2} />)
      expect(screen.getByText('nginx')).toBeInTheDocument()
      expect(screen.getByText('postgres')).toBeInTheDocument()
      expect(screen.getByText(/\+2 more/)).toBeInTheDocument()
    })

    it('renders status attributes on badges', () => {
      const { container } = render(<ServiceStrip services={services} />)
      const badges = container.querySelectorAll('.ui-service-strip__badge')
      expect(badges[0]).toHaveAttribute('data-status', 'running')
      expect(badges[2]).toHaveAttribute('data-status', 'stopped')
      expect(badges[3]).toHaveAttribute('data-status', 'error')
    })

    it('fires onServiceClick when a service is clicked', () => {
      const onClick = vi.fn()
      render(<ServiceStrip services={services} onServiceClick={onClick} />)
      fireEvent.click(screen.getByText('nginx'))
      expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ name: 'nginx' }))
    })

    it('applies data-size attribute', () => {
      const { container } = render(<ServiceStrip services={services} size="sm" />)
      expect(container.querySelector('.ui-service-strip')).toHaveAttribute('data-size', 'sm')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<ServiceStrip services={services} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "ServiceStrip"', () => {
      expect(ServiceStrip.displayName).toBe('ServiceStrip')
    })
  })
})
