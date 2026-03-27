'use client'

import { forwardRef } from 'react'
import { Navbar as BaseNavbar, type NavbarProps } from '../components/navbar'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

interface PremiumNavbarProps extends NavbarProps {
  motion?: 0 | 1 | 2 | 3
}

const premiumNavbarStyles = css`
  @layer premium {
    @scope (.ui-premium-navbar) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Glass morphism surface */
      :scope .ui-navbar {
        background: oklch(18% 0.015 270 / 0.6);
        backdrop-filter: blur(20px) saturate(1.8);
        -webkit-backdrop-filter: blur(20px) saturate(1.8);
        border-block-end: 1px solid oklch(100% 0 0 / 0.06);
        box-shadow:
          0 1px 0 oklch(100% 0 0 / 0.04) inset,
          0 4px 24px oklch(0% 0 0 / 0.2);
      }

      /* Aurora glow on active nav items */
      :scope .ui-navbar__nav a[aria-current="page"],
      :scope .ui-navbar__nav [data-active="true"] {
        color: var(--brand-light, oklch(72% 0.2 270));
        text-shadow: 0 0 14px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.5);
        position: relative;
      }
      :scope .ui-navbar__nav a[aria-current="page"]::after,
      :scope .ui-navbar__nav [data-active="true"]::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-end: -2px;
        block-size: 2px;
        background: var(--brand, oklch(65% 0.2 270));
        border-radius: 1px;
        box-shadow: 0 0 10px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.6);
      }

      /* Spring transitions on nav items — motion 1+ */
      :scope:not([data-motion="0"]) .ui-navbar__nav > * {
        transition:
          color 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
          transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
          text-shadow 0.3s ease-out;
      }
      :scope:not([data-motion="0"]) .ui-navbar__nav > *:hover {
        transform: translateY(-1px);
      }

      /* Spring-scale entrance — motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-navbar {
        animation: ui-premium-navbar-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-navbar-enter {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Mobile dropdown glass */
      :scope .ui-navbar__mobile-nav {
        background: oklch(18% 0.015 270 / 0.85);
        backdrop-filter: blur(16px) saturate(1.6);
        -webkit-backdrop-filter: blur(16px) saturate(1.6);
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"] .ui-navbar {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-navbar { animation: none; }
        :scope .ui-navbar__nav > * { transition: none; transform: none !important; }
      }
    }
  }
`

export const Navbar = forwardRef<HTMLElement, PremiumNavbarProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-navbar', premiumNavbarStyles)

    return (
      <span className="ui-premium-navbar" data-motion={motionLevel}>
        <BaseNavbar ref={ref} {...rest} />
      </span>
    )
  }
)

Navbar.displayName = 'Navbar'
