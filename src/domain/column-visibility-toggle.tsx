'use client'

import {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
  type HTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface ColumnVisibilityToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  columns: { id: string; label: string; visible: boolean }[]
  onChange?: (columnId: string, visible: boolean) => void
  onReset?: () => void
  motion?: 0 | 1 | 2 | 3
}

const columnVisibilityStyles = css`
  @layer components {
    @scope (.ui-column-visibility) {
      :scope {
        position: relative;
        display: inline-block;
        font-family: inherit;
      }

      /* Trigger button */
      .ui-column-visibility__trigger {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-elevated, oklch(50% 0 0 / 0.08));
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        outline: none;
        white-space: nowrap;
        transition: background 0.15s ease-out, border-color 0.15s ease-out;
      }
      .ui-column-visibility__trigger:hover {
        background: var(--bg-hover, oklch(100% 0 0 / 0.1));
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }
      .ui-column-visibility__trigger:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
      .ui-column-visibility__trigger svg {
        inline-size: 1em;
        block-size: 1em;
        flex-shrink: 0;
      }

      /* Dropdown panel */
      .ui-column-visibility__dropdown {
        position: absolute;
        inset-block-start: calc(100% + 4px);
        inset-inline-end: 0;
        min-inline-size: 200px;
        max-block-size: 320px;
        overflow-y: auto;
        background: var(--bg-surface, oklch(20% 0 0 / 0.95));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-lg, 0.75rem);
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
        padding-block: var(--space-xs, 0.25rem);
        z-index: 50;
        transform-origin: top right;
      }

      /* Motion levels for dropdown */
      :scope[data-motion="0"] .ui-column-visibility__dropdown { transition: none; }
      :scope[data-motion="1"] .ui-column-visibility__dropdown {
        transition: opacity 0.1s ease-out;
      }
      :scope[data-motion="2"] .ui-column-visibility__dropdown {
        transition: opacity 0.15s ease-out, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      :scope[data-motion="3"] .ui-column-visibility__dropdown {
        transition: opacity 0.15s ease-out, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .ui-column-visibility__dropdown[data-open="false"] {
        opacity: 0;
        transform: scale(0.95);
        pointer-events: none;
      }
      .ui-column-visibility__dropdown[data-open="true"] {
        opacity: 1;
        transform: scale(1);
      }

      /* Column item */
      .ui-column-visibility__item {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding-block: 0.375rem;
        padding-inline: var(--space-md, 0.75rem);
        cursor: pointer;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary, oklch(90% 0 0));
        user-select: none;
        transition: background 0.1s ease-out;
      }
      .ui-column-visibility__item:hover {
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
      }

      .ui-column-visibility__checkbox {
        appearance: none;
        inline-size: 16px;
        block-size: 16px;
        border: 2px solid var(--border-default, oklch(100% 0 0 / 0.2));
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        cursor: pointer;
        flex-shrink: 0;
        position: relative;
        transition: background 0.1s ease-out, border-color 0.1s ease-out;
      }
      .ui-column-visibility__checkbox:checked {
        background: var(--brand, oklch(65% 0.2 270));
        border-color: var(--brand, oklch(65% 0.2 270));
      }
      .ui-column-visibility__checkbox:checked::after {
        content: '';
        position: absolute;
        inset-block-start: 1px;
        inset-inline-start: 4px;
        inline-size: 5px;
        block-size: 9px;
        border: solid oklch(100% 0 0);
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
      .ui-column-visibility__checkbox:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Divider + reset */
      .ui-column-visibility__divider {
        block-size: 1px;
        background: var(--border-default, oklch(100% 0 0 / 0.1));
        margin-block: var(--space-xs, 0.25rem);
      }
      .ui-column-visibility__reset {
        display: block;
        inline-size: 100%;
        padding-block: 0.375rem;
        padding-inline: var(--space-md, 0.75rem);
        border: none;
        background: transparent;
        color: var(--brand, oklch(65% 0.2 270));
        font-size: var(--text-sm, 0.875rem);
        font-family: inherit;
        font-weight: 500;
        cursor: pointer;
        text-align: start;
        transition: background 0.1s ease-out;
      }
      .ui-column-visibility__reset:hover {
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
      }
      .ui-column-visibility__reset:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: -2px;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-column-visibility__item {
          min-block-size: 44px;
        }
        .ui-column-visibility__trigger {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-column-visibility__dropdown {
          border: 2px solid ButtonText;
        }
        .ui-column-visibility__checkbox:checked {
          background: Highlight;
          border-color: Highlight;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-column-visibility__dropdown {
          transition: none;
        }
      }
    }
  }
`

export const ColumnVisibilityToggle = forwardRef<HTMLDivElement, ColumnVisibilityToggleProps>(
  (
    {
      columns,
      onChange,
      onReset,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('column-visibility', columnVisibilityStyles)
    const motionLevel = useMotionLevel(motionProp)
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
      if (!open) return
      const handler = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }, [open])

    // Close on Escape
    useEffect(() => {
      if (!open) return
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false)
      }
      document.addEventListener('keydown', handler)
      return () => document.removeEventListener('keydown', handler)
    }, [open])

    const setContainerRef = useCallback(
      (el: HTMLDivElement | null) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el
      },
      [ref]
    )

    const visibleCount = columns.filter((c) => c.visible).length

    return (
      <div
        ref={setContainerRef}
        className={cn(cls('root'), className)}
        data-motion={motionLevel}
        {...rest}
      >
        <button
          type="button"
          className="ui-column-visibility__trigger"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Columns ({visibleCount}/{columns.length})
        </button>

        <div
          className="ui-column-visibility__dropdown"
          role="listbox"
          aria-label="Toggle column visibility"
          data-open={open}
        >
          {columns.map((col) => (
            <label key={col.id} className="ui-column-visibility__item">
              <input
                type="checkbox"
                className="ui-column-visibility__checkbox"
                checked={col.visible}
                onChange={() => onChange?.(col.id, !col.visible)}
              />
              {col.label}
            </label>
          ))}
          {onReset && (
            <>
              <div className="ui-column-visibility__divider" />
              <button
                type="button"
                className="ui-column-visibility__reset"
                onClick={onReset}
              >
                Reset to default
              </button>
            </>
          )}
        </div>
      </div>
    )
  }
)
ColumnVisibilityToggle.displayName = 'ColumnVisibilityToggle'
