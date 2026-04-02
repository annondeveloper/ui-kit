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

  // ─── New Props ────────────────────────────────────────────────────

  describe('variant', () => {
    it('sets compact variant data attribute', () => {
      const { container } = render(<DashboardTemplate variant="compact" title="Test" />)
      expect(container.querySelector('[data-variant="compact"]')).toBeInTheDocument()
    })

    it('sets fullscreen variant data attribute', () => {
      const { container } = render(<DashboardTemplate variant="fullscreen" title="Test" />)
      expect(container.querySelector('[data-variant="fullscreen"]')).toBeInTheDocument()
    })

    it('does not set data-variant for default', () => {
      const { container } = render(<DashboardTemplate variant="default" title="Test" />)
      expect(container.querySelector('[data-variant]')).not.toBeInTheDocument()
    })
  })

  describe('sticky header', () => {
    it('sets data-sticky-header when enabled', () => {
      const { container } = render(<DashboardTemplate stickyHeader title="Test" />)
      expect(container.querySelector('[data-sticky-header]')).toBeInTheDocument()
    })

    it('does not set data-sticky-header by default', () => {
      const { container } = render(<DashboardTemplate title="Test" />)
      expect(container.querySelector('[data-sticky-header]')).not.toBeInTheDocument()
    })
  })

  describe('breadcrumb', () => {
    it('renders breadcrumb when provided', () => {
      render(<DashboardTemplate title="Test" showBreadcrumb={<span data-testid="bc">Home / Test</span>} />)
      expect(screen.getByTestId('bc')).toBeInTheDocument()
    })

    it('does not render breadcrumb when not provided', () => {
      const { container } = render(<DashboardTemplate title="Test" />)
      expect(container.querySelector('.ui-dashboard-template__breadcrumb')).not.toBeInTheDocument()
    })
  })

  describe('status bar', () => {
    it('renders status bar when showStatusBar is true', () => {
      const { container } = render(<DashboardTemplate title="Test" showStatusBar status="ok" />)
      const bar = container.querySelector('.ui-dashboard-template__status-bar')
      expect(bar).toBeInTheDocument()
      expect(bar?.textContent).toContain('All systems operational')
    })

    it('renders custom status bar content', () => {
      render(<DashboardTemplate title="Test" showStatusBar statusBarContent={<span>Custom status</span>} />)
      expect(screen.getByText('Custom status')).toBeInTheDocument()
    })

    it('does not render status bar by default', () => {
      const { container } = render(<DashboardTemplate title="Test" />)
      expect(container.querySelector('.ui-dashboard-template__status-bar')).not.toBeInTheDocument()
    })
  })

  describe('metrics layout', () => {
    it('sets data-layout="grid" on metrics strip', () => {
      const { container } = render(<DashboardTemplate metrics={sampleMetrics} metricsLayout="grid" />)
      expect(container.querySelector('.ui-dashboard-template__metrics[data-layout="grid"]')).toBeInTheDocument()
    })

    it('sets data-scrollable on metrics strip when scrollable', () => {
      const { container } = render(<DashboardTemplate metrics={sampleMetrics} metricsScrollable metricsLayout="row" />)
      expect(container.querySelector('.ui-dashboard-template__metrics[data-scrollable]')).toBeInTheDocument()
    })

    it('does not set data-scrollable when layout is grid', () => {
      const { container } = render(<DashboardTemplate metrics={sampleMetrics} metricsScrollable metricsLayout="grid" />)
      expect(container.querySelector('.ui-dashboard-template__metrics[data-scrollable]')).not.toBeInTheDocument()
    })
  })

  describe('clickable metrics', () => {
    it('makes metrics clickable when onMetricClick is provided', () => {
      const onClick = vi.fn()
      const { container } = render(<DashboardTemplate metrics={sampleMetrics} onMetricClick={onClick} />)
      const clickableMetrics = container.querySelectorAll('.ui-dashboard-template__metric[data-clickable]')
      expect(clickableMetrics.length).toBe(sampleMetrics.length)
    })

    it('fires onMetricClick on click', () => {
      const onClick = vi.fn()
      const { container } = render(<DashboardTemplate metrics={sampleMetrics} onMetricClick={onClick} />)
      const firstMetric = container.querySelector('.ui-dashboard-template__metric[data-clickable]')
      fireEvent.click(firstMetric!)
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith(sampleMetrics[0])
    })

    it('fires onMetricClick on Enter key', () => {
      const onClick = vi.fn()
      const { container } = render(<DashboardTemplate metrics={sampleMetrics} onMetricClick={onClick} />)
      const firstMetric = container.querySelector('.ui-dashboard-template__metric[data-clickable]')
      fireEvent.keyDown(firstMetric!, { key: 'Enter' })
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('metrics have role="button" when clickable', () => {
      const onClick = vi.fn()
      const { container } = render(<DashboardTemplate metrics={sampleMetrics} onMetricClick={onClick} />)
      const firstMetric = container.querySelector('.ui-dashboard-template__metric[data-clickable]')
      expect(firstMetric?.getAttribute('role')).toBe('button')
    })
  })

  describe('onSectionToggle', () => {
    it('fires callback when section is toggled', () => {
      const onToggle = vi.fn()
      render(<DashboardTemplate sections={sampleSections} onSectionToggle={onToggle} />)
      const toggle = screen.getByLabelText(/Collapse Active Alerts/)
      fireEvent.click(toggle)
      expect(onToggle).toHaveBeenCalledWith('alerts', true)
    })

    it('fires callback with false when section is expanded', () => {
      const onToggle = vi.fn()
      const sections: DashboardSection[] = [
        { id: 'test', title: 'Test Section', content: <div>test</div>, collapsible: true, defaultCollapsed: true },
      ]
      render(<DashboardTemplate sections={sections} onSectionToggle={onToggle} />)
      const toggle = screen.getByLabelText(/Expand Test Section/)
      fireEvent.click(toggle)
      expect(onToggle).toHaveBeenCalledWith('test', false)
    })
  })

  describe('header height', () => {
    it('applies custom header height as number', () => {
      const { container } = render(<DashboardTemplate title="Test" headerHeight={80} />)
      const header = container.querySelector('.ui-dashboard-template__header') as HTMLElement
      expect(header?.style.minBlockSize).toBe('80px')
    })

    it('applies custom header height as string', () => {
      const { container } = render(<DashboardTemplate title="Test" headerHeight="5rem" />)
      const header = container.querySelector('.ui-dashboard-template__header') as HTMLElement
      expect(header?.style.minBlockSize).toBe('5rem')
    })
  })
})
