import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TransferList, type TransferListItem } from '../../components/transfer-list'

expect.extend(toHaveNoViolations)

const leftItems: TransferListItem[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Charlie' },
]
const rightItems: TransferListItem[] = [
  { value: 'd', label: 'Delta' },
]

function ControlledTransferList(props: Partial<React.ComponentProps<typeof TransferList>>) {
  const [value, setValue] = useState<[TransferListItem[], TransferListItem[]]>(
    props.value ?? [leftItems, rightItems]
  )
  return (
    <TransferList
      {...props}
      value={value}
      onChange={(v) => {
        setValue(v)
        props.onChange?.(v)
      }}
    />
  )
}

describe('TransferList', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders two panels', () => {
      render(<ControlledTransferList />)
      const groups = screen.getAllByRole('group')
      // outer group + 2 panel groups
      expect(groups.length).toBeGreaterThanOrEqual(2)
    })

    it('renders with ui-transfer-list class', () => {
      const { container } = render(<ControlledTransferList />)
      expect(container.querySelector('.ui-transfer-list')).toBeInTheDocument()
    })

    it('renders all items in both lists', () => {
      render(<ControlledTransferList />)
      expect(screen.getByText('Alpha')).toBeInTheDocument()
      expect(screen.getByText('Beta')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
      expect(screen.getByText('Delta')).toBeInTheDocument()
    })

    it('renders custom titles', () => {
      render(<ControlledTransferList titles={['Available', 'Selected']} />)
      expect(screen.getByText('Available')).toBeInTheDocument()
      expect(screen.getByText('Selected')).toBeInTheDocument()
    })

    it('renders default titles "Source" and "Target"', () => {
      render(<ControlledTransferList />)
      expect(screen.getByText('Source')).toBeInTheDocument()
      expect(screen.getByText('Target')).toBeInTheDocument()
    })

    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>()
      render(<TransferList ref={ref} value={[leftItems, rightItems]} onChange={() => {}} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards className', () => {
      const { container } = render(
        <ControlledTransferList className="custom" />
      )
      expect(container.querySelector('.ui-transfer-list')?.className).toContain('custom')
    })
  })

  // ─── Transfer controls ────────────────────────────────────────────

  describe('transfer controls', () => {
    it('renders transfer buttons', () => {
      render(<ControlledTransferList />)
      expect(screen.getByLabelText('Transfer selected to right')).toBeInTheDocument()
      expect(screen.getByLabelText('Transfer selected to left')).toBeInTheDocument()
    })

    it('renders transfer all buttons when showTransferAll is true', () => {
      render(<ControlledTransferList showTransferAll />)
      expect(screen.getByLabelText('Transfer all to right')).toBeInTheDocument()
      expect(screen.getByLabelText('Transfer all to left')).toBeInTheDocument()
    })

    it('hides transfer all buttons when showTransferAll is false', () => {
      render(<ControlledTransferList showTransferAll={false} />)
      expect(screen.queryByLabelText('Transfer all to right')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Transfer all to left')).not.toBeInTheDocument()
    })

    it('disables transfer right button when no left items are selected', () => {
      render(<ControlledTransferList />)
      expect(screen.getByLabelText('Transfer selected to right')).toBeDisabled()
    })

    it('disables transfer left button when no right items are selected', () => {
      render(<ControlledTransferList />)
      expect(screen.getByLabelText('Transfer selected to left')).toBeDisabled()
    })
  })

  // ─── Item selection ───────────────────────────────────────────────

  describe('item selection', () => {
    it('selects an item on click', async () => {
      render(<ControlledTransferList />)
      const alphaItem = screen.getByText('Alpha').closest('[role="option"]')!
      await userEvent.click(alphaItem)
      expect(alphaItem).toHaveAttribute('aria-selected', 'true')
    })

    it('deselects an item on second click', async () => {
      render(<ControlledTransferList />)
      const alphaItem = screen.getByText('Alpha').closest('[role="option"]')!
      await userEvent.click(alphaItem)
      expect(alphaItem).toHaveAttribute('aria-selected', 'true')
      await userEvent.click(alphaItem)
      expect(alphaItem).toHaveAttribute('aria-selected', 'false')
    })
  })

  // ─── Transfer actions ─────────────────────────────────────────────

  describe('transfer actions', () => {
    it('transfers selected items to the right', async () => {
      const onChange = vi.fn()
      render(<ControlledTransferList onChange={onChange} />)

      // Select Alpha
      const alphaItem = screen.getByText('Alpha').closest('[role="option"]')!
      await userEvent.click(alphaItem)

      // Click transfer right
      await userEvent.click(screen.getByLabelText('Transfer selected to right'))

      expect(onChange).toHaveBeenCalled()
      const [newLeft, newRight] = onChange.mock.calls[0][0]
      expect(newLeft.map((i: TransferListItem) => i.value)).toEqual(['b', 'c'])
      expect(newRight.map((i: TransferListItem) => i.value)).toEqual(['d', 'a'])
    })

    it('transfers all items to the right', async () => {
      const onChange = vi.fn()
      render(<ControlledTransferList showTransferAll onChange={onChange} />)

      await userEvent.click(screen.getByLabelText('Transfer all to right'))

      expect(onChange).toHaveBeenCalled()
      const [newLeft, newRight] = onChange.mock.calls[0][0]
      expect(newLeft).toHaveLength(0)
      expect(newRight).toHaveLength(4)
    })

    it('transfers all items to the left', async () => {
      const onChange = vi.fn()
      render(<ControlledTransferList showTransferAll onChange={onChange} />)

      await userEvent.click(screen.getByLabelText('Transfer all to left'))

      expect(onChange).toHaveBeenCalled()
      const [newLeft, newRight] = onChange.mock.calls[0][0]
      expect(newLeft).toHaveLength(4)
      expect(newRight).toHaveLength(0)
    })
  })

  // ─── Search ───────────────────────────────────────────────────────

  describe('search', () => {
    it('shows search inputs when searchable is true', () => {
      render(<ControlledTransferList searchable />)
      const searchInputs = screen.getAllByPlaceholderText('Search...')
      expect(searchInputs).toHaveLength(2)
    })

    it('does not show search inputs when searchable is false', () => {
      render(<ControlledTransferList searchable={false} />)
      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
    })

    it('filters items based on search query', async () => {
      render(<ControlledTransferList searchable />)
      const searchInputs = screen.getAllByPlaceholderText('Search...')
      await userEvent.type(searchInputs[0], 'Alpha')

      // Alpha should be visible, Beta and Charlie should not
      expect(screen.getByText('Alpha')).toBeInTheDocument()
      // Beta and Charlie won't be visible since they don't match
      const leftPanel = searchInputs[0].closest('.ui-transfer-list__panel')!
      const options = within(leftPanel as HTMLElement).getAllByRole('option')
      expect(options).toHaveLength(1)
    })
  })

  // ─── Grouped items ───────────────────────────────────────────────

  describe('grouped items', () => {
    it('renders group headers when items have groups', () => {
      const groupedLeft: TransferListItem[] = [
        { value: 'a', label: 'Alpha', group: 'Greek' },
        { value: 'b', label: 'Beta', group: 'Greek' },
        { value: '1', label: 'One', group: 'Numbers' },
      ]
      render(
        <ControlledTransferList value={[groupedLeft, []]} />
      )
      expect(screen.getByText('Greek')).toBeInTheDocument()
      expect(screen.getByText('Numbers')).toBeInTheDocument()
    })
  })

  // ─── Size ─────────────────────────────────────────────────────────

  describe('size', () => {
    it('renders with default size="md"', () => {
      const { container } = render(<ControlledTransferList />)
      expect(container.querySelector('.ui-transfer-list')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      const { container } = render(<ControlledTransferList size="sm" />)
      expect(container.querySelector('.ui-transfer-list')).toHaveAttribute('data-size', 'sm')
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(<ControlledTransferList motion={2} />)
      expect(container.querySelector('.ui-transfer-list')).toHaveAttribute('data-motion', '2')
    })

    it('defaults to motion level 3', () => {
      const { container } = render(<ControlledTransferList />)
      expect(container.querySelector('.ui-transfer-list')).toHaveAttribute('data-motion', '3')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<ControlledTransferList />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has aria-label on the root', () => {
      render(<ControlledTransferList />)
      const root = screen.getByRole('group', { name: 'Transfer list' })
      expect(root).toBeInTheDocument()
    })

    it('listboxes have multiselectable attribute', () => {
      render(<ControlledTransferList />)
      const listboxes = screen.getAllByRole('listbox')
      listboxes.forEach((lb) => {
        expect(lb).toHaveAttribute('aria-multiselectable', 'true')
      })
    })
  })

  // ─── Style injection ─────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<ControlledTransferList />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-transfer-list)', () => {
      render(<ControlledTransferList />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map((s) => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-transfer-list)')
    })
  })

  // ─── Display name ────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "TransferList"', () => {
      expect(TransferList.displayName).toBe('TransferList')
    })
  })
})
