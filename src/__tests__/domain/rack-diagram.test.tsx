import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { RackDiagram } from '../../domain/rack-diagram'

expect.extend(toHaveNoViolations)

const devices = [
  { startU: 1, heightU: 1, label: 'PDU', status: 'ok' as const },
  { startU: 3, heightU: 2, label: 'Core Switch', status: 'warning' as const },
  { startU: 10, heightU: 4, label: 'Server A', status: 'critical' as const },
]

describe('RackDiagram', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with role="img"', () => {
      render(<RackDiagram units={42} devices={devices} />)
      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('has aria-label with unit and device count', () => {
      render(<RackDiagram units={42} devices={devices} />)
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Rack diagram: 42U, 3 devices')
    })

    it('renders device labels', () => {
      render(<RackDiagram units={42} devices={devices} />)
      expect(screen.getByText('PDU')).toBeInTheDocument()
      expect(screen.getByText('Core Switch')).toBeInTheDocument()
      expect(screen.getByText('Server A')).toBeInTheDocument()
    })

    it('renders unit numbers by default', () => {
      const { container } = render(<RackDiagram units={12} devices={[]} />)
      const numbers = container.querySelectorAll('.ui-rack-diagram__number')
      expect(numbers).toHaveLength(12)
    })

    it('hides unit numbers when showUnitNumbers is false', () => {
      const { container } = render(<RackDiagram units={12} devices={[]} showUnitNumbers={false} />)
      const numbers = container.querySelectorAll('.ui-rack-diagram__number')
      expect(numbers).toHaveLength(0)
    })

    it('renders device status attributes', () => {
      const { container } = render(<RackDiagram units={42} devices={devices} />)
      const devEls = container.querySelectorAll('.ui-rack-diagram__device')
      expect(devEls[0]).toHaveAttribute('data-status', 'ok')
      expect(devEls[1]).toHaveAttribute('data-status', 'warning')
      expect(devEls[2]).toHaveAttribute('data-status', 'critical')
    })

    it('renders correct number of slot rows', () => {
      const { container } = render(<RackDiagram units={12} devices={[]} />)
      const slots = container.querySelectorAll('.ui-rack-diagram__slot')
      expect(slots).toHaveLength(12)
    })

    it('supports rear orientation', () => {
      const { container } = render(<RackDiagram units={12} devices={devices} orientation="rear" />)
      expect(container.querySelector('.ui-rack-diagram')).toBeInTheDocument()
    })

    it('applies data-size attribute', () => {
      const { container } = render(<RackDiagram units={12} devices={[]} size="sm" />)
      expect(container.querySelector('.ui-rack-diagram')).toHaveAttribute('data-size', 'sm')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<RackDiagram units={12} devices={devices} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "RackDiagram"', () => {
      expect(RackDiagram.displayName).toBe('RackDiagram')
    })
  })
})
