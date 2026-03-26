'use client'

import { Popover as BasePopover, type PopoverProps } from '../components/popover'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumPopoverStyles = css`
  @layer premium {
    @scope (.ui-premium-popover) {
      :scope {
        display: contents;
      }

      /* Aurora glow shadow on panel */
      :scope .ui-popover .ui-popover__panel {
        box-shadow:
          0 8px 32px oklch(0% 0 0 / 0.3),
          0 0 20px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
        border-color: oklch(100% 0 0 / 0.1);
      }

      /* Shimmer border effect */
      :scope .ui-popover .ui-popover__panel {
        position: relative;
        background-clip: padding-box;
      }
      :scope .ui-popover .ui-popover__panel::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(
          135deg,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
          oklch(100% 0 0 / 0.06),
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15)
        );
        background-size: 300% 300%;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        z-index: -1;
      }

      /* Spring-scale entrance with blur — motion 1+ */
      :scope:not([data-motion="0"]) .ui-popover {
        animation: ui-premium-popover-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-popover-enter {
        from {
          opacity: 0;
          transform: scale(0.9);
          filter: blur(4px);
        }
        60% {
          transform: scale(1.03);
          filter: blur(0px);
        }
        to {
          opacity: 1;
          transform: scale(1);
          filter: blur(0px);
        }
      }

      /* Shimmer border animation — motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-popover .ui-popover__panel::before {
        animation: ui-premium-popover-shimmer 4s ease-in-out infinite;
      }

      @keyframes ui-premium-popover-shimmer {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      /* Enhanced arrow glow */
      :scope .ui-popover .ui-popover__arrow {
        box-shadow: 0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"] .ui-popover {
        animation: none;
      }
      :scope[data-motion="0"] .ui-popover .ui-popover__panel::before {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-popover { animation: none; }
        :scope .ui-popover .ui-popover__panel::before { animation: none; }
      }
    }
  }
`

export function Popover({ motion: motionProp, ...rest }: PopoverProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-popover', premiumPopoverStyles)

  return (
    <span className="ui-premium-popover" data-motion={motionLevel}>
      <BasePopover motion={motionProp} {...rest} />
    </span>
  )
}

Popover.displayName = 'Popover'
