'use client'

import {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ButtonHTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface CSVExportButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  data: Record<string, unknown>[]
  filename?: string
  columns?: { key: string; label: string }[]
  onExport?: () => void
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  motion?: 0 | 1 | 2 | 3
}

function escapeCSV(val: unknown): string {
  const str = val == null ? '' : String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function generateCSV(
  data: Record<string, unknown>[],
  columns?: { key: string; label: string }[]
): string {
  if (data.length === 0) return ''
  const cols = columns ?? Object.keys(data[0]).map((k) => ({ key: k, label: k }))
  const header = cols.map((c) => escapeCSV(c.label)).join(',')
  const rows = data.map((row) => cols.map((c) => escapeCSV(row[c.key])).join(','))
  return [header, ...rows].join('\n')
}

const csvExportStyles = css`
  @layer components {
    @scope (.ui-csv-export) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs, 0.25rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-elevated, oklch(50% 0 0 / 0.08));
        color: var(--text-secondary, oklch(70% 0 0));
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        white-space: nowrap;
        outline: none;
        overflow: hidden;
        transition: background 0.15s ease-out, border-color 0.15s ease-out,
                    color 0.15s ease-out, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Sizes */
      :scope[data-size="xs"] {
        padding-block: 0.25rem; padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.6875rem); min-block-size: 24px;
      }
      :scope[data-size="sm"] {
        padding-block: 0.375rem; padding-inline: 0.75rem;
        font-size: var(--text-xs, 0.75rem); min-block-size: 32px;
      }
      :scope[data-size="md"] {
        padding-block: 0.5rem; padding-inline: 1rem;
        font-size: var(--text-sm, 0.875rem); min-block-size: 36px;
      }
      :scope[data-size="lg"] {
        padding-block: 0.625rem; padding-inline: 1.25rem;
        font-size: var(--text-base, 1rem); min-block-size: 44px;
      }
      :scope[data-size="xl"] {
        padding-block: 0.75rem; padding-inline: 1.5rem;
        font-size: var(--text-lg, 1.125rem); min-block-size: 52px;
      }

      :scope:hover:not(:disabled) {
        background: var(--bg-hover, oklch(100% 0 0 / 0.1));
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
        color: var(--text-primary, oklch(90% 0 0));
      }
      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
      :scope:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Active press */
      :scope:active:not(:disabled):not([data-motion="0"]) {
        transform: scale(0.97);
        transition: transform 0.06s ease-out;
      }

      /* Success state */
      :scope[data-exported="true"] {
        background: var(--status-healthy, oklch(65% 0.2 150));
        border-color: var(--status-healthy, oklch(65% 0.2 150));
        color: oklch(100% 0 0);
      }

      /* Icon */
      :scope svg {
        inline-size: 1em;
        block-size: 1em;
        flex-shrink: 0;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        :scope { min-block-size: 44px; min-inline-size: 44px; }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope { border: 2px solid ButtonText; }
        :scope:focus-visible { outline: 2px solid Highlight; }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        :scope { transition: none; }
      }
    }
  }
`

export const CSVExportButton = forwardRef<HTMLButtonElement, CSVExportButtonProps>(
  (
    {
      data,
      filename = 'export.csv',
      columns,
      onExport,
      size = 'md',
      motion: motionProp,
      className,
      disabled,
      children,
      onClick,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('csv-export', csvExportStyles)
    const motionLevel = useMotionLevel(motionProp)
    const [exported, setExported] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

    useEffect(() => {
      return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [])

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || data.length === 0) return
        const csvContent = generateCSV(data, columns)
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
        link.click()
        URL.revokeObjectURL(url)

        setExported(true)
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setExported(false), 2000)

        onExport?.()
        onClick?.(e as React.MouseEvent<HTMLButtonElement>)
      },
      [data, columns, filename, onExport, onClick, disabled]
    )

    return (
      <button
        ref={ref}
        type="button"
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        data-exported={exported || undefined}
        disabled={disabled}
        onClick={handleClick}
        {...rest}
      >
        {exported ? (
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {children ?? (exported ? 'Exported!' : 'Export CSV')}
      </button>
    )
  }
)
CSVExportButton.displayName = 'CSVExportButton'
