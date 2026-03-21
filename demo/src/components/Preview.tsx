import { useState, useRef, useEffect, type ReactNode } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Icon } from '@ui/core/icons/icon'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PreviewProps {
  label: string
  description?: string
  children: ReactNode
  code?: string
  wide?: boolean
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const previewStyles = css`
  @layer components {
    @scope (.ui-preview) {
      :scope {
        container-type: inline-size;
      }

      :scope[data-wide="true"] {
        grid-column: 1 / -1;
      }

      .ui-preview__card {
        overflow: hidden;
      }

      /* ── Header ─────────────────────────────────────── */

      .ui-preview__header {
        padding: var(--space-md, 1rem) var(--space-lg, 1.25rem) var(--space-sm, 0.75rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
      }

      .ui-preview__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        margin: 0;
      }

      .ui-preview__description {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
        margin-block-start: var(--space-xs, 0.25rem);
        line-height: 1.5;
        margin-block-end: 0;
      }

      /* ── Live demo area ─────────────────────────────── */

      .ui-preview__demo {
        padding: var(--space-lg, 1.25rem);
        min-block-size: 80px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-md, 1rem);
      }

      /* ── Code toggle ────────────────────────────────── */

      .ui-preview__code-toggle {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-md, 0.75rem);
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        color: var(--text-tertiary, oklch(55% 0 0));
        background: none;
        border: none;
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
        cursor: pointer;
        font-family: inherit;
        transition: color 0.15s;
        inline-size: 100%;
        justify-content: center;
      }
      .ui-preview__code-toggle:hover {
        color: var(--text-secondary, oklch(70% 0 0));
        background: oklch(100% 0 0 / 0.02);
      }
      .ui-preview__code-toggle svg {
        inline-size: 0.875rem;
        block-size: 0.875rem;
        transition: transform 0.2s var(--ease-out, ease-out);
      }
      .ui-preview__code-toggle[data-open="true"] svg {
        transform: rotate(180deg);
      }

      /* ── Code section ───────────────────────────────── */

      .ui-preview__code-wrapper {
        display: grid;
        grid-template-rows: 0fr;
        overflow: hidden;
        transition: grid-template-rows 0.25s var(--ease-out, ease-out);
      }
      .ui-preview__code-wrapper[data-open="true"] {
        grid-template-rows: 1fr;
      }
      .ui-preview__code-inner {
        min-block-size: 0;
        overflow: hidden;
      }

      /* ── Entrance animation ─────────────────────────── */

      :scope[data-in-view="false"] .ui-preview__card {
        opacity: 0;
        transform: translateY(16px);
      }
      :scope[data-in-view="true"] .ui-preview__card {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.4s ease-out, transform 0.4s ease-out;
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function Preview({ label, description, code, wide, children }: PreviewProps) {
  useStyles('preview', previewStyles)
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [codeOpen, setCodeOpen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="ui-preview"
      data-wide={wide || undefined}
      data-in-view={inView}
    >
      <Card variant="default" padding="none" className="ui-preview__card">
        {/* Header */}
        <div className="ui-preview__header">
          <h3 className="ui-preview__label">{label}</h3>
          {description && (
            <p className="ui-preview__description">{description}</p>
          )}
        </div>

        {/* Live demo */}
        <div className="ui-preview__demo">
          {children}
        </div>

        {/* Code section */}
        {code && (
          <>
            <button
              className="ui-preview__code-toggle"
              data-open={codeOpen || undefined}
              onClick={() => setCodeOpen((v) => !v)}
              type="button"
            >
              <Icon name="code" size="sm" />
              {codeOpen ? 'Hide code' : 'Show code'}
            </button>
            <div
              className="ui-preview__code-wrapper"
              data-open={codeOpen || undefined}
            >
              <div className="ui-preview__code-inner">
                <CopyBlock code={code.trim()} language="typescript" />
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

// ─── Utility hook (preserved from original) ─────────────────────────────────

export function useInViewTimer(intervalMs: number, callback: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!intervalRef.current) {
            intervalRef.current = setInterval(callback, intervalMs)
          }
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [intervalMs, callback])

  return ref
}
