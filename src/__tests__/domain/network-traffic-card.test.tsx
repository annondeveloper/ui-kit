import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { NetworkTrafficCard, formatBitRate } from '../../domain/network-traffic-card'
import type { TrafficData } from '../../domain/network-traffic-card'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('NetworkTrafficCard', () => {
  const defaultTraffic: TrafficData = { inbound: 125000, outbound: 62500 }

  // ─── Unit Formatting ─────────────────────────────────────────────────

  describe('formatBitRate', () => {
    it('formats 0 bytes/s as 0 bps', () => {
      expect(formatBitRate(0)).toBe('0 bps')
    })

    it('formats small values as bps', () => {
      expect(formatBitRate(10)).toBe('80 bps')
    })

    it('formats values in Kbps range', () => {
      // 1000 bytes/s = 8000 bps = 8.00 Kbps
      expect(formatBitRate(1000)).toBe('8.00 Kbps')
    })

    it('formats values in Mbps range', () => {
      // 125000 bytes/s = 1,000,000 bps = 1.00 Mbps
      expect(formatBitRate(125000)).toBe('1.00 Mbps')
    })

    it('formats values in Gbps range', () => {
      // 125,000,000 bytes/s = 1,000,000,000 bps = 1.00 Gbps
      expect(formatBitRate(125000000)).toBe('1.00 Gbps')
    })

    it('formats values in Tbps range', () => {
      // 125,000,000,000 bytes/s = 1,000,000,000,000 bps = 1.00 Tbps
      expect(formatBitRate(125000000000)).toBe('1.00 Tbps')
    })

    it('formats fractional Mbps correctly', () => {
      // 500000 bytes/s = 4,000,000 bps = 4.00 Mbps
      expect(formatBitRate(500000)).toBe('4.00 Mbps')
    })

    it('formats edge case at Kbps boundary', () => {
      // 125 bytes/s = 1000 bps = 1.00 Kbps
      expect(formatBitRate(125)).toBe('1.00 Kbps')
    })

    it('formats edge case just below Kbps boundary', () => {
      // 124 bytes/s = 992 bps
      expect(formatBitRate(124)).toBe('992 bps')
    })

    it('formats large Gbps values', () => {
      // 12,500,000,000 bytes/s = 100 Gbps
      expect(formatBitRate(12500000000)).toBe('100.00 Gbps')
    })
  })

  // ─── Rendering ─────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN Link" traffic={defaultTraffic} />
      )
      expect(container.querySelector('.ui-network-traffic-card')).toBeInTheDocument()
    })

    it('renders title', () => {
      render(<NetworkTrafficCard title="WAN Link" traffic={defaultTraffic} />)
      expect(screen.getByText('WAN Link')).toBeInTheDocument()
    })

    it('renders ReactNode title', () => {
      render(
        <NetworkTrafficCard
          title={<span data-testid="custom-title">Custom</span>}
          traffic={defaultTraffic}
        />
      )
      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
    })

    it('renders inbound traffic value', () => {
      render(<NetworkTrafficCard title="WAN" traffic={defaultTraffic} />)
      expect(screen.getByText('1.00 Mbps')).toBeInTheDocument()
    })

    it('renders outbound traffic value', () => {
      render(<NetworkTrafficCard title="WAN" traffic={defaultTraffic} />)
      // 62500 bytes/s = 500,000 bps = 500.00 Kbps
      expect(screen.getByText('500.00 Kbps')).toBeInTheDocument()
    })

    it('renders inbound label', () => {
      render(<NetworkTrafficCard title="WAN" traffic={defaultTraffic} />)
      expect(screen.getByText('Inbound')).toBeInTheDocument()
    })

    it('renders outbound label', () => {
      render(<NetworkTrafficCard title="WAN" traffic={defaultTraffic} />)
      expect(screen.getByText('Outbound')).toBeInTheDocument()
    })
  })

  // ─── Vendor + Location ────────────────────────────────────────────────

  describe('vendor and location', () => {
    it('renders vendor when provided', () => {
      render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} vendor="Cloudflare" />
      )
      expect(screen.getByText('Cloudflare')).toBeInTheDocument()
    })

    it('renders location when provided', () => {
      render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} location="US-East-1" />
      )
      expect(screen.getByText('US-East-1')).toBeInTheDocument()
    })

    it('renders both vendor and location', () => {
      render(
        <NetworkTrafficCard
          title="WAN"
          traffic={defaultTraffic}
          vendor="AWS"
          location="eu-west-1"
        />
      )
      expect(screen.getByText('AWS')).toBeInTheDocument()
      expect(screen.getByText('eu-west-1')).toBeInTheDocument()
    })

    it('does not render vendor section when not provided', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} />
      )
      expect(container.querySelector('.ui-network-traffic-card__vendor')).not.toBeInTheDocument()
    })
  })

  // ─── Traffic Icons ────────────────────────────────────────────────────

  describe('traffic icons', () => {
    it('renders inbound arrow SVG', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} />
      )
      expect(container.querySelector('.ui-network-traffic-card__arrow--inbound')).toBeInTheDocument()
    })

    it('renders outbound arrow SVG', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} />
      )
      expect(container.querySelector('.ui-network-traffic-card__arrow--outbound')).toBeInTheDocument()
    })
  })

  // ─── Trend Sparkline ──────────────────────────────────────────────────

  describe('sparkline', () => {
    it('renders sparkline when trend data provided', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} trend={[10, 20, 30, 40, 50]} />
      )
      expect(container.querySelector('.ui-network-traffic-card__sparkline')).toBeInTheDocument()
    })

    it('renders sparkline as SVG', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} trend={[10, 20, 30]} />
      )
      expect(container.querySelector('.ui-network-traffic-card__sparkline svg')).toBeInTheDocument()
    })

    it('does not render sparkline without trend data', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} />
      )
      expect(container.querySelector('.ui-network-traffic-card__sparkline')).not.toBeInTheDocument()
    })

    it('does not render sparkline with fewer than 2 points', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} trend={[10]} />
      )
      expect(container.querySelector('.ui-network-traffic-card__sparkline')).not.toBeInTheDocument()
    })
  })

  // ─── Status ───────────────────────────────────────────────────────────

  describe('status', () => {
    it('applies ok status', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} status="ok" />
      )
      expect(container.querySelector('[data-status="ok"]')).toBeInTheDocument()
    })

    it('applies warning status', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} status="warning" />
      )
      expect(container.querySelector('[data-status="warning"]')).toBeInTheDocument()
    })

    it('applies critical status', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} status="critical" />
      )
      expect(container.querySelector('[data-status="critical"]')).toBeInTheDocument()
    })

    it('applies unknown status', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} status="unknown" />
      )
      expect(container.querySelector('[data-status="unknown"]')).toBeInTheDocument()
    })

    it('renders status pulse dot', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} status="ok" />
      )
      expect(container.querySelector('.ui-network-traffic-card__status')).toBeInTheDocument()
    })
  })

  // ─── Compact Mode ─────────────────────────────────────────────────────

  describe('compact mode', () => {
    it('applies compact data attribute', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} compact />
      )
      expect(container.querySelector('[data-compact]')).toBeInTheDocument()
    })

    it('does not apply compact when not set', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} />
      )
      expect(container.querySelector('[data-compact]')).not.toBeInTheDocument()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} motion={2} />
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0 for reduced motion', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} motion={0} />
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML Attributes ──────────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} className="custom" />
      )
      expect(container.querySelector('.ui-network-traffic-card.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(
        <NetworkTrafficCard title="WAN" traffic={defaultTraffic} data-testid="ntc" />
      )
      expect(screen.getByTestId('ntc')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(NetworkTrafficCard.displayName).toBe('NetworkTrafficCard')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN Link 1" traffic={defaultTraffic} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with all features', async () => {
      const { container } = render(
        <NetworkTrafficCard
          title="WAN Link 1"
          traffic={defaultTraffic}
          vendor="AWS"
          location="us-east-1"
          status="ok"
          trend={[10, 20, 30]}
          compact
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has role group', () => {
      const { container } = render(
        <NetworkTrafficCard title="WAN Link" traffic={defaultTraffic} />
      )
      expect(container.querySelector('[role="group"]')).toBeInTheDocument()
    })

    it('has aria-label from string title', () => {
      render(
        <NetworkTrafficCard title="WAN Link" traffic={defaultTraffic} />
      )
      expect(screen.getByLabelText('WAN Link')).toBeInTheDocument()
    })
  })
})
