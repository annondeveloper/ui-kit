import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DashboardTemplate } from '../../domain/dashboard-template'
import type { DashboardMetric, DashboardSection } from '../../domain/dashboard-template'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const sampleMetrics: DashboardMetric[] = [
  { id: 'cpu', title: 'CPU Usage', value: '42%', status: 'ok', trend: 'up', change: { value: 3.2, period: 'last hour' }, sparkline: [30, 35, 42, 38, 40, 42] },
  { id: 'mem', title: 'Memory', value: '7.2 GB', status: 'warning', trend: 'up', change: { value: 12, period: 'last hour' } },
  { id: 'disk', title: 'Disk I/O', value: '145 MB/s', status: 'ok', trend: 'flat' },
]

const sampleSections: DashboardSection[] = [
  { id: 'chart', title: 'CPU Over Time', content: <div data-testid="section-chart">chart</div>, span: 2 },
  { id: 'logs', title: 'Recent Logs', content: <div data-testid="section-logs">logs</div> },
  { id: 'alerts', title: 'Active Alerts', content: <div data-testid="section-alerts">alerts</div>, collapsible: true },
]

describe('DashboardTemplate', () => {
  // ─── Rendering ────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<DashboardTemplate title="Test" />)
      expect(container.querySelector('.ui-dashboard-template')).toBeInTheDocument()
    })

    it('renders title', () => {
      render(<DashboardTemplate title="System Dashboard" />)
      expect(screen.getByText('System Dashboard')).toBeInTheDocument()
    })

    it('renders subtitle', () => {
      render(<DashboardTemplate title="Dashboard" subtitle="Main monitoring view" />)
      expect(screen.getByText('Main monitoring view')).toBeInTheDocument()
    })

    it('renders metrics', () => {
      render(<DashboardTemplate metrics={sampleMetrics} />)
      expect(screen.getByText('CPU Usage')).toBeInTheDocument()
      expect(screen.getByText('42%')).toBeInTheDocument()
      expect(screen.getByText('Memory')).toBeInTheDocument()
      expect(screen.getByText('7.2 GB')).toBeInTheDocument()
    })

    it('renders sections', () => {
      render(<DashboardTemplate sections={sampleSections} />)
      expect(screen.getByText('CPU Over Time')).toBeInTheDocument()
      expect(screen.getByText('Recent Logs')).toBeInTheDocument()
      expect(screen.getByText('Active Alerts')).toBeInTheDocument()
    })
  })

  // ─── Layout ───────────────────────────────────────────────────────

  describe('layout', () => {
    it('sets columns data attribute', () => {
      const { container } = render(<DashboardTemplate columns={3} sections={sampleSections} />)
      expect(container.querySelector('[data-columns="3"]')).toBeInTheDocument()
    })

    it('defaults to 2 columns', () => {
      const { container } = render(<DashboardTemplate sections={sampleSections} />)
      expect(container.querySelector('[data-columns="2"]')).toBeInTheDocument()
    })

    it('sidebar on right by default', () => {
      const { container } = render(
        <DashboardTemplate sidebar={<div>sidebar</div>} sections={sampleSections} />
      )
      expect(container.querySelector('[data-sidebar="right"]')).toBeInTheDocument()
    })

    it('sidebar on left when specified', () => {
      const { container } = render(
        <DashboardTemplate sidebar={<div>sidebar</div>} sidebarPosition="left" sections={sampleSections} />
      )
      expect(container.querySelector('[data-sidebar="left"]')).toBeInTheDocument()
    })
  })

  // ─── Header ───────────────────────────────────────────────────────

  describe('header', () => {
    it('renders status badge', () => {
      const { container } = render(<DashboardTemplate title="Test" status="warning" />)
      const badge = container.querySelector('.ui-dashboard-template__status-badge')
      expect(badge).toBeInTheDocument()
      expect(badge?.getAttribute('data-status')).toBe('warning')
    })

    it('renders lastUpdated display', () => {
      render(<DashboardTemplate title="Test" lastUpdated={Date.now() - 120000} />)
      expect(screen.getByText(/Updated.*ago/)).toBeInTheDocument()
    })

    it('renders actions slot', () => {
      render(<DashboardTemplate title="Test" actions={<button>Refresh</button>} />)
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })
  })

  // ─── Metrics ──────────────────────────────────────────────────────

  describe('metrics', () => {
    it('renders metric values', () => {
      render(<DashboardTemplate metrics={sampleMetrics} />)
      expect(screen.getByText('42%')).toBeInTheDocument()
      expect(screen.getByText('7.2 GB')).toBeInTheDocument()
      expect(screen.getByText('145 MB/s')).toBeInTheDocument()
    })

    it('shows change indicators', () => {
      const { container } = render(<DashboardTemplate metrics={sampleMetrics} />)
      const changes = container.querySelectorAll('.ui-dashboard-template__metric-change')
      expect(changes.length).toBeGreaterThan(0)
      // First metric: 3.2% up
      expect(changes[0].textContent).toContain('3.2')
    })

    it('renders sparkline for metrics with data', () => {
      const { container } = render(<DashboardTemplate metrics={sampleMetrics} />)
      const sparklines = container.querySelectorAll('.ui-dashboard-template__metric-sparkline')
      expect(sparklines.length).toBe(1) // only cpu has sparkline
    })

    it('renders metric period text', () => {
      render(<DashboardTemplate metrics={sampleMetrics} />)
      expect(screen.getAllByText('last hour').length).toBeGreaterThan(0)
    })
  })

  // ─── Sections ─────────────────────────────────────────────────────

  describe('sections', () => {
    it('collapsible toggle works', () => {
      render(<DashboardTemplate sections={sampleSections} />)
      // alerts section is collapsible
      const toggle = screen.getByLabelText(/Collapse Active Alerts/)
      expect(toggle).toBeInTheDocument()
      expect(toggle.getAttribute('aria-expanded')).toBe('true')

      fireEvent.click(toggle)
      expect(toggle.getAttribute('aria-expanded')).toBe('false')
    })

    it('section span attribute', () => {
      const { container } = render(<DashboardTemplate sections={sampleSections} />)
      const sections = container.querySelectorAll('.ui-dashboard-template__section')
      // First section has span: 2
      expect(sections[0].getAttribute('data-span')).toBe('2')
    })

    it('renders section content', () => {
      render(<DashboardTemplate sections={sampleSections} />)
      expect(screen.getByTestId('section-chart')).toBeInTheDocument()
      expect(screen.getByTestId('section-logs')).toBeInTheDocument()
    })

    it('defaults collapsed sections when defaultCollapsed is true', () => {
      const sections: DashboardSection[] = [
        { id: 'a', title: 'Collapsed Section', content: <div>content</div>, collapsible: true, defaultCollapsed: true },
      ]
      render(<DashboardTemplate sections={sections} />)
      const toggle = screen.getByLabelText(/Expand Collapsed Section/)
      expect(toggle.getAttribute('aria-expanded')).toBe('false')
    })
  })

  // ─── Sidebar ──────────────────────────────────────────────────────

  describe('sidebar', () => {
    it('renders when provided', () => {
      render(
        <DashboardTemplate sidebar={<div data-testid="sidebar-content">sidebar</div>}>
          <div>main</div>
        </DashboardTemplate>
      )
      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument()
    })

    it('collapsible toggle shows when sidebarCollapsible', () => {
      render(
        <DashboardTemplate
          sidebar={<div>sidebar</div>}
          sidebarCollapsible
        >
          <div>main</div>
        </DashboardTemplate>
      )
      const toggle = screen.getByLabelText(/Collapse sidebar/)
      expect(toggle).toBeInTheDocument()
    })

    it('sidebar collapses on toggle click', () => {
      const { container } = render(
        <DashboardTemplate
          sidebar={<div data-testid="sidebar-content">sidebar</div>}
          sidebarCollapsible
        >
          <div>main</div>
        </DashboardTemplate>
      )
      const toggle = screen.getByLabelText(/Collapse sidebar/)
      fireEvent.click(toggle)

      // sidebar should be data-collapsed
      const sidebar = container.querySelector('.ui-dashboard-template__sidebar')
      expect(sidebar?.hasAttribute('data-collapsed')).toBe(true)
    })
  })

  // ─── Auto-refresh ─────────────────────────────────────────────────

  describe('auto-refresh', () => {
    it('calls onRefresh at interval', () => {
      vi.useFakeTimers()
      const onRefresh = vi.fn()
      render(<DashboardTemplate title="Test" autoRefresh={5000} onRefresh={onRefresh} />)

      expect(onRefresh).not.toHaveBeenCalled()
      vi.advanceTimersByTime(5000)
      expect(onRefresh).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(5000)
      expect(onRefresh).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })

    it('does not call onRefresh when autoRefresh is not set', () => {
      vi.useFakeTimers()
      const onRefresh = vi.fn()
      render(<DashboardTemplate title="Test" onRefresh={onRefresh} />)

      vi.advanceTimersByTime(10000)
      expect(onRefresh).not.toHaveBeenCalled()
      vi.useRealTimers()
    })

    it('clears interval on unmount', () => {
      vi.useFakeTimers()
      const onRefresh = vi.fn()
      const { unmount } = render(<DashboardTemplate title="Test" autoRefresh={5000} onRefresh={onRefresh} />)

      unmount()
      vi.advanceTimersByTime(10000)
      expect(onRefresh).not.toHaveBeenCalled()
      vi.useRealTimers()
    })

    it('shows refresh indicator when auto-refresh is active', () => {
      const { container } = render(
        <DashboardTemplate title="Test" autoRefresh={5000} onRefresh={() => {}} />
      )
      expect(container.querySelector('.ui-dashboard-template__refresh-indicator')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has role="group"', () => {
      const { container } = render(<DashboardTemplate title="Test" />)
      expect(container.querySelector('[role="group"]')).toBeInTheDocument()
    })

    it('has aria-label with title', () => {
      const { container } = render(<DashboardTemplate title="System Dashboard" />)
      expect(container.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Dashboard: System Dashboard')
    })

    it('section headings are h3 elements', () => {
      render(<DashboardTemplate sections={sampleSections} />)
      const headings = screen.getAllByRole('heading', { level: 3 })
      expect(headings.length).toBeGreaterThanOrEqual(3)
    })

    it('metrics strip has list role', () => {
      const { container } = render(<DashboardTemplate metrics={sampleMetrics} />)
      expect(container.querySelector('[role="list"]')).toBeInTheDocument()
    })

    it('has no axe violations', async () => {
      const { container } = render(
        <DashboardTemplate
          title="System Dashboard"
          status="ok"
          metrics={sampleMetrics}
          sections={sampleSections}
          sidebar={<div>Sidebar content</div>}
          actions={<button>Refresh</button>}
          lastUpdated={Date.now()}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────

  describe('edge cases', () => {
    it('renders with no metrics', () => {
      const { container } = render(<DashboardTemplate title="Empty" sections={sampleSections} />)
      expect(container.querySelector('.ui-dashboard-template__metrics')).not.toBeInTheDocument()
    })

    it('renders with no sections', () => {
      const { container } = render(<DashboardTemplate title="Metrics Only" metrics={sampleMetrics} />)
      expect(container.querySelector('.ui-dashboard-template__main')).not.toBeInTheDocument()
    })

    it('renders with only children', () => {
      render(
        <DashboardTemplate title="Children Only">
          <div data-testid="child-content">Custom content</div>
        </DashboardTemplate>
      )
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
    })

    it('renders without any props', () => {
      const { container } = render(<DashboardTemplate />)
      expect(container.querySelector('.ui-dashboard-template')).toBeInTheDocument()
    })

    it('passes className', () => {
      const { container } = render(<DashboardTemplate className="custom" />)
      expect(container.querySelector('.ui-dashboard-template.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<DashboardTemplate data-testid="dashboard" />)
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(DashboardTemplate.displayName).toBe('DashboardTemplate')
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<DashboardTemplate motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<DashboardTemplate motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })
})
