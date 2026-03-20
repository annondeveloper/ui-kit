import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DiffViewer } from '../../domain/diff-viewer'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const oldText = `line one
line two
line three
line four`

const newText = `line one
line TWO
line three
line four
line five`

describe('DiffViewer', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(
        <DiffViewer oldValue="a" newValue="b" />
      )
      expect(container.querySelector('.ui-diff-viewer')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <DiffViewer oldValue="a" newValue="b" className="custom" />
      )
      expect(container.querySelector('.custom')).toBeInTheDocument()
    })

    it('passes through HTML attributes', () => {
      render(
        <DiffViewer oldValue="a" newValue="b" data-testid="diff" />
      )
      expect(screen.getByTestId('diff')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(DiffViewer.displayName).toBe('DiffViewer')
    })
  })

  // ─── Unified Mode ──────────────────────────────────────────────────

  describe('unified mode', () => {
    it('defaults to unified mode', () => {
      const { container } = render(
        <DiffViewer oldValue="a" newValue="b" />
      )
      expect(container.querySelector('[data-mode="unified"]')).toBeInTheDocument()
    })

    it('shows removed lines with minus prefix', () => {
      const { container } = render(
        <DiffViewer oldValue="old line" newValue="new line" />
      )
      const removed = container.querySelectorAll('.ui-diff-viewer__line--removed')
      expect(removed.length).toBeGreaterThan(0)
      expect(removed[0]?.querySelector('.ui-diff-viewer__prefix')?.textContent).toBe('-')
    })

    it('shows added lines with plus prefix', () => {
      const { container } = render(
        <DiffViewer oldValue="old line" newValue="new line" />
      )
      const added = container.querySelectorAll('.ui-diff-viewer__line--added')
      expect(added.length).toBeGreaterThan(0)
      expect(added[0]?.querySelector('.ui-diff-viewer__prefix')?.textContent).toBe('+')
    })

    it('shows unchanged lines without prefix', () => {
      const { container } = render(
        <DiffViewer oldValue={oldText} newValue={newText} />
      )
      const unchanged = container.querySelectorAll('.ui-diff-viewer__line--unchanged')
      expect(unchanged.length).toBeGreaterThan(0)
    })

    it('detects changed lines correctly', () => {
      const { container } = render(
        <DiffViewer oldValue={oldText} newValue={newText} foldUnchanged={false} />
      )
      // "line two" removed, "line TWO" added, "line five" added
      const removed = container.querySelectorAll('.ui-diff-viewer__line--removed')
      const added = container.querySelectorAll('.ui-diff-viewer__line--added')
      expect(removed.length).toBeGreaterThanOrEqual(1)
      expect(added.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ─── Side-by-Side Mode ─────────────────────────────────────────────

  describe('side-by-side mode', () => {
    it('renders side-by-side layout', () => {
      const { container } = render(
        <DiffViewer oldValue="a" newValue="b" mode="side-by-side" />
      )
      expect(container.querySelector('[data-mode="side-by-side"]')).toBeInTheDocument()
    })

    it('has two panes', () => {
      const { container } = render(
        <DiffViewer oldValue="a" newValue="b" mode="side-by-side" />
      )
      const panes = container.querySelectorAll('.ui-diff-viewer__pane')
      expect(panes.length).toBe(2)
    })

    it('shows old content in left pane', () => {
      const { container } = render(
        <DiffViewer
          oldValue="old content"
          newValue="new content"
          mode="side-by-side"
        />
      )
      const leftPane = container.querySelector('.ui-diff-viewer__pane--old')
      expect(leftPane?.textContent).toContain('old content')
    })

    it('shows new content in right pane', () => {
      const { container } = render(
        <DiffViewer
          oldValue="old content"
          newValue="new content"
          mode="side-by-side"
        />
      )
      const rightPane = container.querySelector('.ui-diff-viewer__pane--new')
      expect(rightPane?.textContent).toContain('new content')
    })
  })

  // ─── Fold Unchanged ────────────────────────────────────────────────

  describe('fold unchanged', () => {
    const manyLines = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join('\n')
    const manyLinesChanged = manyLines.replace('line 10', 'CHANGED')

    it('folds unchanged sections by default', () => {
      const { container } = render(
        <DiffViewer oldValue={manyLines} newValue={manyLinesChanged} />
      )
      const foldDivider = container.querySelector('.ui-diff-viewer__fold')
      expect(foldDivider).toBeInTheDocument()
    })

    it('shows fold count text', () => {
      const { container } = render(
        <DiffViewer oldValue={manyLines} newValue={manyLinesChanged} />
      )
      const fold = container.querySelector('.ui-diff-viewer__fold')
      expect(fold?.textContent).toMatch(/\d+ unchanged line/)
    })

    it('does not fold when foldUnchanged=false', () => {
      const { container } = render(
        <DiffViewer
          oldValue={manyLines}
          newValue={manyLinesChanged}
          foldUnchanged={false}
        />
      )
      expect(container.querySelector('.ui-diff-viewer__fold')).not.toBeInTheDocument()
    })

    it('expands fold on click', async () => {
      const { container } = render(
        <DiffViewer oldValue={manyLines} newValue={manyLinesChanged} />
      )
      const foldBtn = container.querySelector('.ui-diff-viewer__fold') as HTMLElement
      expect(foldBtn).toBeInTheDocument()

      const foldsBefore = container.querySelectorAll('.ui-diff-viewer__fold').length
      await userEvent.click(foldBtn)
      const foldsAfter = container.querySelectorAll('.ui-diff-viewer__fold').length
      expect(foldsAfter).toBeLessThan(foldsBefore)
    })

    it('respects foldThreshold', () => {
      // With threshold 10, small unchanged runs should not be folded
      const { container } = render(
        <DiffViewer
          oldValue={manyLines}
          newValue={manyLinesChanged}
          foldThreshold={100}
        />
      )
      expect(container.querySelector('.ui-diff-viewer__fold')).not.toBeInTheDocument()
    })
  })

  // ─── Line Numbers ──────────────────────────────────────────────────

  describe('line numbers', () => {
    it('shows line numbers by default', () => {
      const { container } = render(
        <DiffViewer oldValue="a\nb" newValue="a\nc" foldUnchanged={false} />
      )
      const lineNums = container.querySelectorAll('.ui-diff-viewer__line-number')
      expect(lineNums.length).toBeGreaterThan(0)
    })

    it('hides line numbers when showLineNumbers=false', () => {
      const { container } = render(
        <DiffViewer oldValue="a" newValue="b" showLineNumbers={false} />
      )
      expect(container.querySelector('.ui-diff-viewer__line-number')).not.toBeInTheDocument()
    })
  })

  // ─── Titles ─────────────────────────────────────────────────────────

  describe('titles', () => {
    it('renders old title', () => {
      render(
        <DiffViewer oldValue="a" newValue="b" oldTitle="Before" />
      )
      expect(screen.getByText('Before')).toBeInTheDocument()
    })

    it('renders new title', () => {
      render(
        <DiffViewer oldValue="a" newValue="b" newTitle="After" />
      )
      expect(screen.getByText('After')).toBeInTheDocument()
    })

    it('does not render title area when no titles', () => {
      const { container } = render(
        <DiffViewer oldValue="a" newValue="b" />
      )
      expect(container.querySelector('.ui-diff-viewer__titles')).not.toBeInTheDocument()
    })
  })

  // ─── Empty Diff ─────────────────────────────────────────────────────

  describe('empty diff', () => {
    it('handles identical values', () => {
      const { container } = render(
        <DiffViewer oldValue="same" newValue="same" />
      )
      expect(container.querySelector('.ui-diff-viewer__line--removed')).not.toBeInTheDocument()
      expect(container.querySelector('.ui-diff-viewer__line--added')).not.toBeInTheDocument()
    })

    it('handles empty strings', () => {
      const { container } = render(
        <DiffViewer oldValue="" newValue="" />
      )
      expect(container.querySelector('.ui-diff-viewer')).toBeInTheDocument()
    })

    it('handles old empty, new has content', () => {
      const { container } = render(
        <DiffViewer oldValue="" newValue="new content" />
      )
      const added = container.querySelectorAll('.ui-diff-viewer__line--added')
      expect(added.length).toBeGreaterThan(0)
    })

    it('handles new empty, old has content', () => {
      const { container } = render(
        <DiffViewer oldValue="old content" newValue="" />
      )
      const removed = container.querySelectorAll('.ui-diff-viewer__line--removed')
      expect(removed.length).toBeGreaterThan(0)
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations in unified mode', async () => {
      const { container } = render(
        <DiffViewer oldValue={oldText} newValue={newText} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations in side-by-side mode', async () => {
      const { container } = render(
        <DiffViewer oldValue={oldText} newValue={newText} mode="side-by-side" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('fold button is keyboard accessible', async () => {
      const manyLines = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join('\n')
      const manyLinesChanged = manyLines.replace('line 10', 'CHANGED')

      const { container } = render(
        <DiffViewer oldValue={manyLines} newValue={manyLinesChanged} />
      )
      const foldBtn = container.querySelector('.ui-diff-viewer__fold') as HTMLElement
      expect(foldBtn).toBeInTheDocument()
      foldBtn.focus()
      await userEvent.keyboard('{Enter}')
      // After expanding, the fold should be gone
      expect(container.querySelectorAll('.ui-diff-viewer__fold').length).toBeLessThan(2)
    })
  })
})
