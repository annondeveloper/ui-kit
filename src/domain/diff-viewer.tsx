'use client'

import {
  useState,
  useMemo,
  type HTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DiffViewerProps extends HTMLAttributes<HTMLDivElement> {
  oldValue: string
  newValue: string
  oldTitle?: string
  newTitle?: string
  mode?: 'side-by-side' | 'unified'
  showLineNumbers?: boolean
  foldUnchanged?: boolean
  foldThreshold?: number
  language?: string
  motion?: 0 | 1 | 2 | 3
}

// ─── Diff Algorithm ─────────────────────────────────────────────────────────

type DiffLineType = 'added' | 'removed' | 'unchanged'

interface DiffLine {
  type: DiffLineType
  value: string
  oldLineNum?: number
  newLineNum?: number
}

/**
 * Simple LCS-based line diff.
 * Finds the longest common subsequence of lines, then marks lines as
 * added, removed, or unchanged based on that.
 */
function computeDiff(oldStr: string, newStr: string): DiffLine[] {
  const oldLines = oldStr.split('\n')
  const newLines = newStr.split('\n')

  const m = oldLines.length
  const n = newLines.length

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to produce diff
  const result: DiffLine[] = []
  let i = m
  let j = n

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({
        type: 'unchanged',
        value: oldLines[i - 1],
        oldLineNum: i,
        newLineNum: j,
      })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({
        type: 'added',
        value: newLines[j - 1],
        newLineNum: j,
      })
      j--
    } else if (i > 0) {
      result.unshift({
        type: 'removed',
        value: oldLines[i - 1],
        oldLineNum: i,
      })
      i--
    }
  }

  return result
}

// ─── Fold Helpers ───────────────────────────────────────────────────────────

interface FoldedBlock {
  kind: 'lines'
  lines: DiffLine[]
}

interface FoldedFold {
  kind: 'fold'
  lines: DiffLine[]
  id: number
}

type FoldedItem = FoldedBlock | FoldedFold

function foldDiffLines(
  diffLines: DiffLine[],
  threshold: number,
): FoldedItem[] {
  const items: FoldedItem[] = []
  let unchangedRun: DiffLine[] = []
  let foldId = 0

  const flushUnchanged = () => {
    if (unchangedRun.length === 0) return
    if (unchangedRun.length > threshold) {
      // Keep first line visible, fold middle, keep last line visible
      if (unchangedRun.length > 2) {
        items.push({ kind: 'lines', lines: [unchangedRun[0]] })
        items.push({ kind: 'fold', lines: unchangedRun.slice(1, -1), id: foldId++ })
        items.push({ kind: 'lines', lines: [unchangedRun[unchangedRun.length - 1]] })
      } else {
        items.push({ kind: 'lines', lines: unchangedRun })
      }
    } else {
      items.push({ kind: 'lines', lines: unchangedRun })
    }
    unchangedRun = []
  }

  for (const line of diffLines) {
    if (line.type === 'unchanged') {
      unchangedRun.push(line)
    } else {
      flushUnchanged()
      // Push changed line individually
      const last = items[items.length - 1]
      if (last?.kind === 'lines' && last.lines[last.lines.length - 1]?.type !== 'unchanged') {
        last.lines.push(line)
      } else {
        items.push({ kind: 'lines', lines: [line] })
      }
    }
  }
  flushUnchanged()

  return items
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const diffViewerStyles = css`
  @layer components {
    @scope (.ui-diff-viewer) {
      :scope {
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(18% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow: hidden;
        font-family: var(--font-mono, ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        tab-size: 2;
      }

      /* ── Titles ─────────────────────────────────────────── */

      .ui-diff-viewer__titles {
        display: flex;
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        background: var(--bg-elevated, oklch(22% 0.015 270));
      }

      .ui-diff-viewer__title {
        flex: 1;
        padding-inline: var(--space-md, 1rem);
        padding-block: var(--space-xs, 0.25rem);
        font-weight: 500;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-diff-viewer__title + .ui-diff-viewer__title {
        border-inline-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      /* ── Side-by-side container ─────────────────────────── */

      .ui-diff-viewer__side-by-side {
        display: flex;
      }

      .ui-diff-viewer__pane {
        flex: 1;
        min-inline-size: 0;
        overflow-x: auto;
      }

      .ui-diff-viewer__pane + .ui-diff-viewer__pane {
        border-inline-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      /* ── Unified body ───────────────────────────────────── */

      .ui-diff-viewer__unified {
        overflow-x: auto;
      }

      /* ── Line ───────────────────────────────────────────── */

      .ui-diff-viewer__line {
        display: flex;
        min-block-size: 1.6em;
      }

      .ui-diff-viewer__line--added {
        background: oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.1);
      }

      .ui-diff-viewer__line--removed {
        background: oklch(from var(--status-critical, oklch(65% 0.22 25)) l c h / 0.1);
      }

      .ui-diff-viewer__line--unchanged {
        background: transparent;
      }

      .ui-diff-viewer__line-number {
        display: inline-block;
        min-inline-size: 3ch;
        text-align: end;
        padding-inline: var(--space-xs, 0.25rem);
        color: var(--text-tertiary, oklch(45% 0 0));
        opacity: 0.5;
        user-select: none;
        flex-shrink: 0;
      }

      .ui-diff-viewer__prefix {
        display: inline-block;
        inline-size: 2ch;
        text-align: center;
        flex-shrink: 0;
        user-select: none;
        font-weight: 600;
      }

      .ui-diff-viewer__line--added .ui-diff-viewer__prefix {
        color: var(--status-ok, oklch(72% 0.19 155));
      }

      .ui-diff-viewer__line--removed .ui-diff-viewer__prefix {
        color: var(--status-critical, oklch(65% 0.22 25));
      }

      .ui-diff-viewer__content {
        flex: 1;
        min-inline-size: 0;
        white-space: pre;
        padding-inline-end: var(--space-md, 1rem);
      }

      /* ── Fold divider ───────────────────────────────────── */

      .ui-diff-viewer__fold {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-block: var(--space-2xs, 0.125rem);
        background: var(--bg-elevated, oklch(22% 0.015 270));
        border-block: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: var(--text-xs, 0.75rem);
        font-family: var(--font-sans, system-ui, sans-serif);
        cursor: pointer;
        user-select: none;
        transition: background 0.15s ease;
      }

      .ui-diff-viewer__fold:hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-diff-viewer__fold:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: -2px;
      }

      /* ── Forced colors ──────────────────────────────────── */

      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        .ui-diff-viewer__line--added {
          background: transparent;
          border-inline-start: 3px solid LinkText;
        }
        .ui-diff-viewer__line--removed {
          background: transparent;
          border-inline-start: 3px solid ButtonText;
          text-decoration: line-through;
        }
        .ui-diff-viewer__fold {
          border: 1px solid ButtonText;
        }
      }
    }
  }
`

// ─── Subcomponents ──────────────────────────────────────────────────────────

function DiffLine({
  line,
  showLineNumbers,
  mode,
}: {
  line: DiffLine
  showLineNumbers: boolean
  mode: 'unified' | 'side-by-side'
}) {
  const prefix =
    line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '

  return (
    <div className={`ui-diff-viewer__line ui-diff-viewer__line--${line.type}`}>
      {showLineNumbers && mode === 'unified' && (
        <>
          <span className="ui-diff-viewer__line-number" aria-hidden="true">
            {line.oldLineNum ?? ''}
          </span>
          <span className="ui-diff-viewer__line-number" aria-hidden="true">
            {line.newLineNum ?? ''}
          </span>
        </>
      )}
      {showLineNumbers && mode === 'side-by-side' && (
        <span className="ui-diff-viewer__line-number" aria-hidden="true">
          {line.oldLineNum ?? line.newLineNum ?? ''}
        </span>
      )}
      {mode === 'unified' && (
        <span className="ui-diff-viewer__prefix" aria-hidden="true">
          {prefix}
        </span>
      )}
      <span className="ui-diff-viewer__content">{line.value}</span>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DiffViewer({
  oldValue,
  newValue,
  oldTitle,
  newTitle,
  mode = 'unified',
  showLineNumbers = true,
  foldUnchanged = true,
  foldThreshold = 3,
  language,
  motion: motionProp,
  className,
  ...rest
}: DiffViewerProps) {
  useStyles('diff-viewer', diffViewerStyles)
  const motionLevel = useMotionLevel(motionProp)

  const diffLines = useMemo(
    () => computeDiff(oldValue, newValue),
    [oldValue, newValue],
  )

  const foldedItems = useMemo(() => {
    if (!foldUnchanged) {
      return [{ kind: 'lines' as const, lines: diffLines }]
    }
    return foldDiffLines(diffLines, foldThreshold)
  }, [diffLines, foldUnchanged, foldThreshold])

  const [expandedFolds, setExpandedFolds] = useState<Set<number>>(new Set())

  const toggleFold = (id: number) => {
    setExpandedFolds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const hasTitles = Boolean(oldTitle || newTitle)

  const renderUnified = () => (
    <div className="ui-diff-viewer__unified">
      {foldedItems.map((item, idx) => {
        if (item.kind === 'fold' && !expandedFolds.has(item.id)) {
          return (
            <div
              key={`fold-${item.id}`}
              className="ui-diff-viewer__fold"
              role="button"
              tabIndex={0}
              onClick={() => toggleFold(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleFold(item.id)
                }
              }}
            >
              {item.lines.length} unchanged line{item.lines.length !== 1 ? 's' : ''}
            </div>
          )
        }

        const lines = item.kind === 'fold' ? item.lines : item.lines
        return (
          <div key={idx}>
            {lines.map((line, lineIdx) => (
              <DiffLine
                key={lineIdx}
                line={line}
                showLineNumbers={showLineNumbers}
                mode="unified"
              />
            ))}
          </div>
        )
      })}
    </div>
  )

  const renderSideBySide = () => {
    const oldLines = diffLines.filter((l) => l.type !== 'added')
    const newLines = diffLines.filter((l) => l.type !== 'removed')

    return (
      <div className="ui-diff-viewer__side-by-side">
        <div className="ui-diff-viewer__pane ui-diff-viewer__pane--old">
          {oldLines.map((line, i) => (
            <DiffLine key={i} line={line} showLineNumbers={showLineNumbers} mode="side-by-side" />
          ))}
        </div>
        <div className="ui-diff-viewer__pane ui-diff-viewer__pane--new">
          {newLines.map((line, i) => (
            <DiffLine key={i} line={line} showLineNumbers={showLineNumbers} mode="side-by-side" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('ui-diff-viewer', className)}
      data-mode={mode}
      data-motion={motionLevel}
      {...rest}
    >
      {hasTitles && (
        <div className="ui-diff-viewer__titles">
          {oldTitle && <div className="ui-diff-viewer__title">{oldTitle}</div>}
          {newTitle && <div className="ui-diff-viewer__title">{newTitle}</div>}
        </div>
      )}

      {mode === 'unified' ? renderUnified() : renderSideBySide()}
    </div>
  )
}

DiffViewer.displayName = 'DiffViewer'
