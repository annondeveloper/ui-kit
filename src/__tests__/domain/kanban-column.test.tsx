import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { KanbanColumn, type KanbanCard } from '../../domain/kanban-column'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// ─── Test Data ────────────────────────────────────────────────────────────────

const cards: KanbanCard[] = [
  { id: 'c1', title: 'Setup project', description: 'Initialize repo', tags: ['setup'], priority: 'high' },
  { id: 'c2', title: 'Write tests', description: 'Unit and integration', tags: ['testing', 'quality'] },
  { id: 'c3', title: 'Deploy', priority: 'critical' },
]

describe('KanbanColumn', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" />
      )
      expect(container.querySelector('.ui-kanban-column')).toBeInTheDocument()
    })

    it('renders column title', () => {
      render(<KanbanColumn title="To Do" cards={cards} columnId="todo" />)
      expect(screen.getByText('To Do')).toBeInTheDocument()
    })

    it('renders all cards', () => {
      render(<KanbanColumn title="To Do" cards={cards} columnId="todo" />)
      expect(screen.getByText('Setup project')).toBeInTheDocument()
      expect(screen.getByText('Write tests')).toBeInTheDocument()
      expect(screen.getByText('Deploy')).toBeInTheDocument()
    })

    it('renders card descriptions', () => {
      render(<KanbanColumn title="To Do" cards={cards} columnId="todo" />)
      expect(screen.getByText('Initialize repo')).toBeInTheDocument()
      expect(screen.getByText('Unit and integration')).toBeInTheDocument()
    })

    it('renders card tags', () => {
      render(<KanbanColumn title="To Do" cards={cards} columnId="todo" />)
      expect(screen.getByText('setup')).toBeInTheDocument()
      expect(screen.getByText('testing')).toBeInTheDocument()
      expect(screen.getByText('quality')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" className="custom" />
      )
      expect(container.querySelector('.custom')).toBeInTheDocument()
    })

    it('passes through HTML attributes', () => {
      render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" data-testid="my-col" />
      )
      expect(screen.getByTestId('my-col')).toBeInTheDocument()
    })

    it('shows card count in header', () => {
      render(<KanbanColumn title="To Do" cards={cards} columnId="todo" />)
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders card assignee when provided', () => {
      const cardsWithAssignee: KanbanCard[] = [
        { id: 'c1', title: 'Task', assignee: <span data-testid="avatar">JD</span> },
      ]
      render(<KanbanColumn title="To Do" cards={cardsWithAssignee} columnId="todo" />)
      expect(screen.getByTestId('avatar')).toBeInTheDocument()
    })
  })

  // ─── Priority ─────────────────────────────────────────────────────

  describe('priority', () => {
    it('renders priority indicator for high priority', () => {
      const { container } = render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" />
      )
      const highCard = container.querySelector('[data-priority="high"]')
      expect(highCard).toBeInTheDocument()
    })

    it('renders priority indicator for critical priority', () => {
      const { container } = render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" />
      )
      const criticalCard = container.querySelector('[data-priority="critical"]')
      expect(criticalCard).toBeInTheDocument()
    })

    it('does not set priority attribute when no priority', () => {
      const noPriorityCards: KanbanCard[] = [
        { id: 'c1', title: 'No priority card' },
      ]
      const { container } = render(
        <KanbanColumn title="To Do" cards={noPriorityCards} columnId="todo" />
      )
      expect(container.querySelector('[data-priority]')).not.toBeInTheDocument()
    })
  })

  // ─── WIP Limit ────────────────────────────────────────────────────

  describe('WIP limit', () => {
    it('shows WIP indicator when at limit', () => {
      const { container } = render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" wipLimit={3} />
      )
      expect(container.querySelector('[data-wip-exceeded]')).toBeInTheDocument()
    })

    it('shows WIP indicator when over limit', () => {
      const { container } = render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" wipLimit={2} />
      )
      expect(container.querySelector('[data-wip-exceeded]')).toBeInTheDocument()
    })

    it('does not show WIP indicator when under limit', () => {
      const { container } = render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" wipLimit={5} />
      )
      expect(container.querySelector('[data-wip-exceeded]')).not.toBeInTheDocument()
    })

    it('displays WIP limit text', () => {
      render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" wipLimit={2} />
      )
      expect(screen.getByText(/2/)).toBeInTheDocument()
    })
  })

  // ─── Collapsed State ──────────────────────────────────────────────

  describe('collapsed state', () => {
    it('renders collapsed column', () => {
      const { container } = render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" collapsed />
      )
      expect(container.querySelector('[data-collapsed]')).toBeInTheDocument()
    })

    it('shows title when collapsed', () => {
      render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" collapsed />
      )
      expect(screen.getByText('To Do')).toBeInTheDocument()
    })

    it('shows count when collapsed', () => {
      render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" collapsed />
      )
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('hides cards when collapsed', () => {
      render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" collapsed />
      )
      expect(screen.queryByText('Setup project')).not.toBeInTheDocument()
    })

    it('fires onCollapse when toggle is clicked', async () => {
      const onCollapse = vi.fn()
      render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" onCollapse={onCollapse} />
      )
      const collapseBtn = screen.getByRole('button', { name: /collapse/i })
      await userEvent.click(collapseBtn)
      expect(onCollapse).toHaveBeenCalledWith(true)
    })

    it('fires onCollapse with false when expanding', async () => {
      const onCollapse = vi.fn()
      render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" collapsed onCollapse={onCollapse} />
      )
      const expandBtn = screen.getByRole('button', { name: /expand/i })
      await userEvent.click(expandBtn)
      expect(onCollapse).toHaveBeenCalledWith(false)
    })
  })

  // ─── Card Click ───────────────────────────────────────────────────

  describe('card click', () => {
    it('fires onCardClick when card is clicked', async () => {
      const onCardClick = vi.fn()
      render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" onCardClick={onCardClick} />
      )
      await userEvent.click(screen.getByText('Setup project'))
      expect(onCardClick).toHaveBeenCalledWith('c1')
    })

    it('fires onCardClick for different cards', async () => {
      const onCardClick = vi.fn()
      render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" onCardClick={onCardClick} />
      )
      await userEvent.click(screen.getByText('Write tests'))
      expect(onCardClick).toHaveBeenCalledWith('c2')
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion attribute', () => {
      const { container } = render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" motion={0} />
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })

    it('sets data-motion for higher levels', () => {
      const { container } = render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" motion={3} />
      )
      expect(container.querySelector('[data-motion="3"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('column has appropriate region role', () => {
      render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" />
      )
      expect(screen.getByRole('region')).toBeInTheDocument()
    })

    it('region has accessible name from title', () => {
      render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" />
      )
      expect(screen.getByRole('region')).toHaveAccessibleName(/To Do/)
    })

    it('cards are keyboard accessible', () => {
      render(
        <KanbanColumn title="To Do" cards={cards} columnId="todo" onCardClick={vi.fn()} />
      )
      const firstCard = screen.getByText('Setup project').closest('[data-card]')
      expect(firstCard).toHaveAttribute('tabindex', '0')
    })
  })
})
