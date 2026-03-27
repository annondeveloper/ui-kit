import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { CSVExportButton } from '../../domain/csv-export'

expect.extend(toHaveNoViolations)

const sampleData = [
  { host: 'srv-01', cpu: 72, memory: 8192 },
  { host: 'srv-02', cpu: 45, memory: 16384 },
]

describe('CSVExportButton', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a button element', () => {
      render(<CSVExportButton data={sampleData} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders default text "Export CSV"', () => {
      render(<CSVExportButton data={sampleData} />)
      expect(screen.getByText('Export CSV')).toBeInTheDocument()
    })

    it('renders custom children', () => {
      render(<CSVExportButton data={sampleData}>Download</CSVExportButton>)
      expect(screen.getByText('Download')).toBeInTheDocument()
    })

    it('applies size data attribute', () => {
      render(<CSVExportButton data={sampleData} size="lg" />)
      expect(screen.getByRole('button')).toHaveAttribute('data-size', 'lg')
    })

    it('renders all 5 sizes', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
      for (const s of sizes) {
        const { unmount } = render(<CSVExportButton data={sampleData} size={s} />)
        expect(screen.getByRole('button')).toHaveAttribute('data-size', s)
        unmount()
      }
    })

    it('renders disabled state', () => {
      render(<CSVExportButton data={sampleData} disabled />)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  // ─── Interaction tests ─────────────────────────────────────────────

  describe('interactions', () => {
    it('calls onExport on click', () => {
      const onExport = vi.fn()
      // Mock URL.createObjectURL and link click
      vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:test'), revokeObjectURL: vi.fn() })
      HTMLAnchorElement.prototype.click = vi.fn()
      render(<CSVExportButton data={sampleData} onExport={onExport} />)
      fireEvent.click(screen.getByRole('button'))
      expect(onExport).toHaveBeenCalledOnce()
      vi.unstubAllGlobals()
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<CSVExportButton data={sampleData} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "CSVExportButton"', () => {
      expect(CSVExportButton.displayName).toBe('CSVExportButton')
    })
  })
})
