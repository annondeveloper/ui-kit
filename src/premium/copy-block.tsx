'use client'

import { forwardRef } from 'react'
import { CopyBlock as BaseCopyBlock, type CopyBlockProps } from '../domain/copy-block'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumCopyBlockStyles = css`
  @layer premium {
    @scope (.ui-premium-copy-block) {
      :scope {
        position: relative;
      }

      /* Aurora glow on copy button */
      :scope:not([data-motion="0"]) .ui-copy-block__copy-btn {
        transition: box-shadow 0.25s ease-out, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      :scope:not([data-motion="0"]) .ui-copy-block__copy-btn:hover {
        box-shadow:
          0 0 12px -2px oklch(75% 0.2 270 / 0.3),
          0 0 24px -4px oklch(70% 0.15 300 / 0.15);
      }

      /* Spring-scale feedback on click */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-copy-block__copy-btn:active {
        transform: scale(0.88);
        transition-duration: 0.1s;
      }

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-copy-block__copy-btn[data-copied="true"] {
        animation: ui-premium-copy-spring 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-copy-spring {
        0% { transform: scale(0.85); }
        60% { transform: scale(1.12); }
        100% { transform: scale(1); }
      }

      /* Shimmer on highlighted code lines */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-copy-block__line[data-highlight="true"] {
        position: relative;
        overflow: hidden;
      }

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-copy-block__line[data-highlight="true"]::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          110deg,
          transparent 30%,
          oklch(75% 0.12 270 / 0.1) 50%,
          transparent 70%
        );
        animation: ui-premium-code-shimmer 3s ease-in-out infinite;
        pointer-events: none;
      }

      @keyframes ui-premium-code-shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      /* Subtle aurora glow on container */
      :scope:not([data-motion="0"]) .ui-copy-block {
        box-shadow:
          0 0 0 1px oklch(75% 0.1 270 / 0.08),
          0 4px 16px oklch(0% 0 0 / 0.2);
        transition: box-shadow 0.3s ease-out;
      }

      :scope:not([data-motion="0"]) .ui-copy-block:hover {
        box-shadow:
          0 0 0 1px oklch(75% 0.15 270 / 0.12),
          0 4px 20px oklch(0% 0 0 / 0.25),
          0 0 24px -8px oklch(75% 0.15 270 / 0.1);
      }

      /* Motion 0: no enhancements */
      :scope[data-motion="0"] .ui-copy-block__copy-btn {
        transition: none;
      }
      :scope[data-motion="0"] .ui-copy-block {
        box-shadow: none;
        transition: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-copy-block__copy-btn { transition: none; animation: none; }
        :scope .ui-copy-block__line[data-highlight="true"]::after { display: none; }
        :scope .ui-copy-block { transition: none; }
      }
    }
  }
`

export const CopyBlock = forwardRef<HTMLDivElement, CopyBlockProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-copy-block', premiumCopyBlockStyles)

    return (
      <div ref={ref} className="ui-premium-copy-block" data-motion={motionLevel}>
        <BaseCopyBlock motion={motionProp} {...rest} />
      </div>
    )
  }
)

CopyBlock.displayName = 'CopyBlock'
