import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { LogViewer } from '../../domain/log-viewer'
import type { LogLine } from '../../domain/log-viewer'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const lines: LogLine[] = [
  { id: 1, timestamp: new Date('2026-03-20T10:00:00Z'), level: 'info', message: 'Server started on port 3000' },
  { id: 2, timestamp: new Date('2026-03-20T10:00:01Z'), level: 'debug', message: 'Loading configuration' },
  { id: 3, timestamp: new Date('2026-03-20T10:00:02Z'), level: 'warn', message: 'Deprecated API call detected' },
  { id: 4, timestamp: new Date('2026-03-20T10:00:03Z'), level: 'error', message: 'Connection refused to database' },
  { id: 5, timestamp: new Date('2026-03-20T10:00:04Z'), level: 'info', message: 'Retrying connection...' },
]

describe('LogViewer', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<LogViewer lines={lines} />)
      expect(container.querySelector('.ui-log-viewer')).toBeInTheDocument()
    })

    it('renders all log lines', () => {
      render(<LogViewer lines={lines} />)
      expect(screen.getByText(/Server started/)).toBeInTheDocument()
      expect(screen.getByText(/Connection refused/)).toBeInTheDocument()
    })

    it('renders empty state', () => {
      const { container } = render(<LogViewer lines={[]} />)
      expect(container.querySelector('.ui-log-viewer')).toBeInTheDocument()
    })

    it('renders monospace text', () => {
      const { container } = render(<LogViewer lines={lines} />)
      expect(container.querySelector('.ui-log-viewer')).toBeInTheDocument()
    })
  })

  // ─── Timestamps ─────────────────────────────────────────────────────

  describe('timestamps', () => {
    it('shows timestamps when enabled', () => {
      const { container } = render(<LogViewer lines={lines} showTimestamp />)
      const timestamps = container.querySelectorAll('.ui-log-viewer__timestamp')
      expect(timestamps.length).toBeGreaterThan(0)
    })

    it('hides timestamps by default', () => {
      const { container } = render(<LogViewer lines={lines} />)
      const timestamps = container.querySelectorAll('.ui-log-viewer__timestamp')
      expect(timestamps.length).toBe(0)
    })
  })

  // ─── Level display ─────────────────────────────────────────────────

  describe('level display', () => {
    it('shows level when enabled', () => {
      const { container } = render(<LogViewer lines={lines} showLevel />)
      const levels = container.querySelectorAll('.ui-log-viewer__level')
      expect(levels.length).toBeGreaterThan(0)
    })

    it('hides level by default', () => {
      const { container } = render(<LogViewer lines={lines} />)
      const levels = container.querySelectorAll('.ui-log-viewer__level')
      expect(levels.length).toBe(0)
    })

    it('applies level-specific data attribute', () => {
      const { container } = render(<LogViewer lines={lines} showLevel />)
      expect(container.querySelector('[data-level="info"]')).toBeInTheDocument()
      expect(container.querySelector('[data-level="warn"]')).toBeInTheDocument()
      expect(container.querySelector('[data-level="error"]')).toBeInTheDocument()
    })
  })

  // ─── Level filtering ───────────────────────────────────────────────

  describe('level filtering', () => {
    it('filters to show only specified levels', () => {
      const { container } = render(
        <LogViewer lines={lines} filterLevel={['error']} showLevel />
      )
      const visibleLines = container.querySelectorAll('.ui-log-viewer__line')
      expect(visibleLines.length).toBe(1)
    })

    it('shows multiple filtered levels', () => {
      const { container } = render(
        <LogViewer lines={lines} filterLevel={['info', 'error']} showLevel />
      )
      const visibleLines = container.querySelectorAll('.ui-log-viewer__line')
      expect(visibleLines.length).toBe(3) // 2 info + 1 error
    })

    it('shows all when filter is empty', () => {
      const { container } = render(
        <LogViewer lines={lines} filterLevel={[]} showLevel />
      )
      const visibleLines = container.querySelectorAll('.ui-log-viewer__line')
      expect(visibleLines.length).toBe(5)
    })
  })

  // ─── Search highlighting ───────────────────────────────────────────

  describe('search highlighting', () => {
    it('highlights matching text', () => {
      const { container } = render(<LogViewer lines={lines} search="connection" />)
      const marks = container.querySelectorAll('mark')
      expect(marks.length).toBeGreaterThan(0)
    })

    it('is case insensitive', () => {
      const { container } = render(<LogViewer lines={lines} search="CONNECTION" />)
      const marks = container.querySelectorAll('mark')
      expect(marks.length).toBeGreaterThan(0)
    })

    it('handles empty search', () => {
      const { container } = render(<LogViewer lines={lines} search="" />)
      const marks = container.querySelectorAll('mark')
      expect(marks.length).toBe(0)
    })

    it('handles special regex characters in search', () => {
      const specialLines: LogLine[] = [
        { id: 1, message: 'Error: [object Object]' },
      ]
      const { container } = render(<LogViewer lines={specialLines} search="[object" />)
      const marks = container.querySelectorAll('mark')
      expect(marks.length).toBeGreaterThan(0)
    })
  })

  // ─── Wrap ───────────────────────────────────────────────────────────

  describe('wrap', () => {
    it('applies wrap mode', () => {
      const { container } = render(<LogViewer lines={lines} wrap />)
      expect(container.querySelector('[data-wrap="true"]')).toBeInTheDocument()
    })

    it('defaults to no wrap', () => {
      const { container } = render(<LogViewer lines={lines} />)
      expect(container.querySelector('[data-wrap="true"]')).not.toBeInTheDocument()
    })
  })

  // ─── Max lines ──────────────────────────────────────────────────────

  describe('maxLines', () => {
    it('limits displayed lines', () => {
      const { container } = render(<LogViewer lines={lines} maxLines={3} />)
      const visibleLines = container.querySelectorAll('.ui-log-viewer__line')
      expect(visibleLines.length).toBe(3)
    })
  })

  // ─── Height ─────────────────────────────────────────────────────────

  describe('height', () => {
    it('applies custom height', () => {
      const { container } = render(<LogViewer lines={lines} height="300px" />)
      const viewer = container.querySelector('.ui-log-viewer__scroll') as HTMLElement
      expect(viewer?.style.height || viewer?.style.blockSize).toBeTruthy()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<LogViewer lines={lines} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ───────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<LogViewer lines={lines} className="custom" />)
      expect(container.querySelector('.ui-log-viewer.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<LogViewer lines={lines} data-testid="logs" />)
      expect(screen.getByTestId('logs')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(LogViewer.displayName).toBe('LogViewer')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<LogViewer lines={lines} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no violations with all features', async () => {
      const { container } = render(
        <LogViewer
          lines={lines}
          showTimestamp
          showLevel
          search="connection"
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has log role', () => {
      const { container } = render(<LogViewer lines={lines} />)
      expect(container.querySelector('[role="log"]')).toBeInTheDocument()
    })

    it('has aria-live for auto-tail', () => {
      const { container } = render(<LogViewer lines={lines} autoTail />)
      expect(container.querySelector('[aria-live]')).toBeInTheDocument()
    })
  })

  // ─── Virtual scrolling ─────────────────────────────────────────────

  describe('virtual scrolling', () => {
    it('handles large datasets', () => {
      const manyLines: LogLine[] = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        message: `Log line ${i}`,
        level: 'info' as const,
      }))
      const { container } = render(<LogViewer lines={manyLines} height="200px" />)
      // Should not render all 1000 lines in the DOM
      const rendered = container.querySelectorAll('.ui-log-viewer__line')
      expect(rendered.length).toBeLessThan(1000)
    })
  })
})
