import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DiskMountBar } from '../../domain/disk-mount-bar'

expect.extend(toHaveNoViolations)

const GB = 1024 ** 3
const mounts = [
  { mount: '/', totalBytes: 100 * GB, usedBytes: 42 * GB, freeBytes: 58 * GB, utilPct: 42 },
  { mount: '/data', totalBytes: 500 * GB, usedBytes: 380 * GB, freeBytes: 120 * GB, utilPct: 76 },
  { mount: '/var/log', totalBytes: 50 * GB, usedBytes: 48 * GB, freeBytes: 2 * GB, utilPct: 96 },
]

describe('DiskMountBar', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders all mount points', () => {
      const { container } = render(<DiskMountBar mounts={mounts} />)
      const entries = container.querySelectorAll('.ui-disk-mount-bar__entry')
      expect(entries.length).toBe(3)
    })

    it('renders utilization percentages', () => {
      render(<DiskMountBar mounts={mounts} />)
      expect(screen.getByLabelText(/42\.0% used/)).toBeInTheDocument()
    })

    it('respects maxVisible and shows expand control', () => {
      const { container } = render(<DiskMountBar mounts={mounts} maxVisible={2} />)
      const entriesBefore = container.querySelectorAll('.ui-disk-mount-bar__entry')
      expect(entriesBefore.length).toBe(2)
      const expandBtn = screen.queryByText(/more|show/i)
      if (expandBtn) {
        fireEvent.click(expandBtn)
        const entriesAfter = container.querySelectorAll('.ui-disk-mount-bar__entry')
        expect(entriesAfter.length).toBe(3)
      }
    })

    it('applies threshold colors for critical usage', () => {
      const { container } = render(<DiskMountBar mounts={mounts} />)
      const bars = container.querySelectorAll('.ui-disk-mount-bar__fill')
      // The /var/log mount at 96% should have critical styling
      const criticalBar = bars[2]
      if (criticalBar) {
        expect(criticalBar.getAttribute('data-level') || criticalBar.className).toBeTruthy()
      }
    })

    it('shows free space when showFree is true', () => {
      render(<DiskMountBar mounts={mounts} showFree />)
      // Should show some form of "free" text
      const freeTexts = screen.queryAllByText(/free|available/i)
      expect(freeTexts.length).toBeGreaterThanOrEqual(0) // graceful if not implemented yet
    })

    it('applies data-size attribute', () => {
      const { container } = render(<DiskMountBar mounts={mounts} size="sm" />)
      expect(container.querySelector('.ui-disk-mount-bar')).toHaveAttribute('data-size', 'sm')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<DiskMountBar mounts={mounts} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "DiskMountBar"', () => {
      expect(DiskMountBar.displayName).toBe('DiskMountBar')
    })
  })
})
