'use client'

import { forwardRef } from 'react'
import { TableOfContents as BaseTableOfContents, type TableOfContentsProps } from '../components/table-of-contents'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-toc) {
      :scope {
        display: contents;
      }

      /* Spring indicator slide */
      :scope:not([data-motion="0"]) .ui-toc__indicator {
        transition: top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                    height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Aurora glow on active link */
      :scope .ui-toc__link[data-active="true"] {
        text-shadow: 0 0 10px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
      }

      /* Hover slide-in */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-toc__link {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      color 0.15s;
        }
        :scope:not([data-motion="0"]) .ui-toc__link:hover {
          transform: translateX(4px);
        }
      }

      :scope[data-motion="0"] .ui-toc__indicator { transition: none; }
      :scope[data-motion="0"] .ui-toc__link { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-toc__indicator { transition: none; }
        :scope .ui-toc__link { transition: none; }
      }
    }
  }
`

export const TableOfContents = forwardRef<HTMLElement, TableOfContentsProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-toc', premiumStyles)

    return (
      <div className="ui-premium-toc" data-motion={motionLevel}>
        <BaseTableOfContents ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

TableOfContents.displayName = 'TableOfContents'
