import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { VlanBusBar } from '../../domain/vlan-bus-bar'
import type { VlanEntry } from '../../domain/vlan-bus-bar'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const sampleVlans: VlanEntry[] = [
  { id: 1, name: 'Management', ports: [1, 2, 3, 4], tagged: false },
  { id: 100, name: 'Production', ports: [1, 2, 5, 6, 7, 8], tagged: true },
  { id: 200, name: 'Development', ports: [3, 4, 9, 10], tagged: true },
]

describe('VlanBusBar', () => {
  // ─── Rendering ────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} />)
      expect(container.querySelector('.ui-vlan-bus-bar')).toBeInTheDocument()
    })

    it('renders correct number of VLAN rows', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} />)
      const rows = container.querySelectorAll('[data-testid^="vlan-row-"]')
      expect(rows).toHaveLength(3)
    })

    it('renders SVG element', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renders segment rects for ports in each VLAN', () => {
      const { container } = render(<VlanBusBar vlans={[{ id: 1, name: 'Test', ports: [1, 2, 3] }]} totalPorts={4} />)
      const segments = container.querySelectorAll('.ui-vlan-bus-bar__segment')
      expect(segments).toHaveLength(3)
    })
  })

  // ─── Interactions ─────────────────────────────────────────────────

  describe('interactions', () => {
    it('calls onVlanClick with vlan data when segment is clicked', () => {
      const onClick = vi.fn()
      const { container } = render(
        <VlanBusBar vlans={sampleVlans} totalPorts={12} onVlanClick={onClick} />
      )
      const segments = container.querySelectorAll('.ui-vlan-bus-bar__segment')
      fireEvent.click(segments[0])
      expect(onClick).toHaveBeenCalledWith(sampleVlans[0])
    })

    it('calls onPortClick with port and containing vlans', () => {
      const onClick = vi.fn()
      const { container } = render(
        <VlanBusBar vlans={sampleVlans} totalPorts={12} onPortClick={onClick} />
      )
      // Click on port tick area for port 1 (in Management and Production)
      const tickAreas = container.querySelectorAll('.ui-vlan-bus-bar__port-tick-area')
      fireEvent.click(tickAreas[0]) // port 1
      expect(onClick).toHaveBeenCalledWith(1, expect.arrayContaining([
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 100 }),
      ]))
    })
  })

  // ─── Visual states ────────────────────────────────────────────────

  describe('visual states', () => {
    it('applies data-size attribute', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} size="lg" />)
      expect(container.querySelector('[data-size="lg"]')).toBeInTheDocument()
    })

    it('applies data-orientation attribute', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} orientation="vertical" />)
      expect(container.querySelector('[data-orientation="vertical"]')).toBeInTheDocument()
    })

    it('applies data-motion attribute', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('defaults to horizontal orientation', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} />)
      expect(container.querySelector('[data-orientation="horizontal"]')).toBeInTheDocument()
    })

    it('defaults to md size', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} />)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })
  })

  // ─── Labels ───────────────────────────────────────────────────────

  describe('labels', () => {
    it('shows VLAN labels by default', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} />)
      const labels = container.querySelectorAll('.ui-vlan-bus-bar__label')
      expect(labels).toHaveLength(3)
    })

    it('hides VLAN labels when showLabels is false', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} showLabels={false} />)
      const labels = container.querySelectorAll('.ui-vlan-bus-bar__label')
      expect(labels).toHaveLength(0)
    })

    it('shows port numbers when showPortNumbers is true', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={4} showPortNumbers />)
      const portLabels = container.querySelectorAll('.ui-vlan-bus-bar__port-label')
      expect(portLabels).toHaveLength(4)
    })

    it('hides port numbers by default', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={4} />)
      const portLabels = container.querySelectorAll('.ui-vlan-bus-bar__port-label')
      expect(portLabels).toHaveLength(0)
    })

    it('uses vlan name when provided', () => {
      const { container } = render(<VlanBusBar vlans={[{ id: 42, name: 'MyVLAN', ports: [1] }]} totalPorts={2} />)
      const label = container.querySelector('.ui-vlan-bus-bar__label')
      expect(label?.textContent).toBe('MyVLAN')
    })

    it('falls back to VLAN ID when name is not provided', () => {
      const { container } = render(<VlanBusBar vlans={[{ id: 42, ports: [1] }]} totalPorts={2} />)
      const label = container.querySelector('.ui-vlan-bus-bar__label')
      expect(label?.textContent).toBe('VLAN 42')
    })
  })

  // ─── Auto-colors ──────────────────────────────────────────────────

  describe('auto-colors', () => {
    it('generates unique colors when not provided', () => {
      const vlans: VlanEntry[] = [
        { id: 1, ports: [1] },
        { id: 2, ports: [2] },
        { id: 3, ports: [3] },
      ]
      const { container } = render(<VlanBusBar vlans={vlans} totalPorts={3} />)
      const segments = container.querySelectorAll('.ui-vlan-bus-bar__segment')
      const fills = Array.from(segments).map(s => s.getAttribute('fill'))
      // All fills should be unique
      const unique = new Set(fills)
      expect(unique.size).toBe(3)
    })

    it('uses provided color when set', () => {
      const vlans: VlanEntry[] = [
        { id: 1, color: 'oklch(50% 0.2 120)', ports: [1] },
      ]
      const { container } = render(<VlanBusBar vlans={vlans} totalPorts={1} />)
      const segment = container.querySelector('.ui-vlan-bus-bar__segment')
      expect(segment?.getAttribute('fill')).toBe('oklch(50% 0.2 120)')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has role="img"', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} />)
      expect(container.querySelector('[role="img"]')).toBeInTheDocument()
    })

    it('has descriptive aria-label', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} />)
      const el = container.querySelector('[role="img"]')
      expect(el?.getAttribute('aria-label')).toContain('3 VLANs')
      expect(el?.getAttribute('aria-label')).toContain('12 ports')
    })

    it('has no axe violations', async () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with all options enabled', async () => {
      const { container } = render(
        <VlanBusBar
          vlans={sampleVlans}
          totalPorts={12}
          showLabels
          showPortNumbers
          onVlanClick={vi.fn()}
          onPortClick={vi.fn()}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────

  describe('edge cases', () => {
    it('renders with empty vlans array', () => {
      const { container } = render(<VlanBusBar vlans={[]} totalPorts={4} />)
      expect(container.querySelector('.ui-vlan-bus-bar')).toBeInTheDocument()
      expect(container.querySelectorAll('.ui-vlan-bus-bar__segment')).toHaveLength(0)
    })

    it('renders with single VLAN', () => {
      const { container } = render(
        <VlanBusBar vlans={[{ id: 1, name: 'Only', ports: [1, 2] }]} totalPorts={2} />
      )
      expect(container.querySelectorAll('[data-testid^="vlan-row-"]')).toHaveLength(1)
      expect(container.querySelectorAll('.ui-vlan-bus-bar__segment')).toHaveLength(2)
    })

    it('handles overlapping port ranges across VLANs', () => {
      const vlans: VlanEntry[] = [
        { id: 1, ports: [1, 2, 3] },
        { id: 2, ports: [2, 3, 4] },
        { id: 3, ports: [3, 4, 5] },
      ]
      const { container } = render(<VlanBusBar vlans={vlans} totalPorts={5} />)
      const segments = container.querySelectorAll('.ui-vlan-bus-bar__segment')
      // 3 + 3 + 3 = 9 segments total
      expect(segments).toHaveLength(9)
    })

    it('passes className', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} className="custom" />)
      expect(container.querySelector('.ui-vlan-bus-bar.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<VlanBusBar vlans={sampleVlans} totalPorts={12} data-testid="busbar" />)
      expect(screen.getByTestId('busbar')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(VlanBusBar.displayName).toBe('VlanBusBar')
    })
  })

  // ─── New props (v2.7) ─────────────────────────────────────────────

  describe('highlightPorts / highlightVlans', () => {
    it('renders connector dots for port-VLAN membership', () => {
      const { container } = render(<VlanBusBar vlans={sampleVlans} totalPorts={12} />)
      const connectors = container.querySelectorAll('.ui-vlan-bus-bar__connector')
      // Management has 4 ports, Production 6, Development 4 => 14 connectors
      expect(connectors.length).toBe(14)
    })

    it('applies highlighted class when highlightPorts is set', () => {
      const { container } = render(
        <VlanBusBar vlans={sampleVlans} totalPorts={12} highlightPorts={[1]} />
      )
      const highlighted = container.querySelectorAll('.ui-vlan-bus-bar__segment--highlighted')
      // Port 1 is in Management and Production = 2 highlighted segments
      expect(highlighted.length).toBe(2)
    })

    it('applies highlighted class when highlightVlans is set', () => {
      const { container } = render(
        <VlanBusBar vlans={sampleVlans} totalPorts={12} highlightVlans={[200]} />
      )
      const highlighted = container.querySelectorAll('.ui-vlan-bus-bar__segment--highlighted')
      // VLAN 200 (Development) has ports 3,4,9,10 = 4 segments highlighted
      expect(highlighted.length).toBe(4)
    })

    it('dims non-highlighted segments when highlight is active', () => {
      const { container } = render(
        <VlanBusBar vlans={sampleVlans} totalPorts={12} highlightVlans={[1]} />
      )
      const dimmed = container.querySelectorAll('.ui-vlan-bus-bar__segment--dimmed')
      expect(dimmed.length).toBeGreaterThan(0)
    })
  })

  describe('showTrunkIndicator', () => {
    it('renders trunk/access indicators when enabled', () => {
      const { container } = render(
        <VlanBusBar vlans={sampleVlans} totalPorts={12} showTrunkIndicator />
      )
      const indicators = container.querySelectorAll('.ui-vlan-bus-bar__trunk-indicator')
      expect(indicators.length).toBe(12)
    })

    it('marks trunk ports with T class', () => {
      const { container } = render(
        <VlanBusBar vlans={sampleVlans} totalPorts={12} showTrunkIndicator />
      )
      const trunkIndicators = container.querySelectorAll('.ui-vlan-bus-bar__trunk-indicator--trunk')
      expect(trunkIndicators.length).toBeGreaterThan(0)
    })
  })

  describe('compactMode', () => {
    it('applies data-compact attribute', () => {
      const { container } = render(
        <VlanBusBar vlans={sampleVlans} totalPorts={12} compactMode />
      )
      expect(container.querySelector('[data-compact]')).toBeInTheDocument()
    })

    it('hides labels in compact mode', () => {
      const { container } = render(
        <VlanBusBar vlans={sampleVlans} totalPorts={12} compactMode showLabels />
      )
      expect(container.querySelectorAll('.ui-vlan-bus-bar__label').length).toBe(0)
    })

    it('uses sm size config in compact mode', () => {
      const { container } = render(
        <VlanBusBar vlans={sampleVlans} totalPorts={12} compactMode size="lg" />
      )
      // Should apply sm, not lg
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })
  })

  describe('maxHeight', () => {
    it('applies maxBlockSize style when maxHeight is set', () => {
      const { container } = render(
        <VlanBusBar vlans={sampleVlans} totalPorts={12} maxHeight={200} />
      )
      const el = container.querySelector('.ui-vlan-bus-bar') as HTMLElement
      expect(el.style.maxBlockSize).toBe('200px')
    })

    it('applies string maxHeight', () => {
      const { container } = render(
        <VlanBusBar vlans={sampleVlans} totalPorts={12} maxHeight="50vh" />
      )
      const el = container.querySelector('.ui-vlan-bus-bar') as HTMLElement
      expect(el.style.maxBlockSize).toBe('50vh')
    })
  })

  describe('colorScheme', () => {
    it('generates sequential colors with sequential scheme', () => {
      const vlans: VlanEntry[] = [
        { id: 1, ports: [1] },
        { id: 2, ports: [2] },
        { id: 3, ports: [3] },
      ]
      const { container } = render(
        <VlanBusBar vlans={vlans} totalPorts={3} colorScheme="sequential" />
      )
      const segments = container.querySelectorAll('.ui-vlan-bus-bar__segment')
      const fills = Array.from(segments).map(s => s.getAttribute('fill'))
      // All should contain hue 250 (blue)
      fills.forEach(f => expect(f).toContain('250'))
    })
  })

  describe('callbacks', () => {
    it('calls onPortHover on port enter/leave', () => {
      const onPortHover = vi.fn()
      const { container } = render(
        <VlanBusBar vlans={sampleVlans} totalPorts={12} onPortHover={onPortHover} />
      )
      const tickAreas = container.querySelectorAll('.ui-vlan-bus-bar__port-tick-area')
      fireEvent.mouseEnter(tickAreas[0])
      expect(onPortHover).toHaveBeenCalledWith(1)
      fireEvent.mouseLeave(tickAreas[0])
      expect(onPortHover).toHaveBeenCalledWith(null)
    })

    it('calls onVlanHover on segment enter/leave', () => {
      const onVlanHover = vi.fn()
      const { container } = render(
        <VlanBusBar vlans={sampleVlans} totalPorts={12} onVlanHover={onVlanHover} />
      )
      const segments = container.querySelectorAll('.ui-vlan-bus-bar__segment')
      fireEvent.mouseEnter(segments[0])
      expect(onVlanHover).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
      fireEvent.mouseLeave(segments[0])
      expect(onVlanHover).toHaveBeenCalledWith(null)
    })
  })
})
