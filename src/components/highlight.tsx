'use client'

import { forwardRef, useMemo, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

export interface HighlightProps extends HTMLAttributes<HTMLSpanElement> {
  children: string
  highlight: string | string[]
  color?: string // highlight background color
  caseSensitive?: boolean
  highlightClassName?: string
}

const highlightStyles = css`
  @layer components {
    @scope (.ui-highlight) {
      :scope {
        display: inline;
      }

      mark {
        background: var(--ui-highlight-color, oklch(85% 0.15 90 / 0.4));
        color: inherit;
        border-radius: var(--radius-xs, 0.125rem);
        padding-inline: 0.05em;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        mark {
          background: Highlight;
          color: HighlightText;
        }
      }

      /* Print */
      @media print {
        mark {
          background: none;
          text-decoration: underline;
          text-decoration-thickness: 2px;
        }
      }
    }
  }
`

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const Highlight = forwardRef<HTMLSpanElement, HighlightProps>(
  (
    {
      children,
      highlight,
      color,
      caseSensitive = false,
      highlightClassName,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    useStyles('highlight', highlightStyles)

    const chunks = useMemo(() => {
      const terms = Array.isArray(highlight) ? highlight : [highlight]
      const validTerms = terms.filter((t) => t.length > 0)

      if (validTerms.length === 0) {
        return [{ text: children, highlighted: false }]
      }

      const pattern = validTerms.map(escapeRegExp).join('|')
      const flags = caseSensitive ? 'g' : 'gi'
      const regex = new RegExp(`(${pattern})`, flags)

      const parts = children.split(regex)
      return parts
        .filter((p) => p.length > 0)
        .map((part) => ({
          text: part,
          highlighted: validTerms.some((term) =>
            caseSensitive ? part === term : part.toLowerCase() === term.toLowerCase()
          ),
        }))
    }, [children, highlight, caseSensitive])

    const mergedStyle = color
      ? { ...style, '--ui-highlight-color': color } as React.CSSProperties
      : style

    return (
      <span
        ref={ref}
        className={cn('ui-highlight', className)}
        style={mergedStyle}
        {...rest}
      >
        {chunks.map((chunk, i) =>
          chunk.highlighted ? (
            <mark key={i} className={highlightClassName}>
              {chunk.text}
            </mark>
          ) : (
            <span key={i}>{chunk.text}</span>
          )
        )}
      </span>
    )
  }
)
Highlight.displayName = 'Highlight'
