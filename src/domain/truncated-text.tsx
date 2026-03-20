'use client'

import {
  useState,
  type HTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TruncatedTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string
  lines?: number
  expandable?: boolean
  showTooltip?: boolean
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const truncatedTextStyles = css`
  @layer components {
    @scope (.ui-truncated-text) {
      :scope {
        display: inline-flex;
        flex-direction: column;
        align-items: flex-start;
        max-inline-size: 100%;
      }

      /* ── Content ─────────────────────────────────────── */

      .ui-truncated-text__content {
        display: block;
        max-inline-size: 100%;
      }

      /* Single line truncation */
      :scope[data-lines="1"] .ui-truncated-text__content:not([data-expanded]) {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Multi-line truncation */
      :scope:not([data-lines="1"]) .ui-truncated-text__content:not([data-expanded]) {
        display: -webkit-box;
        -webkit-line-clamp: var(--lines, 1);
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* Expanded state */
      .ui-truncated-text__content[data-expanded] {
        display: block;
        overflow: visible;
        white-space: normal;
        -webkit-line-clamp: unset;
      }

      /* ── Toggle button ───────────────────────────────── */

      .ui-truncated-text__toggle {
        display: inline;
        border: none;
        background: transparent;
        color: var(--brand, oklch(65% 0.2 270));
        cursor: pointer;
        font-size: inherit;
        font-family: inherit;
        padding: 0;
        margin-block-start: var(--space-2xs, 0.125rem);
        text-decoration: none;
      }

      .ui-truncated-text__toggle:hover {
        text-decoration: underline;
      }

      .ui-truncated-text__toggle:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: var(--radius-sm, 0.25rem);
      }

      /* ── Forced colors ───────────────────────────────── */

      @media (forced-colors: active) {
        .ui-truncated-text__toggle {
          color: LinkText;
        }
        .ui-truncated-text__toggle:focus-visible {
          outline: 2px solid Highlight;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function TruncatedText({
  text,
  lines = 1,
  expandable = false,
  showTooltip = true,
  className,
  ...rest
}: TruncatedTextProps) {
  useStyles('truncated-text', truncatedTextStyles)
  const [expanded, setExpanded] = useState(false)

  const shouldShowTooltip = showTooltip && !expanded

  return (
    <span
      className={cn('ui-truncated-text', className)}
      data-lines={lines}
      title={shouldShowTooltip ? text : undefined}
      {...rest}
    >
      <span
        className="ui-truncated-text__content"
        style={{ '--lines': lines } as React.CSSProperties}
        {...(expanded ? { 'data-expanded': '' } : {})}
      >
        {text}
      </span>
      {expandable && (
        <button
          className="ui-truncated-text__toggle"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </span>
  )
}

TruncatedText.displayName = 'TruncatedText'
