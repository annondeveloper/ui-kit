import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { createRef } from 'react'
import { CSVExportButton } from '../../domain/csv-export'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const sampleData = [
  { name: 'Server A', status: 'up', cpu: 45 },
  { name: 'Server B', status: 'down', cpu: 0 },
  { name: 'Server C', status: 'up', cpu: 78 },
]

// Mock URL.createObjectURL and revokeObjectURL
beforeEach(() => {
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  })
})

describe('CSVExportButton', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<CSVExportButton data={sampleData} />)
      expect(container.querySelector('.ui-csv-export')).toBeInTheDocument()
    })

    it('renders as a button element', () => {
      render(<CSVExportButton data={sampleData} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders default label', () => {
      render(<CSVExportButton data={sampleData} />)
      expect(screen.getByText('Export CSV')).toBeInTheDocument()
    })

    it('renders custom children', () => {
      render(<CSVExportButton data={sampleData}>Download</CSVExportButton>)
      expect(screen.getByText('Download')).toBeInTheDocument()
    })

    it('renders SVG icon', () => {
      const { container } = render(<CSVExportButton data={sampleData} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  // ─── Sizes ────────────────────────────────────────────────────────

  describe('sizes', () => {
    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders %s size', (size) => {
      const { container } = render(<CSVExportButton data={sampleData} size={size} />)
      expect(container.querySelector(`[data-size="${size}"]`)).toBeInTheDocument()
    })
  })

  // ─── Export ───────────────────────────────────────────────────────

  describe('export', () => {
    it('calls onExport when clicked', () => {
      const onExport = vi.fn()
      render(<CSVExportButton data={sampleData} onExport={onExport} />)
      fireEvent.click(screen.getByRole('button'))
      expect(onExport).toHaveBeenCalled()
    })

    it('shows exported state after click', () => {
      render(<CSVExportButton data={sampleData} />)
      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByText('Exported!')).toBeInTheDocument()
    })

    it('does not export when disabled', () => {
      const onExport = vi.fn()
      render(<CSVExportButton data={sampleData} onExport={onExport} disabled />)
      fireEvent.click(screen.getByRole('button'))
      expect(onExport).not.toHaveBeenCalled()
    })

    it('does not export when data is empty', () => {
      const onExport = vi.fn()
      render(<CSVExportButton data={[]} onExport={onExport} />)
      fireEvent.click(screen.getByRole('button'))
      expect(onExport).not.toHaveBeenCalled()
    })
  })

  // ─── Ref forwarding ───────────────────────────────────────────────

  describe('ref forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = createRef<HTMLButtonElement>()
      render(<CSVExportButton ref={ref} data={sampleData} />)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<CSVExportButton data={sampleData} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<CSVExportButton data={sampleData} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ─────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<CSVExportButton data={sampleData} className="custom" />)
      expect(container.querySelector('.ui-csv-export.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<CSVExportButton data={sampleData} data-testid="csv-btn" />)
      expect(screen.getByTestId('csv-btn')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(CSVExportButton.displayName).toBe('CSVExportButton')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('renders as type="button"', () => {
      render(<CSVExportButton data={sampleData} />)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('disabled state is reflected', () => {
      render(<CSVExportButton data={sampleData} disabled />)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('has no axe violations', async () => {
      const { container } = render(<CSVExportButton data={sampleData} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations when disabled', async () => {
      const { container } = render(<CSVExportButton data={sampleData} disabled />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
