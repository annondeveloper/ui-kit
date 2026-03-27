/**
 * Shared premium CSS effects — imported by all premium wrappers.
 * Provides aurora glow, spring entrance, shimmer sweep, and particle burst
 * that activate based on data-motion level.
 *
 * Usage in a premium component:
 *   import { sharedPremiumCSS } from './shared-effects'
 *   const styles = css`${sharedPremiumCSS} ... component-specific overrides ...`
 */

export const sharedPremiumCSS = `
  /* ── Shared Premium Effects ── */

  /* Aurora glow on hover */
  @media (hover: hover) {
    :scope:not([data-motion="0"]):hover {
      box-shadow:
        0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12),
        0 0 4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06);
    }
  }

  /* Spring entrance at motion 1+ */
  :scope:not([data-motion="0"]) {
    animation: ui-premium-entrance 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  @keyframes ui-premium-entrance {
    from { opacity: 0; transform: translateY(4px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Shimmer sweep at motion 2+ */
  :scope:not([data-motion="0"]):not([data-motion="1"])::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      110deg,
      transparent 25%,
      oklch(100% 0 0 / 0.04) 45%,
      oklch(100% 0 0 / 0.08) 50%,
      oklch(100% 0 0 / 0.04) 55%,
      transparent 75%
    );
    background-size: 200% 100%;
    animation: ui-premium-shimmer 3s ease-in-out infinite;
    pointer-events: none;
    border-radius: inherit;
    z-index: 0;
  }

  @keyframes ui-premium-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Particle burst at motion 3 — uses box-shadow pseudo-particles */
  :scope[data-motion="3"]::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    z-index: 1;
    opacity: 0;
  }

  :scope[data-motion="3"]:active::before {
    animation: ui-premium-particle-burst 0.6s ease-out;
  }

  @keyframes ui-premium-particle-burst {
    0% {
      opacity: 1;
      box-shadow:
        0 0 0 0 oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3),
        4px -4px 0 0 oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
        -4px -4px 0 0 oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
        6px 2px 0 0 oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15),
        -6px 2px 0 0 oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
    }
    100% {
      opacity: 0;
      box-shadow:
        0 0 0 0 oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0),
        12px -12px 0 0 oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0),
        -12px -12px 0 0 oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0),
        16px 6px 0 0 oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0),
        -16px 6px 0 0 oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0);
    }
  }

  /* Respect reduced motion */
  @media (prefers-reduced-motion: reduce) {
    :scope { animation: none !important; }
    :scope::after { animation: none !important; }
    :scope::before { animation: none !important; }
  }

  /* Motion 0 disables all */
  :scope[data-motion="0"] { animation: none !important; }
  :scope[data-motion="0"]::after { display: none; }
  :scope[data-motion="0"]::before { display: none; }
`
