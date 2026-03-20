import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, act, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TreeView, type TreeNode } from '../../domain/tree-view'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// ─── Test Data ────────────────────────────────────────────────────────────────

const simpleNodes: TreeNode[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
]

const nestedNodes: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'Button.tsx' },
          { id: 'card', label: 'Card.tsx' },
        ],
      },
      { id: 'utils', label: 'utils' },
    ],
  },
  { id: 'readme', label: 'README.md' },
]

const disabledNodes: TreeNode[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta', disabled: true },
  { id: 'c', label: 'Gamma' },
]

describe('TreeView', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with tree role', () => {
      render(<TreeView nodes={simpleNodes} />)
      expect(screen.getByRole('tree')).toBeInTheDocument()
    })

    it('renders the scope class', () => {
      const { container } = render(<TreeView nodes={simpleNodes} />)
      expect(container.querySelector('.ui-tree-view')).toBeInTheDocument()
    })

    it('renders flat nodes as treeitems', () => {
      render(<TreeView nodes={simpleNodes} />)
      const items = screen.getAllByRole('treeitem')
      expect(items).toHaveLength(3)
    })

    it('renders node labels', () => {
      render(<TreeView nodes={simpleNodes} />)
      expect(screen.getByText('Alpha')).toBeInTheDocument()
      expect(screen.getByText('Beta')).toBeInTheDocument()
      expect(screen.getByText('Gamma')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <TreeView nodes={simpleNodes} className="custom" />
      )
      expect(container.querySelector('.custom')).toBeInTheDocument()
    })

    it('passes through HTML attributes', () => {
      render(<TreeView nodes={simpleNodes} data-testid="my-tree" />)
      expect(screen.getByTestId('my-tree')).toBeInTheDocument()
    })

    it('renders nested nodes with group role', () => {
      render(<TreeView nodes={nestedNodes} expanded={['src']} />)
      const groups = screen.getAllByRole('group')
      expect(groups.length).toBeGreaterThanOrEqual(1)
    })

    it('renders node icons when provided', () => {
      const nodesWithIcon: TreeNode[] = [
        { id: 'a', label: 'Alpha', icon: <span data-testid="icon">I</span> },
      ]
      render(<TreeView nodes={nodesWithIcon} />)
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })
  })

  // ─── Expand / Collapse ──────────────────────────────────────────────

  describe('expand/collapse', () => {
    it('collapses children by default', () => {
      render(<TreeView nodes={nestedNodes} />)
      // Children not visible initially
      expect(screen.queryByText('Button.tsx')).not.toBeInTheDocument()
    })

    it('shows children when node is in expanded array', () => {
      render(<TreeView nodes={nestedNodes} expanded={['src', 'components']} />)
      expect(screen.getByText('Button.tsx')).toBeInTheDocument()
      expect(screen.getByText('Card.tsx')).toBeInTheDocument()
    })

    it('fires onExpand when clicking expand toggle', async () => {
      const onExpand = vi.fn()
      render(<TreeView nodes={nestedNodes} onExpand={onExpand} />)
      const srcItem = screen.getByText('src')
      // Click the toggle button (the parent row)
      await userEvent.click(srcItem.closest('[role="treeitem"]')!.querySelector('[data-toggle]') || srcItem)
      expect(onExpand).toHaveBeenCalledWith('src', true)
    })

    it('fires onExpand with false when collapsing', async () => {
      const onExpand = vi.fn()
      render(<TreeView nodes={nestedNodes} expanded={['src']} onExpand={onExpand} />)
      const srcItem = screen.getByText('src')
      await userEvent.click(srcItem.closest('[role="treeitem"]')!.querySelector('[data-toggle]') || srcItem)
      expect(onExpand).toHaveBeenCalledWith('src', false)
    })

    it('sets aria-expanded on expandable nodes', () => {
      render(<TreeView nodes={nestedNodes} expanded={['src']} />)
      const srcItem = screen.getByText('src').closest('[role="treeitem"]')
      expect(srcItem).toHaveAttribute('aria-expanded', 'true')
    })

    it('sets aria-expanded=false on collapsed nodes with children', () => {
      render(<TreeView nodes={nestedNodes} />)
      const srcItem = screen.getByText('src').closest('[role="treeitem"]')
      expect(srcItem).toHaveAttribute('aria-expanded', 'false')
    })
  })

  // ─── Selection ──────────────────────────────────────────────────────

  describe('selection', () => {
    it('highlights selected node', () => {
      const { container } = render(
        <TreeView nodes={simpleNodes} selected="a" />
      )
      const item = screen.getByText('Alpha').closest('[role="treeitem"]')
      expect(item).toHaveAttribute('aria-selected', 'true')
    })

    it('fires onSelect when clicking a node', async () => {
      const onSelect = vi.fn()
      render(<TreeView nodes={simpleNodes} onSelect={onSelect} />)
      await userEvent.click(screen.getByText('Beta'))
      expect(onSelect).toHaveBeenCalledWith('b')
    })

    it('supports multi-select with array', () => {
      render(
        <TreeView nodes={simpleNodes} selected={['a', 'c']} multiSelect />
      )
      const alpha = screen.getByText('Alpha').closest('[role="treeitem"]')
      const gamma = screen.getByText('Gamma').closest('[role="treeitem"]')
      expect(alpha).toHaveAttribute('aria-selected', 'true')
      expect(gamma).toHaveAttribute('aria-selected', 'true')
    })

    it('sets aria-multiselectable when multiSelect is true', () => {
      render(<TreeView nodes={simpleNodes} multiSelect />)
      expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true')
    })
  })

  // ─── Keyboard Navigation ───────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('navigates down with ArrowDown', async () => {
      render(<TreeView nodes={simpleNodes} />)
      const tree = screen.getByRole('tree')
      const items = screen.getAllByRole('treeitem')
      items[0].focus()
      await userEvent.keyboard('{ArrowDown}')
      expect(items[1]).toHaveFocus()
    })

    it('navigates up with ArrowUp', async () => {
      render(<TreeView nodes={simpleNodes} />)
      const items = screen.getAllByRole('treeitem')
      items[1].focus()
      await userEvent.keyboard('{ArrowUp}')
      expect(items[0]).toHaveFocus()
    })

    it('expands node with ArrowRight', async () => {
      const onExpand = vi.fn()
      render(<TreeView nodes={nestedNodes} onExpand={onExpand} />)
      const srcItem = screen.getByText('src').closest('[role="treeitem"]') as HTMLElement
      srcItem.focus()
      await userEvent.keyboard('{ArrowRight}')
      expect(onExpand).toHaveBeenCalledWith('src', true)
    })

    it('ArrowRight on expanded node moves to first child', async () => {
      render(<TreeView nodes={nestedNodes} expanded={['src']} />)
      const srcItem = screen.getByText('src').closest('[role="treeitem"]') as HTMLElement
      srcItem.focus()
      await userEvent.keyboard('{ArrowRight}')
      const firstChild = screen.getByText('components').closest('[role="treeitem"]')
      expect(firstChild).toHaveFocus()
    })

    it('collapses node with ArrowLeft', async () => {
      const onExpand = vi.fn()
      render(<TreeView nodes={nestedNodes} expanded={['src']} onExpand={onExpand} />)
      const srcItem = screen.getByText('src').closest('[role="treeitem"]') as HTMLElement
      srcItem.focus()
      await userEvent.keyboard('{ArrowLeft}')
      expect(onExpand).toHaveBeenCalledWith('src', false)
    })

    it('ArrowLeft on leaf moves to parent', async () => {
      render(<TreeView nodes={nestedNodes} expanded={['src']} />)
      const utilsItem = screen.getByText('utils').closest('[role="treeitem"]') as HTMLElement
      utilsItem.focus()
      await userEvent.keyboard('{ArrowLeft}')
      const srcItem = screen.getByText('src').closest('[role="treeitem"]')
      expect(srcItem).toHaveFocus()
    })

    it('Home key moves to first item', async () => {
      render(<TreeView nodes={simpleNodes} />)
      const items = screen.getAllByRole('treeitem')
      items[2].focus()
      await userEvent.keyboard('{Home}')
      expect(items[0]).toHaveFocus()
    })

    it('End key moves to last visible item', async () => {
      render(<TreeView nodes={simpleNodes} />)
      const items = screen.getAllByRole('treeitem')
      items[0].focus()
      await userEvent.keyboard('{End}')
      expect(items[2]).toHaveFocus()
    })

    it('Enter selects focused node', async () => {
      const onSelect = vi.fn()
      render(<TreeView nodes={simpleNodes} onSelect={onSelect} />)
      const items = screen.getAllByRole('treeitem')
      items[1].focus()
      await userEvent.keyboard('{Enter}')
      expect(onSelect).toHaveBeenCalledWith('b')
    })

    it('* expands all siblings', async () => {
      const onExpand = vi.fn()
      const nodes: TreeNode[] = [
        { id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] },
        { id: 'b', label: 'B', children: [{ id: 'b1', label: 'B1' }] },
      ]
      render(<TreeView nodes={nodes} onExpand={onExpand} />)
      const first = screen.getByText('A').closest('[role="treeitem"]') as HTMLElement
      first.focus()
      await userEvent.keyboard('*')
      expect(onExpand).toHaveBeenCalledWith('a', true)
      expect(onExpand).toHaveBeenCalledWith('b', true)
    })

    it('skips disabled nodes during navigation', async () => {
      render(<TreeView nodes={disabledNodes} />)
      const items = screen.getAllByRole('treeitem')
      items[0].focus()
      await userEvent.keyboard('{ArrowDown}')
      // Should skip disabled 'b' and go to 'c'
      expect(items[2]).toHaveFocus()
    })
  })

  // ─── Lazy Loading ──────────────────────────────────────────────────

  describe('lazy loading', () => {
    it('calls lazy function when expanding a node with no children', async () => {
      const lazyFn = vi.fn().mockResolvedValue([
        { id: 'child1', label: 'Child 1' },
        { id: 'child2', label: 'Child 2' },
      ])
      const lazyNodes: TreeNode[] = [
        { id: 'parent', label: 'Parent', children: [] },
      ]
      const onExpand = vi.fn()
      render(<TreeView nodes={lazyNodes} lazy={lazyFn} onExpand={onExpand} />)
      const item = screen.getByText('Parent').closest('[role="treeitem"]') as HTMLElement
      item.focus()
      await userEvent.keyboard('{ArrowRight}')
      expect(lazyFn).toHaveBeenCalledWith('parent')
    })

    it('shows loading spinner during lazy load', async () => {
      let resolveLoad: (nodes: TreeNode[]) => void
      const lazyFn = vi.fn().mockReturnValue(
        new Promise<TreeNode[]>((resolve) => { resolveLoad = resolve })
      )
      const lazyNodes: TreeNode[] = [
        { id: 'parent', label: 'Parent', children: [] },
      ]
      render(<TreeView nodes={lazyNodes} lazy={lazyFn} expanded={['parent']} />)
      // The component should show a spinner for empty children with lazy fn
      await waitFor(() => {
        const spinner = document.querySelector('[data-loading="true"]')
        expect(spinner).toBeInTheDocument()
      })
    })
  })

  // ─── Indent Guides ────────────────────────────────────────────────

  describe('indent guides', () => {
    it('shows indent guides by default', () => {
      const { container } = render(
        <TreeView nodes={nestedNodes} expanded={['src']} />
      )
      expect(container.querySelector('[data-guides="true"]')).toBeInTheDocument()
    })

    it('hides indent guides when showGuides=false', () => {
      const { container } = render(
        <TreeView nodes={nestedNodes} expanded={['src']} showGuides={false} />
      )
      expect(container.querySelector('[data-guides="true"]')).not.toBeInTheDocument()
    })
  })

  // ─── Disabled Nodes ───────────────────────────────────────────────

  describe('disabled nodes', () => {
    it('marks disabled nodes with aria-disabled', () => {
      render(<TreeView nodes={disabledNodes} />)
      const beta = screen.getByText('Beta').closest('[role="treeitem"]')
      expect(beta).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not fire onSelect for disabled nodes', async () => {
      const onSelect = vi.fn()
      render(<TreeView nodes={disabledNodes} onSelect={onSelect} />)
      await userEvent.click(screen.getByText('Beta'))
      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  // ─── Motion ────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion attribute', () => {
      const { container } = render(
        <TreeView nodes={simpleNodes} motion={0} />
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })

    it('sets data-motion for higher levels', () => {
      const { container } = render(
        <TreeView nodes={simpleNodes} motion={2} />
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <TreeView nodes={nestedNodes} expanded={['src']} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('uses treeitem role for all nodes', () => {
      render(<TreeView nodes={simpleNodes} />)
      const items = screen.getAllByRole('treeitem')
      expect(items.length).toBe(3)
    })

    it('first item is tabbable, rest are not', () => {
      render(<TreeView nodes={simpleNodes} />)
      const items = screen.getAllByRole('treeitem')
      expect(items[0]).toHaveAttribute('tabindex', '0')
      expect(items[1]).toHaveAttribute('tabindex', '-1')
      expect(items[2]).toHaveAttribute('tabindex', '-1')
    })
  })
})
