'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'
import { sanitize } from '../core/utils/sanitize'

// ─── Types ──────────────────────────────────────────────────────────────────

export type ToolbarAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'code'
  | 'link'
  | 'clearFormatting'

export interface RichTextEditorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  defaultValue?: string
  onChange?: (html: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  readOnly?: boolean
  minHeight?: string | number
  maxHeight?: string | number
  toolbar?: ToolbarAction[]
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

const DEFAULT_TOOLBAR: ToolbarAction[] = [
  'bold', 'italic', 'underline', 'strikethrough',
  'heading',
  'bulletList', 'orderedList', 'blockquote',
  'code', 'link', 'clearFormatting',
]

// ─── Toolbar icons (inline SVG) ──────────────────────────────────────────────

const ICONS: Record<string, string> = {
  bold: '<path d="M6 4h5a3 3 0 0 1 0 6H6V4zm0 6h6a3 3 0 0 1 0 6H6v-6z" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  italic: '<path d="M7 4h6M7 16h6M10 4l-2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  underline: '<path d="M6 4v6a4 4 0 0 0 8 0V4M5 18h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  strikethrough: '<path d="M5 10h10M7 4v3M13 16v-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  h1: '<path d="M4 4v12M4 10h6M10 4v12M14 12V8l2 2 2-2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  h2: '<path d="M4 4v12M4 10h6M10 4v12M14 8h3a1 1 0 0 1 0 3h-1l2 3h-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  h3: '<path d="M4 4v12M4 10h6M10 4v12M14 8h3a1 1 0 0 1 0 2.5 1 1 0 0 1 0 2.5h-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  bulletList: '<path d="M8 5h9M8 10h9M8 15h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="4" cy="5" r="1" fill="currentColor"/><circle cx="4" cy="10" r="1" fill="currentColor"/><circle cx="4" cy="15" r="1" fill="currentColor"/>',
  orderedList: '<path d="M8 5h9M8 10h9M8 15h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><text x="3" y="7" font-size="6" fill="currentColor" font-family="inherit">1</text><text x="3" y="12" font-size="6" fill="currentColor" font-family="inherit">2</text><text x="3" y="17" font-size="6" fill="currentColor" font-family="inherit">3</text>',
  blockquote: '<path d="M5 8h4l-1 4M11 8h4l-1 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  code: '<path d="M7 7l-3 3 3 3M13 7l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  link: '<path d="M9 11l-1 1a2.5 2.5 0 0 0 3.5 3.5l1-1M11 9l1-1a2.5 2.5 0 0 0-3.5-3.5l-1 1M8 12l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  clearFormatting: '<path d="M5 5l10 10M8 4h5l-3 6M4 16h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
}

function icon(name: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">${ICONS[name] ?? ''}</svg>`
}

// ─── Heading submenu groups ────────────────────────────────────────────────

const HEADING_LEVELS = ['h1', 'h2', 'h3'] as const

// ─── Format groups for separator logic ───────────────────────────────────────

const FORMAT_GROUPS: ToolbarAction[][] = [
  ['bold', 'italic', 'underline', 'strikethrough'],
  ['heading'],
  ['bulletList', 'orderedList', 'blockquote'],
  ['code', 'link'],
  ['clearFormatting'],
]

function getGroupIndex(action: ToolbarAction): number {
  return FORMAT_GROUPS.findIndex(g => g.includes(action))
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const richTextEditorStyles = css`
  @layer components {
    @scope (.ui-rich-text-editor) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        position: relative;
        font-family: inherit;
      }

      .ui-rich-text-editor__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      .ui-rich-text-editor__wrapper {
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.375rem);
        overflow: hidden;
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
      }

      .ui-rich-text-editor__wrapper:focus-within {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15),
                    0 0 16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }

      /* ── Toolbar ── */
      .ui-rich-text-editor__toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 2px;
        padding-block: 0.25rem;
        padding-inline: 0.375rem;
        background: linear-gradient(to bottom, oklch(20% 0.01 270), oklch(18% 0.01 270));
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.08);
        backdrop-filter: blur(8px);
        border-block-end: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        user-select: none;
      }

      .ui-rich-text-editor__toolbar-separator {
        inline-size: 1px;
        block-size: 1.25rem;
        background: linear-gradient(to bottom, transparent, var(--border-default, oklch(100% 0 0 / 0.08)), transparent);
        margin-inline: 0.25rem;
        flex-shrink: 0;
      }

      .ui-rich-text-editor__toolbar-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        border-radius: var(--radius-sm, 0.25rem);
        cursor: pointer;
        min-inline-size: 1.75rem;
        min-block-size: 1.75rem;
        padding: 0.25rem;
        transition: background 0.1s ease-out, color 0.1s ease-out;
      }

      .ui-rich-text-editor__toolbar-btn:hover:not(:disabled) {
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
        color: var(--text-primary, oklch(90% 0 0));
        transform: translateY(-1px);
        box-shadow: 0 2px 6px oklch(0% 0 0 / 0.15);
      }

      .ui-rich-text-editor__toolbar-btn:active:not(:disabled) {
        transform: scale(0.93);
        transition: transform 0.06s ease-out;
      }

      .ui-rich-text-editor__toolbar-btn[data-active] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
        color: var(--brand, oklch(65% 0.2 270));
        box-shadow: inset 0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      .ui-rich-text-editor__toolbar-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      .ui-rich-text-editor__toolbar-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* Heading dropdown */
      .ui-rich-text-editor__heading-group {
        position: relative;
        display: inline-flex;
      }

      .ui-rich-text-editor__heading-menu {
        position: absolute;
        inset-block-start: 100%;
        inset-inline-start: 0;
        z-index: 10;
        display: none;
        flex-direction: column;
        background: var(--bg-elevated, oklch(22% 0 0));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.375rem);
        padding-block: 0.25rem;
        min-inline-size: 6rem;
        box-shadow: 0 8px 24px oklch(0% 0 0 / 0.4);
        animation: ui-rte-menu-in 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .ui-rich-text-editor__heading-menu[data-open] {
        display: flex;
      }

      .ui-rich-text-editor__heading-menu button {
        display: block;
        inline-size: 100%;
        text-align: start;
        border: none;
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        cursor: pointer;
        font-family: inherit;
      }

      .ui-rich-text-editor__heading-menu button:hover {
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
      }

      .ui-rich-text-editor__heading-menu button[data-active] {
        color: var(--brand, oklch(65% 0.2 270));
      }

      /* ── Editor area ── */
      .ui-rich-text-editor__editor {
        position: relative;
        outline: none;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        line-height: 1.6;
        overflow-y: auto;
        cursor: text;
      }

      /* Placeholder */
      .ui-rich-text-editor__editor[data-placeholder]:empty::before {
        content: attr(data-placeholder);
        color: var(--text-tertiary, oklch(60% 0 0));
        pointer-events: none;
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
        padding: inherit;
      }

      /* Size variants */
      :scope[data-size="sm"] .ui-rich-text-editor__editor {
        padding: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="sm"] .ui-rich-text-editor__toolbar-btn {
        min-inline-size: 1.5rem;
        min-block-size: 1.5rem;
      }

      :scope[data-size="md"] .ui-rich-text-editor__editor {
        padding: 0.75rem;
        font-size: var(--text-sm, 0.875rem);
      }

      :scope[data-size="lg"] .ui-rich-text-editor__editor {
        padding: 1rem;
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="lg"] .ui-rich-text-editor__toolbar-btn {
        min-inline-size: 2rem;
        min-block-size: 2rem;
      }

      /* Inner content styling */
      .ui-rich-text-editor__editor h1 {
        font-size: 1.5em;
        font-weight: 700;
        margin-block: 0.5em;
        line-height: 1.3;
      }
      .ui-rich-text-editor__editor h2 {
        font-size: 1.25em;
        font-weight: 600;
        margin-block: 0.4em;
        line-height: 1.35;
      }
      .ui-rich-text-editor__editor h3 {
        font-size: 1.1em;
        font-weight: 600;
        margin-block: 0.35em;
        line-height: 1.4;
      }
      .ui-rich-text-editor__editor blockquote {
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        padding-inline-start: 0.75rem;
        margin-inline: 0;
        margin-block: 0.5em;
        color: var(--text-secondary, oklch(70% 0 0));
        font-style: italic;
      }
      .ui-rich-text-editor__editor code {
        background: oklch(100% 0 0 / 0.08);
        padding-inline: 0.3em;
        padding-block: 0.1em;
        border-radius: var(--radius-sm, 0.25rem);
        font-family: monospace;
        font-size: 0.9em;
      }
      .ui-rich-text-editor__editor ul,
      .ui-rich-text-editor__editor ol {
        padding-inline-start: 1.5em;
        margin-block: 0.5em;
      }
      .ui-rich-text-editor__editor li {
        margin-block: 0.15em;
      }
      .ui-rich-text-editor__editor a {
        color: var(--brand, oklch(65% 0.2 270));
        text-decoration: underline;
      }
      .ui-rich-text-editor__editor p {
        margin-block: 0.25em;
      }

      /* ── Error state ── */
      :scope[data-invalid] .ui-rich-text-editor__wrapper {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 1px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.2);
      }
      :scope[data-invalid] .ui-rich-text-editor__wrapper:focus-within {
        border-color: var(--status-critical, oklch(65% 0.25 25));
        box-shadow: 0 0 0 3px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.25);
      }

      .ui-rich-text-editor__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      :scope:not([data-motion="0"]) .ui-rich-text-editor__error {
        animation: ui-rte-error-in 0.2s var(--ease-out, ease-out);
      }

      /* ── Disabled state ── */
      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* ── Read-only state ── */
      :scope[data-readonly] .ui-rich-text-editor__toolbar {
        pointer-events: none;
        opacity: 0.6;
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        .ui-rich-text-editor__wrapper {
          border: 2px solid ButtonText;
        }
        .ui-rich-text-editor__wrapper:focus-within {
          outline: 2px solid Highlight;
        }
        .ui-rich-text-editor__toolbar-btn[data-active] {
          background: Highlight;
          color: HighlightText;
        }
        :scope[data-invalid] .ui-rich-text-editor__wrapper {
          border-color: LinkText;
        }
      }

      /* ── Print ── */
      @media print {
        .ui-rich-text-editor__toolbar {
          display: none;
        }
        .ui-rich-text-editor__wrapper {
          border: 1px solid;
          box-shadow: none;
        }
      }

      /* ── Touch targets ── */
      @media (pointer: coarse) {
        .ui-rich-text-editor__toolbar-btn {
          min-inline-size: 2.75rem;
          min-block-size: 2.75rem;
        }
      }
    }

    @keyframes ui-rte-menu-in {
      from {
        opacity: 0;
        transform: translateY(-4px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes ui-rte-error-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
`

// ─── Command helpers ─────────────────────────────────────────────────────────

function execCommand(command: string, value?: string): void {
  const result = document.execCommand(command, false, value)
  if (!result) {
    console.warn(`[RichTextEditor] execCommand('${command}') returned false`)
  }
}

function queryActive(command: string): boolean {
  try {
    return document.queryCommandState(command)
  } catch {
    return false
  }
}

function queryBlockFormat(): string {
  try {
    const val = document.queryCommandValue('formatBlock')
    return val ? val.toLowerCase() : ''
  } catch {
    return ''
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      placeholder = 'Start typing...',
      label,
      error,
      disabled = false,
      readOnly = false,
      minHeight = 120,
      maxHeight,
      toolbar = DEFAULT_TOOLBAR,
      size = 'md',
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('rich-text-editor', richTextEditorStyles)
    const motionLevel = useMotionLevel(motionProp)
    const stableId = useStableId('rich-text-editor')

    const editorRef = useRef<HTMLDivElement>(null)
    const isFocusedRef = useRef(false)
    const [activeStates, setActiveStates] = useState<Record<string, boolean>>({})
    const [headingMenuOpen, setHeadingMenuOpen] = useState(false)
    const isControlled = value !== undefined
    const lastHtmlRef = useRef<string>('')

    // ── Sync controlled value ─────────────────────────────────────────
    useEffect(() => {
      if (isControlled && editorRef.current) {
        // Skip sync while editor is focused to preserve cursor position
        if (isFocusedRef.current) return
        const currentHtml = editorRef.current.innerHTML
        if (value !== currentHtml) {
          editorRef.current.innerHTML = value ?? ''
          lastHtmlRef.current = value ?? ''
        }
      }
    }, [value, isControlled])

    // ── Set default value ─────────────────────────────────────────────
    useEffect(() => {
      if (!isControlled && defaultValue && editorRef.current) {
        editorRef.current.innerHTML = defaultValue
        lastHtmlRef.current = defaultValue
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Update active states ──────────────────────────────────────────
    const updateActiveStates = useCallback(() => {
      setActiveStates({
        bold: queryActive('bold'),
        italic: queryActive('italic'),
        underline: queryActive('underline'),
        strikethrough: queryActive('strikeThrough'),
        h1: queryBlockFormat() === 'h1',
        h2: queryBlockFormat() === 'h2',
        h3: queryBlockFormat() === 'h3',
        bulletList: queryActive('insertUnorderedList'),
        orderedList: queryActive('insertOrderedList'),
      })
    }, [])

    // ── Handle input ──────────────────────────────────────────────────
    const handleInput = useCallback(() => {
      if (!editorRef.current) return
      const html = editorRef.current.innerHTML
      // Treat a lone <br> or empty paragraphs as empty
      const isEmpty = html === '<br>' || html === '<p><br></p>' || html === ''
      const sanitized = isEmpty ? '' : sanitize(html)

      if (sanitized !== lastHtmlRef.current) {
        lastHtmlRef.current = sanitized
        onChange?.(sanitized)
      }
      updateActiveStates()
    }, [onChange, updateActiveStates])

    // ── Handle selection change to update toolbar states ──────────────
    useEffect(() => {
      const handler = () => {
        if (editorRef.current && editorRef.current.contains(document.activeElement ?? document.getSelection()?.anchorNode ?? null)) {
          updateActiveStates()
        }
      }
      document.addEventListener('selectionchange', handler)
      return () => document.removeEventListener('selectionchange', handler)
    }, [updateActiveStates])

    // ── Keyboard shortcuts ────────────────────────────────────────────
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (readOnly || disabled) return
        const mod = e.metaKey || e.ctrlKey
        if (mod && e.key === 'b') {
          e.preventDefault()
          execCommand('bold')
          updateActiveStates()
        } else if (mod && e.key === 'i') {
          e.preventDefault()
          execCommand('italic')
          updateActiveStates()
        } else if (mod && e.key === 'u') {
          e.preventDefault()
          execCommand('underline')
          updateActiveStates()
        }
      },
      [readOnly, disabled, updateActiveStates]
    )

    // ── Toolbar command handler ───────────────────────────────────────
    const handleToolbarAction = useCallback(
      (action: ToolbarAction, subAction?: string) => {
        if (disabled || readOnly) return
        // Restore focus to editor
        editorRef.current?.focus()

        switch (action) {
          case 'bold':
            execCommand('bold')
            break
          case 'italic':
            execCommand('italic')
            break
          case 'underline':
            execCommand('underline')
            break
          case 'strikethrough':
            execCommand('strikeThrough')
            break
          case 'heading': {
            const level = subAction ?? 'h1'
            const current = queryBlockFormat()
            if (current === level) {
              execCommand('formatBlock', 'p')
            } else {
              execCommand('formatBlock', level)
            }
            break
          }
          case 'bulletList':
            execCommand('insertUnorderedList')
            break
          case 'orderedList':
            execCommand('insertOrderedList')
            break
          case 'blockquote': {
            const current = queryBlockFormat()
            if (current === 'blockquote') {
              execCommand('formatBlock', 'p')
            } else {
              execCommand('formatBlock', 'blockquote')
            }
            break
          }
          case 'code':
            // Wrap selection in <code> using insertHTML
            {
              const selection = window.getSelection()
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                const text = range.toString()
                if (text) {
                  execCommand('insertHTML', `<code>${text}</code>`)
                }
              }
            }
            break
          case 'link': {
            const selection = window.getSelection()
            const selectedText = selection?.toString() ?? ''
            // eslint-disable-next-line no-alert
            const url = prompt('Enter URL:', 'https://')
            if (url) {
              if (selectedText) {
                execCommand('createLink', url)
              } else {
                execCommand('insertHTML', `<a href="${url}">${url}</a>`)
              }
            }
            break
          }
          case 'clearFormatting':
            execCommand('removeFormat')
            break
        }

        updateActiveStates()
        handleInput()
      },
      [disabled, readOnly, updateActiveStates, handleInput]
    )

    // ── Close heading menu on outside click ───────────────────────────
    useEffect(() => {
      if (!headingMenuOpen) return
      const handler = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (!target.closest('.ui-rich-text-editor__heading-group')) {
          setHeadingMenuOpen(false)
        }
      }
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }, [headingMenuOpen])

    // ── Compute min/max height styles ─────────────────────────────────
    const editorStyle: React.CSSProperties = {}
    if (minHeight) {
      editorStyle.minBlockSize = typeof minHeight === 'number' ? `${minHeight}px` : minHeight
    }
    if (maxHeight) {
      editorStyle.maxBlockSize = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
    }

    // ── Render toolbar buttons ────────────────────────────────────────
    const renderToolbar = () => {
      const buttons: React.ReactNode[] = []
      let prevGroup = -1

      toolbar.forEach((action, i) => {
        const currentGroup = getGroupIndex(action)
        if (prevGroup !== -1 && currentGroup !== prevGroup) {
          buttons.push(
            <span key={`sep-${i}`} className="ui-rich-text-editor__toolbar-separator" aria-hidden="true" />
          )
        }
        prevGroup = currentGroup

        if (action === 'heading') {
          const headingActive = activeStates.h1 || activeStates.h2 || activeStates.h3
          buttons.push(
            <span key="heading" className="ui-rich-text-editor__heading-group">
              <button
                type="button"
                className="ui-rich-text-editor__toolbar-btn"
                {...(headingActive ? { 'data-active': '' } : {})}
                onClick={() => setHeadingMenuOpen(prev => !prev)}
                aria-label="Heading"
                aria-expanded={headingMenuOpen}
                aria-haspopup="true"
                title="Heading"
                disabled={disabled || readOnly}
              >
                <span dangerouslySetInnerHTML={{ __html: icon('h1') }} />
              </button>
              <div
                className="ui-rich-text-editor__heading-menu"
                role="menu"
                {...(headingMenuOpen ? { 'data-open': '' } : {})}
              >
                {HEADING_LEVELS.map(level => (
                  <button
                    key={level}
                    type="button"
                    role="menuitem"
                    {...(activeStates[level] ? { 'data-active': '' } : {})}
                    onClick={() => {
                      handleToolbarAction('heading', level)
                      setHeadingMenuOpen(false)
                    }}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </span>
          )
          return
        }

        const commandMap: Record<string, string> = {
          bold: 'Bold',
          italic: 'Italic',
          underline: 'Underline',
          strikethrough: 'Strikethrough',
          bulletList: 'Bullet list',
          orderedList: 'Ordered list',
          blockquote: 'Blockquote',
          code: 'Code',
          link: 'Link',
          clearFormatting: 'Clear formatting',
        }

        const isMac = typeof navigator !== 'undefined' &&
          (/Mac|iPhone|iPad|iPod/i.test(navigator.platform) ||
           (navigator as any).userAgentData?.platform === 'macOS')
        const modKey = isMac ? 'Cmd' : 'Ctrl'
        const shortcutMap: Record<string, string> = {
          bold: ` (${modKey}+B)`,
          italic: ` (${modKey}+I)`,
          underline: ` (${modKey}+U)`,
        }

        const iconName = action === 'bulletList' ? 'bulletList' : action === 'orderedList' ? 'orderedList' : action
        const isActive = activeStates[action] ?? false

        buttons.push(
          <button
            key={action}
            type="button"
            className="ui-rich-text-editor__toolbar-btn"
            {...(isActive ? { 'data-active': '' } : {})}
            onClick={() => handleToolbarAction(action)}
            aria-label={commandMap[action] ?? action}
            title={`${commandMap[action] ?? action}${shortcutMap[action] ?? ''}`}
            disabled={disabled || readOnly}
          >
            <span dangerouslySetInnerHTML={{ __html: icon(iconName) }} />
          </button>
        )
      })

      return buttons
    }

    const errorId = error ? `${stableId}-error` : undefined
    const labelId = label ? `${stableId}-label` : undefined

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(error ? { 'data-invalid': '' } : {})}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...(readOnly ? { 'data-readonly': '' } : {})}
        {...rest}
      >
        {label && (
          <label id={labelId} className="ui-rich-text-editor__label">
            {label}
          </label>
        )}

        <div className="ui-rich-text-editor__wrapper">
          <div className="ui-rich-text-editor__toolbar" role="toolbar" aria-label="Formatting options">
            {renderToolbar()}
          </div>

          <div
            ref={editorRef}
            className="ui-rich-text-editor__editor"
            contentEditable={!disabled && !readOnly}
            role="textbox"
            aria-multiline="true"
            aria-label={label ?? 'Rich text editor'}
            aria-labelledby={labelId}
            aria-describedby={errorId}
            aria-invalid={error ? true : undefined}
            aria-readonly={readOnly || undefined}
            aria-disabled={disabled || undefined}
            data-placeholder={placeholder}
            style={editorStyle}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => { isFocusedRef.current = true }}
            onBlur={() => { isFocusedRef.current = false }}
            suppressContentEditableWarning
          />
        </div>

        {error && (
          <span id={errorId} className="ui-rich-text-editor__error" role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)
RichTextEditor.displayName = 'RichTextEditor'
