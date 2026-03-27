import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { RackDiagram } from '../../domain/rack-diagram'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const sampleDevices = [
  { startU: 1, heightU: 2, label: 'UPS', status: 'ok' as const },
  { startU: 3, heightU: 1, label: 'Switch', status: 'warning' as const },
  { startU: 5, heightU: 4, label: 'Server', status: 'critical' as const },
]

const devices = [
  { startU: 1, heightU: 1, label: 'PDU', status: 'ok' as const },
  { startU: 3, heightU: 2, label: 'Core Switch', status: 'warning' as const },
  { startU: 10, heightU: 4, label: 'Server A', status: 'critical' as const },
]

describe('RackDiagram', () => {
  // ─── Rendering (ours) ──────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} />)
      expect(container.querySelector('.ui-rack-diagram')).toBeInTheDocument()
    })

    it('renders device labels', () => {
      render(<RackDiagram units={12} devices={sampleDevices} />)
      expect(screen.getByText('UPS')).toBeInTheDocument()
      expect(screen.getByText('Switch')).toBeInTheDocument()
      expect(screen.getByText('Server')).toBeInTheDocument()
    })

    it('renders unit slots', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} />)
      const slots = container.querySelectorAll('.ui-rack-diagram__slot')
      expect(slots.length).toBe(12)
    })

    it('renders unit numbers by default', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} />)
      const numbers = container.querySelectorAll('.ui-rack-diagram__number')
      expect(numbers.length).toBe(12)
    })

    it('hides unit numbers when showUnitNumbers is false', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} showUnitNumbers={false} />)
      const numbers = container.querySelectorAll('.ui-rack-diagram__number')
      expect(numbers.length).toBe(0)
    })

    it('renders devices with status data attributes', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} />)
      expect(container.querySelector('[data-status="ok"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="warning"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="critical"]')).toBeInTheDocument()
    })
  })

  // ─── Sizes ────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('renders sm size', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} size="sm" />)
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })

    it('renders md size (default)', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} />)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })

    it('renders lg size', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} size="lg" />)
      expect(container.querySelector('[data-size="lg"]')).toBeInTheDocument()
    })
  })

  // ─── Tooltip ──────────────────────────────────────────────────────

  describe('tooltip', () => {
    it('shows tooltip on device hover', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} />)
      const devEls = container.querySelectorAll('.ui-rack-diagram__device')
      fireEvent.mouseEnter(devEls[0])
      expect(container.querySelector('.ui-rack-diagram__tooltip')).toBeInTheDocument()
    })

    it('hides tooltip on device mouse leave', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} />)
      const devEls = container.querySelectorAll('.ui-rack-diagram__device')
      fireEvent.mouseEnter(devEls[0])
      fireEvent.mouseLeave(devEls[0])
      expect(container.querySelector('.ui-rack-diagram__tooltip')).not.toBeInTheDocument()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ─────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} className="custom" />)
      expect(container.querySelector('.ui-rack-diagram.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<RackDiagram units={12} devices={sampleDevices} data-testid="rack" />)
      expect(screen.getByTestId('rack')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(RackDiagram.displayName).toBe('RackDiagram')
    })
  })

  // ─── Accessibility (ours) ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has img role', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} />)
      expect(container.querySelector('[role="img"]')).toBeInTheDocument()
    })

    it('has aria-label describing rack', () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} />)
      const el = container.querySelector('[role="img"]')
      expect(el?.getAttribute('aria-label')).toContain('12U')
      expect(el?.getAttribute('aria-label')).toContain('3 devices')
    })

    it('has no axe violations', async () => {
      const { container } = render(<RackDiagram units={12} devices={sampleDevices} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Rendering (origin/main) ───────────────────────────────────────

  describe('rendering (origin/main)', () => {
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

  // ─── Accessibility (origin/main) ───────────────────────────────────

  describe('accessibility (origin/main)', () => {
    it('has no axe violations', async () => {
      const { container } = render(<RackDiagram units={12} devices={devices} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name (origin/main) ────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "RackDiagram"', () => {
      expect(RackDiagram.displayName).toBe('RackDiagram')
    })
  })
})
