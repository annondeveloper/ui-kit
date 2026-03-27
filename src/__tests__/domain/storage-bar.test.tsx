import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { StorageBar } from '../../domain/storage-bar'

expect.extend(toHaveNoViolations)

const segments = [
  { label: 'System', value: 120 },
  { label: 'Apps', value: 340 },
  { label: 'Media', value: 210 },
]

describe('StorageBar', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with role="img"', () => {
      render(<StorageBar segments={segments} total={1024} />)
      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('renders correct number of segments', () => {
      const { container } = render(<StorageBar segments={segments} total={1024} />)
      const segs = container.querySelectorAll('.ui-storage-bar__segment')
      expect(segs).toHaveLength(3)
    })

    it('has aria-label with storage summary', () => {
      render(<StorageBar segments={segments} total={1024} />)
      const el = screen.getByRole('img')
      expect(el.getAttribute('aria-label')).toContain('670.0 GB')
      expect(el.getAttribute('aria-label')).toContain('1.0 TB')
    })

    it('renders legend when showLegend is true', () => {
      const { container } = render(<StorageBar segments={segments} total={1024} showLegend />)
      const legend = container.querySelector('.ui-storage-bar__legend')
      expect(legend).toBeInTheDocument()
      expect(screen.getByText(/System/)).toBeInTheDocument()
      expect(screen.getByText(/Free/)).toBeInTheDocument()
    })

    it('does not render legend by default', () => {
      const { container } = render(<StorageBar segments={segments} total={1024} />)
      expect(container.querySelector('.ui-storage-bar__legend')).not.toBeInTheDocument()
    })

    it('renders segment labels when showLabels is true', () => {
      const { container } = render(<StorageBar segments={segments} total={1024} showLabels />)
      const labels = container.querySelectorAll('.ui-storage-bar__segment-label')
      expect(labels).toHaveLength(3)
    })

    it('applies data-size attribute', () => {
      const { container } = render(<StorageBar segments={segments} total={1024} size="lg" />)
      expect(container.querySelector('.ui-storage-bar')).toHaveAttribute('data-size', 'lg')
    })

    it('renders all sizes', () => {
      for (const size of ['sm', 'md', 'lg'] as const) {
        const { container, unmount } = render(<StorageBar segments={segments} total={1024} size={size} />)
        expect(container.querySelector('.ui-storage-bar')).toHaveAttribute('data-size', size)
        unmount()
      }
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<StorageBar segments={segments} total={1024} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "StorageBar"', () => {
      expect(StorageBar.displayName).toBe('StorageBar')
    })
  })
})
