import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { SwitchFaceplate } from '../../domain/switch-faceplate'
import type { SwitchPort } from '../../domain/switch-faceplate'

expect.extend(toHaveNoViolations)

const makePorts = (count: number): SwitchPort[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    status: (['up', 'down', 'admin-down', 'unused'] as const)[i % 4],
    speed: '1G',
    type: 'ethernet' as const,
  }))

describe('SwitchFaceplate', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
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

  // ─── Interaction tests ─────────────────────────────────────────────

  describe('interactions', () => {
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

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<SwitchFaceplate ports={makePorts(8)} label="Test Switch" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "SwitchFaceplate"', () => {
      expect(SwitchFaceplate.displayName).toBe('SwitchFaceplate')
    })
  })
})
