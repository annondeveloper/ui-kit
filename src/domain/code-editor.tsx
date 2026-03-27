'use client'

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type HTMLAttributes,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export type CodeEditorLanguage =
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'html'
  | 'css'
  | 'python'
  | 'bash'
  | 'sql'
  | 'plain'

export interface CodeEditorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  language?: CodeEditorLanguage
  readOnly?: boolean
  showLineNumbers?: boolean
  lineNumberStart?: number
  placeholder?: string
  minHeight?: string | number
  maxHeight?: string | number
  wordWrap?: boolean
  tabSize?: number
  highlightActiveLine?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Tokenizer ──────────────────────────────────────────────────────────────

interface Token {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'operator' | 'plain'
  value: string
}

const KEYWORDS: Record<string, Set<string>> = {
  javascript: new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'class',
    'extends', 'import', 'export', 'from', 'default', 'typeof', 'instanceof',
    'in', 'of', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'yield',
    'true', 'false', 'null', 'undefined', 'void', 'delete',
  ]),
  typescript: new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'class',
    'extends', 'import', 'export', 'from', 'default', 'typeof', 'instanceof',
    'in', 'of', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'yield',
    'true', 'false', 'null', 'undefined', 'void', 'delete', 'type', 'interface',
    'enum', 'implements', 'abstract', 'static', 'readonly', 'as', 'is', 'keyof',
    'infer', 'extends', 'satisfies', 'declare', 'namespace', 'module',
  ]),
  python: new Set([
    'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'break',
    'continue', 'import', 'from', 'as', 'try', 'except', 'finally', 'raise',
    'with', 'yield', 'lambda', 'pass', 'True', 'False', 'None', 'and', 'or',
    'not', 'in', 'is', 'del', 'global', 'nonlocal', 'assert', 'async', 'await',
  ]),
  sql: new Set([
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
    'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'INDEX', 'JOIN', 'LEFT',
    'RIGHT', 'INNER', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'NULL', 'IS',
    'IN', 'BETWEEN', 'LIKE', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT',
    'OFFSET', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
    'select', 'from', 'where', 'insert', 'into', 'values', 'update', 'set',
    'delete', 'create', 'table', 'drop', 'alter', 'join', 'left', 'right',
    'inner', 'outer', 'on', 'and', 'or', 'not', 'null', 'is', 'in',
    'between', 'like', 'order', 'by', 'group', 'having', 'limit', 'offset',
    'as', 'distinct', 'count', 'sum', 'avg', 'max', 'min',
  ]),
  html: new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'class',
  ]),
  css: new Set([]),
  bash: new Set([
    'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done',
    'case', 'esac', 'function', 'return', 'exit', 'echo', 'export',
    'source', 'local', 'readonly', 'declare', 'set', 'unset',
  ]),
}

function tokenizeLine(line: string, language: CodeEditorLanguage): Token[] {
  if (language === 'plain') return [{ type: 'plain', value: line }]

  const tokens: Token[] = []
  const kw = KEYWORDS[language] || new Set()
  let i = 0

  while (i < line.length) {
    // Comments
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ type: 'comment', value: line.slice(i) })
      break
    }
    if (line[i] === '#' && (language === 'python' || language === 'bash')) {
      tokens.push({ type: 'comment', value: line.slice(i) })
      break
    }
    if (line[i] === '-' && line[i + 1] === '-' && language === 'sql') {
      tokens.push({ type: 'comment', value: line.slice(i) })
      break
    }
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
        if (line[j] === '\\') j++
        j++
      }
      tokens.push({ type: 'string', value: line.slice(i, j + 1) })
      i = j + 1
      continue
    }

    // Numbers
    if (/\d/.test(line[i]) && (i === 0 || !/\w/.test(line[i - 1]))) {
      let j = i
      while (j < line.length && /[\d.xXa-fA-FeE_]/.test(line[j])) j++
      tokens.push({ type: 'number', value: line.slice(i, j) })
      i = j
      continue
    }

    // Words
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i
      while (j < line.length && /[\w$]/.test(line[j])) j++
      const word = line.slice(i, j)
      tokens.push({
        type: kw.has(word) ? 'keyword' : 'plain',
        value: word,
      })
      i = j
      continue
    }

    // Operators
    if (/[+\-*/%=<>!&|^~?:]/.test(line[i])) {
      let j = i
      while (j < line.length && /[+\-*/%=<>!&|^~?:]/.test(line[j])) j++
      tokens.push({ type: 'operator', value: line.slice(i, j) })
      i = j
      continue
    }

    // Other
    let j = i + 1
    while (
      j < line.length &&
      !/[a-zA-Z_$\d"'`/#+\-*/%=<>!&|^~?:]/.test(line[j])
    ) {
      j++
    }
    tokens.push({ type: 'plain', value: line.slice(i, j) })
    i = j
  }

  return tokens
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const codeEditorStyles = css`
  @layer components {
    @scope (.ui-code-editor) {
      :scope {
        position: relative;
        display: flex;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(18% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow: hidden;
        font-family: var(--font-mono, ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
      }

      :scope:focus-within {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 1px var(--brand, oklch(65% 0.2 270));
      }

      /* ── Line numbers gutter ───────────────────────────── */

      .ui-code-editor__gutter {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        padding-block: var(--space-md, 1rem);
        padding-inline: var(--space-sm, 0.5rem) var(--space-md, 1rem);
        background: var(--bg-elevated, oklch(15% 0.01 270));
        border-inline-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        color: var(--text-tertiary, oklch(45% 0 0));
        user-select: none;
        flex-shrink: 0;
        overflow: hidden;
      }

      .ui-code-editor__line-number {
        block-size: 1.6em;
        display: flex;
        align-items: center;
        opacity: 0.6;
      }

      .ui-code-editor__line-number[data-active] {
        opacity: 1;
        color: var(--text-secondary, oklch(70% 0 0));
      }

      /* ── Editor area ───────────────────────────────────── */

      .ui-code-editor__editor {
        position: relative;
        flex: 1;
        min-inline-size: 0;
        overflow: auto;
      }

      .ui-code-editor__textarea {
        position: absolute;
        inset: 0;
        inline-size: 100%;
        block-size: 100%;
        padding: var(--space-md, 1rem);
        margin: 0;
        border: none;
        background: transparent;
        color: transparent;
        caret-color: var(--text-primary, oklch(90% 0 0));
        font: inherit;
        line-height: inherit;
        resize: none;
        outline: none;
        overflow: auto;
        white-space: pre;
        z-index: 1;
      }

      .ui-code-editor__textarea[data-word-wrap] {
        white-space: pre-wrap;
        overflow-wrap: break-word;
      }

      .ui-code-editor__textarea::placeholder {
        color: var(--text-tertiary, oklch(45% 0 0));
      }

      .ui-code-editor__textarea::selection {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
      }

      /* ── Highlighted pre layer ─────────────────────────── */

      .ui-code-editor__pre {
        margin: 0;
        padding: var(--space-md, 1rem);
        min-block-size: 100%;
        white-space: pre;
        pointer-events: none;
        overflow: hidden;
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-code-editor__pre[data-word-wrap] {
        white-space: pre-wrap;
        overflow-wrap: break-word;
      }

      .ui-code-editor__line {
        display: block;
        block-size: 1.6em;
        position: relative;
      }

      .ui-code-editor__line[data-active] {
        background: oklch(100% 0 0 / 0.04);
        border-radius: var(--radius-sm, 0.25rem);
      }

      /* ── Tokens ────────────────────────────────────────── */

      .ui-code-editor__token--keyword {
        color: var(--brand, oklch(65% 0.2 270));
      }

      .ui-code-editor__token--string {
        color: var(--status-ok, oklch(72% 0.19 155));
      }

      .ui-code-editor__token--comment {
        color: var(--text-tertiary, oklch(50% 0 0));
        font-style: italic;
      }

      .ui-code-editor__token--number {
        color: var(--status-warning, oklch(78% 0.15 80));
      }

      .ui-code-editor__token--operator {
        color: var(--text-secondary, oklch(75% 0.05 270));
      }

      /* ── Active line glow ──────────────────────────────── */

      :scope[data-motion='2'] .ui-code-editor__line[data-active],
      :scope[data-motion='3'] .ui-code-editor__line[data-active] {
        box-shadow: inset 0 0 20px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.03);
      }

      /* ── Forced colors ─────────────────────────────────── */

      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        :scope:focus-within {
          border-color: Highlight;
          box-shadow: none;
        }
        .ui-code-editor__gutter {
          border-inline-end: 1px solid ButtonText;
          background: Canvas;
        }
        .ui-code-editor__textarea {
          caret-color: ButtonText;
        }
        .ui-code-editor__token--keyword,
        .ui-code-editor__token--string,
        .ui-code-editor__token--comment,
        .ui-code-editor__token--number,
        .ui-code-editor__token--operator {
          color: inherit;
        }
        .ui-code-editor__line[data-active] {
          background: Highlight;
          color: HighlightText;
        }
      }

      /* ── Print ──────────────────────────────────────────── */

      @media print {
        :scope {
          background: white;
          color: black;
          border: 1px solid black;
        }
        .ui-code-editor__textarea {
          display: none;
        }
        .ui-code-editor__token--keyword,
        .ui-code-editor__token--string,
        .ui-code-editor__token--comment,
        .ui-code-editor__token--number,
        .ui-code-editor__token--operator {
          color: inherit;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function CodeEditor({
  value: controlledValue,
  defaultValue = '',
  onChange,
  language = 'plain',
  readOnly = false,
  showLineNumbers = true,
  lineNumberStart = 1,
  placeholder,
  minHeight,
  maxHeight,
  wordWrap = false,
  tabSize = 2,
  highlightActiveLine = true,
  motion: motionProp,
  className,
  ...rest
}: CodeEditorProps) {
  useStyles('code-editor', codeEditorStyles)
  const motionLevel = useMotionLevel(motionProp)

  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const code = isControlled ? controlledValue : internalValue
  const [activeLine, setActiveLine] = useState(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)

  // When wordWrap is enabled, line numbers can't align correctly with wrapped lines,
  // so automatically hide them
  const effectiveShowLineNumbers = wordWrap ? false : showLineNumbers

  const lines = code.split('\n')

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    },
    [isControlled, onChange]
  )

  const updateActiveLine = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    const before = ta.value.slice(0, ta.selectionStart)
    const line = before.split('\n').length - 1
    setActiveLine(line)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      const ta = e.currentTarget
      const { selectionStart, selectionEnd, value } = ta

      // Tab inserts spaces (or indents block if multi-line selection)
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        const spaces = ' '.repeat(tabSize)

        if (selectionStart !== selectionEnd) {
          // Check if selection spans multiple lines
          const selectedText = value.slice(selectionStart, selectionEnd)
          if (selectedText.includes('\n')) {
            // Indent entire selected block: prepend spaces to each line
            const lines = selectedText.split('\n')
            const indented = lines.map(line => spaces + line).join('\n')
            const newValue = value.slice(0, selectionStart) + indented + value.slice(selectionEnd)
            ta.value = newValue
            ta.selectionStart = selectionStart
            ta.selectionEnd = selectionStart + indented.length
            if (!isControlled) setInternalValue(newValue)
            onChange?.(newValue)
            return
          }
        }

        // Single cursor or single-line selection: insert spaces at cursor
        const before = value.slice(0, selectionStart)
        const after = value.slice(selectionEnd)
        const newValue = before + spaces + after
        ta.value = newValue
        ta.selectionStart = ta.selectionEnd = selectionStart + tabSize
        if (!isControlled) setInternalValue(newValue)
        onChange?.(newValue)
        return
      }

      // Shift+Tab dedents current line only
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault()
        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
        const lineEnd = value.indexOf('\n', lineStart)
        const actualLineEnd = lineEnd === -1 ? value.length : lineEnd
        const lineText = value.substring(lineStart, actualLineEnd)
        const leadingSpaces = lineText.match(/^ */)?.[0].length ?? 0
        const removeCount = Math.min(tabSize, leadingSpaces)
        if (removeCount > 0) {
          const newValue = value.slice(0, lineStart) + lineText.slice(removeCount) + value.slice(actualLineEnd)
          ta.value = newValue
          ta.selectionStart = ta.selectionEnd = Math.max(lineStart, selectionStart - removeCount)
          if (!isControlled) setInternalValue(newValue)
          onChange?.(newValue)
        }
        return
      }

      // Enter auto-indent
      if (e.key === 'Enter') {
        e.preventDefault()
        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
        const currentLine = value.slice(lineStart, selectionStart)
        const indent = currentLine.match(/^(\s*)/)?.[1] ?? ''
        const before = value.slice(0, selectionStart)
        const after = value.slice(selectionEnd)
        const insertion = '\n' + indent
        const newValue = before + insertion + after
        ta.value = newValue
        ta.selectionStart = ta.selectionEnd = selectionStart + insertion.length
        if (!isControlled) setInternalValue(newValue)
        onChange?.(newValue)
      }
    },
    [tabSize, isControlled, onChange]
  )

  // Sync scroll
  const handleScroll = useCallback(() => {
    const ta = textareaRef.current
    const pre = preRef.current
    if (ta && pre) {
      pre.scrollTop = ta.scrollTop
      pre.scrollLeft = ta.scrollLeft
    }
  }, [])

  // Keep textarea synced when controlled value changes
  useEffect(() => {
    if (isControlled && textareaRef.current) {
      textareaRef.current.value = controlledValue
    }
  }, [controlledValue, isControlled])

  const heightStyle: Record<string, string | number | undefined> = {}
  if (minHeight) heightStyle.minBlockSize = typeof minHeight === 'number' ? `${minHeight}px` : minHeight
  if (maxHeight) heightStyle.maxBlockSize = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight

  const renderTokens = (line: string) => {
    const tokens = tokenizeLine(line, language)
    return tokens.map((token, i) => {
      if (token.type === 'plain') return <span key={i}>{token.value}</span>
      return (
        <span key={i} className={`ui-code-editor__token--${token.type}`}>
          {token.value}
        </span>
      )
    })
  }

  return (
    <div
      className={cn('ui-code-editor', className)}
      data-motion={motionLevel}
      role="group"
      aria-label="Code editor"
      style={heightStyle}
      {...rest}
    >
      {effectiveShowLineNumbers && (
        <div className="ui-code-editor__gutter" aria-hidden="true">
          {lines.map((_, idx) => (
            <span
              key={idx}
              className="ui-code-editor__line-number"
              {...(highlightActiveLine && idx === activeLine ? { 'data-active': '' } : {})}
            >
              {idx + lineNumberStart}
            </span>
          ))}
        </div>
      )}

      <div className="ui-code-editor__editor">
        <textarea
          ref={textareaRef}
          className="ui-code-editor__textarea"
          defaultValue={isControlled ? undefined : defaultValue}
          value={isControlled ? controlledValue : undefined}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          onClick={updateActiveLine}
          onKeyUp={updateActiveLine}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          aria-label="Code input"
          aria-multiline="true"
          role="textbox"
          style={{ tabSize }}
          {...(wordWrap ? { 'data-word-wrap': '' } : {})}
        />
        <pre
          ref={preRef}
          className="ui-code-editor__pre"
          aria-hidden="true"
          {...(wordWrap ? { 'data-word-wrap': '' } : {})}
        >
          {lines.map((line, idx) => (
            <span
              key={idx}
              className="ui-code-editor__line"
              {...(highlightActiveLine && idx === activeLine ? { 'data-active': '' } : {})}
            >
              {renderTokens(line || ' ')}
              {'\n'}
            </span>
          ))}
        </pre>
      </div>
    </div>
  )
}

CodeEditor.displayName = 'CodeEditor'
