import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DashboardGrid } from '../../domain/dashboard-grid'
import type { DashboardGroup } from '../../domain/dashboard-grid'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('DashboardGrid', () => {
  const sampleGroups: DashboardGroup[] = [
    {
      id: 'network',
      title: 'Network',
      description: 'Network devices',
      summary: <span data-testid="summary-1">3 devices</span>,
      items: [
        <div key="a" data-testid="item-a">Card A</div>,
        <div key="b" data-testid="item-b">Card B</div>,
      ],
    },
    {
      id: 'servers',
      title: 'Servers',
      items: [
        <div key="c" data-testid="item-c">Card C</div>,
      ],
    },
  ]

  // ─── Rendering ─────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(
        <DashboardGrid><div>child</div></DashboardGrid>
      )
      expect(container.querySelector('.ui-dashboard-grid')).toBeInTheDocument()
    })

    it('renders children in ungrouped mode', () => {
      render(
        <DashboardGrid>
          <div data-testid="child-1">Card 1</div>
          <div data-testid="child-2">Card 2</div>
        </DashboardGrid>
      )
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })

    it('renders grid container for children', () => {
      const { container } = render(
        <DashboardGrid><div>child</div></DashboardGrid>
      )
      expect(container.querySelector('.ui-dashboard-grid__grid')).toBeInTheDocument()
    })
  })

  // ─── Grouped Mode ─────────────────────────────────────────────────────

  describe('grouped mode', () => {
    it('renders group titles', () => {
      render(<DashboardGrid groups={sampleGroups} />)
      expect(screen.getByText('Network')).toBeInTheDocument()
      expect(screen.getByText('Servers')).toBeInTheDocument()
    })

    it('renders group items', () => {
      render(<DashboardGrid groups={sampleGroups} />)
      expect(screen.getByTestId('item-a')).toBeInTheDocument()
      expect(screen.getByTestId('item-b')).toBeInTheDocument()
      expect(screen.getByTestId('item-c')).toBeInTheDocument()
    })

    it('renders group description', () => {
      render(<DashboardGrid groups={sampleGroups} />)
      expect(screen.getByText('Network devices')).toBeInTheDocument()
    })

    it('renders group summary', () => {
      render(<DashboardGrid groups={sampleGroups} />)
      expect(screen.getByTestId('summary-1')).toBeInTheDocument()
    })

    it('renders each group section', () => {
      const { container } = render(<DashboardGrid groups={sampleGroups} />)
      const groups = container.querySelectorAll('.ui-dashboard-grid__group')
      expect(groups.length).toBe(2)
    })

    it('renders sub-grid inside each group', () => {
      const { container } = render(<DashboardGrid groups={sampleGroups} />)
      const subGrids = container.querySelectorAll('.ui-dashboard-grid__group .ui-dashboard-grid__grid')
      expect(subGrids.length).toBe(2)
    })
  })

  // ─── Collapse / Expand ────────────────────────────────────────────────

  describe('collapse and expand', () => {
    it('renders groups as expanded by default', () => {
      render(<DashboardGrid groups={sampleGroups} />)
      expect(screen.getByTestId('item-a')).toBeInTheDocument()
    })

    it('renders initially collapsed group', () => {
      const groups: DashboardGroup[] = [
        {
          id: 'collapsed-group',
          title: 'Collapsed',
          collapsed: true,
          items: [<div key="hidden" data-testid="hidden-item">Hidden</div>],
        },
      ]
      const { container } = render(<DashboardGrid groups={groups} />)
      const group = container.querySelector('.ui-dashboard-grid__group')
      expect(group?.getAttribute('data-collapsed')).not.toBeNull()
    })

    it('toggles group collapse on header click', () => {
      render(<DashboardGrid groups={sampleGroups} />)
      const header = screen.getByText('Network').closest('button')
      expect(header).toBeInTheDocument()
      fireEvent.click(header!)
      // After click, group should be collapsed
      const group = header!.closest('.ui-dashboard-grid__group')
      expect(group?.getAttribute('data-collapsed')).not.toBeNull()
    })

    it('expands collapsed group on click', () => {
      const groups: DashboardGroup[] = [
        {
          id: 'test',
          title: 'Test Group',
          collapsed: true,
          items: [<div key="item">Item</div>],
        },
      ]
      render(<DashboardGrid groups={groups} />)
      const header = screen.getByText('Test Group').closest('button')
      fireEvent.click(header!)
      const group = header!.closest('.ui-dashboard-grid__group')
      expect(group?.getAttribute('data-collapsed')).toBeNull()
    })
  })

  // ─── Columns ──────────────────────────────────────────────────────────

  describe('columns', () => {
    it('defaults to auto columns', () => {
      const { container } = render(
        <DashboardGrid><div>child</div></DashboardGrid>
      )
      expect(container.querySelector('[data-columns="auto"]')).toBeInTheDocument()
    })

    it('sets fixed column count', () => {
      const { container } = render(
        <DashboardGrid columns={3}><div>child</div></DashboardGrid>
      )
      expect(container.querySelector('[data-columns="3"]')).toBeInTheDocument()
    })
  })

  // ─── Gap ──────────────────────────────────────────────────────────────

  describe('gap', () => {
    it('applies sm gap', () => {
      const { container } = render(
        <DashboardGrid gap="sm"><div>child</div></DashboardGrid>
      )
      expect(container.querySelector('[data-gap="sm"]')).toBeInTheDocument()
    })

    it('applies md gap (default)', () => {
      const { container } = render(
        <DashboardGrid><div>child</div></DashboardGrid>
      )
      expect(container.querySelector('[data-gap="md"]')).toBeInTheDocument()
    })

    it('applies lg gap', () => {
      const { container } = render(
        <DashboardGrid gap="lg"><div>child</div></DashboardGrid>
      )
      expect(container.querySelector('[data-gap="lg"]')).toBeInTheDocument()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(
        <DashboardGrid motion={2}><div>child</div></DashboardGrid>
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(
        <DashboardGrid motion={0}><div>child</div></DashboardGrid>
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML Attributes ──────────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(
        <DashboardGrid className="custom"><div>child</div></DashboardGrid>
      )
      expect(container.querySelector('.ui-dashboard-grid.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(
        <DashboardGrid data-testid="grid"><div>child</div></DashboardGrid>
      )
      expect(screen.getByTestId('grid')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(DashboardGrid.displayName).toBe('DashboardGrid')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations with children', async () => {
      const { container } = render(
        <DashboardGrid>
          <div>Card 1</div>
          <div>Card 2</div>
        </DashboardGrid>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with groups', async () => {
      const { container } = render(
        <DashboardGrid groups={sampleGroups} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('group header is a button for keyboard access', () => {
      render(<DashboardGrid groups={sampleGroups} />)
      const button = screen.getByText('Network').closest('button')
      expect(button).toBeInTheDocument()
    })

    it('group header has aria-expanded', () => {
      render(<DashboardGrid groups={sampleGroups} />)
      const button = screen.getByText('Network').closest('button')
      expect(button?.getAttribute('aria-expanded')).toBe('true')
    })

    it('collapsed group header has aria-expanded false', () => {
      const groups: DashboardGroup[] = [
        { id: 'g', title: 'Group', collapsed: true, items: [<div key="x">X</div>] },
      ]
      render(<DashboardGrid groups={groups} />)
      const button = screen.getByText('Group').closest('button')
      expect(button?.getAttribute('aria-expanded')).toBe('false')
    })
  })
})
