import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { SegmentedControl } from '../../components/segmented-control'

expect.extend(toHaveNoViolations)

const stringData = ['Day', 'Week', 'Month']
const objectData = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

describe('SegmentedControl', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders all string options as radio buttons', () => {
      render(<SegmentedControl data={stringData} />)
      const radios = screen.getAllByRole('radio')
      expect(radios).toHaveLength(3)
    })

    it('renders string data items with correct labels', () => {
      render(<SegmentedControl data={stringData} />)
      expect(screen.getByText('Day')).toBeInTheDocument()
      expect(screen.getByText('Week')).toBeInTheDocument()
      expect(screen.getByText('Month')).toBeInTheDocument()
    })

    it('renders object data items with correct labels', () => {
      render(<SegmentedControl data={objectData} />)
      expect(screen.getByText('Day')).toBeInTheDocument()
      expect(screen.getByText('Week')).toBeInTheDocument()
      expect(screen.getByText('Month')).toBeInTheDocument()
    })

    it('applies ui-segmented class', () => {
      const { container } = render(<SegmentedControl data={stringData} />)
      const root = container.querySelector('.ui-segmented')
      expect(root).toBeInTheDocument()
    })

    it('renders the indicator element', () => {
      const { container } = render(<SegmentedControl data={stringData} />)
      expect(container.querySelector('.ui-segmented__indicator')).toBeInTheDocument()
    })

    it('sets role="radiogroup" on root', () => {
      render(<SegmentedControl data={stringData} />)
      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })

    it('renders icon when provided in option', () => {
      const data = [
        { value: 'a', label: 'A', icon: <svg data-testid="icon-a" /> },
        { value: 'b', label: 'B' },
      ]
      render(<SegmentedControl data={data} />)
      expect(screen.getByTestId('icon-a')).toBeInTheDocument()
    })
  })

  // ─── Default value & controlled ─────────────────────────────────────

  describe('value management', () => {
    it('selects first option by default', () => {
      render(<SegmentedControl data={stringData} />)
      const radios = screen.getAllByRole('radio')
      expect(radios[0]).toHaveAttribute('aria-checked', 'true')
      expect(radios[1]).toHaveAttribute('aria-checked', 'false')
    })

    it('selects defaultValue option initially', () => {
      render(<SegmentedControl data={stringData} defaultValue="Week" />)
      const radios = screen.getAllByRole('radio')
      expect(radios[0]).toHaveAttribute('aria-checked', 'false')
      expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    })

    it('respects controlled value', () => {
      render(<SegmentedControl data={objectData} value="month" />)
      const radios = screen.getAllByRole('radio')
      expect(radios[2]).toHaveAttribute('aria-checked', 'true')
    })

    it('calls onChange when option is clicked', async () => {
      const onChange = vi.fn()
      render(<SegmentedControl data={stringData} onChange={onChange} />)
      await userEvent.click(screen.getByText('Week'))
      expect(onChange).toHaveBeenCalledWith('Week')
    })

    it('updates uncontrolled state on click', async () => {
      render(<SegmentedControl data={stringData} />)
      await userEvent.click(screen.getByText('Month'))
      const radios = screen.getAllByRole('radio')
      expect(radios[2]).toHaveAttribute('aria-checked', 'true')
    })
  })

  // ─── Data attributes ───────────────────────────────────────────────

  describe('data attributes', () => {
    it('sets data-size to default "md"', () => {
      render(<SegmentedControl data={stringData} />)
      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-size', 'md')
    })

    it('sets data-size to provided size', () => {
      render(<SegmentedControl data={stringData} size="lg" />)
      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-size', 'lg')
    })

    it('sets data-orientation', () => {
      render(<SegmentedControl data={stringData} orientation="vertical" />)
      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-orientation', 'vertical')
    })

    it('sets data-full-width when fullWidth is true', () => {
      render(<SegmentedControl data={stringData} fullWidth />)
      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-full-width', 'true')
    })

    it('does not set data-full-width by default', () => {
      render(<SegmentedControl data={stringData} />)
      expect(screen.getByRole('radiogroup')).not.toHaveAttribute('data-full-width')
    })

    it('sets data-active on selected item', async () => {
      const { container } = render(<SegmentedControl data={stringData} />)
      const items = container.querySelectorAll('.ui-segmented__item')
      expect(items[0]).toHaveAttribute('data-active', 'true')
      expect(items[1]).not.toHaveAttribute('data-active')
    })
  })

  // ─── Disabled state ────────────────────────────────────────────────

  describe('disabled', () => {
    it('sets data-disabled on root when disabled', () => {
      render(<SegmentedControl data={stringData} disabled />)
      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-disabled', 'true')
    })

    it('does not call onChange when disabled', async () => {
      const onChange = vi.fn()
      render(<SegmentedControl data={stringData} disabled onChange={onChange} />)
      // Can't click when pointer-events: none, but the handler also checks
      const radios = screen.getAllByRole('radio')
      fireEvent.click(radios[1])
      expect(onChange).not.toHaveBeenCalled()
    })

    it('sets data-disabled on individual disabled options', () => {
      const data = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
      ]
      const { container } = render(<SegmentedControl data={data} />)
      const items = container.querySelectorAll('.ui-segmented__item')
      expect(items[1]).toHaveAttribute('data-disabled', 'true')
    })

    it('does not select disabled individual option on click', async () => {
      const onChange = vi.fn()
      const data = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
      ]
      render(<SegmentedControl data={data} onChange={onChange} />)
      await userEvent.click(screen.getByText('B'))
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── ReadOnly ──────────────────────────────────────────────────────

  describe('readOnly', () => {
    it('does not call onChange when readOnly', async () => {
      const onChange = vi.fn()
      render(<SegmentedControl data={stringData} readOnly onChange={onChange} />)
      await userEvent.click(screen.getByText('Week'))
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── Keyboard navigation ──────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('navigates with ArrowRight', async () => {
      const onChange = vi.fn()
      render(<SegmentedControl data={stringData} onChange={onChange} />)
      const firstRadio = screen.getAllByRole('radio')[0]
      firstRadio.focus()
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' })
      expect(onChange).toHaveBeenCalledWith('Week')
    })

    it('navigates with ArrowLeft and wraps around', async () => {
      const onChange = vi.fn()
      render(<SegmentedControl data={stringData} onChange={onChange} />)
      const firstRadio = screen.getAllByRole('radio')[0]
      firstRadio.focus()
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowLeft' })
      expect(onChange).toHaveBeenCalledWith('Month')
    })

    it('navigates with Home key', async () => {
      const onChange = vi.fn()
      render(<SegmentedControl data={stringData} defaultValue="Month" onChange={onChange} />)
      const lastRadio = screen.getAllByRole('radio')[2]
      lastRadio.focus()
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'Home' })
      expect(onChange).toHaveBeenCalledWith('Day')
    })

    it('navigates with End key', async () => {
      const onChange = vi.fn()
      render(<SegmentedControl data={stringData} onChange={onChange} />)
      const firstRadio = screen.getAllByRole('radio')[0]
      firstRadio.focus()
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'End' })
      expect(onChange).toHaveBeenCalledWith('Month')
    })
  })

  // ─── Custom color ─────────────────────────────────────────────────

  describe('custom color', () => {
    it('sets --segmented-color CSS variable when color prop is provided', () => {
      render(<SegmentedControl data={stringData} color="oklch(70% 0.2 150)" />)
      const root = screen.getByRole('radiogroup')
      expect(root.style.getPropertyValue('--segmented-color')).toBe('oklch(70% 0.2 150)')
    })

    it('sets data-has-color when color is provided', () => {
      render(<SegmentedControl data={stringData} color="red" />)
      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-has-color', 'true')
    })
  })

  // ─── Ref forwarding ───────────────────────────────────────────────

  describe('ref', () => {
    it('forwards ref to root div', () => {
      const ref = createRef<HTMLDivElement>()
      render(<SegmentedControl ref={ref} data={stringData} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  // ─── Class & HTML attrs ───────────────────────────────────────────

  describe('props forwarding', () => {
    it('merges custom className', () => {
      const { container } = render(<SegmentedControl data={stringData} className="custom" />)
      const root = container.firstElementChild!
      expect(root.className).toContain('ui-segmented')
      expect(root.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<SegmentedControl data={stringData} data-testid="my-sc" id="sc-1" />)
      const el = screen.getByTestId('my-sc')
      expect(el).toHaveAttribute('id', 'sc-1')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<SegmentedControl data={stringData} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with object data', async () => {
      const { container } = render(<SegmentedControl data={objectData} value="week" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('sets correct tabIndex (active=0, others=-1)', () => {
      render(<SegmentedControl data={stringData} />)
      const radios = screen.getAllByRole('radio')
      expect(radios[0]).toHaveAttribute('tabindex', '0')
      expect(radios[1]).toHaveAttribute('tabindex', '-1')
      expect(radios[2]).toHaveAttribute('tabindex', '-1')
    })
  })

  // ─── Style injection ─────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<SegmentedControl data={stringData} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-segmented)', () => {
      render(<SegmentedControl data={stringData} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-segmented)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "SegmentedControl"', () => {
      expect(SegmentedControl.displayName).toBe('SegmentedControl')
    })
  })
})
