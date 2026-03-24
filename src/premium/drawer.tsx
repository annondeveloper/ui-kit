'use client'

import type { ReactNode } from 'react'
import { Drawer as BaseDrawer, type DrawerProps } from '../components/drawer'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumDrawerStyles = css`
  @layer premium {
    @scope (.ui-premium-drawer) {
      :scope {
        display: contents;
      }

      /* ── Spring-scale slide entrance per side ─────────────────────── */

      /* Left: slide from left with overshoot */
      :scope .ui-drawer__panel[data-side="left"] {
        animation: ui-premium-drawer-enter-left 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      @keyframes ui-premium-drawer-enter-left {
        from {
          opacity: 0;
          transform: translateX(-100%);
          filter: blur(4px);
        }
        50% {
          opacity: 1;
          filter: blur(0);
        }
        70% {
          transform: translateX(3%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
          filter: blur(0);
        }
      }

      /* Right: slide from right with overshoot */
      :scope .ui-drawer__panel[data-side="right"] {
        animation: ui-premium-drawer-enter-right 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      @keyframes ui-premium-drawer-enter-right {
        from {
          opacity: 0;
          transform: translateX(100%);
          filter: blur(4px);
        }
        50% {
          opacity: 1;
          filter: blur(0);
        }
        70% {
          transform: translateX(-3%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
          filter: blur(0);
        }
      }

      /* Top: slide from top with overshoot */
      :scope .ui-drawer__panel[data-side="top"] {
        animation: ui-premium-drawer-enter-top 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      @keyframes ui-premium-drawer-enter-top {
        from {
          opacity: 0;
          transform: translateY(-100%);
          filter: blur(4px);
        }
        50% {
          opacity: 1;
          filter: blur(0);
        }
        70% {
          transform: translateY(3%);
        }
        to {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }
      }

      /* Bottom: slide from bottom with overshoot */
      :scope .ui-drawer__panel[data-side="bottom"] {
        animation: ui-premium-drawer-enter-bottom 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      @keyframes ui-premium-drawer-enter-bottom {
        from {
          opacity: 0;
          transform: translateY(100%);
          filter: blur(4px);
        }
        50% {
          opacity: 1;
          filter: blur(0);
        }
        70% {
          transform: translateY(-3%);
        }
        to {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }
      }

      /* ── Aurora glow along visible edge ───────────────────────────── */

      /* Left drawer — glow on right edge */
      :scope .ui-drawer__panel[data-side="left"]::after {
        content: '';
        position: absolute;
        inset-block: 0;
        inset-inline-end: 0;
        inline-size: 2px;
        background: linear-gradient(
          180deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.2) c h / 0.7) 15%,
          oklch(70% 0.18 300 / 0.5) 35%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.25) c h / 0.9) 50%,
          oklch(70% 0.18 200 / 0.5) 65%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.2) c h / 0.7) 85%,
          transparent 100%
        );
        animation: ui-premium-drawer-shimmer 3s ease-in-out infinite alternate;
      }

      /* Right drawer — glow on left edge */
      :scope .ui-drawer__panel[data-side="right"]::after {
        content: '';
        position: absolute;
        inset-block: 0;
        inset-inline-start: 0;
        inline-size: 2px;
        background: linear-gradient(
          180deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.2) c h / 0.7) 15%,
          oklch(70% 0.18 300 / 0.5) 35%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.25) c h / 0.9) 50%,
          oklch(70% 0.18 200 / 0.5) 65%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.2) c h / 0.7) 85%,
          transparent 100%
        );
        animation: ui-premium-drawer-shimmer 3s ease-in-out infinite alternate;
      }

      /* Top drawer — glow on bottom edge */
      :scope .ui-drawer__panel[data-side="top"]::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-end: 0;
        block-size: 2px;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.2) c h / 0.7) 15%,
          oklch(70% 0.18 300 / 0.5) 35%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.25) c h / 0.9) 50%,
          oklch(70% 0.18 200 / 0.5) 65%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.2) c h / 0.7) 85%,
          transparent 100%
        );
        animation: ui-premium-drawer-shimmer 3s ease-in-out infinite alternate;
      }

      /* Bottom drawer — glow on top edge */
      :scope .ui-drawer__panel[data-side="bottom"]::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-start: 0;
        block-size: 2px;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.2) c h / 0.7) 15%,
          oklch(70% 0.18 300 / 0.5) 35%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.25) c h / 0.9) 50%,
          oklch(70% 0.18 200 / 0.5) 65%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.2) c h / 0.7) 85%,
          transparent 100%
        );
        animation: ui-premium-drawer-shimmer 3s ease-in-out infinite alternate;
      }

      @keyframes ui-premium-drawer-shimmer {
        from { opacity: 0.6; }
        to { opacity: 1; }
      }

      /* ── Enhanced layered box-shadow ──────────────────────────────── */

      /* Left */
      :scope .ui-drawer__panel[data-side="left"] {
        box-shadow:
          8px 0 40px oklch(0% 0 0 / 0.4),
          4px 0 16px oklch(0% 0 0 / 0.3),
          0 0 0 1px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12),
          8px 0 80px -16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.18),
          12px 0 120px -24px oklch(from var(--brand, oklch(65% 0.2 270)) calc(l - 0.1) c h / 0.1),
          inset -1px 0 0 oklch(100% 0 0 / 0.08);
      }
      /* Right */
      :scope .ui-drawer__panel[data-side="right"] {
        box-shadow:
          -8px 0 40px oklch(0% 0 0 / 0.4),
          -4px 0 16px oklch(0% 0 0 / 0.3),
          0 0 0 1px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12),
          -8px 0 80px -16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.18),
          -12px 0 120px -24px oklch(from var(--brand, oklch(65% 0.2 270)) calc(l - 0.1) c h / 0.1),
          inset 1px 0 0 oklch(100% 0 0 / 0.08);
      }
      /* Top */
      :scope .ui-drawer__panel[data-side="top"] {
        box-shadow:
          0 8px 40px oklch(0% 0 0 / 0.4),
          0 4px 16px oklch(0% 0 0 / 0.3),
          0 0 0 1px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12),
          0 8px 80px -16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.18),
          0 12px 120px -24px oklch(from var(--brand, oklch(65% 0.2 270)) calc(l - 0.1) c h / 0.1),
          inset 0 -1px 0 oklch(100% 0 0 / 0.08);
      }
      /* Bottom */
      :scope .ui-drawer__panel[data-side="bottom"] {
        box-shadow:
          0 -8px 40px oklch(0% 0 0 / 0.4),
          0 -4px 16px oklch(0% 0 0 / 0.3),
          0 0 0 1px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12),
          0 -8px 80px -16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.18),
          0 -12px 120px -24px oklch(from var(--brand, oklch(65% 0.2 270)) calc(l - 0.1) c h / 0.1),
          inset 0 1px 0 oklch(100% 0 0 / 0.08);
      }

      /* ── Backdrop particles ───────────────────────────────────────── */

      .ui-premium-drawer__particles {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 999;
        overflow: hidden;
      }
      .ui-premium-drawer__particle {
        position: absolute;
        inline-size: 3px;
        block-size: 3px;
        border-radius: var(--radius-full, 9999px);
        background: oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.1) c h / 0.5);
        animation: ui-premium-drawer-particle-float 5s ease-in-out infinite;
      }
      @keyframes ui-premium-drawer-particle-float {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
        50% { transform: translateY(-30px) scale(1.5); opacity: 0.7; }
      }

      /* ── Motion 0: disable all animations ─────────────────────────── */

      :scope[data-motion="0"] .ui-drawer__panel {
        animation: none;
      }
      :scope[data-motion="0"] .ui-drawer__panel::after {
        animation: none;
      }

      /* ── Motion 1: subtle — no overshoot, no particles, no shimmer */
      :scope[data-motion="1"] .ui-drawer__panel {
        animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
        animation-duration: 0.3s;
      }
      :scope[data-motion="1"] .ui-drawer__panel::after {
        animation: none;
        opacity: 0.8;
      }

      /* ── Prefers reduced motion ────────────────────────────────────── */

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-drawer__panel {
          animation: none;
        }
        :scope .ui-drawer__panel::after {
          animation: none;
        }
        .ui-premium-drawer__particle {
          animation: none;
        }
      }
    }
  }
`

function BackdropParticles({ count = 12 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    left: `${(i / count) * 100 + Math.random() * 8}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    size: `${2 + Math.random() * 2}px`,
  }))

  return (
    <div className="ui-premium-drawer__particles" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="ui-premium-drawer__particle"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            inlineSize: p.size,
            blockSize: p.size,
          }}
        />
      ))}
    </div>
  )
}

export function Drawer({
  motion: motionProp,
  children,
  ...rest
}: DrawerProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-drawer', premiumDrawerStyles)

  return (
    <div className="ui-premium-drawer" data-motion={motionLevel}>
      {rest.open && motionLevel >= 3 && <BackdropParticles />}
      <BaseDrawer motion={motionProp} {...rest}>
        {children}
      </BaseDrawer>
    </div>
  )
}

Drawer.displayName = 'Drawer'
