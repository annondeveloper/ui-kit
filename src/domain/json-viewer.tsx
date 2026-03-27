'use client'

import {
  useState,
  useCallback,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface JsonViewerProps extends HTMLAttributes<HTMLDivElement> {
  data: unknown
  initialExpandDepth?: number
  collapsed?: boolean
  rootName?: string
  enableClipboard?: boolean
  displayDataTypes?: boolean
  displayObjectSize?: boolean
  theme?: 'dark' | 'light' | 'auto'
  indentWidth?: number
  sortKeys?: boolean
  maxStringLength?: number
  motion?: 0 | 1 | 2 | 3
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

function getSize(value: unknown): number {
  if (Array.isArray(value)) return value.length
  if (value !== null && typeof value === 'object') return Object.keys(value).length
  return 0
}

function copyToClipboard(text: string): void {
  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  } catch {
    // silently fail
  }
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const jsonViewerStyles = css`
  @layer components {
    @scope (.ui-json-viewer) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(18% 0.015 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow: auto;
        font-family: var(--font-mono, ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        padding: var(--space-md, 1rem);
        color: var(--text-primary, oklch(90% 0 0));
      }

      :scope[data-theme='light'] {
        background: var(--bg-surface-light, oklch(97% 0.005 270));
        color: var(--text-primary-light, oklch(20% 0 0));
      }

      /* ── Tree node ─────────────────────────────────────── */

      .ui-json-viewer__node {
        display: flex;
        flex-direction: column;
      }

      .ui-json-viewer__row {
        display: flex;
        align-items: baseline;
        gap: var(--space-2xs, 0.125rem);
        padding-block: 1px;
        border-radius: var(--radius-sm, 0.25rem);
        cursor: default;
      }

      .ui-json-viewer__row:hover {
        background: oklch(100% 0 0 / 0.04);
      }

      .ui-json-viewer__indent {
        display: inline-block;
        flex-shrink: 0;
      }

      /* ── Chevron ───────────────────────────────────────── */

      .ui-json-viewer__chevron {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1em;
        block-size: 1em;
        flex-shrink: 0;
        cursor: pointer;
        color: var(--brand, oklch(65% 0.2 270));
        transition: transform 0.15s ease;
        user-select: none;
        border: none;
        background: none;
        padding: 0;
        font-size: inherit;
        line-height: 1;
      }

      .ui-json-viewer__chevron[data-expanded] {
        transform: rotate(90deg);
      }

      .ui-json-viewer__chevron:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: var(--radius-sm, 0.25rem);
      }

      .ui-json-viewer__chevron-spacer {
        display: inline-block;
        inline-size: 1em;
        flex-shrink: 0;
      }

      /* ── Key ───────────────────────────────────────────── */

      .ui-json-viewer__key {
        color: var(--text-primary, oklch(90% 0 0));
        font-weight: 500;
      }

      .ui-json-viewer__colon {
        color: var(--text-tertiary, oklch(55% 0 0));
        margin-inline-end: var(--space-2xs, 0.125rem);
      }

      /* ── Values ────────────────────────────────────────── */

      .ui-json-viewer__value {
        cursor: pointer;
        position: relative;
      }

      .ui-json-viewer__value[data-type='string'] {
        color: var(--status-ok, oklch(72% 0.19 155));
      }

      .ui-json-viewer__value[data-type='number'] {
        color: var(--status-info, oklch(65% 0.2 270));
      }

      .ui-json-viewer__value[data-type='boolean'] {
        color: var(--status-warning, oklch(78% 0.15 80));
      }

      .ui-json-viewer__value[data-type='null'] {
        color: var(--status-error, oklch(65% 0.22 25));
        font-style: italic;
      }

      /* ── Copy feedback ─────────────────────────────────── */

      .ui-json-viewer__value[data-copied]::after {
        content: 'copied!';
        position: absolute;
        inset-inline-start: calc(100% + var(--space-xs, 0.25rem));
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-ok, oklch(72% 0.19 155));
        white-space: nowrap;
        animation: ui-json-viewer-fade 1.5s ease forwards;
      }

      @keyframes ui-json-viewer-fade {
        0% { opacity: 1; }
        70% { opacity: 1; }
        100% { opacity: 0; }
      }

      /* ── Size badge ────────────────────────────────────── */

      .ui-json-viewer__size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        margin-inline-start: var(--space-2xs, 0.125rem);
      }

      /* ── Type label ────────────────────────────────────── */

      .ui-json-viewer__type {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(50% 0 0));
        margin-inline-start: var(--space-2xs, 0.125rem);
        font-style: italic;
      }

      /* ── Bracket ───────────────────────────────────────── */

      .ui-json-viewer__bracket {
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      /* ── Children container (animated) ─────────────────── */

      .ui-json-viewer__children {
        display: grid;
        grid-template-rows: 1fr;
        overflow: hidden;
      }

      .ui-json-viewer__children[data-collapsed] {
        grid-template-rows: 0fr;
      }

      :scope[data-motion='1'] .ui-json-viewer__children,
      :scope[data-motion='2'] .ui-json-viewer__children,
      :scope[data-motion='3'] .ui-json-viewer__children {
        transition: grid-template-rows 0.2s ease;
      }

      .ui-json-viewer__children-inner {
        min-block-size: 0;
        overflow: hidden;
      }

      /* ── Ellipsis / expand ─────────────────────────────── */

      .ui-json-viewer__ellipsis {
        color: var(--text-tertiary, oklch(55% 0 0));
        cursor: pointer;
        font-style: italic;
      }

      .ui-json-viewer__ellipsis:hover {
        color: var(--brand, oklch(65% 0.2 270));
      }

      /* ── Forced colors ─────────────────────────────────── */

      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        .ui-json-viewer__key,
        .ui-json-viewer__value,
        .ui-json-viewer__bracket,
        .ui-json-viewer__size,
        .ui-json-viewer__type {
          color: inherit;
        }
        .ui-json-viewer__chevron {
          color: ButtonText;
        }
        .ui-json-viewer__chevron:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* ── Print ──────────────────────────────────────────── */

      @media print {
        :scope {
          background: white;
          color: black;
          border: 1px solid black;
        }
        .ui-json-viewer__value[data-type='string'],
        .ui-json-viewer__value[data-type='number'],
        .ui-json-viewer__value[data-type='boolean'],
        .ui-json-viewer__value[data-type='null'] {
          color: inherit;
        }
      }
    }
  }
`

// ─── Tree Node Component ────────────────────────────────────────────────────

interface TreeNodeProps {
  keyName?: string
  value: unknown
  depth: number
  initialExpandDepth: number
  collapsed: boolean
  enableClipboard: boolean
  displayDataTypes: boolean
  displayObjectSize: boolean
  indentWidth: number
  sortKeys: boolean
  maxStringLength: number | undefined
  isLast: boolean
  visited?: Set<unknown>
}

function TreeNode({
  keyName,
  value,
  depth,
  initialExpandDepth,
  collapsed,
  enableClipboard,
  displayDataTypes,
  displayObjectSize,
  indentWidth,
  sortKeys,
  maxStringLength,
  isLast,
  visited = new Set(),
}: TreeNodeProps) {
  const valueType = getType(value)
  const isExpandable = valueType === 'object' || valueType === 'array'
  const [expanded, setExpanded] = useState(
    collapsed ? false : depth < initialExpandDepth
  )
  const [copiedKey, setCopiedKey] = useState(false)
  const [stringExpanded, setStringExpanded] = useState(false)

  const handleToggle = useCallback(() => {
    setExpanded(prev => !prev)
  }, [])

  const handleCopy = useCallback((text: string) => {
    copyToClipboard(text)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 1500)
  }, [])

  const indent = depth * indentWidth

  // Render primitive value
  const renderValue = (): ReactNode => {
    let display: string
    let dataType = valueType

    switch (valueType) {
      case 'string': {
        const str = value as string
        const truncated = maxStringLength && str.length > maxStringLength && !stringExpanded
        display = truncated ? `"${str.slice(0, maxStringLength)}..."` : `"${str}"`
        break
      }
      case 'number':
        display = String(value)
        break
      case 'boolean':
        display = String(value)
        break
      case 'null':
        display = 'null'
        break
      default:
        display = String(value)
        dataType = 'string'
    }

    return (
      <>
        <span
          className="ui-json-viewer__value"
          data-type={dataType}
          onClick={enableClipboard ? () => handleCopy(display) : undefined}
          role={enableClipboard ? 'button' : undefined}
          tabIndex={enableClipboard ? 0 : undefined}
          aria-label={enableClipboard ? `Copy value ${display}` : undefined}
          {...(copiedKey ? { 'data-copied': '' } : {})}
        >
          {display}
        </span>
        {valueType === 'string' && maxStringLength && (value as string).length > maxStringLength && !stringExpanded && (
          <span
            className="ui-json-viewer__ellipsis"
            onClick={() => setStringExpanded(true)}
            role="button"
            tabIndex={0}
            aria-label="Expand string"
          >
            {' '}show more
          </span>
        )}
        {displayDataTypes && (
          <span className="ui-json-viewer__type">{valueType}</span>
        )}
      </>
    )
  }

  // Render expandable (object/array)
  if (isExpandable) {
    // Circular reference detection
    if (visited.has(value)) {
      const indent = depth * indentWidth
      return (
        <div className="ui-json-viewer__node">
          <div className="ui-json-viewer__row">
            <span className="ui-json-viewer__indent" style={{ inlineSize: `${indent}ch` }} />
            <span className="ui-json-viewer__chevron-spacer" />
            {keyName !== undefined && (
              <>
                <span className="ui-json-viewer__key">{keyName}</span>
                <span className="ui-json-viewer__colon">:</span>
              </>
            )}
            <span className="ui-json-viewer__value" data-type="null" style={{ fontStyle: 'italic' }}>
              [Circular]
            </span>
          </div>
        </div>
      )
    }

    const nextVisited = new Set(visited)
    nextVisited.add(value)

    const isArray = valueType === 'array'
    const entries = isArray
      ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
      : Object.entries(value as Record<string, unknown>)

    if (sortKeys && !isArray) {
      entries.sort(([a], [b]) => a.localeCompare(b))
    }

    const size = entries.length
    const openBracket = isArray ? '[' : '{'
    const closeBracket = isArray ? ']' : '}'
    const comma = isLast ? '' : ','

    return (
      <div className="ui-json-viewer__node">
        <div className="ui-json-viewer__row">
          <span className="ui-json-viewer__indent" style={{ inlineSize: `${indent}ch` }} />
          <button
            className="ui-json-viewer__chevron"
            onClick={handleToggle}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            aria-expanded={expanded}
            {...(expanded ? { 'data-expanded': '' } : {})}
          >
            ▶
          </button>
          {keyName !== undefined && (
            <>
              <span className="ui-json-viewer__key">{keyName}</span>
              <span className="ui-json-viewer__colon">:</span>
            </>
          )}
          <span className="ui-json-viewer__bracket">{openBracket}</span>
          {displayObjectSize && (
            <span className="ui-json-viewer__size">
              {isArray ? `[${size}]` : `{${size}}`}
            </span>
          )}
          {!expanded && (
            <>
              <span className="ui-json-viewer__ellipsis" onClick={handleToggle} role="button" tabIndex={0}>
                ...
              </span>
              <span className="ui-json-viewer__bracket">{closeBracket}{comma}</span>
            </>
          )}
        </div>
        <div
          className="ui-json-viewer__children"
          {...(expanded ? {} : { 'data-collapsed': '' })}
        >
          <div className="ui-json-viewer__children-inner">
            {entries.map(([k, v], i) => (
              <TreeNode
                key={k}
                keyName={isArray ? undefined : k}
                value={v}
                depth={depth + 1}
                initialExpandDepth={initialExpandDepth}
                collapsed={collapsed}
                enableClipboard={enableClipboard}
                displayDataTypes={displayDataTypes}
                displayObjectSize={displayObjectSize}
                indentWidth={indentWidth}
                sortKeys={sortKeys}
                maxStringLength={maxStringLength}
                isLast={i === entries.length - 1}
                visited={nextVisited}
              />
            ))}
          </div>
        </div>
        {expanded && (
          <div className="ui-json-viewer__row">
            <span className="ui-json-viewer__indent" style={{ inlineSize: `${indent}ch` }} />
            <span className="ui-json-viewer__chevron-spacer" />
            <span className="ui-json-viewer__bracket">{closeBracket}{comma}</span>
          </div>
        )}
      </div>
    )
  }

  // Primitive node
  const comma = isLast ? '' : ','
  return (
    <div className="ui-json-viewer__node">
      <div className="ui-json-viewer__row">
        <span className="ui-json-viewer__indent" style={{ inlineSize: `${indent}ch` }} />
        <span className="ui-json-viewer__chevron-spacer" />
        {keyName !== undefined && (
          <>
            <span className="ui-json-viewer__key">{keyName}</span>
            <span className="ui-json-viewer__colon">:</span>
          </>
        )}
        {renderValue()}
        {comma && <span className="ui-json-viewer__bracket">{comma}</span>}
      </div>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function JsonViewer({
  data,
  initialExpandDepth = 2,
  collapsed = false,
  rootName = 'root',
  enableClipboard = false,
  displayDataTypes = false,
  displayObjectSize = true,
  theme = 'dark',
  indentWidth = 2,
  sortKeys = false,
  maxStringLength,
  motion: motionProp,
  className,
  ...rest
}: JsonViewerProps) {
  useStyles('json-viewer', jsonViewerStyles)
  const motionLevel = useMotionLevel(motionProp)

  const resolvedTheme = useMemo(() => {
    if (theme === 'auto') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'dark'
    }
    return theme
  }, [theme])

  return (
    <div
      className={cn('ui-json-viewer', className)}
      data-motion={motionLevel}
      data-theme={resolvedTheme}
      role="group"
      aria-label={`JSON viewer: ${rootName}`}
      {...rest}
    >
      <TreeNode
        keyName={rootName}
        value={data}
        depth={0}
        initialExpandDepth={initialExpandDepth}
        collapsed={collapsed}
        enableClipboard={enableClipboard}
        displayDataTypes={displayDataTypes}
        displayObjectSize={displayObjectSize}
        indentWidth={indentWidth}
        sortKeys={sortKeys}
        maxStringLength={maxStringLength}
        isLast
      />
    </div>
  )
}

JsonViewer.displayName = 'JsonViewer'
