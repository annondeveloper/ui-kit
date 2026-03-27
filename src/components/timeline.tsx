'use client'

import {
  forwardRef,
  useRef,
  useEffect,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TimelineItem {
  id: string
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  timestamp?: string
  status?: 'completed' | 'active' | 'pending' | 'error'
}

export interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  items: TimelineItem[]
  variant?: 'default' | 'alternate' | 'compact'
  size?: 'sm' | 'md' | 'lg'
  connectorStyle?: 'solid' | 'dashed' | 'dotted'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const timelineStyles = css`
  @layer components {
    @scope (.ui-timeline) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
        padding-inline-start: var(--space-lg, 1.5rem);
      }

      /* Connector line as ::before on the container */
      :scope::before {
        content: '';
        position: absolute;
        inset-inline-start: calc(var(--dot-offset, 0.5625rem) - 1px);
        inset-block-start: var(--space-sm, 0.5rem);
        inset-block-end: var(--space-sm, 0.5rem);
        inline-size: 2px;
        background: var(--border-subtle, oklch(50% 0 0 / 0.2));
      }

      /* Connector styles */
      :scope[data-connector="dashed"]::before {
        background: none;
        border-inline-start: 2px dashed var(--border-subtle, oklch(50% 0 0 / 0.2));
        inline-size: 0;
      }
      :scope[data-connector="dotted"]::before {
        background: none;
        border-inline-start: 2px dotted var(--border-subtle, oklch(50% 0 0 / 0.2));
        inline-size: 0;
      }

      /* Timeline item */
      .ui-timeline__item {
        position: relative;
        display: flex;
        flex-direction: column;
        padding-block-end: var(--space-lg, 1.5rem);
      }
      .ui-timeline__item:last-child {
        padding-block-end: 0;
      }

      /* Status dot */
      .ui-timeline__dot {
        position: absolute;
        inset-inline-start: calc(-1 * var(--space-lg, 1.5rem));
        inset-block-start: 0.125rem;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: var(--dot-size, 1.125rem);
        block-size: var(--dot-size, 1.125rem);
        border-radius: 50%;
        border: 2px solid var(--border-default, oklch(50% 0 0 / 0.3));
        background: var(--bg-base, oklch(20% 0 0));
        flex-shrink: 0;
        z-index: 1;
      }
      .ui-timeline__dot svg {
        inline-size: 0.625em;
        block-size: 0.625em;
      }

      /* Status colors — OKLCH */
      .ui-timeline__dot[data-status="completed"] {
        border-color: oklch(72% 0.19 145);
        background: oklch(72% 0.19 145);
        color: oklch(20% 0.02 145);
      }
      .ui-timeline__dot[data-status="active"] {
        border-color: var(--brand, oklch(65% 0.2 270));
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.25);
      }
      .ui-timeline__dot[data-status="pending"] {
        border-color: oklch(60% 0 0);
        background: transparent;
      }
      .ui-timeline__dot[data-status="error"] {
        border-color: oklch(65% 0.25 25);
        background: oklch(65% 0.25 25);
        color: oklch(100% 0 0);
      }

      /* Content */
      .ui-timeline__content {
        display: flex;
        flex-direction: column;
        gap: var(--space-2xs, 0.25rem);
      }

      .ui-timeline__title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        line-height: 1.5;
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-timeline__description {
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        color: var(--text-secondary, oklch(70% 0 0));
        text-wrap: pretty;
      }

      .ui-timeline__timestamp {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        margin-block-start: var(--space-2xs, 0.25rem);
      }

      /* ─── Sizes ──────────────────────────────────────────────── */

      :scope[data-size="sm"] {
        padding-inline-start: var(--space-md, 1rem);
        --dot-size: 0.875rem;
        --dot-offset: 0.4375rem;
      }
      :scope[data-size="sm"] .ui-timeline__item {
        padding-block-end: var(--space-md, 1rem);
      }
      :scope[data-size="sm"] .ui-timeline__title {
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="sm"] .ui-timeline__description {
        font-size: var(--text-xs, 0.75rem);
      }

      :scope[data-size="md"] {
        --dot-size: 1.125rem;
        --dot-offset: 0.5625rem;
      }

      :scope[data-size="lg"] {
        padding-inline-start: var(--space-xl, 2rem);
        --dot-size: 1.5rem;
        --dot-offset: 0.75rem;
      }
      :scope[data-size="lg"] .ui-timeline__item {
        padding-block-end: var(--space-xl, 2rem);
      }
      :scope[data-size="lg"] .ui-timeline__title {
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="lg"] .ui-timeline__description {
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-timeline__dot {
        inset-block-start: 0;
      }

      /* ─── Compact variant ────────────────────────────────────── */

      :scope[data-variant="compact"] .ui-timeline__item {
        padding-block-end: var(--space-sm, 0.5rem);
      }
      :scope[data-variant="compact"] .ui-timeline__description {
        display: none;
      }
      :scope[data-variant="compact"] .ui-timeline__content {
        flex-direction: row;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
      }
      :scope[data-variant="compact"] .ui-timeline__timestamp {
        margin-block-start: 0;
        order: -1;
        min-inline-size: 5rem;
      }

      /* ─── Alternate variant ──────────────────────────────────── */

      :scope[data-variant="alternate"] {
        padding-inline-start: 0;
        align-items: center;
      }
      :scope[data-variant="alternate"]::before {
        inset-inline-start: 50%;
        translate: -50% 0;
      }
      :scope[data-variant="alternate"] .ui-timeline__item {
        inline-size: 50%;
        padding-inline: var(--space-lg, 1.5rem);
      }
      :scope[data-variant="alternate"] .ui-timeline__item:nth-child(odd) {
        align-self: flex-start;
        text-align: end;
      }
      :scope[data-variant="alternate"] .ui-timeline__item:nth-child(odd) .ui-timeline__dot {
        inset-inline-start: auto;
        inset-inline-end: calc(-1 * var(--dot-size, 1.125rem) / 2 - 1px);
      }
      :scope[data-variant="alternate"] .ui-timeline__item:nth-child(odd) .ui-timeline__content {
        align-items: flex-end;
      }
      :scope[data-variant="alternate"] .ui-timeline__item:nth-child(even) {
        align-self: flex-end;
      }
      :scope[data-variant="alternate"] .ui-timeline__item:nth-child(even) .ui-timeline__dot {
        inset-inline-start: calc(-1 * var(--dot-size, 1.125rem) / 2 - 1px);
      }

      /* ─── Motion: staggered fade-in at level 2+ ──────────────── */

      :scope[data-motion="2"] .ui-timeline__item,
      :scope[data-motion="3"] .ui-timeline__item {
        opacity: 0;
        translate: 0 0.5rem;
        animation: ui-timeline-fade-in 0.4s var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) forwards;
      }

      /* Stagger delays — up to 12 items via nth-child */
      :scope[data-motion="2"] .ui-timeline__item:nth-child(1),
      :scope[data-motion="3"] .ui-timeline__item:nth-child(1) { animation-delay: 0ms; }
      :scope[data-motion="2"] .ui-timeline__item:nth-child(2),
      :scope[data-motion="3"] .ui-timeline__item:nth-child(2) { animation-delay: 60ms; }
      :scope[data-motion="2"] .ui-timeline__item:nth-child(3),
      :scope[data-motion="3"] .ui-timeline__item:nth-child(3) { animation-delay: 120ms; }
      :scope[data-motion="2"] .ui-timeline__item:nth-child(4),
      :scope[data-motion="3"] .ui-timeline__item:nth-child(4) { animation-delay: 180ms; }
      :scope[data-motion="2"] .ui-timeline__item:nth-child(5),
      :scope[data-motion="3"] .ui-timeline__item:nth-child(5) { animation-delay: 240ms; }
      :scope[data-motion="2"] .ui-timeline__item:nth-child(6),
      :scope[data-motion="3"] .ui-timeline__item:nth-child(6) { animation-delay: 300ms; }
      :scope[data-motion="2"] .ui-timeline__item:nth-child(7),
      :scope[data-motion="3"] .ui-timeline__item:nth-child(7) { animation-delay: 360ms; }
      :scope[data-motion="2"] .ui-timeline__item:nth-child(8),
      :scope[data-motion="3"] .ui-timeline__item:nth-child(8) { animation-delay: 420ms; }
      :scope[data-motion="2"] .ui-timeline__item:nth-child(9),
      :scope[data-motion="3"] .ui-timeline__item:nth-child(9) { animation-delay: 480ms; }
      :scope[data-motion="2"] .ui-timeline__item:nth-child(10),
      :scope[data-motion="3"] .ui-timeline__item:nth-child(10) { animation-delay: 540ms; }
      :scope[data-motion="2"] .ui-timeline__item:nth-child(11),
      :scope[data-motion="3"] .ui-timeline__item:nth-child(11) { animation-delay: 600ms; }
      :scope[data-motion="2"] .ui-timeline__item:nth-child(12),
      :scope[data-motion="3"] .ui-timeline__item:nth-child(12) { animation-delay: 660ms; }

      /* Motion 0: no animation */
      :scope[data-motion="0"] .ui-timeline__item {
        animation: none;
        opacity: 1;
        translate: none;
      }

      /* ─── Responsive: alternate falls back to default on mobile ─ */

      @media (max-width: 639px) {
        :scope[data-variant="alternate"] {
          padding-inline-start: var(--space-lg, 1.5rem);
          align-items: stretch;
        }
        :scope[data-variant="alternate"]::before {
          inset-inline-start: calc(var(--dot-offset, 0.5625rem) - 1px);
          translate: none;
        }
        :scope[data-variant="alternate"] .ui-timeline__item {
          inline-size: 100%;
          padding-inline: 0;
          text-align: start;
        }
        :scope[data-variant="alternate"] .ui-timeline__item:nth-child(odd),
        :scope[data-variant="alternate"] .ui-timeline__item:nth-child(even) {
          align-self: auto;
        }
        :scope[data-variant="alternate"] .ui-timeline__item:nth-child(odd) .ui-timeline__dot,
        :scope[data-variant="alternate"] .ui-timeline__item:nth-child(even) .ui-timeline__dot {
          inset-inline-start: calc(-1 * var(--space-lg, 1.5rem));
          inset-inline-end: auto;
        }
        :scope[data-variant="alternate"] .ui-timeline__item:nth-child(odd) .ui-timeline__content {
          align-items: flex-start;
        }
      }

      /* ─── Touch targets ──────────────────────────────────────── */

      @media (pointer: coarse) {
        .ui-timeline__item {
          min-block-size: 44px;
        }
      }

      /* ─── Forced colors ──────────────────────────────────────── */

      @media (forced-colors: active) {
        :scope::before {
          background: ButtonText;
        }
        :scope[data-connector="dashed"]::before,
        :scope[data-connector="dotted"]::before {
          border-color: ButtonText;
        }
        .ui-timeline__dot {
          border-color: ButtonText;
          background: Canvas;
          forced-color-adjust: none;
        }
        .ui-timeline__dot[data-status="completed"],
        .ui-timeline__dot[data-status="active"],
        .ui-timeline__dot[data-status="error"] {
          background: Highlight;
          border-color: Highlight;
        }
        .ui-timeline__title {
          color: CanvasText;
        }
        .ui-timeline__description {
          color: GrayText;
        }
      }

      /* ─── Print ──────────────────────────────────────────────── */

      @media print {
        :scope::before {
          background: #999;
        }
        .ui-timeline__item {
          break-inside: avoid;
          animation: none !important;
          opacity: 1 !important;
          translate: none !important;
        }
        .ui-timeline__dot {
          border: 2px solid #333;
          box-shadow: none;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .ui-timeline__dot[data-status="completed"] {
          background: #4a4;
        }
        .ui-timeline__dot[data-status="active"] {
          background: #66f;
        }
        .ui-timeline__dot[data-status="error"] {
          background: #e44;
        }
      }

      /* ─── Reduced data ───────────────────────────────────────── */

      @media (prefers-reduced-data: reduce) {
        .ui-timeline__item {
          animation: none;
          opacity: 1;
          translate: none;
        }
      }
    }

    @keyframes ui-timeline-fade-in {
      to {
        opacity: 1;
        translate: 0 0;
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  function Timeline(
    {
      items,
      variant = 'default',
      size = 'md',
      connectorStyle = 'solid',
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) {
    useStyles('timeline', timelineStyles)
    const motionLevel = useMotionLevel(motionProp)

    return (
      <div
        ref={ref}
        className={cn('ui-timeline', className)}
        data-variant={variant}
        data-size={size}
        data-connector={connectorStyle}
        data-motion={motionLevel}
        role="list"
        {...rest}
      >
        {items.map((item) => {
          const status = item.status ?? 'pending'
          return (
            <div
              key={item.id}
              className="ui-timeline__item"
              role="listitem"
            >
              <span
                className="ui-timeline__dot"
                data-status={status}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <div className="ui-timeline__content">
                <span className="ui-timeline__title">{item.title}</span>
                {item.description && (
                  <span className="ui-timeline__description">
                    {item.description}
                  </span>
                )}
                {item.timestamp && (
                  <time className="ui-timeline__timestamp">
                    {item.timestamp}
                  </time>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
)

Timeline.displayName = 'Timeline'
