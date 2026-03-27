'use client'

import { DropdownMenu as BaseDropdownMenu, type DropdownMenuProps } from '../components/dropdown-menu'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumDropdownMenuStyles = css`
  @layer premium {
    @scope (.ui-premium-dropdown-menu) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Spring-scale entrance on panel */
      :scope:not([data-motion="0"]) .ui-dropdown-menu__panel {
        animation: ui-premium-dropdown-scale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        transform-origin: top start;
      }
      @keyframes ui-premium-dropdown-scale {
        from {
          opacity: 0;
          transform: scale(0.92) translateY(-4px);
        }
        70% {
          transform: scale(1.02) translateY(1px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      /* Aurora glow on active item */
      :scope .ui-dropdown-menu__item[data-active] {
        box-shadow:
          0 0 0 1px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15),
          0 0 12px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
          0 0 24px -6px oklch(from var(--brand, oklch(65% 0.2 270)) calc(l - 0.1) c h / 0.1);
      }

      /* Shimmer on hover */
      :scope .ui-dropdown-menu__item:hover {
        background: linear-gradient(
          110deg,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06) 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.14) 45%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06) 55%,
          transparent 100%
        );
        background-size: 200% 100%;
        animation: ui-premium-dropdown-shimmer 2s ease-in-out infinite alternate;
      }
      @keyframes ui-premium-dropdown-shimmer {
        from { background-position: 100% 0; }
        to { background-position: 0% 0; }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-dropdown-menu__panel,
      :scope[data-motion="0"] .ui-dropdown-menu__item:hover {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-dropdown-menu__panel { animation: none; }
        :scope .ui-dropdown-menu__item:hover { animation: none; }
      }
    }
  }
`

export function DropdownMenu({ motion: motionProp, ...rest }: DropdownMenuProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-dropdown-menu', premiumDropdownMenuStyles)

  return (
    <span className="ui-premium-dropdown-menu" data-motion={motionLevel}>
      <BaseDropdownMenu motion={motionProp} {...rest} />
    </span>
  )
}
