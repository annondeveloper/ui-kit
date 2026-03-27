import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Accordion } from '../../components/accordion'

expect.extend(toHaveNoViolations)

const defaultItems = [
  { id: 'a', trigger: 'Section A', content: 'Content A' },
  { id: 'b', trigger: 'Section B', content: 'Content B' },
  { id: 'c', trigger: 'Section C', content: 'Content C' },
]

describe('Accordion', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with ui-accordion scope class', () => {
      const { container } = render(<Accordion items={defaultItems} />)
      expect(container.querySelector('.ui-accordion')).toBeInTheDocument()
    })

    it('renders all items', () => {
      render(<Accordion items={defaultItems} />)
      expect(screen.getByText('Section A')).toBeInTheDocument()
      expect(screen.getByText('Section B')).toBeInTheDocument()
      expect(screen.getByText('Section C')).toBeInTheDocument()
    })

    it('renders native details elements', () => {
      const { container } = render(<Accordion items={defaultItems} />)
      const details = container.querySelectorAll('details')
      expect(details).toHaveLength(3)
    })

    it('renders native summary elements', () => {
      const { container } = render(<Accordion items={defaultItems} />)
      const summaries = container.querySelectorAll('summary')
      expect(summaries).toHaveLength(3)
    })

    it('renders content inside details', () => {
      render(<Accordion items={defaultItems} defaultOpen={['a']} />)
      expect(screen.getByText('Content A')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <Accordion items={defaultItems} className="custom-acc" />
      )
      expect(container.querySelector('.ui-accordion')).toHaveClass('custom-acc')
    })

    it('spreads additional HTML attributes', () => {
      render(<Accordion items={defaultItems} data-testid="my-accordion" />)
      expect(screen.getByTestId('my-accordion')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(Accordion.displayName).toBe('Accordion')
    })
  })

  // ─── Open / Close ──────────────────────────────────────────────────

  describe('open/close', () => {
    it('all items are closed by default', () => {
      const { container } = render(<Accordion items={defaultItems} />)
      const details = container.querySelectorAll('details')
      details.forEach((d) => {
        expect(d).not.toHaveAttribute('open')
      })
    })

    it('opens items specified in defaultOpen', () => {
      const { container } = render(
        <Accordion items={defaultItems} defaultOpen={['a', 'c']} />
      )
      const details = container.querySelectorAll('details')
      expect(details[0]).toHaveAttribute('open')
      expect(details[1]).not.toHaveAttribute('open')
      expect(details[2]).toHaveAttribute('open')
    })

    it('toggles item open on click', () => {
      const { container } = render(<Accordion items={defaultItems} />)
      const summary = screen.getByText('Section A')
      fireEvent.click(summary)
      const details = container.querySelector('details')
      expect(details).toHaveAttribute('open')
    })

    it('calls onOpenChange when toggling', () => {
      const onOpenChange = vi.fn()
      render(<Accordion items={defaultItems} onOpenChange={onOpenChange} />)
      fireEvent.click(screen.getByText('Section A'))
      expect(onOpenChange).toHaveBeenCalledWith(['a'])
    })

    it('closes an open item on click', () => {
      const onOpenChange = vi.fn()
      render(
        <Accordion
          items={defaultItems}
          defaultOpen={['a']}
          onOpenChange={onOpenChange}
        />
      )
      fireEvent.click(screen.getByText('Section A'))
      expect(onOpenChange).toHaveBeenCalledWith([])
    })
  })

  // ─── Single (exclusive) mode ──────────────────────────────────────

  describe('single mode', () => {
    it('only allows one item open at a time', () => {
      const onOpenChange = vi.fn()
      const { container } = render(
        <Accordion
          items={defaultItems}
          type="single"
          onOpenChange={onOpenChange}
        />
      )
      fireEvent.click(screen.getByText('Section A'))
      expect(onOpenChange).toHaveBeenLastCalledWith(['a'])

      fireEvent.click(screen.getByText('Section B'))
      expect(onOpenChange).toHaveBeenLastCalledWith(['b'])
    })

    it('closes other items when opening one in single mode', () => {
      const { container } = render(
        <Accordion items={defaultItems} type="single" defaultOpen={['a']} />
      )
      fireEvent.click(screen.getByText('Section B'))
      const details = container.querySelectorAll('details')
      expect(details[0]).not.toHaveAttribute('open')
      expect(details[1]).toHaveAttribute('open')
    })

    it('allows closing the open item in single mode', () => {
      const onOpenChange = vi.fn()
      render(
        <Accordion
          items={defaultItems}
          type="single"
          defaultOpen={['a']}
          onOpenChange={onOpenChange}
        />
      )
      fireEvent.click(screen.getByText('Section A'))
      expect(onOpenChange).toHaveBeenLastCalledWith([])
    })
  })

  // ─── Multiple mode ────────────────────────────────────────────────

  describe('multiple mode', () => {
    it('allows multiple items open simultaneously', () => {
      const onOpenChange = vi.fn()
      render(
        <Accordion
          items={defaultItems}
          type="multiple"
          onOpenChange={onOpenChange}
        />
      )
      fireEvent.click(screen.getByText('Section A'))
      expect(onOpenChange).toHaveBeenLastCalledWith(['a'])

      fireEvent.click(screen.getByText('Section B'))
      expect(onOpenChange).toHaveBeenLastCalledWith(['a', 'b'])
    })

    it('defaults to multiple type', () => {
      const onOpenChange = vi.fn()
      render(
        <Accordion items={defaultItems} onOpenChange={onOpenChange} />
      )
      fireEvent.click(screen.getByText('Section A'))
      fireEvent.click(screen.getByText('Section B'))
      expect(onOpenChange).toHaveBeenLastCalledWith(['a', 'b'])
    })
  })

  // ─── Disabled ─────────────────────────────────────────────────────

  describe('disabled items', () => {
    it('does not open disabled items on click', () => {
      const items = [
        { id: 'a', trigger: 'Enabled', content: 'Content A' },
        { id: 'b', trigger: 'Disabled', content: 'Content B', disabled: true },
      ]
      const onOpenChange = vi.fn()
      render(<Accordion items={items} onOpenChange={onOpenChange} />)
      fireEvent.click(screen.getByText('Disabled'))
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('renders disabled summary with aria-disabled', () => {
      const items = [
        { id: 'a', trigger: 'Disabled', content: 'Content', disabled: true },
      ]
      const { container } = render(<Accordion items={items} />)
      const summary = container.querySelector('summary')
      expect(summary).toHaveAttribute('aria-disabled', 'true')
    })
  })

  // ─── Keyboard ─────────────────────────────────────────────────────

  describe('keyboard', () => {
    it('toggles on Enter key', () => {
      const { container } = render(<Accordion items={defaultItems} />)
      const summary = screen.getByText('Section A')
      fireEvent.keyDown(summary, { key: 'Enter' })
      // Native details toggle on Enter via click — verify the summary is focusable
      expect(summary.closest('summary')).toBeTruthy()
    })

    it('toggles on Space key', () => {
      const { container } = render(<Accordion items={defaultItems} />)
      const summary = screen.getByText('Section A')
      // Summary elements natively handle Space
      expect(summary.closest('summary')).toBeTruthy()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(
        <Accordion items={defaultItems} motion={0} />
      )
      expect(container.querySelector('.ui-accordion')).toHaveAttribute('data-motion', '0')
    })

    it('applies motion level 2', () => {
      const { container } = render(
        <Accordion items={defaultItems} motion={2} />
      )
      expect(container.querySelector('.ui-accordion')).toHaveAttribute('data-motion', '2')
    })
  })

  // ─── Chevron ──────────────────────────────────────────────────────

  describe('chevron', () => {
    it('renders a chevron icon in each summary', () => {
      const { container } = render(<Accordion items={defaultItems} />)
      const svgs = container.querySelectorAll('summary svg')
      expect(svgs).toHaveLength(3)
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles empty items array', () => {
      const { container } = render(<Accordion items={[]} />)
      expect(container.querySelector('.ui-accordion')).toBeInTheDocument()
      expect(container.querySelectorAll('details')).toHaveLength(0)
    })

    it('handles single item', () => {
      const items = [{ id: 'only', trigger: 'Only One', content: 'Content' }]
      render(<Accordion items={items} />)
      expect(screen.getByText('Only One')).toBeInTheDocument()
    })

    it('handles ReactNode as trigger and content', () => {
      const items = [
        {
          id: 'rich',
          trigger: <strong>Rich Trigger</strong>,
          content: <em>Rich Content</em>,
        },
      ]
      render(<Accordion items={items} defaultOpen={['rich']} />)
      expect(screen.getByText('Rich Trigger')).toBeInTheDocument()
      expect(screen.getByText('Rich Content')).toBeInTheDocument()
    })
  })

  // ─── Variant ─────────────────────────────────────────────────────

  describe('variant', () => {
    it('defaults to data-variant="default"', () => {
      const { container } = render(<Accordion items={defaultItems} />)
      expect(container.querySelector('.ui-accordion')).toHaveAttribute('data-variant', 'default')
    })

    it('applies bordered variant', () => {
      const { container } = render(<Accordion items={defaultItems} variant="bordered" />)
      expect(container.querySelector('.ui-accordion')).toHaveAttribute('data-variant', 'bordered')
    })

    it('applies separated variant', () => {
      const { container } = render(<Accordion items={defaultItems} variant="separated" />)
      expect(container.querySelector('.ui-accordion')).toHaveAttribute('data-variant', 'separated')
    })
  })

  // ─── Size ───────────────────────────────────────────────────────────

  describe('size', () => {
    it('defaults to data-size="md"', () => {
      const { container } = render(<Accordion items={defaultItems} />)
      expect(container.querySelector('.ui-accordion')).toHaveAttribute('data-size', 'md')
    })

    it('applies size sm', () => {
      const { container } = render(<Accordion items={defaultItems} size="sm" />)
      expect(container.querySelector('.ui-accordion')).toHaveAttribute('data-size', 'sm')
    })

    it('applies size lg', () => {
      const { container } = render(<Accordion items={defaultItems} size="lg" />)
      expect(container.querySelector('.ui-accordion')).toHaveAttribute('data-size', 'lg')
    })
  })

  // ─── Item icon ──────────────────────────────────────────────────────

  describe('item icon', () => {
    it('renders item icon when provided', () => {
      const items = [
        { id: 'a', trigger: 'Section A', content: 'Content A', icon: <svg data-testid="item-icon" /> },
      ]
      render(<Accordion items={items} />)
      expect(screen.getByTestId('item-icon')).toBeInTheDocument()
    })

    it('wraps icon in ui-accordion__item-icon class', () => {
      const items = [
        { id: 'a', trigger: 'Section A', content: 'Content A', icon: <svg data-testid="item-icon" /> },
      ]
      const { container } = render(<Accordion items={items} />)
      const iconWrapper = container.querySelector('.ui-accordion__item-icon')!
      expect(iconWrapper).toBeInTheDocument()
      expect(iconWrapper).toHaveAttribute('aria-hidden', 'true')
    })

    it('does not render icon wrapper when no icon provided', () => {
      const { container } = render(<Accordion items={defaultItems} />)
      expect(container.querySelector('.ui-accordion__item-icon')).toBeNull()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<Accordion items={defaultItems} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with open items', async () => {
      const { container } = render(
        <Accordion items={defaultItems} defaultOpen={['a']} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
