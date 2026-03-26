'use client'

import { forwardRef } from 'react'
import { Slider as BaseSlider, type SliderProps } from '../components/slider'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'


// ─── Premium styles ──────────────────────────────────────────────────────────

const premiumSliderStyles = css`
  @layer premium {
    @scope (.ui-premium-slider) {
      :scope {
        display: contents;
      }

      /* ── Aurora glow thumb — WebKit ── */
      :scope .ui-slider__input::-webkit-slider-thumb {
        box-shadow:
          0 0 12px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4),
          0 0 24px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
        transition: box-shadow 0.2s var(--ease-out, ease-out),
                    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      :scope .ui-slider__input::-webkit-slider-thumb:hover {
        box-shadow:
          0 0 18px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.5),
          0 0 36px -6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.25);
      }

      /* ── Aurora glow thumb — Firefox ── */
      :scope .ui-slider__input::-moz-range-thumb {
        box-shadow:
          0 0 12px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4),
          0 0 24px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
        transition: box-shadow 0.2s var(--ease-out, ease-out),
                    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      :scope .ui-slider__input::-moz-range-thumb:hover {
        box-shadow:
          0 0 18px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.5),
          0 0 36px -6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.25);
      }

      /* ── Spring-bounce on active release ── */
      :scope .ui-slider__input:active::-webkit-slider-thumb {
        transform: scale(1.2);
      }
      :scope .ui-slider__input:active::-moz-range-thumb {
        transform: scale(1.2);
      }

      /* ── Shimmer track fill overlay ── */
      :scope .ui-slider__track-container {
        position: relative;
      }
      :scope .ui-slider__track-container::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: var(--radius-full, 9999px);
        background: linear-gradient(
          110deg,
          transparent 30%,
          oklch(100% 0 0 / 0.12) 48%,
          oklch(100% 0 0 / 0.18) 50%,
          oklch(100% 0 0 / 0.12) 52%,
          transparent 70%
        );
        background-size: 250% 100%;
        animation: ui-premium-slider-shimmer 3s ease-in-out infinite;
        pointer-events: none;
        z-index: 0;
      }
      @keyframes ui-premium-slider-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* ── Motion level 0: no effects ── */
      :scope[data-motion="0"] .ui-slider__input::-webkit-slider-thumb {
        box-shadow: var(--shadow-sm, 0 1px 2px oklch(0% 0 0 / 0.1));
        transition: none;
      }
      :scope[data-motion="0"] .ui-slider__input::-moz-range-thumb {
        box-shadow: var(--shadow-sm, 0 1px 2px oklch(0% 0 0 / 0.1));
        transition: none;
      }
      :scope[data-motion="0"] .ui-slider__track-container::after {
        display: none;
      }

      /* ── Motion level 1: glow only, no shimmer ── */
      :scope[data-motion="1"] .ui-slider__track-container::after {
        display: none;
      }

      /* ── Motion level 2: slower shimmer ── */
      :scope[data-motion="2"] .ui-slider__track-container::after {
        animation-duration: 5s;
      }

      /* ── prefers-reduced-motion ── */
      @media (prefers-reduced-motion: reduce) {
        :scope .ui-slider__track-container::after {
          display: none !important;
        }
        :scope .ui-slider__input::-webkit-slider-thumb {
          transition: none !important;
        }
        :scope .ui-slider__input::-moz-range-thumb {
          transition: none !important;
        }
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        :scope .ui-slider__input::-webkit-slider-thumb {
          box-shadow: none;
        }
        :scope .ui-slider__input::-moz-range-thumb {
          box-shadow: none;
        }
        :scope .ui-slider__track-container::after {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-slider', premiumSliderStyles)

    return (
      <div className="ui-premium-slider" data-motion={motionLevel}>
        <BaseSlider ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

Slider.displayName = 'Slider'
