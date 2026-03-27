import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { SwitchFaceplate } from '../../domain/switch-faceplate'

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

describe('SwitchFaceplate', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

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

  // ─── Accessibility ────────────────────────────────────────────────

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
})
