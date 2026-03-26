'use client'

import { forwardRef } from 'react'
import { CommandBar as BaseCommandBar, type CommandBarProps } from '../domain/command-bar'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumCommandBarStyles = css`
  @layer premium {
    @scope (.ui-premium-command-bar) {
      :scope {
        position: relative;
      }

      /* Glass morphism on container */
      :scope .ui-command-bar {
        background: oklch(18% 0.02 270 / 0.75);
        backdrop-filter: blur(20px) saturate(1.4);
        -webkit-backdrop-filter: blur(20px) saturate(1.4);
        border: 1px solid oklch(100% 0 0 / 0.1);
        box-shadow:
          0 0 0 1px oklch(100% 0 0 / 0.05),
          0 8px 32px oklch(0% 0 0 / 0.4),
          inset 0 1px 0 oklch(100% 0 0 / 0.06);
      }

      /* Aurora glow on active/selected item */
      :scope .ui-command-bar__item[data-active="true"],
      :scope .ui-command-bar__item[aria-selected="true"] {
        background: oklch(75% 0.15 270 / 0.12);
        box-shadow:
          0 0 12px -2px oklch(75% 0.2 270 / 0.25),
          inset 0 0 8px oklch(75% 0.15 270 / 0.08);
      }

      /* Spring entrance animation */
      :scope:not([data-motion="0"]) .ui-command-bar {
        animation: ui-premium-cmdb-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-cmdb-enter {
        from {
          opacity: 0;
          transform: scale(0.92) translateY(-8px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      /* Item hover glow */
      :scope:not([data-motion="0"]) .ui-command-bar__item {
        transition: background 0.2s ease-out, box-shadow 0.2s ease-out;
      }

      :scope:not([data-motion="0"]) .ui-command-bar__item:hover {
        box-shadow: 0 0 8px -2px oklch(75% 0.15 270 / 0.15);
      }

      /* Aurora shimmer on input focus */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-command-bar__input:focus {
        box-shadow: 0 0 0 2px oklch(75% 0.15 270 / 0.2);
      }

      /* Motion 0: no enhancements */
      :scope[data-motion="0"] .ui-command-bar {
        animation: none;
        backdrop-filter: none;
      }
      :scope[data-motion="0"] .ui-command-bar__item {
        transition: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-command-bar { animation: none; }
        :scope .ui-command-bar__item { transition: none; }
      }
    }
  }
`

export const CommandBar = forwardRef<HTMLDivElement, CommandBarProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-command-bar', premiumCommandBarStyles)

    return (
      <div ref={ref} className="ui-premium-command-bar" data-motion={motionLevel}>
        <BaseCommandBar motion={motionProp} {...rest} />
      </div>
    )
  }
)

CommandBar.displayName = 'CommandBar'
