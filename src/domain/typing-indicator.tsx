'use client'

import {
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TypingIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  avatar?: ReactNode
  label?: string
  size?: 'sm' | 'md'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const typingIndicatorStyles = css`
  @layer components {
    @scope (.ui-typing-indicator) {
      :scope {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.5rem);
      }

      .ui-typing-indicator__avatar {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ui-typing-indicator__dots {
        display: flex;
        align-items: center;
        gap: 3px;
        padding: var(--space-xs, 0.375rem) var(--space-sm, 0.625rem);
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      :scope[data-size="sm"] .ui-typing-indicator__dots {
        gap: 2px;
        padding: var(--space-2xs, 0.25rem) var(--space-xs, 0.5rem);
      }

      .ui-typing-indicator__dot {
        display: block;
        inline-size: 6px;
        block-size: 6px;
        border-radius: 50%;
        background: var(--text-secondary, oklch(65% 0 0));
      }

      :scope[data-size="sm"] .ui-typing-indicator__dot {
        inline-size: 4px;
        block-size: 4px;
      }

      /* Motion 0: static dots */
      :scope[data-motion="0"] .ui-typing-indicator__dot {
        animation: none;
      }

      /* Motion 1: simple CSS bounce */
      :scope[data-motion="1"] .ui-typing-indicator__dot {
        animation: ui-typing-bounce 1.4s ease-in-out infinite;
      }
      :scope[data-motion="1"] .ui-typing-indicator__dot:nth-child(1) {
        animation-delay: 0s;
      }
      :scope[data-motion="1"] .ui-typing-indicator__dot:nth-child(2) {
        animation-delay: 0.16s;
      }
      :scope[data-motion="1"] .ui-typing-indicator__dot:nth-child(3) {
        animation-delay: 0.32s;
      }

      /* Motion 2+: spring-like bounce with overshoot */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-typing-indicator__dot {
        animation: ui-typing-spring 1.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-typing-indicator__dot:nth-child(1) {
        animation-delay: 0s;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-typing-indicator__dot:nth-child(2) {
        animation-delay: 0.16s;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-typing-indicator__dot:nth-child(3) {
        animation-delay: 0.32s;
      }

      @keyframes ui-typing-bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-4px); }
      }

      @keyframes ui-typing-spring {
        0%, 60%, 100% { transform: translateY(0); }
        20% { transform: translateY(-6px); }
        35% { transform: translateY(1px); }
        45% { transform: translateY(-2px); }
      }

      /* Visually hidden label */
      .ui-typing-indicator__label {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-typing-indicator__dots {
          border: 1px solid ButtonText;
        }
        .ui-typing-indicator__dot {
          background: ButtonText;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

function TypingIndicatorInner({
  avatar,
  label = 'Someone is typing...',
  size = 'md',
  motion: motionProp,
  className,
  ...rest
}: TypingIndicatorProps) {
  useStyles('typing-indicator', typingIndicatorStyles)
  const motionLevel = useMotionLevel(motionProp)

  return (
    <div
      className={cn('ui-typing-indicator', className)}
      data-motion={motionLevel}
      data-size={size}
      role="status"
      aria-live="polite"
      {...rest}
    >
      {avatar && (
        <span className="ui-typing-indicator__avatar">{avatar}</span>
      )}
      <span className="ui-typing-indicator__dots" aria-hidden="true">
        <span className="ui-typing-indicator__dot" />
        <span className="ui-typing-indicator__dot" />
        <span className="ui-typing-indicator__dot" />
      </span>
      <span className="ui-typing-indicator__label">{label}</span>
    </div>
  )
}

export function TypingIndicator(props: TypingIndicatorProps) {
  return (
    <ComponentErrorBoundary>
      <TypingIndicatorInner {...props} />
    </ComponentErrorBoundary>
  )
}

TypingIndicator.displayName = 'TypingIndicator'
