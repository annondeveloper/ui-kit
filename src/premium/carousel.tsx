'use client'

import { forwardRef } from 'react'
import { Carousel as BaseCarousel, type CarouselProps } from '../components/carousel'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumCarouselStyles = css`
  @layer premium {
    @scope (.ui-premium-carousel) {
      :scope {
        position: relative;
      }

      /* Aurora glow on arrows */
      :scope .ui-carousel__arrow {
        box-shadow:
          var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.2)),
          0 0 12px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
      }

      :scope .ui-carousel__arrow:hover:not(:disabled) {
        box-shadow:
          var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.2)),
          0 0 20px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
      }

      /* Spring scale on arrow hover at motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-carousel__arrow {
        transition: background 0.15s var(--ease-out, ease-out),
                    opacity 0.15s var(--ease-out, ease-out),
                    box-shadow 0.2s var(--ease-out, ease-out),
                    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-carousel__arrow:hover:not(:disabled) {
        transform: scale(1.08);
      }

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-carousel__arrow:active:not(:disabled) {
        transform: scale(0.95);
      }

      /* Active dot glow */
      :scope .ui-carousel__dot[data-active] {
        box-shadow: 0 0 8px -1px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4);
      }

      /* Dot morphing transition at motion 3 */
      :scope[data-motion="3"] .ui-carousel__dot {
        transition: opacity 0.15s var(--ease-out, ease-out),
                    background 0.15s var(--ease-out, ease-out),
                    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 0.2s var(--ease-out, ease-out),
                    border-radius 0.3s var(--ease-out, ease-out),
                    inline-size 0.3s var(--ease-out, ease-out);
      }

      :scope[data-motion="3"] .ui-carousel__dot[data-active] {
        border-radius: var(--radius-sm, 0.25rem);
        inline-size: 1.25rem;
      }

      /* Slide crossfade at motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-carousel__slide {
        animation: ui-premium-carousel-slide-enter 0.35s ease-out;
      }

      @keyframes ui-premium-carousel-slide-enter {
        from {
          opacity: 0.6;
        }
        to {
          opacity: 1;
        }
      }

      /* Motion 0: disable everything */
      :scope[data-motion="0"] .ui-carousel__arrow {
        box-shadow: var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.2));
        transition: none;
      }
      :scope[data-motion="0"] .ui-carousel__dot {
        transition: none;
        box-shadow: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-carousel__arrow {
          transition: none !important;
        }
        :scope .ui-carousel__dot {
          transition: none !important;
          box-shadow: none !important;
        }
        :scope .ui-carousel__slide {
          animation: none !important;
        }
      }

      @media (forced-colors: active) {
        :scope .ui-carousel__arrow {
          box-shadow: none;
        }
        :scope .ui-carousel__dot {
          box-shadow: none;
        }
      }
    }
  }
`

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-carousel', premiumCarouselStyles)

    return (
      <div className="ui-premium-carousel" data-motion={motionLevel}>
        <BaseCarousel ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

Carousel.displayName = 'Carousel'

export type { CarouselProps } from '../components/carousel'
