import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MetricCard } from '../../domain/metric-card'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('MetricCard', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<MetricCard title="CPU" value="85%" />)
      expect(container.querySelector('.ui-metric-card')).toBeInTheDocument()
    })

    it('renders title', () => {
      render(<MetricCard title="CPU Usage" value="85%" />)
      expect(screen.getByText('CPU Usage')).toBeInTheDocument()
    })

    it('renders value', () => {
      render(<MetricCard title="CPU" value="85%" />)
      expect(screen.getByText('85%')).toBeInTheDocument()
    })

    it('renders ReactNode title', () => {
      render(<MetricCard title={<span data-testid="custom-title">Custom</span>} value="10" />)
      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
    })

    it('renders ReactNode value', () => {
      render(<MetricCard title="Test" value={<span data-testid="custom-value">42</span>} />)
      expect(screen.getByTestId('custom-value')).toBeInTheDocument()
    })

    it('renders icon when provided', () => {
      render(<MetricCard title="CPU" value="85%" icon={<span data-testid="icon">🔥</span>} />)
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('renders change with positive value', () => {
      render(<MetricCard title="CPU" value="85%" change={{ value: 5.2, period: 'last week' }} />)
      expect(screen.getByText(/5\.2%/)).toBeInTheDocument()
      expect(screen.getByText(/last week/)).toBeInTheDocument()
    })

    it('renders change with negative value', () => {
      render(<MetricCard title="CPU" value="85%" change={{ value: -3.1 }} />)
      expect(screen.getByText(/3\.1%/)).toBeInTheDocument()
    })

    it('renders change without period', () => {
      render(<MetricCard title="CPU" value="85%" change={{ value: 2 }} />)
      expect(screen.getByText(/2%/)).toBeInTheDocument()
    })
  })

  // ─── Trend ──────────────────────────────────────────────────────────

  describe('trend', () => {
    it('shows up trend indicator', () => {
      const { container } = render(<MetricCard title="CPU" value="85%" trend="up" />)
      expect(container.querySelector('[data-trend="up"]')).toBeInTheDocument()
    })

    it('shows down trend indicator', () => {
      const { container } = render(<MetricCard title="CPU" value="85%" trend="down" />)
      expect(container.querySelector('[data-trend="down"]')).toBeInTheDocument()
    })

    it('shows flat trend indicator', () => {
      const { container } = render(<MetricCard title="CPU" value="85%" trend="flat" />)
      expect(container.querySelector('[data-trend="flat"]')).toBeInTheDocument()
    })
  })

  // ─── Status ─────────────────────────────────────────────────────────

  describe('status', () => {
    it('applies ok status', () => {
      const { container } = render(<MetricCard title="CPU" value="85%" status="ok" />)
      expect(container.querySelector('[data-status="ok"]')).toBeInTheDocument()
    })

    it('applies warning status', () => {
      const { container } = render(<MetricCard title="CPU" value="85%" status="warning" />)
      expect(container.querySelector('[data-status="warning"]')).toBeInTheDocument()
    })

    it('applies critical status', () => {
      const { container } = render(<MetricCard title="CPU" value="85%" status="critical" />)
      expect(container.querySelector('[data-status="critical"]')).toBeInTheDocument()
    })
  })

  // ─── States ─────────────────────────────────────────────────────────

  describe('states', () => {
    it('renders loading state', () => {
      const { container } = render(<MetricCard title="CPU" value="85%" loading />)
      expect(container.querySelector('[data-loading]')).toBeInTheDocument()
    })

    it('renders error state', () => {
      render(<MetricCard title="CPU" value="85%" error="Failed to load" />)
      expect(screen.getByText('Failed to load')).toBeInTheDocument()
    })

    it('renders empty state when value is empty', () => {
      render(<MetricCard title="CPU" value="" empty="No data available" />)
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('error takes precedence over value', () => {
      render(<MetricCard title="CPU" value="85%" error="Failed" />)
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })

    it('empty takes precedence over value when shown', () => {
      render(<MetricCard title="CPU" value="" empty="No data" />)
      expect(screen.getByText('No data')).toBeInTheDocument()
    })
  })

  // ─── Sparkline ──────────────────────────────────────────────────────

  describe('sparkline', () => {
    it('renders sparkline when data is provided', () => {
      const { container } = render(
        <MetricCard title="CPU" value="85%" sparkline={[10, 20, 30, 40, 50]} />
      )
      expect(container.querySelector('.ui-metric-card__sparkline')).toBeInTheDocument()
    })

    it('renders sparkline as SVG', () => {
      const { container } = render(
        <MetricCard title="CPU" value="85%" sparkline={[10, 20, 30]} />
      )
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('does not render sparkline without data', () => {
      const { container } = render(<MetricCard title="CPU" value="85%" />)
      expect(container.querySelector('.ui-metric-card__sparkline')).not.toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<MetricCard title="CPU" value="85%" motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0 for reduced motion', () => {
      const { container } = render(<MetricCard title="CPU" value="85%" motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ───────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<MetricCard title="CPU" value="85%" className="custom" />)
      expect(container.querySelector('.ui-metric-card.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      const { container } = render(<MetricCard title="CPU" value="85%" data-testid="metric" />)
      expect(screen.getByTestId('metric')).toBeInTheDocument()
    })

    it('passes aria attributes', () => {
      render(<MetricCard title="CPU" value="85%" aria-label="CPU metric" />)
      expect(screen.getByLabelText('CPU metric')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(MetricCard.displayName).toBe('MetricCard')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<MetricCard title="CPU Usage" value="85%" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with all features', async () => {
      const { container } = render(
        <MetricCard
          title="CPU Usage"
          value="85%"
          change={{ value: 5.2, period: 'last week' }}
          trend="up"
          status="ok"
          sparkline={[10, 20, 30]}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations in loading state', async () => {
      const { container } = render(<MetricCard title="CPU" value="85%" loading />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations in error state', async () => {
      const { container } = render(<MetricCard title="CPU" value="85%" error="Failed" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
