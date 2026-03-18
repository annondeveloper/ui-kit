'use client'

import type React from 'react'
import { useMemo, useState } from 'react'
import { cn } from '../utils'

export interface DiffViewerProps {
  /** The original text. */
  oldValue: string
  /** The modified text. */
  newValue: string
  /** Display mode. */
  mode?: 'inline' | 'side-by-side'
  /** Language hint for potential styling. */
  language?: string
  /** Show line numbers in the gutter. */
  showLineNumbers?: boolean
  className?: string
}

type LineType = 'added' | 'removed' | 'unchanged'

interface DiffLine {
  type: LineType
  content: string
  oldLineNo?: number
  newLineNo?: number
}

const MAX_LINES = 2000

/** Simple line-by-line diff using longest common subsequence. */
function computeDiff(oldLines: string[], newLines: string[]): DiffLine[] {
  // Fall back to simple line-by-line comparison for large inputs
  if (oldLines.length > MAX_LINES || newLines.length > MAX_LINES) {
    const result: DiffLine[] = oldLines.map((l, i) => ({
      type: (l === (newLines[i] ?? '') ? 'unchanged' : 'removed') as LineType,
      content: l,
      oldLineNo: i + 1,
      newLineNo: i + 1,
    }))
    for (let i = oldLines.length; i < newLines.length; i++) {
      result.push({
        type: 'added' as LineType,
        content: newLines[i],
        oldLineNo: undefined,
        newLineNo: i + 1,
      })
    }
    return result
  }

  // Build LCS table
  const m = oldLines.length
  const n = newLines.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))

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
      result.push({ type: 'unchanged', content: oldLines[i - 1], oldLineNo: i, newLineNo: j })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: 'added', content: newLines[j - 1], newLineNo: j })
      j--
    } else {
      result.push({ type: 'removed', content: oldLines[i - 1], oldLineNo: i })
      i--
    }
  }

  return result.reverse()
}

const TYPE_BG: Record<LineType, string> = {
  added: 'bg-[hsl(var(--status-ok))]/10',
  removed: 'bg-[hsl(var(--status-critical))]/10',
  unchanged: '',
}

const TYPE_PREFIX: Record<LineType, string> = {
  added: '+',
  removed: '-',
  unchanged: ' ',
}

const TYPE_PREFIX_COLOR: Record<LineType, string> = {
  added: 'text-[hsl(var(--status-ok))]',
  removed: 'text-[hsl(var(--status-critical))]',
  unchanged: 'text-[hsl(var(--text-tertiary))]',
}

/**
 * @description A diff viewer showing line-by-line differences between two text values.
 * Supports inline and side-by-side modes, collapsible unchanged sections, and line numbers.
 */
export function DiffViewer({
  oldValue,
  newValue,
  mode = 'inline',
  language,
  showLineNumbers = true,
  className,
}: DiffViewerProps): React.JSX.Element {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())

  const diffLines = useMemo(() => {
    const oldLines = oldValue.split('\n')
    const newLines = newValue.split('\n')
    return computeDiff(oldLines, newLines)
  }, [oldValue, newValue])

  // Group unchanged sections for collapsing
  const sections = useMemo(() => {
    const groups: { type: 'changes' | 'unchanged'; lines: DiffLine[]; startIdx: number }[] = []
    let current: DiffLine[] = []
    let currentType: 'changes' | 'unchanged' | null = null
    let startIdx = 0

    for (let i = 0; i < diffLines.length; i++) {
      const lineType = diffLines[i].type === 'unchanged' ? 'unchanged' : 'changes'
      if (lineType !== currentType) {
        if (current.length > 0 && currentType !== null) {
          groups.push({ type: currentType, lines: current, startIdx })
        }
        current = [diffLines[i]]
        currentType = lineType
        startIdx = i
      } else {
        current.push(diffLines[i])
      }
    }
    if (current.length > 0 && currentType !== null) {
      groups.push({ type: currentType, lines: current, startIdx })
    }
    return groups
  }, [diffLines])

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }

  if (mode === 'side-by-side') {
    return <SideBySide diffLines={diffLines} showLineNumbers={showLineNumbers} language={language} className={className} />
  }

  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))]',
        'font-mono text-xs leading-5',
        className,
      )}
      data-language={language}
    >
      {sections.map((section, sIdx) => {
        // Collapse unchanged sections longer than 6 lines
        if (section.type === 'unchanged' && section.lines.length > 6 && !expandedSections.has(sIdx)) {
          const topContext = section.lines.slice(0, 3)
          const bottomContext = section.lines.slice(-3)
          const hiddenCount = section.lines.length - 6

          return (
            <div key={sIdx}>
              {topContext.map((line, i) => (
                <InlineLine key={`${sIdx}-t-${i}`} line={line} showLineNumbers={showLineNumbers} />
              ))}
              <button
                type="button"
                onClick={() => toggleSection(sIdx)}
                className={cn(
                  'w-full px-3 py-1 text-center text-[10px]',
                  'text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-overlay))]/50',
                  'hover:bg-[hsl(var(--bg-overlay))] cursor-pointer transition-colors duration-100',
                )}
              >
                ... {hiddenCount} unchanged {hiddenCount === 1 ? 'line' : 'lines'} ...
              </button>
              {bottomContext.map((line, i) => (
                <InlineLine key={`${sIdx}-b-${i}`} line={line} showLineNumbers={showLineNumbers} />
              ))}
            </div>
          )
        }

        return (
          <div key={sIdx}>
            {section.type === 'unchanged' && expandedSections.has(sIdx) && (
              <button
                type="button"
                onClick={() => toggleSection(sIdx)}
                className={cn(
                  'w-full px-3 py-0.5 text-center text-[10px]',
                  'text-[hsl(var(--text-tertiary))] bg-[hsl(var(--bg-overlay))]/30',
                  'hover:bg-[hsl(var(--bg-overlay))] cursor-pointer transition-colors duration-100',
                )}
              >
                collapse {section.lines.length} unchanged lines
              </button>
            )}
            {section.lines.map((line, i) => (
              <InlineLine key={`${sIdx}-${i}`} line={line} showLineNumbers={showLineNumbers} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

function InlineLine({ line, showLineNumbers }: { line: DiffLine; showLineNumbers: boolean }): React.JSX.Element {
  return (
    <div className={cn('flex', TYPE_BG[line.type])}>
      {showLineNumbers && (
        <span className="shrink-0 w-9 px-1.5 text-right select-none text-[hsl(var(--text-tertiary))]/50 tabular-nums">
          {line.oldLineNo ?? ''}
        </span>
      )}
      {showLineNumbers && (
        <span className="shrink-0 w-9 px-1.5 text-right select-none text-[hsl(var(--text-tertiary))]/50 tabular-nums">
          {line.newLineNo ?? ''}
        </span>
      )}
      <span className={cn('shrink-0 w-4 text-center select-none font-bold', TYPE_PREFIX_COLOR[line.type])}>
        {TYPE_PREFIX[line.type]}
      </span>
      <span className="flex-1 px-2 whitespace-pre text-[hsl(var(--text-primary))]">
        {line.content}
      </span>
    </div>
  )
}

function SideBySide({
  diffLines,
  showLineNumbers,
  language,
  className,
}: {
  diffLines: DiffLine[]
  showLineNumbers: boolean
  language?: string
  className?: string
}): React.JSX.Element {
  // Build paired rows for side-by-side
  const pairs: { left?: DiffLine; right?: DiffLine }[] = []
  let i = 0
  while (i < diffLines.length) {
    const line = diffLines[i]
    if (line.type === 'unchanged') {
      pairs.push({ left: line, right: line })
      i++
    } else if (line.type === 'removed') {
      // Look for a matching added line
      if (i + 1 < diffLines.length && diffLines[i + 1].type === 'added') {
        pairs.push({ left: line, right: diffLines[i + 1] })
        i += 2
      } else {
        pairs.push({ left: line })
        i++
      }
    } else {
      pairs.push({ right: line })
      i++
    }
  }

  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))]',
        'font-mono text-xs leading-5',
        className,
      )}
      data-language={language}
    >
      <div className="grid grid-cols-2 divide-x divide-[hsl(var(--border-subtle))]">
        {/* Left: old */}
        <div>
          {pairs.map((pair, idx) => (
            <div
              key={`l-${idx}`}
              className={cn('flex', pair.left ? TYPE_BG[pair.left.type] : '')}
            >
              {showLineNumbers && (
                <span className="shrink-0 w-9 px-1.5 text-right select-none text-[hsl(var(--text-tertiary))]/50 tabular-nums">
                  {pair.left?.oldLineNo ?? ''}
                </span>
              )}
              <span className="flex-1 px-2 whitespace-pre text-[hsl(var(--text-primary))]">
                {pair.left?.content ?? ''}
              </span>
            </div>
          ))}
        </div>
        {/* Right: new */}
        <div>
          {pairs.map((pair, idx) => (
            <div
              key={`r-${idx}`}
              className={cn('flex', pair.right ? TYPE_BG[pair.right.type] : '')}
            >
              {showLineNumbers && (
                <span className="shrink-0 w-9 px-1.5 text-right select-none text-[hsl(var(--text-tertiary))]/50 tabular-nums">
                  {pair.right?.newLineNo ?? ''}
                </span>
              )}
              <span className="flex-1 px-2 whitespace-pre text-[hsl(var(--text-primary))]">
                {pair.right?.content ?? ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
