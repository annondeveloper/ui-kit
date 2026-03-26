'use client'

import { type StreamingTextProps, StreamingText as BaseStreamingText } from '../domain/streaming-text'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStreamingTextStyles = css`
  @layer premium {
    @scope (.ui-premium-streaming-text) {
      :scope {
        position: relative;
      }

      /* Aurora glow cursor */
      :scope:not([data-motion="0"]) .ui-streaming-text__cursor {
        box-shadow: 0 0 10px 2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.5);
        filter: drop-shadow(0 0 4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3));
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-streaming-text__cursor {
        animation: ui-premium-cursor-glow 1.2s ease-in-out infinite alternate;
      }
      @keyframes ui-premium-cursor-glow {
        from {
          box-shadow: 0 0 8px 1px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4);
        }
        to {
          box-shadow: 0 0 14px 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.6);
        }
      }

      /* Spring-fade tokens */
      :scope:not([data-motion="0"]) .ui-streaming-text__token {
        animation: ui-premium-token-spring 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-token-spring {
        from {
          opacity: 0;
          transform: translateY(4px) scale(0.9);
        }
        70% {
          transform: translateY(-1px) scale(1.02);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Shimmer text — subtle shine sweep after streaming completes */
      :scope:not([data-motion="0"]):not([data-motion="1"])[data-complete="true"]::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          105deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) 95% 0.02 h / 0.2) 45%,
          oklch(from var(--brand, oklch(65% 0.2 270)) 95% 0.04 h / 0.35) 50%,
          oklch(from var(--brand, oklch(65% 0.2 270)) 95% 0.02 h / 0.2) 55%,
          transparent 100%
        );
        animation: ui-premium-text-shimmer 1.5s ease-out 0.2s 1 both;
        pointer-events: none;
      }
      @keyframes ui-premium-text-shimmer {
        from { transform: translateX(-100%); }
        to { transform: translateX(100%); opacity: 0; }
      }

      /* Motion 0: disable */
      :scope[data-motion="0"] .ui-streaming-text__cursor {
        box-shadow: none;
        filter: none;
        animation: none;
      }
      :scope[data-motion="0"] .ui-streaming-text__token {
        animation: none;
      }
      :scope[data-motion="0"]::after {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-streaming-text__cursor { box-shadow: none; filter: none; animation: none; }
        :scope .ui-streaming-text__token { animation: none; }
        :scope::after { animation: none; display: none; }
      }
    }
  }
`

export function StreamingText({ motion: motionProp, streaming, ...rest }: StreamingTextProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-streaming-text', premiumStreamingTextStyles)

  return (
    <div
      className="ui-premium-streaming-text"
      data-motion={motionLevel}
      data-complete={streaming === false || undefined}
    >
      <BaseStreamingText motion={motionProp} streaming={streaming} {...rest} />
    </div>
  )
}

StreamingText.displayName = 'StreamingText'
