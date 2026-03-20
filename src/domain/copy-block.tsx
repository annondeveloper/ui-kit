'use client'

import {
  useState,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export type CopyBlockLanguage =
  | 'javascript'
  | 'typescript'
  | 'css'
  | 'json'
  | 'bash'
  | 'html'
  | 'text'

export interface CopyBlockProps extends HTMLAttributes<HTMLDivElement> {
  code: string
  language?: CopyBlockLanguage
  showLineNumbers?: boolean
  highlight?: number[]
  maxHeight?: string
  title?: string
  motion?: 0 | 1 | 2 | 3
}

// ─── Tokenizer ──────────────────────────────────────────────────────────────

interface Token {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'plain'
  value: string
}

const JS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'class',
  'extends', 'import', 'export', 'from', 'default', 'typeof', 'instanceof',
  'in', 'of', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'yield',
  'true', 'false', 'null', 'undefined', 'void', 'delete', 'type', 'interface',
  'enum', 'implements', 'abstract', 'static', 'readonly', 'as', 'is',
])

function tokenizeJS(line: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < line.length) {
    // Single-line comment
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ type: 'comment', value: line.slice(i) })
      break
    }

    // Block comment start (simplistic — treat rest of line as comment)
    if (line[i] === '/' && line[i + 1] === '*') {
      const end = line.indexOf('*/', i + 2)
      if (end !== -1) {
        tokens.push({ type: 'comment', value: line.slice(i, end + 2) })
        i = end + 2
        continue
      }
      tokens.push({ type: 'comment', value: line.slice(i) })
      break
    }

    // Strings
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i]
      let j = i + 1
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++ // skip escaped char
        j++
      }
      tokens.push({ type: 'string', value: line.slice(i, j + 1) })
      i = j + 1
      continue
    }

    // Numbers
    if (/\d/.test(line[i]) && (i === 0 || !/\w/.test(line[i - 1]))) {
      let j = i
      while (j < line.length && /[\d.]/.test(line[j])) j++
      tokens.push({ type: 'number', value: line.slice(i, j) })
      i = j
      continue
    }

    // Words (potential keywords)
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i
      while (j < line.length && /[\w$]/.test(line[j])) j++
      const word = line.slice(i, j)
      tokens.push({
        type: JS_KEYWORDS.has(word) ? 'keyword' : 'plain',
        value: word,
      })
      i = j
      continue
    }

    // Other characters
    let j = i
    while (
      j < line.length &&
      !/[a-zA-Z_$\d"'`/]/.test(line[j])
    ) {
      j++
    }
    if (j === i) j = i + 1
    tokens.push({ type: 'plain', value: line.slice(i, j) })
    i = j
  }

  return tokens
}

function tokenizeJSON(line: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < line.length) {
    // String (could be key or value)
    if (line[i] === '"') {
      let j = i + 1
      while (j < line.length && line[j] !== '"') {
        if (line[j] === '\\') j++
        j++
      }
      const str = line.slice(i, j + 1)
      // Check if this is a key (followed by colon)
      const afterStr = line.slice(j + 1).trimStart()
      if (afterStr.startsWith(':')) {
        tokens.push({ type: 'keyword', value: str })
      } else {
        tokens.push({ type: 'string', value: str })
      }
      i = j + 1
      continue
    }

    // Numbers
    if (/[\d-]/.test(line[i]) && (i === 0 || !/\w/.test(line[i - 1]))) {
      let j = i
      if (line[j] === '-') j++
      while (j < line.length && /[\d.eE+-]/.test(line[j])) j++
      if (j > i && (line[i] !== '-' || j > i + 1)) {
        tokens.push({ type: 'number', value: line.slice(i, j) })
        i = j
        continue
      }
    }

    // Booleans / null
    if (/[a-z]/.test(line[i])) {
      let j = i
      while (j < line.length && /[a-z]/.test(line[j])) j++
      const word = line.slice(i, j)
      if (word === 'true' || word === 'false' || word === 'null') {
        tokens.push({ type: 'keyword', value: word })
      } else {
        tokens.push({ type: 'plain', value: word })
      }
      i = j
      continue
    }

    // Other
    let j = i + 1
    while (j < line.length && !/["a-z\d-]/i.test(line[j])) j++
    tokens.push({ type: 'plain', value: line.slice(i, j) })
    i = j
  }

  return tokens
}

function tokenizeCSS(line: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < line.length) {
    // Comments
    if (line[i] === '/' && line[i + 1] === '*') {
      const end = line.indexOf('*/', i + 2)
      if (end !== -1) {
        tokens.push({ type: 'comment', value: line.slice(i, end + 2) })
        i = end + 2
        continue
      }
      tokens.push({ type: 'comment', value: line.slice(i) })
      break
    }

    // Strings
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i]
      let j = i + 1
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++
        j++
      }
      tokens.push({ type: 'string', value: line.slice(i, j + 1) })
      i = j + 1
      continue
    }

    // Properties (word followed by colon)
    if (/[a-zA-Z-]/.test(line[i])) {
      let j = i
      while (j < line.length && /[a-zA-Z0-9-]/.test(line[j])) j++
      const word = line.slice(i, j)
      const afterWord = line.slice(j).trimStart()
      if (afterWord.startsWith(':')) {
        tokens.push({ type: 'keyword', value: word })
      } else {
        tokens.push({ type: 'plain', value: word })
      }
      i = j
      continue
    }

    // Numbers
    if (/\d/.test(line[i])) {
      let j = i
      while (j < line.length && /[\d.%a-z]/.test(line[j])) j++
      tokens.push({ type: 'number', value: line.slice(i, j) })
      i = j
      continue
    }

    let j = i + 1
    while (j < line.length && !/[a-zA-Z\d"'/\-]/.test(line[j])) j++
    tokens.push({ type: 'plain', value: line.slice(i, j) })
    i = j
  }

  return tokens
}

function tokenizeBash(line: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < line.length) {
    // Comments
    if (line[i] === '#') {
      tokens.push({ type: 'comment', value: line.slice(i) })
      break
    }

    // Strings
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i]
      let j = i + 1
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++
        j++
      }
      tokens.push({ type: 'string', value: line.slice(i, j + 1) })
      i = j + 1
      continue
    }

    // Flags (--flag or -f)
    if (line[i] === '-' && i > 0 && /\s/.test(line[i - 1])) {
      let j = i
      while (j < line.length && /[a-zA-Z0-9-]/.test(line[j])) j++
      tokens.push({ type: 'keyword', value: line.slice(i, j) })
      i = j
      continue
    }

    // Words
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i
      while (j < line.length && /[\w.-]/.test(line[j])) j++
      tokens.push({ type: 'plain', value: line.slice(i, j) })
      i = j
      continue
    }

    let j = i + 1
    while (j < line.length && !/[a-zA-Z_"'#-]/.test(line[j])) j++
    tokens.push({ type: 'plain', value: line.slice(i, j) })
    i = j
  }

  return tokens
}

function tokenizeLine(line: string, language: CopyBlockLanguage): Token[] {
  switch (language) {
    case 'javascript':
    case 'typescript':
    case 'html':
      return tokenizeJS(line)
    case 'json':
      return tokenizeJSON(line)
    case 'css':
      return tokenizeCSS(line)
    case 'bash':
      return tokenizeBash(line)
    case 'text':
    default:
      return [{ type: 'plain', value: line }]
  }
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const copyBlockStyles = css`
  @layer components {
    @scope (.ui-copy-block) {
      :scope {
        position: relative;
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

      /* ── Header ─────────────────────────────────────────── */

      .ui-copy-block__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-inline: var(--space-md, 1rem);
        padding-block: var(--space-xs, 0.25rem);
        background: var(--bg-elevated, oklch(22% 0.015 270));
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      .ui-copy-block__title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .ui-copy-block__lang-badge {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        padding-inline: var(--space-xs, 0.25rem);
        padding-block: var(--space-2xs, 0.125rem);
        background: oklch(100% 0 0 / 0.05);
        border-radius: var(--radius-sm, 0.25rem);
      }

      /* ── Body (scrollable area) ─────────────────────────── */

      .ui-copy-block__body {
        overflow: auto;
        position: relative;
      }

      /* ── Copy button ────────────────────────────────────── */

      .ui-copy-block__copy-btn {
        position: absolute;
        inset-block-start: var(--space-xs, 0.25rem);
        inset-inline-end: var(--space-xs, 0.25rem);
        z-index: 2;
        display: inline-flex;
        align-items: center;
        gap: var(--space-2xs, 0.125rem);
        padding-inline: var(--space-sm, 0.5rem);
        padding-block: var(--space-2xs, 0.125rem);
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-sm, 0.25rem);
        background: var(--bg-elevated, oklch(22% 0.015 270));
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: var(--text-xs, 0.75rem);
        font-family: inherit;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.15s ease;
      }

      :scope:hover .ui-copy-block__copy-btn,
      .ui-copy-block__copy-btn:focus-visible {
        opacity: 1;
      }

      .ui-copy-block__copy-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-copy-block__copy-btn[data-copied] {
        color: var(--status-ok, oklch(72% 0.19 155));
        opacity: 1;
      }

      /* ── Code area ──────────────────────────────────────── */

      .ui-copy-block__pre {
        margin: 0;
        padding: 0;
        overflow: visible;
        background: transparent;
      }

      .ui-copy-block__code {
        display: table;
        min-inline-size: 100%;
      }

      /* ── Line ───────────────────────────────────────────── */

      .ui-copy-block__line {
        display: table-row;
      }

      .ui-copy-block__line[data-highlighted] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
      }

      .ui-copy-block__line-number {
        display: table-cell;
        text-align: end;
        padding-inline-end: var(--space-md, 1rem);
        padding-inline-start: var(--space-md, 1rem);
        color: var(--text-tertiary, oklch(45% 0 0));
        user-select: none;
        white-space: nowrap;
        vertical-align: top;
        opacity: 0.5;
      }

      .ui-copy-block__line-content {
        display: table-cell;
        padding-inline-end: var(--space-md, 1rem);
        white-space: pre;
      }

      /* ── Tokens ─────────────────────────────────────────── */

      .ui-copy-block__token--keyword {
        color: var(--brand, oklch(65% 0.2 270));
      }

      .ui-copy-block__token--string {
        color: var(--status-ok, oklch(72% 0.19 155));
      }

      .ui-copy-block__token--comment {
        color: var(--text-tertiary, oklch(50% 0 0));
        font-style: italic;
      }

      .ui-copy-block__token--number {
        color: var(--status-warning, oklch(78% 0.15 80));
      }

      /* ── Forced colors ──────────────────────────────────── */

      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        .ui-copy-block__copy-btn {
          border: 1px solid ButtonText;
          background: Canvas;
          color: ButtonText;
          opacity: 1;
        }
        .ui-copy-block__copy-btn:focus-visible {
          outline: 2px solid Highlight;
        }
        .ui-copy-block__line[data-highlighted] {
          background: Highlight;
          color: HighlightText;
        }
        .ui-copy-block__token--keyword,
        .ui-copy-block__token--string,
        .ui-copy-block__token--comment,
        .ui-copy-block__token--number {
          color: inherit;
        }
      }

      /* ── Print ──────────────────────────────────────────── */

      @media print {
        .ui-copy-block__copy-btn {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function CopyBlock({
  code,
  language = 'text',
  showLineNumbers = true,
  highlight,
  maxHeight,
  title,
  motion: motionProp,
  className,
  ...rest
}: CopyBlockProps) {
  useStyles('copy-block', copyBlockStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [copied, setCopied] = useState(false)

  const lines = code.split('\n')
  const highlightSet = highlight ? new Set(highlight) : null

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Silently fail if clipboard not available
    }
  }, [code])

  const renderTokens = (line: string): ReactNode[] => {
    const tokens = tokenizeLine(line, language)
    return tokens.map((token, i) => {
      if (token.type === 'plain') {
        return <span key={i}>{token.value}</span>
      }
      return (
        <span key={i} className={`ui-copy-block__token--${token.type}`}>
          {token.value}
        </span>
      )
    })
  }

  return (
    <div
      className={cn('ui-copy-block', className)}
      data-motion={motionLevel}
      {...rest}
    >
      {title && (
        <div className="ui-copy-block__header">
          <span className="ui-copy-block__title">{title}</span>
          {language !== 'text' && (
            <span className="ui-copy-block__lang-badge">{language}</span>
          )}
        </div>
      )}

      <div
        className="ui-copy-block__body"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <button
          className="ui-copy-block__copy-btn"
          onClick={handleCopy}
          aria-label="Copy code"
          {...(copied ? { 'data-copied': '' } : {})}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>

        <pre className="ui-copy-block__pre">
          <code className="ui-copy-block__code">
            {lines.map((line, idx) => {
              const lineNum = idx + 1
              const isHighlighted = highlightSet?.has(lineNum) ?? false
              return (
                <span
                  key={idx}
                  className="ui-copy-block__line"
                  {...(isHighlighted ? { 'data-highlighted': '' } : {})}
                >
                  {showLineNumbers && (
                    <span className="ui-copy-block__line-number" aria-hidden="true">
                      {lineNum}
                    </span>
                  )}
                  <span className="ui-copy-block__line-content">
                    {renderTokens(line)}
                    {'\n'}
                  </span>
                </span>
              )
            })}
          </code>
        </pre>
      </div>
    </div>
  )
}

CopyBlock.displayName = 'CopyBlock'
