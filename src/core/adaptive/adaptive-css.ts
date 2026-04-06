import { css } from '../styles/css-tag'

/**
 * CSS rules that optimize component appearance based on adaptive tier.
 * Injected by UIProvider when adaptive is enabled.
 *
 * - lite: removes expensive effects (shadows, backdrop-filter, animations)
 * - standard: default appearance
 * - premium: enhanced glows, hover effects, transitions
 */
export const adaptiveStyles = css`
  /* ── Lite tier: strip expensive visuals for speed ────────── */
  [data-adaptive-tier="lite"] [class*="ui-"] {
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  [data-adaptive-tier="lite"] *::before,
  [data-adaptive-tier="lite"] *::after {
    animation: none !important;
    transition: none !important;
  }

  /* Disable scroll-reveal animations in lite */
  [data-adaptive-tier="lite"] [class*="__section"] {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }

  /* ── Premium tier: enhance interactive elements ──────────── */
  [data-adaptive-tier="premium"] .ui-button:hover,
  [data-adaptive-tier="premium"] .ui-card:hover {
    box-shadow:
      0 0 0 1px oklch(65% 0.2 270 / 0.2),
      0 4px 20px oklch(65% 0.2 270 / 0.12);
    transition: box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Premium effects fade in subtly — feels like page "coming alive" */
  [data-adaptive-tier="premium"] [class*="ui-premium"] {
    animation: adaptive-premium-fadein 0.15s ease-in both;
  }

  @keyframes adaptive-premium-fadein {
    from { opacity: 0.96; }
    to { opacity: 1; }
  }

  /* ── Always respect user preferences ─────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    [data-adaptive-tier] *,
    [data-adaptive-tier] *::before,
    [data-adaptive-tier] *::after {
      animation-duration: 0s !important;
      transition-duration: 0s !important;
    }
  }
`

export const ADAPTIVE_CSS_ID = 'ui-kit-adaptive'
