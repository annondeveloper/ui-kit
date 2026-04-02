import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { NetworkInterfaceGrid } from '../../domain/network-interface-grid'
import type { NetworkInterface } from '../../domain/network-interface-grid'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const sampleInterfaces: NetworkInterface[] = [
  { name: 'eth0', status: 'up', speed: '10Gbps', type: 'ethernet', txRate: 524288000, rxRate: 134217728, duplex: 'full' },
  { name: 'eth1', status: 'down', speed: '1Gbps', type: 'ethernet', txErrors: 12, rxErrors: 3 },
  { name: 'bond0', status: 'up', speed: '25Gbps', type: 'bond', txRate: 1073741824, rxRate: 536870912 },
  { name: 'br0', status: 'dormant', speed: '1Gbps', type: 'bridge' },
  { name: 'vlan100', status: 'up', speed: '10Gbps', type: 'vlan', txRate: 262144000, rxRate: 131072000 },
  { name: 'lo', status: 'unknown', type: 'loopback' },
]

describe('NetworkInterfaceGrid', () => {
  // ─── Rendering ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      expect(container.querySelector('.ui-network-interface-grid')).toBeInTheDocument()
    })

    it('renders correct number of interface cards', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      const cards = container.querySelectorAll('.ui-nig__card')
      expect(cards.length).toBe(6)
    })

    it('renders interface names', () => {
      render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      expect(screen.getByText('eth0')).toBeInTheDocument()
      expect(screen.getByText('bond0')).toBeInTheDocument()
      expect(screen.getByText('lo')).toBeInTheDocument()
    })

    it('renders speed badges', () => {
      render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      expect(screen.getAllByText('10Gbps').length).toBe(2) // eth0, vlan100
      expect(screen.getByText('25Gbps')).toBeInTheDocument()
    })

    it('renders type badges', () => {
      render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      expect(screen.getAllByText('ETH').length).toBe(2) // eth0, eth1
      expect(screen.getByText('BOND')).toBeInTheDocument()
      expect(screen.getByText('BR')).toBeInTheDocument()
      expect(screen.getByText('VLAN')).toBeInTheDocument()
      expect(screen.getByText('LO')).toBeInTheDocument()
    })

    it('renders status data attributes', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      expect(container.querySelector('.ui-nig__card[data-status="up"]')).toBeInTheDocument()
      expect(container.querySelector('.ui-nig__card[data-status="down"]')).toBeInTheDocument()
      expect(container.querySelector('.ui-nig__card[data-status="dormant"]')).toBeInTheDocument()
      expect(container.querySelector('.ui-nig__card[data-status="unknown"]')).toBeInTheDocument()
    })

    it('renders LED indicators for each interface', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      const leds = container.querySelectorAll('.ui-nig__led')
      expect(leds.length).toBe(6)
    })

    it('renders duplex info when present', () => {
      render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      expect(screen.getByText('full')).toBeInTheDocument()
    })
  })

  // ─── Traffic display ──────────────────────────────────────────

  describe('traffic display', () => {
    it('does not show traffic by default', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      expect(container.querySelector('.ui-nig__traffic')).not.toBeInTheDocument()
    })

    it('shows traffic when showTraffic is true', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} showTraffic />)
      expect(container.querySelector('.ui-nig__traffic')).toBeInTheDocument()
    })

    it('formats traffic rates with appropriate units', () => {
      render(<NetworkInterfaceGrid interfaces={[sampleInterfaces[0]]} showTraffic />)
      expect(screen.getByText('500.0 MB/s')).toBeInTheDocument()
      expect(screen.getByText('128.0 MB/s')).toBeInTheDocument()
    })
  })

  // ─── Error display ────────────────────────────────────────────

  describe('error display', () => {
    it('does not show errors by default', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      expect(container.querySelector('.ui-nig__errors')).not.toBeInTheDocument()
    })

    it('shows errors when showErrors is true', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} showErrors />)
      expect(container.querySelector('.ui-nig__errors')).toBeInTheDocument()
    })

    it('highlights non-zero error counts', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} showErrors />)
      const errorItems = container.querySelectorAll('.ui-nig__error-item:not(.ui-nig__error-item--zero)')
      expect(errorItems.length).toBeGreaterThan(0)
    })
  })

  // ─── Interactions ─────────────────────────────────────────────

  describe('interactions', () => {
    it('renders clickable buttons when onInterfaceClick is provided', () => {
      const onClick = vi.fn()
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} onInterfaceClick={onClick} />)
      const buttons = container.querySelectorAll('.ui-nig__card-btn')
      expect(buttons.length).toBe(6)
    })

    it('calls onInterfaceClick with interface data', () => {
      const onClick = vi.fn()
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} onInterfaceClick={onClick} />)
      const buttons = container.querySelectorAll('.ui-nig__card-btn')
      fireEvent.click(buttons[0])
      expect(onClick).toHaveBeenCalledWith(sampleInterfaces[0])
    })

    it('does not render buttons when onInterfaceClick is not provided', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      expect(container.querySelectorAll('.ui-nig__card-btn')).toHaveLength(0)
    })
  })

  // ─── Sizes ────────────────────────────────────────────────────

  describe('sizes', () => {
    it('renders sm size', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} size="sm" />)
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })

    it('renders md size (default)', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })

    it('renders lg size', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} size="lg" />)
      expect(container.querySelector('[data-size="lg"]')).toBeInTheDocument()
    })
  })

  // ─── Compact mode ─────────────────────────────────────────────

  describe('compact mode', () => {
    it('sets data-compact attribute', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} compact />)
      expect(container.querySelector('[data-compact]')).toBeInTheDocument()
    })

    it('does not set data-compact by default', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      expect(container.querySelector('[data-compact]')).not.toBeInTheDocument()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ─────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} className="custom" />)
      expect(container.querySelector('.ui-network-interface-grid.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<NetworkInterfaceGrid interfaces={sampleInterfaces} data-testid="nig" />)
      expect(screen.getByTestId('nig')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(NetworkInterfaceGrid.displayName).toBe('NetworkInterfaceGrid')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────

  describe('accessibility', () => {
    it('has group role', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      expect(container.querySelector('[role="group"]')).toBeInTheDocument()
    })

    it('has aria-label', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      expect(container.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Network interfaces')
    })

    it('clickable interfaces have aria-label with status info', () => {
      const onClick = vi.fn()
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} onInterfaceClick={onClick} />)
      const buttons = container.querySelectorAll('.ui-nig__card-btn')
      expect(buttons[0].getAttribute('aria-label')).toContain('eth0')
      expect(buttons[0].getAttribute('aria-label')).toContain('up')
    })

    it('has no axe violations', async () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with clickable interfaces', async () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={sampleInterfaces} onInterfaceClick={vi.fn()} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────

  describe('edge cases', () => {
    it('renders empty grid for empty interfaces array', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={[]} />)
      expect(container.querySelector('.ui-network-interface-grid')).toBeInTheDocument()
      expect(container.querySelectorAll('.ui-nig__card')).toHaveLength(0)
    })

    it('renders single interface', () => {
      const { container } = render(<NetworkInterfaceGrid interfaces={[sampleInterfaces[0]]} />)
      expect(container.querySelectorAll('.ui-nig__card')).toHaveLength(1)
    })
  })
})
