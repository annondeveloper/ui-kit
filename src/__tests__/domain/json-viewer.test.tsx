import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { JsonViewer } from '../../domain/json-viewer'

expect.extend(toHaveNoViolations)

const sampleData = {
  name: 'Alice',
  age: 30,
  active: true,
  address: null,
  tags: ['admin', 'user'],
  meta: {
    created: '2024-01-01',
    updated: '2024-06-15',
  },
}

describe('JsonViewer', () => {
  afterEach(cleanup)

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the json viewer container', () => {
      const { container } = render(<JsonViewer data={sampleData} />)
      expect(container.querySelector('.ui-json-viewer')).toBeInTheDocument()
    })

    it('renders root name', () => {
      render(<JsonViewer data={sampleData} rootName="data" />)
      expect(screen.getByText('data')).toBeInTheDocument()
    })

    it('renders default root name as "root"', () => {
      render(<JsonViewer data={sampleData} />)
      expect(screen.getByText('root')).toBeInTheDocument()
    })

    it('renders string values in quotes', () => {
      render(<JsonViewer data={{ name: 'Alice' }} initialExpandDepth={5} />)
      expect(screen.getByText('"Alice"')).toBeInTheDocument()
    })

    it('renders number values', () => {
      render(<JsonViewer data={{ age: 30 }} initialExpandDepth={5} />)
      expect(screen.getByText('30')).toBeInTheDocument()
    })

    it('renders boolean values', () => {
      render(<JsonViewer data={{ active: true }} initialExpandDepth={5} />)
      expect(screen.getByText('true')).toBeInTheDocument()
    })

    it('renders null values', () => {
      render(<JsonViewer data={{ val: null }} initialExpandDepth={5} />)
      expect(screen.getByText('null')).toBeInTheDocument()
    })

    it('renders nested objects', () => {
      render(<JsonViewer data={sampleData} initialExpandDepth={5} />)
      expect(screen.getByText('created')).toBeInTheDocument()
      expect(screen.getByText('"2024-01-01"')).toBeInTheDocument()
    })
  })

  // ─── Expand/Collapse ───────────────────────────────────────────────

  describe('expand/collapse', () => {
    it('expands nodes to initialExpandDepth', () => {
      render(<JsonViewer data={sampleData} initialExpandDepth={1} />)
      // First level keys should be visible
      expect(screen.getByText('name')).toBeInTheDocument()
      expect(screen.getByText('"Alice"')).toBeInTheDocument()
    })

    it('collapses all when collapsed prop is true', () => {
      render(<JsonViewer data={sampleData} collapsed />)
      // Root should show ellipsis since it is collapsed
      const ellipsis = screen.getAllByText('...')
      expect(ellipsis.length).toBeGreaterThan(0)
    })

    it('toggles node on chevron click', () => {
      render(<JsonViewer data={sampleData} initialExpandDepth={0} />)
      // Root is collapsed, click to expand
      const expandBtn = screen.getAllByLabelText('Expand')[0]
      fireEvent.click(expandBtn)
      // Now first-level keys should appear
      expect(screen.getByText('name')).toBeInTheDocument()
    })

    it('chevron has data-expanded when node is expanded', () => {
      const { container } = render(<JsonViewer data={sampleData} initialExpandDepth={1} />)
      const expandedChevrons = container.querySelectorAll('.ui-json-viewer__chevron[data-expanded]')
      expect(expandedChevrons.length).toBeGreaterThan(0)
    })
  })

  // ─── Size badges ──────────────────────────────────────────────────

  describe('size badges', () => {
    it('shows object size badge by default', () => {
      render(<JsonViewer data={sampleData} />)
      // sampleData has 6 keys
      expect(screen.getByText('{6}')).toBeInTheDocument()
    })

    it('shows array size badge', () => {
      render(<JsonViewer data={sampleData} initialExpandDepth={1} />)
      // tags array has 2 items
      expect(screen.getByText('[2]')).toBeInTheDocument()
    })

    it('hides size badges when displayObjectSize is false', () => {
      render(<JsonViewer data={sampleData} displayObjectSize={false} />)
      expect(screen.queryByText('{6}')).not.toBeInTheDocument()
    })
  })

  // ─── Type labels ─────────────────────────────────────────────────

  describe('type labels', () => {
    it('shows type labels when displayDataTypes is true', () => {
      render(<JsonViewer data={{ val: 42 }} displayDataTypes initialExpandDepth={5} />)
      expect(screen.getByText('number')).toBeInTheDocument()
    })

    it('does not show type labels by default', () => {
      render(<JsonViewer data={{ val: 42 }} initialExpandDepth={5} />)
      expect(screen.queryByText('number')).not.toBeInTheDocument()
    })
  })

  // ─── String truncation ───────────────────────────────────────────

  describe('string truncation', () => {
    it('truncates long strings', () => {
      const longStr = 'a'.repeat(100)
      render(<JsonViewer data={{ text: longStr }} maxStringLength={10} initialExpandDepth={5} />)
      expect(screen.getByText(`"${'a'.repeat(10)}..."`)).toBeInTheDocument()
    })

    it('shows "show more" button for truncated strings', () => {
      const longStr = 'a'.repeat(100)
      render(<JsonViewer data={{ text: longStr }} maxStringLength={10} initialExpandDepth={5} />)
      expect(screen.getByText('show more')).toBeInTheDocument()
    })

    it('expands string on "show more" click', () => {
      const longStr = 'b'.repeat(50)
      render(<JsonViewer data={{ text: longStr }} maxStringLength={10} initialExpandDepth={5} />)
      fireEvent.click(screen.getByText('show more'))
      expect(screen.getByText(`"${longStr}"`)).toBeInTheDocument()
    })
  })

  // ─── Sort keys ───────────────────────────────────────────────────

  describe('sort keys', () => {
    it('sorts keys alphabetically when sortKeys is true', () => {
      const data = { zebra: 1, apple: 2, mango: 3 }
      const { container } = render(<JsonViewer data={data} sortKeys initialExpandDepth={5} />)
      const keys = container.querySelectorAll('.ui-json-viewer__key')
      // root + apple + mango + zebra
      const keyTexts = Array.from(keys).map(k => k.textContent)
      // Root is first, then sorted
      expect(keyTexts.slice(1)).toEqual(['apple', 'mango', 'zebra'])
    })
  })

  // ─── Clipboard ───────────────────────────────────────────────────

  describe('clipboard', () => {
    it('makes values clickable when enableClipboard is true', () => {
      const { container } = render(
        <JsonViewer data={{ val: 42 }} enableClipboard initialExpandDepth={5} />
      )
      const valueEl = container.querySelector('.ui-json-viewer__value[role="button"]')
      expect(valueEl).toBeInTheDocument()
    })

    it('does not make values clickable by default', () => {
      const { container } = render(
        <JsonViewer data={{ val: 42 }} initialExpandDepth={5} />
      )
      const valueEl = container.querySelector('.ui-json-viewer__value[role="button"]')
      expect(valueEl).not.toBeInTheDocument()
    })
  })

  // ─── Theme ───────────────────────────────────────────────────────

  describe('theme', () => {
    it('applies dark theme by default', () => {
      const { container } = render(<JsonViewer data={{}} />)
      expect(container.querySelector('.ui-json-viewer')).toHaveAttribute('data-theme', 'dark')
    })

    it('applies light theme', () => {
      const { container } = render(<JsonViewer data={{}} theme="light" />)
      expect(container.querySelector('.ui-json-viewer')).toHaveAttribute('data-theme', 'light')
    })
  })

  // ─── Value coloring ──────────────────────────────────────────────

  describe('value types', () => {
    it('applies data-type attribute for strings', () => {
      const { container } = render(<JsonViewer data={{ s: 'hi' }} initialExpandDepth={5} />)
      expect(container.querySelector('[data-type="string"]')).toBeInTheDocument()
    })

    it('applies data-type attribute for numbers', () => {
      const { container } = render(<JsonViewer data={{ n: 42 }} initialExpandDepth={5} />)
      expect(container.querySelector('[data-type="number"]')).toBeInTheDocument()
    })

    it('applies data-type attribute for booleans', () => {
      const { container } = render(<JsonViewer data={{ b: true }} initialExpandDepth={5} />)
      expect(container.querySelector('[data-type="boolean"]')).toBeInTheDocument()
    })

    it('applies data-type attribute for null', () => {
      const { container } = render(<JsonViewer data={{ n: null }} initialExpandDepth={5} />)
      expect(container.querySelector('[data-type="null"]')).toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion attribute', () => {
      const { container } = render(<JsonViewer data={{}} motion={0} />)
      expect(container.querySelector('.ui-json-viewer')).toHaveAttribute('data-motion', '0')
    })

    it('sets data-motion to 2', () => {
      const { container } = render(<JsonViewer data={{}} motion={2} />)
      expect(container.querySelector('.ui-json-viewer')).toHaveAttribute('data-motion', '2')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<JsonViewer data={sampleData} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has role="group" on the root', () => {
      const { container } = render(<JsonViewer data={sampleData} />)
      expect(container.querySelector('[role="group"]')).toBeInTheDocument()
    })

    it('has aria-label on root', () => {
      render(<JsonViewer data={{}} rootName="config" />)
      expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'JSON viewer: config')
    })

    it('chevrons have aria-expanded attribute', () => {
      const { container } = render(<JsonViewer data={sampleData} initialExpandDepth={1} />)
      const chevrons = container.querySelectorAll('.ui-json-viewer__chevron')
      chevrons.forEach(chevron => {
        expect(chevron).toHaveAttribute('aria-expanded')
      })
    })
  })

  // ─── Edge cases ─────────────────────────────────────────────────

  describe('edge cases', () => {
    it('renders empty object', () => {
      const { container } = render(<JsonViewer data={{}} />)
      expect(container.querySelector('.ui-json-viewer')).toBeInTheDocument()
    })

    it('renders empty array', () => {
      const { container } = render(<JsonViewer data={[]} />)
      expect(container.querySelector('.ui-json-viewer')).toBeInTheDocument()
    })

    it('renders primitive at root', () => {
      render(<JsonViewer data={42} />)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders string at root', () => {
      render(<JsonViewer data="hello" />)
      expect(screen.getByText('"hello"')).toBeInTheDocument()
    })

    it('passes additional className', () => {
      const { container } = render(<JsonViewer data={{}} className="custom" />)
      expect(container.querySelector('.ui-json-viewer.custom')).toBeInTheDocument()
    })
  })
})
