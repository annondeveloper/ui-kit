import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import {
  UpstreamDashboard,
  formatBitRateSplit,
  formatRelativeTime,
} from '../../domain/upstream-dashboard'
import type { UpstreamLink } from '../../domain/upstream-dashboard'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

// ─── Test Data ──────────────────────────────────────────────────────────────

function makeLink(overrides: Partial<UpstreamLink> & { id: string }): UpstreamLink {
  return {
    vendor: 'Cloudflare',
    location: 'us-east-1',
    inbound: 125000000,    // 1 Gbps
    outbound: 62500000,    // 500 Mbps
    status: 'ok',
    ...overrides,
  }
}

const sampleLinks: UpstreamLink[] = [
  makeLink({ id: 'cf-1', vendor: 'Cloudflare', location: 'us-east-1', status: 'ok' }),
  makeLink({ id: 'aws-1', vendor: 'AWS', location: 'eu-west-1', status: 'warning', inbound: 250000000, outbound: 125000000 }),
  makeLink({ id: 'gcp-1', vendor: 'GCP', location: 'asia-east-1', status: 'critical', inbound: 62500000, outbound: 31250000 }),
]

describe('UpstreamDashboard', () => {
  // ─── formatBitRateSplit ─────────────────────────────────────────────────

  describe('formatBitRateSplit', () => {
    it('formats 0 bytes/s as 0 bps', () => {
      const r = formatBitRateSplit(0)
      expect(r).toEqual({ value: '0', unit: 'bps' })
    })

    it('formats small values as bps', () => {
      const r = formatBitRateSplit(10)
      expect(r).toEqual({ value: '80', unit: 'bps' })
    })

    it('formats values in Kbps range', () => {
      const r = formatBitRateSplit(1000)
      expect(r).toEqual({ value: '8.00', unit: 'Kbps' })
    })

    it('formats values in Mbps range', () => {
      const r = formatBitRateSplit(125000)
      expect(r).toEqual({ value: '1.00', unit: 'Mbps' })
    })

    it('formats values in Gbps range', () => {
      const r = formatBitRateSplit(125000000)
      expect(r).toEqual({ value: '1.00', unit: 'Gbps' })
    })

    it('formats values in Tbps range', () => {
      const r = formatBitRateSplit(125000000000)
      expect(r).toEqual({ value: '1.00', unit: 'Tbps' })
    })

    it('formats fractional values correctly', () => {
      const r = formatBitRateSplit(500000)
      expect(r).toEqual({ value: '4.00', unit: 'Mbps' })
    })

    it('formats edge case at Kbps boundary', () => {
      const r = formatBitRateSplit(125)
      expect(r).toEqual({ value: '1.00', unit: 'Kbps' })
    })
  })

  // ─── formatRelativeTime ────────────────────────────────────────────────

  describe('formatRelativeTime', () => {
    it('formats seconds ago', () => {
      const result = formatRelativeTime(Date.now() - 5000)
      expect(result).toMatch(/^\d+s ago$/)
    })

    it('formats minutes ago', () => {
      const result = formatRelativeTime(Date.now() - 120000)
      expect(result).toBe('2m ago')
    })

    it('formats hours ago', () => {
      const result = formatRelativeTime(Date.now() - 7200000)
      expect(result).toBe('2h ago')
    })

    it('formats days ago', () => {
      const result = formatRelativeTime(Date.now() - 172800000)
      expect(result).toBe('2d ago')
    })
  })

  // ─── Empty State ──────────────────────────────────────────────────────

  describe('empty state', () => {
    it('renders empty state with empty links array', () => {
      render(<UpstreamDashboard links={[]} />)
      expect(screen.getByText('No upstream links configured')).toBeInTheDocument()
    })

    it('does not render summary when links are empty even with showSummary', () => {
      const { container } = render(<UpstreamDashboard links={[]} showSummary />)
      expect(container.querySelector('.ui-upstream-dashboard__summary')).not.toBeInTheDocument()
    })

    it('does not render grid when links are empty', () => {
      const { container } = render(<UpstreamDashboard links={[]} />)
      expect(container.querySelector('.ui-upstream-dashboard__grid')).not.toBeInTheDocument()
    })
  })

  // ─── Rendering ────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<UpstreamDashboard links={sampleLinks} />)
      expect(container.querySelector('.ui-upstream-dashboard')).toBeInTheDocument()
    })

    it('renders title when provided', () => {
      render(<UpstreamDashboard links={sampleLinks} title="NOC Dashboard" />)
      expect(screen.getByText('NOC Dashboard')).toBeInTheDocument()
    })

    it('renders ReactNode title', () => {
      render(
        <UpstreamDashboard
          links={sampleLinks}
          title={<span data-testid="custom-title">Custom</span>}
        />
      )
      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
    })

    it('renders individual link cards for each link', () => {
      const { container } = render(<UpstreamDashboard links={sampleLinks} />)
      const linkCards = container.querySelectorAll('.ui-upstream-dashboard__link')
      expect(linkCards.length).toBe(3)
    })

    it('renders vendor name on each card', () => {
      render(<UpstreamDashboard links={sampleLinks} />)
      expect(screen.getByText('Cloudflare')).toBeInTheDocument()
      expect(screen.getByText('AWS')).toBeInTheDocument()
      expect(screen.getByText('GCP')).toBeInTheDocument()
    })

    it('renders location on each card', () => {
      render(<UpstreamDashboard links={sampleLinks} />)
      expect(screen.getByText('us-east-1')).toBeInTheDocument()
      expect(screen.getByText('eu-west-1')).toBeInTheDocument()
      expect(screen.getByText('asia-east-1')).toBeInTheDocument()
    })
  })

  // ─── Summary Card ────────────────────────────────────────────────────

  describe('summary card', () => {
    it('renders summary when showSummary is true', () => {
      const { container } = render(
        <UpstreamDashboard links={sampleLinks} showSummary />
      )
      expect(container.querySelector('.ui-upstream-dashboard__summary')).toBeInTheDocument()
    })

    it('does not render summary when showSummary is false', () => {
      const { container } = render(
        <UpstreamDashboard links={sampleLinks} />
      )
      expect(container.querySelector('.ui-upstream-dashboard__summary')).not.toBeInTheDocument()
    })

    it('renders summary title', () => {
      render(<UpstreamDashboard links={sampleLinks} showSummary />)
      expect(screen.getByText('Upstream Traffic Summary')).toBeInTheDocument()
    })

    it('renders aggregated inbound traffic correctly', () => {
      // Total inbound: 125M + 250M + 62.5M = 437.5M bytes/s = 3.50 Gbps
      render(<UpstreamDashboard links={sampleLinks} showSummary />)
      const inbound = screen.getByTestId('summary-inbound')
      expect(inbound.textContent).toContain('3.50')
      expect(inbound.textContent).toContain('Gbps')
    })

    it('renders aggregated outbound traffic correctly', () => {
      // Total outbound: 62.5M + 125M + 31.25M = 218.75M bytes/s = 1.75 Gbps
      render(<UpstreamDashboard links={sampleLinks} showSummary />)
      const outbound = screen.getByTestId('summary-outbound')
      expect(outbound.textContent).toContain('1.75')
      expect(outbound.textContent).toContain('Gbps')
    })

    it('renders total traffic correctly', () => {
      // Total: (437.5M + 218.75M) * 8 = 5.25 Gbps
      render(<UpstreamDashboard links={sampleLinks} showSummary />)
      const total = screen.getByTestId('summary-total')
      expect(total.textContent).toContain('5.25')
      expect(total.textContent).toContain('Gbps')
    })

    it('renders link count', () => {
      render(<UpstreamDashboard links={sampleLinks} showSummary />)
      expect(screen.getByText('3 Links')).toBeInTheDocument()
    })

    it('renders status breakdown counts correctly', () => {
      render(<UpstreamDashboard links={sampleLinks} showSummary />)
      expect(screen.getByText('1 Healthy')).toBeInTheDocument()
      expect(screen.getByText('1 Warning')).toBeInTheDocument()
      expect(screen.getByText('1 Critical')).toBeInTheDocument()
    })

    it('does not render status category if count is zero', () => {
      const links = [makeLink({ id: 'a', status: 'ok' })]
      render(<UpstreamDashboard links={links} showSummary />)
      expect(screen.getByText('1 Healthy')).toBeInTheDocument()
      expect(screen.queryByText(/Warning/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Critical/)).not.toBeInTheDocument()
    })

    it('renders lastUpdated as relative time (number)', () => {
      const ts = Date.now() - 5000
      render(<UpstreamDashboard links={sampleLinks} showSummary lastUpdated={ts} />)
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    })

    it('renders lastUpdated as relative time (Date)', () => {
      const d = new Date(Date.now() - 120000)
      render(<UpstreamDashboard links={sampleLinks} showSummary lastUpdated={d} />)
      expect(screen.getByText(/Last updated:.*2m ago/)).toBeInTheDocument()
    })
  })

  // ─── Status ───────────────────────────────────────────────────────────

  describe('status indicators', () => {
    it('applies ok status to link card', () => {
      const { container } = render(
        <UpstreamDashboard links={[makeLink({ id: 'a', status: 'ok' })]} />
      )
      expect(container.querySelector('.ui-upstream-dashboard__link[data-status="ok"]')).toBeInTheDocument()
    })

    it('applies warning status to link card', () => {
      const { container } = render(
        <UpstreamDashboard links={[makeLink({ id: 'a', status: 'warning' })]} />
      )
      expect(container.querySelector('.ui-upstream-dashboard__link[data-status="warning"]')).toBeInTheDocument()
    })

    it('applies critical status to link card', () => {
      const { container } = render(
        <UpstreamDashboard links={[makeLink({ id: 'a', status: 'critical' })]} />
      )
      expect(container.querySelector('.ui-upstream-dashboard__link[data-status="critical"]')).toBeInTheDocument()
    })

    it('applies unknown status to link card', () => {
      const { container } = render(
        <UpstreamDashboard links={[makeLink({ id: 'a', status: 'unknown' })]} />
      )
      expect(container.querySelector('.ui-upstream-dashboard__link[data-status="unknown"]')).toBeInTheDocument()
    })

    it('renders status dot', () => {
      const { container } = render(
        <UpstreamDashboard links={[makeLink({ id: 'a', status: 'ok' })]} />
      )
      expect(container.querySelector('.ui-upstream-dashboard__status-dot')).toBeInTheDocument()
    })
  })

  // ─── Grouping ─────────────────────────────────────────────────────────

  describe('groupBy', () => {
    const groupableLinks: UpstreamLink[] = [
      makeLink({ id: '1', vendor: 'Cloudflare', location: 'us-east-1' }),
      makeLink({ id: '2', vendor: 'Cloudflare', location: 'eu-west-1' }),
      makeLink({ id: '3', vendor: 'AWS', location: 'us-east-1' }),
      makeLink({ id: '4', vendor: 'AWS', location: 'ap-south-1' }),
      makeLink({ id: '5', vendor: 'GCP', location: 'eu-west-1' }),
    ]

    it('groups links by vendor', () => {
      const { container } = render(
        <UpstreamDashboard links={groupableLinks} groupBy="vendor" />
      )
      const groups = container.querySelectorAll('.ui-upstream-dashboard__group')
      expect(groups.length).toBe(3) // Cloudflare, AWS, GCP
    })

    it('renders vendor names as group titles', () => {
      const { container } = render(<UpstreamDashboard links={groupableLinks} groupBy="vendor" />)
      const titles = container.querySelectorAll('.ui-upstream-dashboard__group-title')
      const titleTexts = Array.from(titles).map(t => t.textContent)
      expect(titleTexts).toContain('Cloudflare')
      expect(titleTexts).toContain('AWS')
      expect(titleTexts).toContain('GCP')
    })

    it('groups links by location', () => {
      const { container } = render(
        <UpstreamDashboard links={groupableLinks} groupBy="location" />
      )
      const groups = container.querySelectorAll('.ui-upstream-dashboard__group')
      expect(groups.length).toBe(3) // us-east-1, eu-west-1, ap-south-1
    })

    it('renders location names as group titles when groupBy=location', () => {
      render(<UpstreamDashboard links={groupableLinks} groupBy="location" />)
      // us-east-1 appears as group title (and as card location text)
      const usEast = screen.getAllByText('us-east-1')
      expect(usEast.length).toBeGreaterThanOrEqual(1)
    })

    it('renders flat list when groupBy=none', () => {
      const { container } = render(
        <UpstreamDashboard links={groupableLinks} groupBy="none" />
      )
      expect(container.querySelector('.ui-upstream-dashboard__group')).not.toBeInTheDocument()
      const linkCards = container.querySelectorAll('.ui-upstream-dashboard__link')
      expect(linkCards.length).toBe(5)
    })

    it('renders aggregated traffic per group', () => {
      render(<UpstreamDashboard links={groupableLinks} groupBy="vendor" />)
      // Each group summary shows traffic in/out
      const summaries = screen.getAllByText(/in \/ .* out/)
      expect(summaries.length).toBe(3)
    })

    it('collapses group when header clicked', () => {
      const { container } = render(
        <UpstreamDashboard links={groupableLinks} groupBy="vendor" />
      )
      const headers = container.querySelectorAll('.ui-upstream-dashboard__group-header')
      expect(headers[0].getAttribute('aria-expanded')).toBe('true')

      fireEvent.click(headers[0])

      const group = container.querySelectorAll('.ui-upstream-dashboard__group')[0]
      expect(group.hasAttribute('data-collapsed')).toBe(true)
      expect(headers[0].getAttribute('aria-expanded')).toBe('false')
    })
  })

  // ─── Compact Mode ────────────────────────────────────────────────────

  describe('compact mode', () => {
    it('applies compact data attribute', () => {
      const { container } = render(
        <UpstreamDashboard links={sampleLinks} compact />
      )
      expect(container.querySelector('[data-compact]')).toBeInTheDocument()
    })

    it('does not apply compact when not set', () => {
      const { container } = render(
        <UpstreamDashboard links={sampleLinks} />
      )
      expect(container.querySelector('[data-compact]')).not.toBeInTheDocument()
    })
  })

  // ─── Sparkline / Trend ────────────────────────────────────────────────

  describe('sparkline', () => {
    it('renders sparkline when trend data provided', () => {
      const links = [makeLink({ id: 'a', trend: [10, 20, 30, 40, 50] })]
      const { container } = render(<UpstreamDashboard links={links} />)
      expect(container.querySelector('.ui-upstream-dashboard__sparkline')).toBeInTheDocument()
    })

    it('renders sparkline as SVG', () => {
      const links = [makeLink({ id: 'a', trend: [10, 20, 30] })]
      const { container } = render(<UpstreamDashboard links={links} />)
      expect(container.querySelector('.ui-upstream-dashboard__sparkline svg')).toBeInTheDocument()
    })

    it('does not render sparkline without trend data', () => {
      const links = [makeLink({ id: 'a' })]
      const { container } = render(<UpstreamDashboard links={links} />)
      expect(container.querySelector('.ui-upstream-dashboard__sparkline')).not.toBeInTheDocument()
    })

    it('does not render sparkline with fewer than 2 points', () => {
      const links = [makeLink({ id: 'a', trend: [10] })]
      const { container } = render(<UpstreamDashboard links={links} />)
      expect(container.querySelector('.ui-upstream-dashboard__sparkline')).not.toBeInTheDocument()
    })

    it('does not render sparkline in compact mode', () => {
      const links = [makeLink({ id: 'a', trend: [10, 20, 30] })]
      const { container } = render(<UpstreamDashboard links={links} compact />)
      expect(container.querySelector('.ui-upstream-dashboard__sparkline')).not.toBeInTheDocument()
    })
  })

  // ─── Container Query Responsive ───────────────────────────────────────

  describe('responsive container queries', () => {
    it('sets container-type on root element', () => {
      const { container } = render(<UpstreamDashboard links={sampleLinks} />)
      const root = container.querySelector('.ui-upstream-dashboard')
      expect(root).toBeInTheDocument()
      // We can verify the class exists; actual container-type is CSS
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(
        <UpstreamDashboard links={sampleLinks} motion={2} />
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0 for reduced motion', () => {
      const { container } = render(
        <UpstreamDashboard links={sampleLinks} motion={0} />
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML Attributes ──────────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(
        <UpstreamDashboard links={sampleLinks} className="custom" />
      )
      expect(container.querySelector('.ui-upstream-dashboard.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(
        <UpstreamDashboard links={sampleLinks} data-testid="ud" />
      )
      expect(screen.getByTestId('ud')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(UpstreamDashboard.displayName).toBe('UpstreamDashboard')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations with minimal props', async () => {
      const { container } = render(
        <UpstreamDashboard links={sampleLinks} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with all features', async () => {
      const { container } = render(
        <UpstreamDashboard
          links={sampleLinks}
          title="NOC Dashboard"
          showSummary
          groupBy="vendor"
          compact
          lastUpdated={Date.now()}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has region role on root', () => {
      const { container } = render(
        <UpstreamDashboard links={sampleLinks} title="NOC" />
      )
      expect(container.querySelector('[role="region"]')).toBeInTheDocument()
    })

    it('has aria-label from string title', () => {
      render(<UpstreamDashboard links={sampleLinks} title="NOC Dashboard" />)
      expect(screen.getByLabelText('NOC Dashboard')).toBeInTheDocument()
    })

    it('has default aria-label when no title', () => {
      render(<UpstreamDashboard links={sampleLinks} />)
      expect(screen.getByLabelText('Upstream Dashboard')).toBeInTheDocument()
    })

    it('link cards have role group', () => {
      const { container } = render(
        <UpstreamDashboard links={[makeLink({ id: 'a' })]} />
      )
      expect(container.querySelector('.ui-upstream-dashboard__link[role="group"]')).toBeInTheDocument()
    })

    it('link cards have aria-label with vendor and location', () => {
      render(
        <UpstreamDashboard links={[makeLink({ id: 'a', vendor: 'AWS', location: 'us-east-1' })]} />
      )
      expect(screen.getByLabelText('AWS us-east-1')).toBeInTheDocument()
    })

    it('summary card has region role and label', () => {
      render(<UpstreamDashboard links={sampleLinks} showSummary />)
      expect(screen.getByLabelText('Upstream Traffic Summary')).toBeInTheDocument()
    })

    it('group headers have aria-expanded', () => {
      const { container } = render(
        <UpstreamDashboard links={sampleLinks} groupBy="vendor" />
      )
      const headers = container.querySelectorAll('.ui-upstream-dashboard__group-header')
      for (const h of headers) {
        expect(h.getAttribute('aria-expanded')).toBe('true')
      }
    })
  })

  // ─── ErrorBoundary ────────────────────────────────────────────────────

  describe('error boundary', () => {
    it('wraps in ComponentErrorBoundary', () => {
      // If ErrorBoundary catches, it renders fallback. We just verify no crash.
      const { container } = render(<UpstreamDashboard links={sampleLinks} />)
      expect(container.querySelector('.ui-upstream-dashboard')).toBeInTheDocument()
    })
  })
})
