'use client'

import { forwardRef } from 'react'
import { TransferList as BaseTransferList, type TransferListProps } from '../components/transfer-list'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-transfer-list) {
      :scope {
        display: contents;
      }

      /* Spring item transfer animation */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-transfer-list__item {
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                    opacity 0.25s var(--ease-out, ease-out);
      }

      /* Aurora glow on control buttons */
      :scope:not([data-motion="0"]) .ui-transfer-list__control-btn:focus-visible {
        box-shadow: 0 0 12px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
      }

      /* Hover lift on items */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-transfer-list__item:hover {
          transform: translateX(2px);
        }
        :scope:not([data-motion="0"]) .ui-transfer-list__control-btn {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        :scope:not([data-motion="0"]) .ui-transfer-list__control-btn:hover {
          transform: scale(1.12);
        }
      }

      :scope[data-motion="0"] .ui-transfer-list__item { transition: none; }
      :scope[data-motion="0"] .ui-transfer-list__control-btn { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-transfer-list__item { transition: none; }
        :scope .ui-transfer-list__control-btn { transition: none; }
      }
    }
  }
`

export const TransferList = forwardRef<HTMLDivElement, TransferListProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-transfer-list', premiumStyles)

    return (
      <div className="ui-premium-transfer-list" data-motion={motionLevel}>
        <BaseTransferList ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

TransferList.displayName = 'TransferList'
