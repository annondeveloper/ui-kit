'use client'

import { forwardRef } from 'react'
import { TagInput as BaseTagInput, type TagInputProps } from '../components/tag-input'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumTagInputStyles = css`
  @layer premium {
    @scope (.ui-premium-tag-input) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Aurora glow on tag pills */
      :scope .ui-tag-input__tag {
        box-shadow: 0 0 8px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l 0.04 h / 0.15);
        border: 1px solid oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      /* Spring-scale on tag add — motion 1+ */
      :scope:not([data-motion="0"]) .ui-tag-input__tag {
        animation: ui-premium-tag-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-tag-enter {
        from {
          opacity: 0;
          transform: scale(0.4);
        }
        60% {
          transform: scale(1.1);
        }
        80% {
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Shimmer sweep on newest tag — motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-tag-input__tag {
        position: relative;
        overflow: hidden;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-tag-input__tag::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          110deg,
          transparent 30%,
          oklch(100% 0 0 / 0.15) 50%,
          transparent 70%
        );
        animation: ui-premium-tag-shimmer 0.8s ease-out both;
        pointer-events: none;
      }

      @keyframes ui-premium-tag-shimmer {
        from { transform: translateX(-100%); }
        to   { transform: translateX(100%); }
      }

      /* Motion 0: no animations */
      :scope[data-motion="0"] .ui-tag-input__tag {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-tag-input__tag { animation: none; }
        :scope .ui-tag-input__tag::after { animation: none; display: none; }
      }
    }
  }
`

export const TagInput = forwardRef<HTMLDivElement, TagInputProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-tag-input', premiumTagInputStyles)

    return (
      <div className="ui-premium-tag-input" data-motion={motionLevel}>
        <BaseTagInput ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

TagInput.displayName = 'TagInput'
