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

const sampleData2 = [
  { host: 'srv-01', cpu: 72, memory: 8192 },
  { host: 'srv-02', cpu: 45, memory: 16384 },
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
  // ─── Rendering (ours) ──────────────────────────────────────────────

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

  // ─── Accessibility (ours) ──────────────────────────────────────────

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

  // ─── Rendering (origin/main) ───────────────────────────────────────

  describe('rendering (origin/main)', () => {
    it('renders a button element', () => {
      render(<CSVExportButton data={sampleData2} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders default text "Export CSV"', () => {
      render(<CSVExportButton data={sampleData2} />)
      expect(screen.getByText('Export CSV')).toBeInTheDocument()
    })

    it('renders custom children', () => {
      render(<CSVExportButton data={sampleData2}>Download</CSVExportButton>)
      expect(screen.getByText('Download')).toBeInTheDocument()
    })

    it('applies size data attribute', () => {
      render(<CSVExportButton data={sampleData2} size="lg" />)
      expect(screen.getByRole('button')).toHaveAttribute('data-size', 'lg')
    })

    it('renders all 5 sizes', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
      for (const s of sizes) {
        const { unmount } = render(<CSVExportButton data={sampleData2} size={s} />)
        expect(screen.getByRole('button')).toHaveAttribute('data-size', s)
        unmount()
      }
    })

    it('renders disabled state', () => {
      render(<CSVExportButton data={sampleData2} disabled />)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  // ─── Interactions (origin/main) ────────────────────────────────────

  describe('interactions (origin/main)', () => {
    it('calls onExport on click', () => {
      const onExport = vi.fn()
      // Mock URL.createObjectURL and link click
      vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:test'), revokeObjectURL: vi.fn() })
      HTMLAnchorElement.prototype.click = vi.fn()
      render(<CSVExportButton data={sampleData2} onExport={onExport} />)
      fireEvent.click(screen.getByRole('button'))
      expect(onExport).toHaveBeenCalledOnce()
      vi.unstubAllGlobals()
    })
  })

  // ─── Accessibility (origin/main) ───────────────────────────────────

  describe('accessibility (origin/main)', () => {
    it('has no axe violations', async () => {
      const { container } = render(<CSVExportButton data={sampleData2} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name (origin/main) ────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "CSVExportButton"', () => {
      expect(CSVExportButton.displayName).toBe('CSVExportButton')
    })
  })
})
