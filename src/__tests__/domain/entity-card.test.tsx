import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { EntityCard } from '../../domain/entity-card'

expect.extend(toHaveNoViolations)

describe('EntityCard', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders entity name', () => {
      render(<EntityCard name="prod-web-01" />)
      expect(screen.getByText('prod-web-01')).toBeInTheDocument()
    })

    it('renders status attribute', () => {
      const { container } = render(<EntityCard name="srv" status="ok" />)
      expect(container.querySelector('.ui-entity-card')).toHaveAttribute('data-status', 'ok')
    })

    it('renders all status variants', () => {
      const statuses = ['ok', 'warning', 'critical', 'unknown', 'maintenance'] as const
      for (const status of statuses) {
        const { container, unmount } = render(<EntityCard name={`srv-${status}`} status={status} />)
        expect(container.querySelector('.ui-entity-card')).toHaveAttribute('data-status', status)
        unmount()
      }
    })

    it('renders metrics when provided', () => {
      render(<EntityCard name="srv" metrics={[{ label: 'CPU', value: '24%' }, { label: 'RAM', value: '8GB' }]} />)
      expect(screen.getByText('CPU')).toBeInTheDocument()
      expect(screen.getByText('24%')).toBeInTheDocument()
    })

    it('renders tags when provided', () => {
      render(<EntityCard name="srv" tags={['production', 'us-east-1']} />)
      expect(screen.getByText('production')).toBeInTheDocument()
      expect(screen.getByText('us-east-1')).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      const onClick = vi.fn()
      render(<EntityCard name="srv" actions={[{ label: 'SSH', onClick }]} />)
      const btn = screen.getByText('SSH')
      expect(btn).toBeInTheDocument()
      fireEvent.click(btn)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('applies compact mode', () => {
      const { container } = render(<EntityCard name="srv" compact />)
      expect(container.querySelector('.ui-entity-card')).toHaveAttribute('data-compact')
    })

    it('applies data-size attribute', () => {
      const { container } = render(<EntityCard name="srv" size="lg" />)
      expect(container.querySelector('.ui-entity-card')).toHaveAttribute('data-size', 'lg')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <EntityCard name="prod-web-01" status="ok" metrics={[{ label: 'CPU', value: '24%' }]} tags={['prod']} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "EntityCard"', () => {
      expect(EntityCard.displayName).toBe('EntityCard')
    })
  })
})
