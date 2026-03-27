import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { StorageBar } from '../../domain/storage-bar'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const sampleSegments = [
  { label: 'System', value: 120 },
  { label: 'Apps', value: 250 },
  { label: 'Data', value: 380 },
]

const segments = [
  { label: 'System', value: 120 },
  { label: 'Apps', value: 340 },
  { label: 'Media', value: 210 },
]

describe('StorageBar', () => {
  // ─── Rendering (ours) ──────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} />)
      expect(container.querySelector('.ui-storage-bar')).toBeInTheDocument()
    })

    it('renders track element', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} />)
      expect(container.querySelector('.ui-storage-bar__track')).toBeInTheDocument()
    })

    it('renders segment for each entry', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} />)
      const segs = container.querySelectorAll('.ui-storage-bar__segment')
      expect(segs.length).toBe(3)
    })

    it('renders segment labels when showLabels is true', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} showLabels />)
      const labels = container.querySelectorAll('.ui-storage-bar__segment-label')
      expect(labels.length).toBe(3)
    })

    it('does not render labels by default', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} />)
      const labels = container.querySelectorAll('.ui-storage-bar__segment-label')
      expect(labels.length).toBe(0)
    })

    it('renders legend when showLegend is true', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} showLegend />)
      expect(container.querySelector('.ui-storage-bar__legend')).toBeInTheDocument()
    })

    it('does not render legend by default', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} />)
      expect(container.querySelector('.ui-storage-bar__legend')).not.toBeInTheDocument()
    })
  })

  // ─── Sizes ────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('renders sm size', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} size="sm" />)
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })

    it('renders md size (default)', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} />)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })

    it('renders lg size', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} size="lg" />)
      expect(container.querySelector('[data-size="lg"]')).toBeInTheDocument()
    })
  })

  // ─── Tooltip ──────────────────────────────────────────────────────

  describe('tooltip', () => {
    it('shows tooltip on segment hover', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} />)
      const segs = container.querySelectorAll('.ui-storage-bar__segment')
      fireEvent.mouseEnter(segs[0])
      expect(container.querySelector('.ui-storage-bar__tooltip')).toBeInTheDocument()
    })

    it('hides tooltip on mouse leave', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} />)
      const segs = container.querySelectorAll('.ui-storage-bar__segment')
      fireEvent.mouseEnter(segs[0])
      fireEvent.mouseLeave(segs[0])
      expect(container.querySelector('.ui-storage-bar__tooltip')).not.toBeInTheDocument()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ─────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} className="custom" />)
      expect(container.querySelector('.ui-storage-bar.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<StorageBar segments={sampleSegments} total={1024} data-testid="storage" />)
      expect(screen.getByTestId('storage')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(StorageBar.displayName).toBe('StorageBar')
    })
  })

  // ─── Accessibility (ours) ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has img role', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} />)
      expect(container.querySelector('[role="img"]')).toBeInTheDocument()
    })

    it('has aria-label describing storage', () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} />)
      const el = container.querySelector('[role="img"]')
      expect(el?.getAttribute('aria-label')).toContain('Storage')
    })

    it('has no axe violations', async () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with legend', async () => {
      const { container } = render(<StorageBar segments={sampleSegments} total={1024} showLegend />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Rendering (origin/main) ───────────────────────────────────────

  describe('rendering (origin/main)', () => {
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

  // ─── Accessibility (origin/main) ───────────────────────────────────

  describe('accessibility (origin/main)', () => {
    it('has no axe violations', async () => {
      const { container } = render(<StorageBar segments={segments} total={1024} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name (origin/main) ────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "StorageBar"', () => {
      expect(StorageBar.displayName).toBe('StorageBar')
    })
  })
})
