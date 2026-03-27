import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { SwitchFaceplate } from '../../domain/switch-faceplate'
import type { SwitchPort } from '../../domain/switch-faceplate'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const samplePorts = [
  { id: 1, status: 'up' as const, speed: '1G', type: 'ethernet' as const },
  { id: 2, status: 'down' as const, type: 'ethernet' as const },
  { id: 3, status: 'admin-down' as const, type: 'ethernet' as const },
  { id: 4, status: 'unused' as const, type: 'sfp' as const },
  { id: 5, status: 'up' as const, speed: '10G', type: 'sfp' as const, label: 'Uplink', vlan: 100 },
  { id: 6, status: 'up' as const, speed: '40G', type: 'qsfp' as const },
]

const makePorts = (count: number): SwitchPort[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    status: (['up', 'down', 'admin-down', 'unused'] as const)[i % 4],
    speed: '1G',
    type: 'ethernet' as const,
  }))

describe('SwitchFaceplate', () => {
  // ─── Rendering (ours) ──────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} />)
      expect(container.querySelector('.ui-switch-faceplate')).toBeInTheDocument()
    })

    it('renders port elements for each port', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} />)
      const ports = container.querySelectorAll('.ui-switch-faceplate__port')
      expect(ports.length).toBe(6)
    })

    it('renders header label when provided', () => {
      render(<SwitchFaceplate ports={samplePorts} label="Core Switch 1" />)
      expect(screen.getByText('Core Switch 1')).toBeInTheDocument()
    })

    it('renders port status data attributes', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} />)
      expect(container.querySelector('[data-status="up"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="down"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="admin-down"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="unused"]')).toBeInTheDocument()
    })

    it('renders port type data attributes', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} />)
      expect(container.querySelector('[data-type="ethernet"]')).toBeInTheDocument()
      expect(container.querySelector('[data-type="sfp"]')).toBeInTheDocument()
      expect(container.querySelector('[data-type="qsfp"]')).toBeInTheDocument()
    })

    it('renders activity LED for up ports', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} />)
      const leds = container.querySelectorAll('.ui-switch-faceplate__led')
      expect(leds.length).toBe(3) // ports 1, 5, 6 are "up"
    })
  })

  // ─── Port click ───────────────────────────────────────────────────

  describe('port click', () => {
    it('renders clickable buttons when onPortClick is provided', () => {
      const onClick = vi.fn()
      const { container } = render(<SwitchFaceplate ports={samplePorts} onPortClick={onClick} />)
      const buttons = container.querySelectorAll('.ui-switch-faceplate__port-btn')
      expect(buttons.length).toBe(6)
    })

    it('calls onPortClick with port data', () => {
      const onClick = vi.fn()
      const { container } = render(<SwitchFaceplate ports={samplePorts} onPortClick={onClick} />)
      const buttons = container.querySelectorAll('.ui-switch-faceplate__port-btn')
      fireEvent.click(buttons[0])
      expect(onClick).toHaveBeenCalledWith(samplePorts[0])
    })
  })

  // ─── Tooltip ──────────────────────────────────────────────────────

  describe('tooltip', () => {
    it('shows tooltip on port hover', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} />)
      const ports = container.querySelectorAll('.ui-switch-faceplate__port')
      fireEvent.mouseEnter(ports[0])
      expect(container.querySelector('.ui-switch-faceplate__tooltip')).toBeInTheDocument()
    })

    it('hides tooltip on mouse leave', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} />)
      const ports = container.querySelectorAll('.ui-switch-faceplate__port')
      fireEvent.mouseEnter(ports[0])
      fireEvent.mouseLeave(ports[0])
      expect(container.querySelector('.ui-switch-faceplate__tooltip')).not.toBeInTheDocument()
    })
  })

  // ─── Sizes ────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('renders sm size', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} size="sm" />)
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })

    it('renders md size (default)', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} />)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })

    it('renders lg size', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} size="lg" />)
      expect(container.querySelector('[data-size="lg"]')).toBeInTheDocument()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ─────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} className="custom" />)
      expect(container.querySelector('.ui-switch-faceplate.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<SwitchFaceplate ports={samplePorts} data-testid="faceplate" />)
      expect(screen.getByTestId('faceplate')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(SwitchFaceplate.displayName).toBe('SwitchFaceplate')
    })
  })

  // ─── Accessibility (ours) ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has group role', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} />)
      expect(container.querySelector('[role="group"]')).toBeInTheDocument()
    })

    it('has aria-label', () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} />)
      expect(container.querySelector('[role="group"]')?.getAttribute('aria-label')).toContain('switch faceplate')
    })

    it('clickable ports have aria-label with status info', () => {
      const onClick = vi.fn()
      const { container } = render(<SwitchFaceplate ports={samplePorts} onPortClick={onClick} />)
      const buttons = container.querySelectorAll('.ui-switch-faceplate__port-btn')
      expect(buttons[0].getAttribute('aria-label')).toContain('Port 1')
      expect(buttons[0].getAttribute('aria-label')).toContain('up')
    })

    it('has no axe violations', async () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with clickable ports', async () => {
      const { container } = render(<SwitchFaceplate ports={samplePorts} onPortClick={vi.fn()} label="Switch" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Rendering (origin/main) ───────────────────────────────────────

  describe('rendering (origin/main)', () => {
    it('renders with role="group"', () => {
      render(<SwitchFaceplate ports={makePorts(8)} />)
      expect(screen.getByRole('group')).toBeInTheDocument()
    })

    it('renders correct number of port elements', () => {
      const { container } = render(<SwitchFaceplate ports={makePorts(24)} />)
      const ports = container.querySelectorAll('.ui-switch-faceplate__port')
      expect(ports).toHaveLength(24)
    })

    it('renders port status data attributes', () => {
      // Ports are split across rows (even/odd indices), so DOM order is:
      // row0: port1(up), port3(admin-down) | row1: port2(down), port4(unused)
      const { container } = render(<SwitchFaceplate ports={makePorts(4)} />)
      const ports = container.querySelectorAll('.ui-switch-faceplate__port')
      expect(ports[0]).toHaveAttribute('data-status', 'up')
      expect(ports[1]).toHaveAttribute('data-status', 'admin-down')
      expect(ports[2]).toHaveAttribute('data-status', 'down')
      expect(ports[3]).toHaveAttribute('data-status', 'unused')
    })

    it('renders label header when label prop is provided', () => {
      render(<SwitchFaceplate ports={makePorts(4)} label="SW-CORE-01" />)
      expect(screen.getByText('SW-CORE-01')).toBeInTheDocument()
    })

    it('renders aria-label with switch name', () => {
      render(<SwitchFaceplate ports={makePorts(4)} label="SW-CORE-01" />)
      expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Switch: SW-CORE-01')
    })

    it('renders activity LEDs for up ports', () => {
      const { container } = render(<SwitchFaceplate ports={makePorts(4)} />)
      const leds = container.querySelectorAll('.ui-switch-faceplate__led')
      expect(leds).toHaveLength(1) // only port 1 is 'up' in makePorts(4)
    })

    it('applies data-size attribute', () => {
      const { container } = render(<SwitchFaceplate ports={makePorts(4)} size="lg" />)
      expect(container.querySelector('.ui-switch-faceplate')).toHaveAttribute('data-size', 'lg')
    })
  })

  // ─── Interactions (origin/main) ────────────────────────────────────

  describe('interactions (origin/main)', () => {
    it('calls onPortClick when a port button is clicked', () => {
      const onPortClick = vi.fn()
      render(<SwitchFaceplate ports={makePorts(4)} onPortClick={onPortClick} />)
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])
      expect(onPortClick).toHaveBeenCalledOnce()
      expect(onPortClick.mock.calls[0][0]).toHaveProperty('id', 1)
    })

    it('renders buttons only when onPortClick is provided', () => {
      const { container, rerender } = render(<SwitchFaceplate ports={makePorts(4)} />)
      expect(container.querySelectorAll('.ui-switch-faceplate__port-btn')).toHaveLength(0)
      rerender(<SwitchFaceplate ports={makePorts(4)} onPortClick={() => {}} />)
      expect(container.querySelectorAll('.ui-switch-faceplate__port-btn')).toHaveLength(4)
    })
  })

  // ─── Accessibility (origin/main) ───────────────────────────────────

  describe('accessibility (origin/main)', () => {
    it('has no axe violations', async () => {
      const { container } = render(<SwitchFaceplate ports={makePorts(8)} label="Test Switch" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name (origin/main) ────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "SwitchFaceplate"', () => {
      expect(SwitchFaceplate.displayName).toBe('SwitchFaceplate')
    })
  })
})
